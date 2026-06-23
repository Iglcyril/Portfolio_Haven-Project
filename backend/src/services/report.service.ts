/**
 * report.service.ts
 * ------------------
 * Service central de Haven - gère tout le cycle de vie d'un rapport.
 * C'est ici que les signalements sont sauvegardés en base de données.
 *
 * Méthodes :
 *   - create           → crée un rapport et le sauvegarde en base
 *   - findAll          → liste les rapports (filtrée selon le rôle)
 *   - findByTrackingId → détail d'un rapport par trackingId
 *   - updateStatus     → avance le statut du rapport (Supervisor uniquement)
 *   - updateSeverity   → met à jour la gravité du rapport (Supervisor uniquement)
 *   - getStats         → statistiques des rapports par établissement
 *   - delete           → supprime un rapport dans les 5 minutes
 *
 * Les enums (ReportStatus, Severity, AnonymatLevel, Categorie) sont importés
 * directement depuis Prisma - si le schema change, TypeScript signale
 * automatiquement les endroits à mettre à jour.
 */

import { PrismaClient, ReportStatus, Severity, AnonymatLevel, Categorie } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

// Prisma v7 — nécessite un adapter explicite pour la connexion PostgreSQL
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

export type CreateReportInput = {
  userId?:          string  // Absent si signalement anonyme via le chatbot (pas de compte)
  type:             'victime' | 'temoin'
  category:         Categorie
  anonymatLevel:    AnonymatLevel
  contenu?:         string  // Peut être envoyé plus tard via addDeposition (flow chatbot en plusieurs étapes)
  establishment_id: string
  crisisDetected:   boolean
}

export type UpdateStatusInput = {
  status: ReportStatus
}

export type UpdateSeverityInput = {
  severity: Severity
}

export type SaveSummaryInput = {
  classLevel?:           string
  identity?:             string
  initialFeeling?:       string
  mood?:                 string
  adultContact?:         string
  contactTeam?:          string
  witnessContext?:       string
  victimInfo?:           string
  victimIdentity?:       string
  bullyInfo?:            string
  bullyIdentity?:        string
  situationDescription?: string
}

