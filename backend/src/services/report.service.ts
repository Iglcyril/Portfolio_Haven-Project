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

import { ReportStatus, Severity, AnonymatLevel, Categorie } from '@prisma/client'
import { prisma } from '../lib/prisma'

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
  async findAll(userId: string, role: string, page = 1, limit = 10, statusFilter?: string) {
    const isStaff = ['SUPERVISOR', 'ADMIN'].includes(role)
    const where: Record<string, unknown> = isStaff ? {} : { userId }
    if (statusFilter) where.status = statusFilter

    const skip = (page - 1) * limit

    const [data, total] = await Promise.all([
      prisma.report.findMany({
        where,
        skip,
        take: limit,
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
          userId:         isStaff,
          user:           isStaff ? { select: { firstName: true, lastName: true } } : false,
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
      }),
      prisma.report.count({ where }),
    ])

    return { data, total, page, totalPages: Math.ceil(total / limit), limit }
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

    // PARENT → uniquement les rapports de ses enfants liés, non masqués (signalement anonyme ou contexte domicile = jamais visible)
    if (role === 'PARENT' && report.user?.parentId === userId && !report.hiddenFromParent) return report

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
    const where = establishment_id ? { etablissementId: establishment_id } : {}

    // Récupère tous les signalements en une seule requête pour les calculs temporels
    const allReports = await prisma.report.findMany({
      where,
      select: { createdAt: true, updatedAt: true, severity: true, status: true, categorie: true }
    })

    const total = allReports.length
    const notPending = allReports.filter(r => r.status !== 'EN_ATTENTE').length
    const tauxPriseEnCharge = total > 0 ? Math.round((notPending / total) * 100) : 0

    // Temps moyen de résolution (en jours) sur les dossiers RESOLU/ARCHIVE
    const resolved = allReports.filter(r => r.status === 'RESOLU' || r.status === 'ARCHIVE')
    const avgResolutionDays = resolved.length > 0
      ? Math.round(
          resolved.reduce((sum, r) =>
            sum + (new Date(r.updatedAt).getTime() - new Date(r.createdAt).getTime()), 0
          ) / resolved.length / (1000 * 60 * 60 * 24)
        )
      : null

    // Helpers temporels
    const now = new Date()

    const weekKey = (d: Date) => {
      const ms  = now.getTime() - d.getTime()
      const wk  = Math.floor(ms / (7 * 24 * 3600 * 1000))
      return wk <= 7 ? wk : null
    }
    const monthKey = (d: Date) => {
      const dm = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth())
      return dm <= 5 ? dm : null
    }
    const yearKey = (d: Date) => {
      const dy = now.getFullYear() - d.getFullYear()
      return dy <= 2 ? dy : null
    }

    type Bucket = { total: number; high: number; medium: number; low: number }
    const makeBuckets = (n: number): Bucket[] =>
      Array.from({ length: n }, () => ({ total: 0, high: 0, medium: 0, low: 0 }))

    const weekBuckets  = makeBuckets(8)
    const monthBuckets = makeBuckets(6)
    const yearBuckets  = makeBuckets(3)

    const sev = (s: string) => s === 'ELEVE' ? 'high' : s === 'MOYEN' ? 'medium' : 'low'

    for (const r of allReports) {
      const d = new Date(r.createdAt)
      const sv = sev(r.severity)
      const fill = (bucket: Bucket) => { bucket.total++; (bucket as Record<string, number>)[sv]++ }

      const wk = weekKey(d);  if (wk !== null) fill(weekBuckets[7 - wk])
      const mo = monthKey(d); if (mo !== null) fill(monthBuckets[5 - mo])
      const yr = yearKey(d);  if (yr !== null) fill(yearBuckets[2 - yr])
    }

    const MONTH_LABELS = ['Jan.','Fév.','Mar.','Avr.','Mai','Juin','Juil.','Août','Sep.','Oct.','Nov.','Déc.']
    const weekly  = weekBuckets.map((b, i) => ({ label: i === 7 ? 'S0' : `S-${7 - i}`, ...b }))
    const monthly = monthBuckets.map((b, i) => {
      const mo = new Date(now.getFullYear(), now.getMonth() - (5 - i))
      return { label: MONTH_LABELS[mo.getMonth()], ...b }
    })
    const yearly  = yearBuckets.map((b, i) => ({
      label: String(now.getFullYear() - (2 - i)), ...b
    }))

    // Répartition par sévérité (pourcentages pour le donut)
    const sevCounts = { ELEVE: 0, MOYEN: 0, BAS: 0 }
    for (const r of allReports) sevCounts[r.severity as keyof typeof sevCounts]++
    const bySeverity = [
      { name: 'Élevé',  value: total > 0 ? Math.round(sevCounts.ELEVE / total * 100) : 0, color: '#C0392B' },
      { name: 'Moyen',  value: total > 0 ? Math.round(sevCounts.MOYEN / total * 100) : 0, color: '#E67E22' },
      { name: 'Faible', value: total > 0 ? Math.round(sevCounts.BAS   / total * 100) : 0, color: '#2EAB7B' },
    ]

    // Répartition par catégorie
    const catCounts: Record<string, number> = {}
    for (const r of allReports) catCounts[r.categorie] = (catCounts[r.categorie] ?? 0) + 1
    const byCategory = Object.entries(catCounts)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)

    // Répartition par statut
    const statusCounts: Record<string, number> = {}
    for (const r of allReports) statusCounts[r.status] = (statusCounts[r.status] ?? 0) + 1

    return {
      total,
      tauxPriseEnCharge,
      avgResolutionDays,
      weekly,
      monthly,
      yearly,
      bySeverity,
      byCategory,
      byStatus: Object.entries(statusCounts).map(([status, count]) => ({ status, count })),
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
    if (report.userId === userId) return { trackingCode: trackingId, linked: true }
    if (report.userId !== null) throw new Error('REPORT_ALREADY_LINKED')
    await prisma.report.update({ where: { trackingId }, data: { userId } })
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
