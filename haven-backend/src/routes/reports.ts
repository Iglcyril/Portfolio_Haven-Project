/**
 * reports.ts
 * ------------------
 * Routes de signalement pour les étudiants.
 * Préfixe : /reports
 *
 * Routes :
 *   POST   /reports      → soumettre un signalement (sauvegardé en base)
 *   GET    /reports/:code → suivi d'un signalement par tracking code
 *   DELETE /reports/:code → annuler un signalement (dans les 5 minutes)
 *
 * Connecté à Prisma — les données sont sauvegardées en base.
 */

import { Elysia, t } from 'elysia'
import { bearer } from '@elysiajs/bearer'
import { requireAuth } from '../middlewares/auth.middleware'
import { handleError } from '../middlewares/error.middleware'
import { reportService } from '../services/report.service'

// --- Mots clés de crise ---
// Liste à compléter — prendre en compte les fautes d'orthographe courantes
const alertKeywords = [
  'suicide',
  'me suicider',
  'me tuer',
  'je veux mourir',
  'je ne veux plus vivre',
  'je veux me faire du mal',
  'je veux me tuer',
  'en finir',
  'violer',
  'viol'
]

/**
 * Vérifie si le contenu du rapport contient des mots clés de crise.
 * La comparaison est insensible à la casse.
 */
function containsAlertKeywords(message: string): boolean {
  const lowerCaseMessage = message.toLowerCase()
  return alertKeywords.some(keyword => lowerCaseMessage.includes(keyword))
}

// --- Types de validation ---

// Type de signalement
const reportType = t.Union([
  t.Literal('victime'),
  t.Literal('temoin')
])

// Niveau d'anonymat
const anonymatLevel = t.Union([
  t.Literal('total'),
  t.Literal('partiel'),
  t.Literal('pas_anonyme')
])

// Catégories de signalement
const reportCategory = t.Union([
  t.Literal('harcelement_scolaire'),
  t.Literal('violence_physique'),
  t.Literal('violence_verbale'),
  t.Literal('cyberharcelement'),
  t.Literal('discrimination'),
  t.Literal('mal_etre'),
  t.Literal('autre')
])

export const reportsRoutes = new Elysia({ prefix: '/reports' })
  .use(bearer())

  /**
   * POST /reports
   * Réservé : tous les utilisateurs connectés
   * Soumet un nouveau signalement et le sauvegarde en base.
   * - Génère un tracking code unique
   * - Détecte les mots clés de crise
   * - Retourne les numéros d'urgence si crise détectée
   *
   * Réponses :
   *   201 → rapport créé avec trackingCode
   *   400 → establishment_id manquant
   *   401 → token absent ou invalide
   *   422 → body invalide
   */
  .post('/', async ({ body, bearer, set }) => {
    try {
      const { userId } = requireAuth(bearer ?? '')

      // Vérification establishment_id
      if (!body.establishment_id || body.establishment_id.trim() === '') {
        set.status = 400
        return { error: 'L\'identifiant de l\'établissement est requis' }
      }

      // Détection de crise sur le contenu du rapport
      const crisisAlert = containsAlertKeywords(body.contenu)

      // Sauvegarde en base via le Report Service
      const report = await reportService.create({
        userId,
        type:             body.type,
        category:         body.category,
        anonymatLevel:    body.anonymat_level,
        contenu:          body.contenu,
        establishment_id: body.establishment_id,
        crisisDetected:   crisisAlert
      })

      set.status = 201

      return {
        trackingCode:   report.trackingId,
        statut:         'recu',
        crisisDetected: report.crisisDetected,
        createdAt:      report.createdAt,
        // Si crise détectée → numéros d'urgence avec message réconfortant
        ...(crisisAlert && {
          urgence: {
            message: 'Tu n\'es pas seul(e), Contacte immédiatement :',
            number: [
              { name: 'Prévention suicide',                number: '3114' },
              { name: 'Enfance en danger',                 number: '119'  },
              { name: 'Cyberharcèlement',                  number: '3018' },
              { name: 'Pour les personnes sourd-aveugles', number: '114'  }
            ]
          }
        })
      }

    } catch (e) {
      const { status, body } = handleError(e)
      set.status = status
      return body
    }
  }, {
    body: t.Object({
      type:             reportType,
      anonymat_level:   anonymatLevel,
      contenu:          t.String({ minLength: 10 }),
      category:         reportCategory,
      establishment_id: t.String()
    })
  })

  /**
   * GET /reports/:code
   * Réservé : tous les utilisateurs connectés
   * Retourne le suivi d'un signalement via son tracking code avec timeline.
   * À faire : remplacer par prisma.report.findUnique({ where: { trackingId: code } })
   *
   * Réponses :
   *   200 → rapport avec timeline
   *   401 → token absent ou invalide
   *   404 → code de suivi invalide
   */
  .get('/:code', async ({ params, bearer, set }) => {
    try {
      requireAuth(bearer ?? '')

      const { code } = params

      // Vérification du format du code de suivi
      if (!code.startsWith('HVN-')) {
        set.status = 404
        return { error: 'Code de suivi invalide' }
      }

      // À faire : remplacer par une vraie requête Prisma
      return {
        tracking_code:  code,
        current_status: 'EN_COURS',
        category:       'harcelement_scolaire',
        level:          'MOYEN',
        referent:       'Madame Dupont',
        createdAt:      '2026-05-15T10:30:00Z',
        last_update:    '2026-05-15T10:30:00Z',
        timeline: [
          {
            step:      'EN_ATTENTE',
            timestamp: '2026-05-15T10:30:00Z',
            comment:   'Signalement reçu, en attente de traitement'
          },
          {
            step:      'EN_COURS',
            timestamp: '2026-05-16T14:45:00Z',
            comment:   'Le référent de l\'établissement a pris en charge le signalement'
          }
        ],
        next_steps: [
          'Le référent de l\'établissement prendra contact avec vous dans les plus brefs délais',
          'En cas d\'urgence, n\'hésitez pas à contacter les numéros d\'urgence fournis'
        ]
      }

    } catch (e) {
      const { status, body } = handleError(e)
      set.status = status
      return body
    }
  })

  /**
   * DELETE /reports/:code
   * Réservé : tous les utilisateurs connectés
   * Annule un signalement dans les 5 minutes suivant sa création.
   * À faire : vérifier le délai de 5 minutes + prisma.report.delete()
   *
   * Réponses :
   *   200 → signalement annulé
   *   401 → token absent ou invalide
   *   404 → code de suivi invalide
   */
  .delete('/:code', async ({ params, bearer, set }) => {
    try {
      requireAuth(bearer ?? '')

      const { code } = params

      // Vérification du format du code de suivi
      if (!code.startsWith('HVN-')) {
        set.status = 404
        return { error: 'Signalement inconnu' }
      }

      // À faire : vérifier que le rapport a moins de 5 minutes
      // const report = await prisma.report.findUnique({ where: { trackingId: code } })
      // const diff = Date.now() - new Date(report.createdAt).getTime()
      // if (diff > 5 * 60 * 1000) return { error: 'Délai d\'annulation dépassé' }
      // await prisma.report.delete({ where: { trackingId: code } })

      return {
        message:      'Votre signalement a été annulé avec succès. Si vous avez besoin d\'aide, n\'hésitez pas à contacter les numéros d\'urgence fournis.',
        trackingCode: code,
        deletedAt:    new Date().toISOString()
      }

    } catch (e) {
      const { status, body } = handleError(e)
      set.status = status
      return body
    }
  })