export const reportService = {

  /**
   * Crée un nouveau rapport de harcèlement et le sauvegarde en base.
   * - Génère un tracking ID unique (HVN-XXXX-XXXX)
   * - Sauvegarde le rapport avec tous ses champs
   * - isAnonymous est true si anonymatLevel === 'total'
   */
  async create({
    userId,
    type,
    category,
    anonymatLevel,
    contenu,
    establishment_id,
    crisisDetected
  }: CreateReportInput) {

    const trackingId = await generateUniqueTrackingId()

    const report = await prisma.report.create({
      data: {
        trackingId,
        userId,
        type,
        // Prisma utilise "categorie" en base — on mappe category → categorie
        categorie:       category,
        anonymatLevel,
        // isAnonymous = true uniquement si anonymat total
        isAnonymous:     anonymatLevel === AnonymatLevel.total,
        // Prisma utilise "etablissementId" en base — on mappe establishment_id → etablissementId
        etablissementId: establishment_id,
        crisisDetected,
        status:   ReportStatus.EN_ATTENTE,
        severity: Severity.BAS
      },
      select: {
        id:             true,
        trackingId:     true,
        type:           true,
        categorie:      true,
        anonymatLevel:  true,
        isAnonymous:    true,
        crisisDetected: true,
        status:         true,
        severity:       true,
        createdAt:      true
      }
    })

    if (contenu) {
      await prisma.chatMessage.create({
        data: { reportId: report.id, sender: 'USER', content: contenu }
      })
    }

    return report
  },

  /**
   * Retourne la liste des rapports selon le rôle :
   * - SUPERVISOR / ADMIN → tous les rapports
   * - STUDENT / PARENT   → uniquement les leurs
   */
  async findAll(userId: string, role: string) {
    const where = ['SUPERVISOR', 'ADMIN'].includes(role) ? {} : { userId }

    return prisma.report.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id:             true,
        trackingId:     true,
        type:           true,
        categorie:      true,
        anonymatLevel:  true,
        isAnonymous:    true,
        crisisDetected: true,
        status:         true,
        severity:       true,
        createdAt:      true,
        updatedAt:      true,
        userId:         ['SUPERVISOR', 'ADMIN'].includes(role) ? true : false,
        user:           ['SUPERVISOR', 'ADMIN'].includes(role)
          ? { select: { firstName: true, lastName: true } }
          : false,
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          select: { id: true, sender: true, content: true, createdAt: true }
        },
        summary: {
          select: { classLevel: true }
        }
      }
    })
  },

  /**
   * Retourne le détail complet d'un rapport via son trackingId.
   * - SUPERVISOR / ADMIN → accès à tous les rapports
   * - STUDENT → uniquement ses propres rapports
   * - PARENT → uniquement les rapports de ses enfants liés
   * Lance REPORT_NOT_FOUND ou FORBIDDEN selon le cas.
   */
  async findByTrackingId(trackingId: string, userId: string, role: string) {
    const report = await prisma.report.findUnique({
      where: { trackingId },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
        // On inclut l'étudiant avec son parentId pour vérifier le lien
        user: {
          select: { id: true, parentId: true }
        }
      }
    })

    if (!report) throw new Error('REPORT_NOT_FOUND')

    // SUPERVISOR et ADMIN → accès total
    if (['SUPERVISOR', 'ADMIN'].includes(role)) return report

    // STUDENT → uniquement ses propres rapports
    if (role === 'STUDENT' && report.userId === userId) return report

    // PARENT → uniquement les rapports de ses enfants liés (signalement anonyme = jamais visible par un parent)
    if (role === 'PARENT' && report.user?.parentId === userId) return report

    throw new Error('FORBIDDEN')
  },

  /**
   * Met à jour le statut d'un rapport.
   * Progression : EN_ATTENTE → EN_COURS → RESOLU
   * Réservé aux Supervisors et Admins.
   */
  async updateStatus(trackingId: string, { status }: UpdateStatusInput) {
    const report = await prisma.report.findUnique({ where: { trackingId } })
    if (!report) throw new Error('REPORT_NOT_FOUND')

    return prisma.report.update({
      where: { trackingId },
      data:  { status },
      select: { id: true, trackingId: true, status: true, updatedAt: true }
    })
  },

  /**
   * Met à jour la gravité d'un rapport après évaluation.
   * BAS / MOYEN / ELEVE correspond aux badges colorés du dashboard.
   * Réservé aux Supervisors et Admins.
   */
  async updateSeverity(trackingId: string, { severity }: UpdateSeverityInput) {
    const report = await prisma.report.findUnique({ where: { trackingId } })
    if (!report) throw new Error('REPORT_NOT_FOUND')

    return prisma.report.update({
      where: { trackingId },
      data:  { severity },
      select: { id: true, trackingId: true, severity: true, updatedAt: true }
    })
  },

  /**
   * Ajoute la déposition complète de l'étudiant (message) à un rapport existant.
   * Met à jour crisisDetected si des mots clés sont détectés, et fait avancer
   * le statut de EN_ATTENTE vers EN_COURS.
   * Lance REPORT_NOT_FOUND si le trackingId n'existe pas.
   */
  async addDeposition(trackingId: string, content: string, crisisDetected: boolean) {
    const report = await prisma.report.findUnique({ where: { trackingId } })
    if (!report) throw new Error('REPORT_NOT_FOUND')

    await prisma.chatMessage.create({
      data: { reportId: report.id, sender: 'USER', content }
    })

    return prisma.report.update({
      where: { trackingId },
      data: {
        crisisDetected: report.crisisDetected || crisisDetected,
        status: report.status === ReportStatus.EN_ATTENTE ? ReportStatus.EN_COURS : report.status
      },
      select: { trackingId: true, status: true, crisisDetected: true, updatedAt: true }
    })
  },

  /**
   * Retourne les informations publiques d'un rapport via son trackingId,
   * sans authentification (parcours parent par code de suivi).
   * Lance REPORT_NOT_FOUND si le trackingId n'existe pas.
   */
  async findPublicByTrackingId(trackingId: string) {
    const report = await prisma.report.findUnique({
      where: { trackingId },
      select: { trackingId: true, status: true, categorie: true }
    })
    if (!report) throw new Error('REPORT_NOT_FOUND')
    return report
  },

  /**
   * Sauvegarde (ou met à jour) le résumé narratif détaillé d'un rapport,
   * collecté par le chatbot. Ne touche jamais aux champs déjà gérés par
   * create()/addDeposition() (categorie, anonymatLevel, crisisDetected...)
   * pour éviter qu'une donnée fiable soit écrasée par une valeur de webhook.
   * Lance REPORT_NOT_FOUND si le trackingId n'existe pas.
   */
  async saveSummary(trackingId: string, data: SaveSummaryInput) {
    const report = await prisma.report.findUnique({ where: { trackingId } })
    if (!report) throw new Error('REPORT_NOT_FOUND')

    return prisma.reportSummary.upsert({
      where: { reportId: report.id },
      create: { reportId: report.id, ...data },
      update: data
    })
  },

  /**
   * Retourne le résumé complet d'un rapport (champs du Report + ReportSummary associé).
   * Utilisé par GET /admin/reports/:id/summary et GET /parents/report/:code/summary.
   * Lance REPORT_NOT_FOUND si le trackingId n'existe pas.
   */
  async getSummary(trackingId: string) {
    const report = await prisma.report.findUnique({
      where: { trackingId },
      include: { summary: true }
    })
    if (!report) throw new Error('REPORT_NOT_FOUND')
    return report
  },

  /**
   * Assigne un référent (SUPERVISOR ou ADMIN) à un rapport.
   * Lance REPORT_NOT_FOUND si le rapport n'existe pas,
   * USER_NOT_FOUND si le referentId ne correspond à aucun membre du staff.
   */
  async assign(trackingId: string, referentId: string) {
    const report = await prisma.report.findUnique({ where: { trackingId } })
    if (!report) throw new Error('REPORT_NOT_FOUND')

    const referent = await prisma.user.findFirst({
      where: { id: referentId, role: { in: ['ADMIN', 'SUPERVISOR'] } }
    })
    if (!referent) throw new Error('USER_NOT_FOUND')

    await prisma.report.update({
      where: { trackingId },
      data: { assignedToId: referent.id }
    })

    return {
      trackingCode: trackingId,
      referent_id: referent.id,
      referent_name: [referent.firstName, referent.lastName].filter(Boolean).join(' ') || referent.email,
      assignedAt: new Date().toISOString()
    }
  },

  /**
   * Retourne les statistiques des rapports par établissement.
   * Utilisé par GET /admin/stats
   * Calcule les vrais chiffres depuis la base via groupBy Prisma.
   */
  async getStats(establishment_id?: string) {
    // Filtre par établissement si fourni
    const where = establishment_id
      ? { etablissementId: establishment_id }
      : {}

    // Répartition par catégorie
    const byCategorie = await prisma.report.groupBy({
      by: ['categorie'],
      _count: { id: true },
      where
    })

    // Répartition par statut
    const byStatus = await prisma.report.groupBy({
      by: ['status'],
      _count: { id: true },
      where
    })

    // Répartition par sévérité
    const bySeverity = await prisma.report.groupBy({
      by: ['severity'],
      _count: { id: true },
      where
    })

    // Total des rapports
    const total = await prisma.report.count({ where })

    // Total des rapports résolus
    const resolved = await prisma.report.count({
      where: { ...where, status: ReportStatus.RESOLU }
    })

    return {
      establishment_id,
      by_category: byCategorie.map(r => ({
        category: r.categorie,
        count:    r._count.id
      })),
      by_status: byStatus.map(r => ({
        status: r.status,
        count:  r._count.id
      })),
      by_level: bySeverity.map(r => ({
        level: r.severity,
        count: r._count.id
      })),
      total_reports: total,
      resolution_amount: total > 0
        ? `${Math.round((resolved / total) * 100)}%`
        : '0%',
      average_resolution_time: 'À calculer'
    }
  },

  /**
   * Supprime un rapport si créé il y a moins de 5 minutes.
   * Lance REPORT_NOT_FOUND si le rapport n'existe pas.
   * Lance DELETE_TIMEOUT si le délai de 5 minutes est dépassé.
   */
  async delete(trackingId: string, userId: string, role: string) {
    const report = await prisma.report.findUnique({ where: { trackingId } })
    if (!report) throw new Error('REPORT_NOT_FOUND')

    // Admin/Supervisor : accès total
    // Student : peut supprimer son propre rapport OU un rapport sans userId (créé anonymement)
    if (!['SUPERVISOR', 'ADMIN'].includes(role) && report.userId !== null && report.userId !== userId) {
      throw new Error('FORBIDDEN')
    }

    // Vérification du délai de 5 minutes
    const diff = Date.now() - new Date(report.createdAt).getTime()
    if (diff > 5 * 60 * 1000) {
      throw new Error('DELETE_TIMEOUT')
    }

    await prisma.$transaction([
      prisma.chatMessage.deleteMany({ where: { reportId: report.id } }),
      prisma.reportSummary.deleteMany({ where: { reportId: report.id } }),
      prisma.analytics.deleteMany({ where: { reportId: report.id } }),
      prisma.report.delete({ where: { trackingId } }),
    ])

    return {
      message:      'Votre signalement a été annulé avec succès. Si vous avez besoin d\'aide, n\'hésitez pas à contacter les numéros d\'urgence fournis.',
      trackingCode: trackingId,
      deletedAt:    new Date().toISOString()
    }
  },

  /**
   * Rattache un signalement anonyme (créé par Typebot sans token) au compte
   * de l'étudiant connecté. Silencieux si le rapport est déjà lié.
   * Lance REPORT_NOT_FOUND si le trackingId n'existe pas.
   */
  async link(trackingId: string, userId: string) {
    const report = await prisma.report.findUnique({ where: { trackingId } })
    if (!report) throw new Error('REPORT_NOT_FOUND')
    if (!report.userId) {
      await prisma.report.update({ where: { trackingId }, data: { userId } })
    }
    return { trackingCode: trackingId, linked: true }
  }

}

// --- Helpers ---

/**
 * Génère un tracking ID unique au format HVN-XXXX-XXXX.
 * Boucle jusqu'à trouver un ID libre en base.
 */
async function generateUniqueTrackingId(): Promise<string> {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const randomPart = (length: number) =>
    Array.from({ length }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join('')

  let trackingId = `HVN-${randomPart(4)}-${randomPart(4)}`

  // Vérifie l'unicité en base — collision rare mais possible
  while (await prisma.report.findUnique({ where: { trackingId } })) {
    trackingId = `HVN-${randomPart(4)}-${randomPart(4)}`
  }

  return trackingId
}
