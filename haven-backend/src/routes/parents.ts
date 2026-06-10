/**
 * parents.ts
 * ------------------
 * Routes de suivi pour les parents.
 * Préfixe : /parents
 *
 * Routes :
 *   GET  /parents/report/:code → suivi d'un rapport par tracking code
 *   POST /parents/contact      → formulaire de contact pour les parents
 *
 * Note : les données sont statiques pour l'instant.
 * À remplacer par des requêtes Prisma quand le Report Service sera connecté.
 */

import { Elysia, t } from 'elysia'
import { bearer } from '@elysiajs/bearer'
import { requireAuth } from '../middlewares/auth.middleware'
import { handleError } from '../middlewares/error.middleware'

export const parentsRoutes = new Elysia({ prefix: '/parents' })
  .use(bearer())

  /**
   * GET /parents/report/:code
   * Réservé : utilisateurs connectés (Parent, Supervisor, Admin)
   * Retourne le suivi d'un rapport via son tracking code.
   * À faire : remplacer par prisma.report.findUnique({ where: { trackingId: code } })
   */
  .get('/report/:code', async ({ params, bearer, set }) => {
    try {
      requireAuth(bearer ?? '')

      const { code } = params

      // Vérification du format du code de suivi
      if (!code.startsWith('HVN-')) {
        set.status = 404
        return { error: 'Code de suivi invalide' }
      }

      // À faire : remplacer par une vraie requête Prisma
      const report = {
        trackingCode:      code,
        studentName:       'Jean Dupont',
        incidentDate:      '2024-05-15',
        reportCategory:    'harcelement_scolaire',
        status:            'en_cours',
        supervisorName:    'Mme Durand',
        supervisorJob:     'Conseillère principale d\'éducation',
        supervisorContact: 'g.durand@etablissement.fr',
        actionsTaken: [
          'Contactez l\'école pour obtenir des informations supplémentaires'
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
   * POST /parents/contact
   * Public — pas de JWT requis
   * Permet à un parent de contacter l'équipe de suivi.
   * À faire : envoyer un email ou créer une tâche dans le système de gestion de cas.
   */
  .post('/contact', async ({ body, set }) => {
    try {
      const { parentName, parentEmail, message } = body

      // À faire : envoyer un email à l'équipe de suivi
      // ex: sendEmail({ to: 'equipe@haven.fr', from: parentEmail, body: message })

      return {
        message:     'Merci pour votre message. Nous allons vous contacter sous peu.',
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
