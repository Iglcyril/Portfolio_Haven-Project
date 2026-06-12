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
 * Connecté à Prisma via reportService.findByTrackingId()
 */

import { Elysia, t } from 'elysia'
import { bearer } from '@elysiajs/bearer'
import { requireAuth } from '../middlewares/auth.middleware'
import { handleError } from '../middlewares/error.middleware'
import { reportService } from '../services/report.service'

export const parentsRoutes = new Elysia({ prefix: '/parents' })
  .use(bearer())

  /**
   * GET /parents/report/:code
   * Réservé : utilisateurs connectés (Parent, Supervisor, Admin)
   * Retourne le suivi d'un rapport via son tracking code depuis la base.
   *
   * Réponses :
   *   200 → rapport complet
   *   401 → token absent ou invalide
   *   403 → accès refusé
   *   404 → rapport introuvable
   */
  .get('/report/:code', async ({ params, bearer, set }) => {
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
   * POST /parents/contact
   * Public — pas de JWT requis
   * Permet à un parent de contacter l'équipe de suivi.
   * À faire : envoyer un email à l'équipe de suivi
   *
   * Réponses :
   *   200 → message envoyé
   *   422 → body invalide
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
