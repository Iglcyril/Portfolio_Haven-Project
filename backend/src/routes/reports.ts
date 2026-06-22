/**
 * reports.ts
 * ------------------
 * Routes de signalement pour les étudiants.
 * Préfixe : /reports
 *
 * Routes :
 *   POST  /reports           → soumettre un signalement (sauvegardé en base)
 *   POST  /reports/:code     → ajouter une déposition via le chatbot Typebot
 *   GET   /reports/:code     → suivi d'un signalement par tracking code
 *   DELETE /reports/:code    → annuler un signalement (dans les 5 minutes)
 *   POST  /reports/:code/summary → sauvegarder le résumé complet du chatbot
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

const reportType = t.Union([
  t.Literal('victime'),
  t.Literal('temoin')
])

const anonymatLevel = t.Union([
  t.Literal('total'),
  t.Literal('partiel'),
  t.Literal('pas_anonyme')
])

const reportCategories = t.Union([
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
   * GET /reports
   * Réservé : utilisateurs connectés
   * - STUDENT → ses propres rapports
   * - SUPERVISOR / ADMIN → tous les rapports
   */
  .get('/', async ({ bearer, set }) => {
    try {
      const { userId, role } = requireAuth(bearer ?? '')
      return await reportService.findAll(userId, role)
    } catch (e) {
      const { status, body } = handleError(e)
      set.status = status
      return body
    }
  })

  /**
   * POST /reports
   * Pas d'authentification obligatoire — le chatbot crée des signalements anonymes.
   * Si un bearer valide est fourni, le rapport est rattaché au compte connecté.
   *
   * Réponses :
   *   200 → rapport créé avec trackingCode
   *   401 → token invalide (si fourni)
   */
  .post('/', async ({ body, bearer, set }) => {
    try {
      // Récupère le userId si un token valide est fourni — sinon signalement anonyme
      let userId: string | undefined
      if (bearer) {
        try { userId = requireAuth(bearer).userId } catch { /* signalement anonyme */ }
      }

      const crisisAlert = body.contenu ? containsAlertKeywords(body.contenu) : false

      const report = await reportService.create({
        userId,
        type:             body.type,
        category:         body.categorie,
        anonymatLevel:    body.anonymat_level,
        contenu:          body.contenu,
        establishment_id: body.etablissement_id,
        crisisDetected:   crisisAlert
      })

      return {
        trackingCode:   report.trackingId,
        statut:         report.status,
        crisisDetected: report.crisisDetected,
        createdAt:      report.createdAt,
        ...(crisisAlert && {
          urgence: {
            message: 'Tu n\'es pas seul(e), Contacte immédiatement :',
            numero: [
              { nom: 'Prévention suicide',                  numero: '3114' },
              { nom: 'Enfance en danger',                   numero: '119'  },
              { nom: 'Cyberharcèlement',                    numero: '3018' },
              { nom: 'Pour les personnes sourd-aveugles',   numero: '114'  }
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
      // Optionnel — le chatbot peut créer un rapport vide et ajouter le contenu ensuite
      contenu:          t.Optional(t.String({ minLength: 10 })),
      categorie:        reportCategories,
      etablissement_id: t.String()
    })
  })

  /**
   * POST /reports/:code
   * Pas d'authentification — même logique que POST /
   * Utilisé par le webhook Typebot pour ajouter la déposition après création du rapport.
   *
   * Réponses :
   *   200 → déposition ajoutée
   *   404 → rapport introuvable
   */
  .post('/:code', async ({ params, body, set }) => {
    try {
      const crisisAlert = containsAlertKeywords(body.content)
      const report = await reportService.addDeposition(params.code, body.content, crisisAlert)

      return {
        trackingCode:   report?.trackingId,
        statut:         report?.status,
        crisisDetected: report?.crisisDetected,
        updatedAt:      report?.updatedAt,
        ...(report?.crisisDetected && {
          urgence: {
            message: 'Tu n\'es pas seul(e), Contacte immédiatement :',
            numero: [
              { nom: 'Prévention suicide',                  numero: '3114' },
              { nom: 'Enfance en danger',                   numero: '119'  },
              { nom: 'Cyberharcèlement',                    numero: '3018' },
              { nom: 'Pour les personnes sourd-aveugles',   numero: '114'  }
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
      content: t.String({ minLength: 10 })
    })
  })

  /**
   * GET /reports/:code
   * Réservé : tous les utilisateurs connectés
   * Retourne le suivi d'un signalement via son tracking code.
   * L'accès est géré par reportService.findByTrackingId selon le rôle.
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

  /**
   * POST /reports/:code/link
   * Bearer requis — rattache un signalement anonyme créé par Typebot
   * au compte de l'étudiant connecté. Appelé automatiquement par Flutter
   * quand le bot affiche le code de suivi dans la conversation.
   */
  .post('/:code/link', async ({ params, bearer, set }) => {
    try {
      const { userId } = requireAuth(bearer ?? '')
      return await reportService.link(params.code, userId)
    } catch (e) {
      const { status, body } = handleError(e)
      set.status = status
      return body
    }
  })

  /**
   * POST /reports/:code/summary
   * Pas d'authentification — envoyé par le webhook Typebot
   * Sauvegarde le résumé complet du signalement collecté par le chatbot.
   * Tous les champs sont optionnels car les parcours victime/témoin
   * n'envoient pas exactement les mêmes champs.
   *
   * Réponses :
   *   200 → résumé sauvegardé
   *   404 → rapport introuvable
   */
  .post('/:code/summary', async ({ params, body, set }) => {
    try {
      const summary = await reportService.saveSummary(params.code, {
        classLevel:           body.classe,
        identity:             body.identite,
        initialFeeling:       body.ressenti_initial,
        mood:                 body.humeur,
        adultContact:         body.contact_adulte,
        contactTeam:          body.interpeller_equipe,
        witnessContext:       body.contexte_vu,
        victimInfo:           body.infos_victime,
        victimIdentity:       body.identite_victime,
        bullyInfo:            body.infos_harceleur,
        bullyIdentity:        body.identite_harceleur,
        situationDescription: body.description_situation
      })

      return {
        trackingCode: params.code,
        statut:       'resume_enregistre',
        savedAt:      summary.updatedAt
      }

    } catch (e) {
      const { status, body } = handleError(e)
      set.status = status
      return body
    }
  }, {
    body: t.Object({
      tracking_code:         t.Optional(t.String()),
      role:                  t.Optional(t.String()),
      type_signalement:      t.Optional(t.String()),
      anonymat_level:        t.Optional(t.String()),
      classe:                t.Optional(t.String()),
      identite:              t.Optional(t.String()),
      category:              t.Optional(t.String()),
      ressenti_initial:      t.Optional(t.String()),
      statut:                t.Optional(t.String()),
      humeur:                t.Optional(t.String()),
      is_crisis:             t.Optional(t.String()),
      contact_adulte:        t.Optional(t.String()),
      interpeller_equipe:    t.Optional(t.String()),
      establishment_id:      t.Optional(t.String()),
      contexte_vu:           t.Optional(t.String()),
      infos_victime:         t.Optional(t.String()),
      identite_victime:      t.Optional(t.String()),
      infos_harceleur:       t.Optional(t.String()),
      identite_harceleur:    t.Optional(t.String()),
      description_situation: t.Optional(t.String())
    })
  })
  