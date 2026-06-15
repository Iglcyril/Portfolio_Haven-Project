/**
 * reports.ts
 * ------------------
 * Routes de signalement pour les étudiants.
 * Préfixe : /reports
 *
 * Routes :
 *   POST   /reports       → soumettre un signalement (sauvegardé en base)
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
   * Retourne le suivi d'un signalement via son tracking code.
   * Connecté à Prisma via reportService.findByTrackingId()
   *
   * Réponses :
   *   200 → rapport complet
   *   401 → token absent ou invalide
   *   403 → accès refusé
   *   404 → rapport introuvable
   */
  .get('/:code', async ({ params, bearer, set }) => {
    try {
      const { userId, role } = requireAuth(bearer ?? '')
      return await reportService.findByTrackingId(params.code, userId, role)
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
   * Connecté à Prisma via reportService.delete()
   *
   * Réponses :
   *   200 → signalement annulé
   *   401 → token absent ou invalide
   *   403 → délai dépassé ou accès refusé
   *   404 → rapport introuvable
   */
  .delete('/:code', async ({ params, bearer, set }) => {
    try {
      const { userId, role } = requireAuth(bearer ?? '')
      return await reportService.delete(params.code, userId, role)
    } catch (e) {
      const { status, body } = handleError(e)
      set.status = status
      return body
    }
  })
