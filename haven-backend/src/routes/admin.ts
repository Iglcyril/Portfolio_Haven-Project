/**
 * admin.ts
 * ----------------
 * Routes d'administration — réservées aux ADMIN et SUPERVISOR.
 * Préfixe : /admin
 *
 * Routes :
 *   GET   /admin/reports      → liste tous les signalements avec filtrage
 *   GET   /admin/reports/:id  → détail d'un signalement
 *   PATCH /admin/reports/:id  → modifier statut, catégorie, niveau
 *   GET   /admin/stats        → statistiques par établissement
 *   GET   /admin/team         → liste de l'équipe
 *
 * Note : toutes les données sont statiques pour l'instant.
 * À remplacer par des requêtes Prisma quand le Report Service sera connecté.
 */

import { Elysia, t } from 'elysia'
import { bearer } from '@elysiajs/bearer'
import { requireSupervisor } from '../middlewares/auth.middleware'
import { handleError } from '../middlewares/error.middleware'

export const adminRoutes = new Elysia({ prefix: '/admin' })
  .use(bearer())

  /**
   * GET /admin/reports
   * Réservé : ADMIN et SUPERVISOR
   * Retourne tous les signalements avec filtrage optionnel par status.
   * À faire : remplacer par prisma.report.findMany()
   */
  .get('/reports', async ({ query, bearer, set }) => {
    try {
      requireSupervisor(bearer ?? '')

      const { status } = query

      // À faire : remplacer par une vraie requête Prisma
      const reports = [
        {
          trackingCode: 'HVN-AB12-CD34',
          status:   'EN_ATTENTE',
          category: 'harcelement_scolaire',
          severite: 'ELEVE',
          createdAt: '2026-05-15T10:30:00Z'
        },
        {
          trackingCode: 'HVN-EF56-GH78',
          status:   'EN_COURS',
          category: 'cyberharcelement',
          severite: 'MOYEN',
          createdAt: '2026-05-20T14:00:00Z'
        },
        {
          trackingCode: 'HVN-IJ90-KL12',
          status:   'RESOLU',
          category: 'mal_etre',
          severite: 'BAS',
          createdAt: '2026-05-22T09:15:00Z'
        }
      ]

      const filtered = status
        ? reports.filter(r => r.status === status)
        : reports

      return { data: filtered, total: filtered.length }

    } catch (e) {
      const { status, body } = handleError(e)
      set.status = status
      return body
    }
  })

  /**
   * GET /admin/reports/:id
   * Réservé : ADMIN et SUPERVISOR
   * Retourne le détail d'un signalement par trackingCode.
   * À faire : remplacer par prisma.report.findUnique({ where: { trackingId: id } })
   */
  .get('/reports/:id', async ({ params, bearer, set }) => {
    try {
      requireSupervisor(bearer ?? '')

      const { id } = params

      // Vérification format trackingCode
      if (!id.startsWith('HVN-')) {
        set.status = 404
        return { error: 'Signalement non trouvé' }
      }

      // À faire : remplacer par une vraie requête Prisma
      const report = {
        trackingCode: id,
        status:   'EN_COURS',
        category: 'harcelement_scolaire',
        severite: 'ELEVE',
        createdAt: '2026-05-15T10:30:00Z'
      }

      return report

    } catch (e) {
      const { status, body } = handleError(e)
      set.status = status
      return body
    }
  })

  /**
   * PATCH /admin/reports/:id
   * Réservé : ADMIN et SUPERVISOR
   * Modifie le statut, la catégorie ou le niveau de sévérité d'un signalement.
   * Tous les champs sont optionnels.
   * À faire : remplacer par prisma.report.update()
   */
  .patch('/reports/:id', async ({ params, body, bearer, set }) => {
    try {
      requireSupervisor(bearer ?? '')

      const { id } = params

      // Vérification format trackingCode
      if (!id.startsWith('HVN-')) {
        set.status = 404
        return { error: 'Signalement non trouvé' }
      }

      // À faire : remplacer par une vraie requête Prisma
      return {
        trackingCode: id,
        status:   body.status   ?? 'EN_ATTENTE',
        category: body.category ?? 'harcelement_scolaire',
        severite: body.level    ?? 'BAS',
        updatedAt: new Date().toISOString()
      }

    } catch (e) {
      const { status, body } = handleError(e)
      set.status = status
      return body
    }
  }, {
    body: t.Object({
      status: t.Optional(t.Union([
        t.Literal('EN_ATTENTE'),
        t.Literal('EN_COURS'),
        t.Literal('RESOLU'),
        t.Literal('archive')
      ])),
      assigne_a:    t.Optional(t.String()),
      note_interne: t.Optional(t.String()),
      category: t.Optional(t.Union([
        t.Literal('harcelement_scolaire'),
        t.Literal('violence_physique'),
        t.Literal('violence_verbale'),
        t.Literal('cyberharcelement'),
        t.Literal('discrimination'),
        t.Literal('mal_etre'),
        t.Literal('autre')
      ])),
      level: t.Optional(t.Union([
        t.Literal('BAS'),
        t.Literal('MOYEN'),
        t.Literal('ELEVE')
      ]))
    })
  })

  /**
   * GET /admin/stats
   * Réservé : ADMIN et SUPERVISOR
   * Retourne les statistiques par établissement.
   * À faire : remplacer par prisma.report.groupBy()
   */
  .get('/stats', async ({ query, bearer, set }) => {
    try {
      requireSupervisor(bearer ?? '')

      const { establishment_id } = query

      // À faire : remplacer par une vraie requête Prisma
      return {
        establishment_id,
        by_category: [
          { category: 'harcelement_scolaire', count: 10 },
          { category: 'violence_physique',    count: 2  },
          { category: 'violence_verbale',     count: 1  },
          { category: 'cyberharcelement',     count: 5  },
          { category: 'discrimination',       count: 0  },
          { category: 'mal_etre',             count: 3  },
          { category: 'autre',                count: 0  }
        ],
        by_status: [
          { status: 'EN_ATTENTE', count: 4 },
          { status: 'EN_COURS',   count: 8 },
          { status: 'RESOLU',     count: 5 },
          { status: 'archive',    count: 1 }
        ],
        by_level: [
          { level: 'BAS',   count: 6 },
          { level: 'MOYEN', count: 7 },
          { level: 'ELEVE', count: 5 }
        ],
        total_reports: 20,
        resolution_amount: '50%',
        average_resolution_time: '3 jours'
      }

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
  .get('/team', async ({ query, bearer, set }) => {
    try {
      requireSupervisor(bearer ?? '')

      // À faire : remplacer par une vraie requête Prisma
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
