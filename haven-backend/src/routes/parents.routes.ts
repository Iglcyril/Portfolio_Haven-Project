/**
 * parents.routes.ts
 * ------------------
 * Routes de suivi pour les parents.
 * Préfixe : /api/parents
 *
 * Routes :
 *   GET  /api/parents/report/:code → suivi d'un rapport par tracking code
 *   POST /api/parents/contact      → formulaire de contact pour les parents
 *
 * Note : les données sont statiques pour l'instant.
 * À remplacer par des requêtes Prisma quand le Report Service sera connecté.
 */

import { Elysia, t } from 'elysia'
import { bearer } from '@elysiajs/bearer'
import { requireParent, requireAuth } from '../middlewares/auth.middleware'
import { handleError } from '../middlewares/error.middleware'

export const parentsRoutes = new Elysia({ prefix: '/api/parents' })
  .use(bearer())

  /**
   * GET /api/parents/report/:code
   * Réservé : PARENT et SUPERVISOR
   * Retourne le suivi d'un rapport via son tracking code.
   * Permet au parent de suivre l'avancement du dossier de son enfant.
   * À faire : remplacer par prisma.report.findUnique({ where: { trackingCode: code } })
   */
  .get('/report/:code', async ({ params, bearer, set }) => {
    try {
      // Un parent ou supervisor peut consulter le suivi
      requireAuth(bearer ?? '')

      const { code } = params

      // À faire : remplacer par une vraie requête Prisma
      const report = {
        trackingCode:      code,
        studentName:       'Jean Dupont',
        incidentDate:      '2024-05-15',
        categorie:         'harcelement_scolaire',
        status:            'en_cours',
        severite:          'MEDIUM',
        supervisorName:    'Mme Durand',
        supervisorJob:     'Conseillère principale d\'éducation',
        supervisorContact: 'g.durand@etablissement.fr',
        actionsTaken: [
          'Entretien avec l\'élève concerné',
          'Contact avec les familles',
          'Mise en place d\'un suivi hebdomadaire'
        ],
        nextSteps: 'Suivi régulier avec la famille et l\'école pour assurer la sécurité de l\'enfant'
      }

      return report

    } catch (e) {
      const { status, body } = handleError(e)
      set.status = status
      return body
    }
  })

  /**
   * POST /api/parents/contact
   * Public — pas de JWT requis
   * Permet à un parent de contacter l'équipe de suivi.
   * À faire : envoyer un email ou créer une tâche dans le système de gestion de cas.
   */
  .post('/contact', async ({ body, set }) => {
    try {
      const { parentName, parentEmail, message } = body

      // À faire : envoyer un email à l'équipe de suivi
      // ex: sendEmail({ to: 'equipe@haven.fr', from: parentEmail, subject: `Contact de ${parentName}`, body: message })

      return {
        confirmation: 'Merci pour votre message. Nous allons vous contacter sous peu.',
        parentName,
        parentEmail,
        sentAt: new Date().toISOString()
      }

    } catch (e) {
      const { status, body } = handleError(e)
      set.status = status
      return body
    }
  }, {
    body: t.Object({
      parentName:  t.String({ minLength: 2 }),
      parentEmail: t.String({ format: 'email' }),
      message:     t.String({ minLength: 10 })
    })
  })
