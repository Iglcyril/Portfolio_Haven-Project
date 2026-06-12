/**
 * admin.ts
 * ----------------
 * Routes d'administration — réservées aux ADMIN et SUPERVISOR.
 * Préfixe : /admin
 *
 * Routes :
 *   GET   /admin/reports      → liste tous les signalements depuis la base
 *   GET   /admin/reports/:id  → détail d'un signalement depuis la base
 *   PATCH /admin/reports/:id  → modifier statut, catégorie, niveau en base
 *   GET   /admin/stats        → statistiques par établissement depuis la base
 *   GET   /admin/team         → liste de l'équipe (statique pour l'instant)
 */

import { Elysia, t } from 'elysia'
import { bearer } from '@elysiajs/bearer'
import { requireSupervisor } from '../middlewares/auth.middleware'
import { handleError } from '../middlewares/error.middleware'
import { reportService } from '../services/report.service'

export const adminRoutes = new Elysia({ prefix: '/admin' })
  .use(bearer())

  /**
   * GET /admin/reports
   * Réservé : ADMIN et SUPERVISOR
   * Retourne tous les signalements depuis la base avec filtrage optionnel par status.
   */
  .get('/reports', async ({ query, bearer, set }) => {
    try {
      const { userId, role } = requireSupervisor(bearer ?? '')
      return await reportService.findAll(userId, role)
    } catch (e) {
      const { status, body } = handleError(e)
      set.status = status
      return body
    }
  })

  /**
   * GET /admin/reports/:id
   * Réservé : ADMIN et SUPERVISOR
   * Retourne le détail d'un signalement par trackingId depuis la base.
   */
  .get('/reports/:id', async ({ params, bearer, set }) => {
    try {
      const { userId, role } = requireSupervisor(bearer ?? '')
      return await reportService.findByTrackingId(params.id, userId, role)
    } catch (e) {
      const { status, body } = handleError(e)
      set.status = status
      return body
    }
  })

  /**
   * PATCH /admin/reports/:id/status
   * Réservé : ADMIN et SUPERVISOR
   * Met à jour le statut d'un signalement en base.
   */
  .patch('/reports/:id/status', async ({ params, body, bearer, set }) => {
    try {
      requireSupervisor(bearer ?? '')
      return await reportService.updateStatus(params.id, body)
    } catch (e) {
      const { status, body } = handleError(e)
      set.status = status
      return body
    }
  }, {
    body: t.Object({
      status: t.Union([
        t.Literal('EN_ATTENTE'),
        t.Literal('EN_COURS'),
        t.Literal('RESOLU')
      ])
    })
  })

  /**
   * PATCH /admin/reports/:id/severity
   * Réservé : ADMIN et SUPERVISOR
   * Met à jour la sévérité d'un signalement en base.
   */
  .patch('/reports/:id/severity', async ({ params, body, bearer, set }) => {
    try {
      requireSupervisor(bearer ?? '')
      return await reportService.updateSeverity(params.id, body)
    } catch (e) {
      const { status, body } = handleError(e)
      set.status = status
      return body
    }
  }, {
    body: t.Object({
      severity: t.Union([
        t.Literal('BAS'),
        t.Literal('MOYEN'),
        t.Literal('ELEVE')
      ])
    })
  })

  /**
   * GET /admin/stats
   * Réservé : ADMIN et SUPERVISOR
   * Retourne les statistiques par établissement depuis la base.
   */
  .get('/stats', async ({ query, bearer, set }) => {
    try {
      requireSupervisor(bearer ?? '')
      const { establishment_id } = query
      return await reportService.getStats(establishment_id)
    } catch (e) {
      const { status, body } = handleError(e)
      set.status = status
      return body
    }
  })

  /**
   * GET /admin/team
   * Réservé : ADMIN et SUPERVISOR
   * Retourne la liste de l'équipe de suivi.
   * À faire : remplacer par une vraie requête Prisma
   */
  .get('/team', async ({ bearer, set }) => {
    try {
      requireSupervisor(bearer ?? '')

      return {
        team_info: [
          {
            id: 1,
            name: 'Alice Dupont',
            role: 'Responsable de la sécurité',
            email: 'alice.dupont@example.com',
            dispo: 'Libre',
            assigned_cases: 5
          },
          {
            id: 2,
            name: 'Bob Martin',
            role: 'Psychologue scolaire',
            email: 'bob.martin@example.com',
            dispo: 'Occupé',
            assigned_cases: 3
          },
          {
            id: 3,
            name: 'Claire Durand',
            role: 'Médiatrice',
            email: 'claire.durand@example.com',
            dispo: 'Absent',
            assigned_cases: 2
          }
        ]
      }

    } catch (e) {
      const { status, body } = handleError(e)
      set.status = status
      return body
    }
  })
