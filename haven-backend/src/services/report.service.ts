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
  userId:           string
  type:             'victime' | 'temoin'
  category:         Categorie
  anonymatLevel:    AnonymatLevel
  contenu:          string
  establishment_id: string
  crisisDetected:   boolean
}

export type UpdateStatusInput = {
  status: ReportStatus
}

export type UpdateSeverityInput = {
  severity: Severity
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
        // On cache userId si le rapport est anonyme
        userId: ['SUPERVISOR', 'ADMIN'].includes(role) ? true : false
      }
    })
  },

  /**
   * Retourne le détail complet d'un rapport via son trackingId.
   * - Un Student ne peut accéder qu'à ses propres rapports
   * - Un Supervisor / Admin peut accéder à tous les rapports
   * Lance REPORT_NOT_FOUND ou FORBIDDEN selon le cas.
   */
  async findByTrackingId(trackingId: string, userId: string, role: string) {
    const report = await prisma.report.findUnique({
      where: { trackingId },
      include: {
        // Messages triés chronologiquement pour reconstituer la conversation
        messages: { orderBy: { createdAt: 'asc' } }
      }
    })

    if (!report) throw new Error('REPORT_NOT_FOUND')

    // Un student ne peut voir que ses propres rapports
    if (!['SUPERVISOR', 'ADMIN'].includes(role) && report.userId !== userId) {
      throw new Error('FORBIDDEN')
    }

    return report
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

    // Un student ne peut supprimer que ses propres rapports
    if (!['SUPERVISOR', 'ADMIN'].includes(role) && report.userId !== userId) {
      throw new Error('FORBIDDEN')
    }

    // Vérification du délai de 5 minutes
    const diff = Date.now() - new Date(report.createdAt).getTime()
    if (diff > 5 * 60 * 1000) {
      throw new Error('DELETE_TIMEOUT')
    }

    await prisma.report.delete({ where: { trackingId } })

    return {
      message:      'Votre signalement a été annulé avec succès. Si vous avez besoin d\'aide, n\'hésitez pas à contacter les numéros d\'urgence fournis.',
      trackingCode: trackingId,
      deletedAt:    new Date().toISOString()
    }
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
