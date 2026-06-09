/**
 * admin.routes.ts
 * ----------------
 * Routes d'administration — réservées aux ADMIN et SUPERVISOR.
 * Préfixe : /api/admin
 *
 * Routes :
 *   GET   /api/admin/reports      → liste tous les signalements avec filtrage
 *   GET   /api/admin/reports/:id  → détail d'un signalement
 *   PATCH /api/admin/reports/:id  → modifier statut, catégorie, niveau
 *   GET   /api/admin/stats        → statistiques par établissement
 *
 * Note : toutes les données sont statiques pour l'instant.
 * À remplacer par des requêtes Prisma quand le Report Service sera connecté.
 */

import { Elysia, t } from 'elysia'
import { bearer } from '@elysiajs/bearer'
import { requireSupervisor } from '../middlewares/auth.middleware'
import { handleError } from '../middlewares/error.middleware'

export const adminRoutes = new Elysia({ prefix: '/api/admin' })
  .use(bearer())

  /**
   * GET /api/admin/reports
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
          status: 'urgent',
          categorie: 'harcelement_scolaire',
          severite: 'HIGH',
          createdAt: '2026-05-15T10:30:00Z'
        },
        {
          trackingCode: 'HVN-EF56-GH78',
          status: 'en_cours',
          categorie: 'cyberharcelement',
          severite: 'MEDIUM',
          createdAt: '2026-05-20T14:00:00Z'
        },
        {
          trackingCode: 'HVN-IJ90-KL12',
          status: 'traite',
          categorie: 'mal_etre',
          severite: 'LOW',
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
   * GET /api/admin/reports/:id
   * Réservé : ADMIN et SUPERVISOR
   * Retourne le détail d'un signalement par trackingCode.
   * À faire : remplacer par prisma.report.findUnique({ where: { trackingCode: id } })
   */
  .get('/reports/:id', async ({ params, bearer, set }) => {
    try {
      requireSupervisor(bearer ?? '')

      const { id } = params

      // À faire : remplacer par une vraie requête Prisma
      const report = {
        trackingCode: id,
        status: 'en_cours',
        categorie: 'harcelement_scolaire',
        severite: 'HIGH',
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
   * PATCH /api/admin/reports/:id
   * Réservé : ADMIN et SUPERVISOR
   * Modifie le statut, la catégorie ou le niveau de sévérité d'un signalement.
   * Tous les champs sont optionnels.
   * À faire : remplacer par prisma.report.update()
   */
  .patch('/reports/:id', async ({ params, body, bearer, set }) => {
    try {
      requireSupervisor(bearer ?? '')

      const { id } = params

      // À faire : remplacer par une vraie requête Prisma
      return {
        trackingCode: id,
        status:   body.status   ?? 'en_cours',
        categorie: body.categorie ?? 'harcelement_scolaire',
        severite:  body.severite  ?? 'HIGH',
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
        t.Literal('urgent'),
        t.Literal('en_cours'),
        t.Literal('traite'),
        t.Literal('archive')
      ])),
      assigne_a:    t.Optional(t.String()),
      note_interne: t.Optional(t.String()),
      categorie: t.Optional(t.Union([
        t.Literal('harcelement_scolaire'),
        t.Literal('violence_physique'),
        t.Literal('violence_verbale'),
        t.Literal('cyberharcelement'),
        t.Literal('discrimination'),
        t.Literal('mal_etre'),
        t.Literal('autre')
      ])),
      // Aligné sur le schema Prisma — LOW / MEDIUM / HIGH
      severite: t.Optional(t.Union([
        t.Literal('LOW'),
        t.Literal('MEDIUM'),
        t.Literal('HIGH')
      ]))
    })
  })

  /**
   * GET /api/admin/stats
   * Réservé : ADMIN et SUPERVISOR
   * Retourne les statistiques par établissement.
   * À faire : remplacer par prisma.report.groupBy()
   */
  .get('/stats', async ({ query, bearer, set }) => {
    try {
      requireSupervisor(bearer ?? '')

      const { etablissement_id } = query

      // À faire : remplacer par une vraie requête Prisma
      return {
        etablissement_id,
        by_categorie: [
          { categorie: 'harcelement_scolaire', count: 10 },
          { categorie: 'violence_physique',    count: 2  },
          { categorie: 'violence_verbale',     count: 1  },
          { categorie: 'cyberharcelement',     count: 5  },
          { categorie: 'discrimination',       count: 0  },
          { categorie: 'mal_etre',             count: 3  },
          { categorie: 'autre',                count: 0  }
        ],
        by_status: [
          { status: 'urgent',   count: 4 },
          { status: 'en_cours', count: 8 },
          { status: 'traite',   count: 5 },
          { status: 'archive',  count: 1 }
        ],
        // Aligné sur LOW / MEDIUM / HIGH
        by_severite: [
          { severite: 'LOW',    count: 6 },
          { severite: 'MEDIUM', count: 7 },
          { severite: 'HIGH',   count: 5 }
        ],
        total_reports: 20,
        resolution_rate: '50%',
        average_resolution_time: '3 jours'
      }

    } catch (e) {
      const { status, body } = handleError(e)
      set.status = status
      return body
    }
  })
