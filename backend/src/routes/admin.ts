/**
 * admin.ts
 * ----------------
 * Routes d'administration — réservées aux ADMIN et SUPERVISOR.
 * Préfixe : /admin
 *
 * Routes :
 *   GET   /admin/reports                  → liste tous les signalements depuis la base
 *   GET   /admin/reports/:id              → détail d'un signalement depuis la base
 *   PATCH /admin/reports/:id/status       → modifier le statut en base
 *   PATCH /admin/reports/:id/severity     → modifier la sévérité en base
 *   GET   /admin/stats                    → statistiques par établissement depuis la base
 *   GET   /admin/team                     → liste de l'équipe (statique pour l'instant)
 *   PATCH /admin/users/:studentId/parent  → lier un parent à un étudiant
 */

import { Elysia, t } from 'elysia'
import { bearer } from '@elysiajs/bearer'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { requireSupervisor } from '../middlewares/auth.middleware'
import { handleError } from '../middlewares/error.middleware'
import { reportService } from '../services/report.service'

// Prisma v7 — nécessite un adapter explicite pour la connexion PostgreSQL
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

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

  /**
   * PATCH /admin/users/:studentId/parent
   * Réservé : ADMIN et SUPERVISOR
   * Lie un compte parent à un compte étudiant.
   * Permet au parent de consulter les rapports de son enfant.
   *
   * Réponses :
   *   200 → lien créé avec succès
   *   400 → utilisateur n'est pas un étudiant ou un parent
   *   401 → token absent ou invalide
   *   403 → accès refusé
   *   404 → utilisateur introuvable
   */
  .patch('/users/:studentId/parent', async ({ params, body, bearer, set }) => {
    try {
      requireSupervisor(bearer ?? '')

      // Vérifie que l'étudiant existe
      const student = await prisma.user.findUnique({
        where: { id: params.studentId }
      })
      if (!student) throw new Error('USER_NOT_FOUND')
      if (student.role !== 'STUDENT') {
        set.status = 400
        return { error: 'L\'utilisateur n\'est pas un étudiant' }
      }

      // Vérifie que le parent existe
      const parent = await prisma.user.findUnique({
        where: { id: body.parentId }
      })
      if (!parent) throw new Error('USER_NOT_FOUND')
      if (parent.role !== 'PARENT') {
        set.status = 400
        return { error: 'L\'utilisateur n\'est pas un parent' }
      }

      // Crée le lien parent → enfant
      await prisma.user.update({
        where: { id: params.studentId },
        data:  { parentId: body.parentId }
      })

      return {
        message:   'Lien parent/enfant créé avec succès',
        studentId: params.studentId,
        parentId:  body.parentId
      }

    } catch (e) {
      const { status, body } = handleError(e)
      set.status = status
      return body
    }
  }, {
    body: t.Object({
      parentId: t.String()
    })
  })
