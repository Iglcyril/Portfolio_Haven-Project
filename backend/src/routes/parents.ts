/**
 * parents.ts
 * ------------------
 * Routes de suivi pour les parents.
 * Préfixe : /parents
 *
 * Routes :
 *   GET  /parents/report/:code         → suivi d'un rapport (JWT requis)
 *   GET  /parents/report/:code/summary → résumé complet du signalement (JWT requis)
 *   GET  /parents/children/reports     → tous les rapports des enfants liés (JWT requis)
 *   POST /parents/contact              → formulaire de contact (public)
 *   POST /parents/link-child           → lier un parent à son enfant (JWT requis)
 */

import { Elysia, t } from 'elysia'
import { bearer } from '@elysiajs/bearer'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { requireAuth, requireParent } from '../middlewares/auth.middleware'
import { handleError } from '../middlewares/error.middleware'
import { reportService } from '../services/report.service'
import { contactService } from '../services/contact.service'

// Prisma v7 — nécessite un adapter explicite pour la connexion PostgreSQL
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

export const parentsRoutes = new Elysia({ prefix: '/parents' })
  .use(bearer())

  /**
   * GET /parents/report/:code
   * Réservé : PARENT, SUPERVISOR, ADMIN
   * Retourne le suivi d'un rapport via son tracking code.
   * Le parent doit être connecté et lié à l'enfant via POST /parents/link-child.
   *
   * Réponses :
   *   200 → rapport complet
   *   401 → token absent ou invalide
   *   403 → accès refusé (pas lié à cet enfant)
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
   * GET /parents/report/:code/summary
   * Réservé : PARENT, SUPERVISOR, ADMIN
   * Retourne le résumé complet du signalement.
   * Le parent doit être connecté et lié à l'enfant.
   *
   * Réponses :
   *   200 → résumé complet
   *   401 → token absent ou invalide
   *   403 → accès refusé
   *   404 → rapport introuvable
   */
  .get('/report/:code/summary', async ({ params, bearer, set }) => {
    try {
      const { userId, role } = requireAuth(bearer ?? '')
      // Vérifie d'abord que le parent a accès au rapport
      await reportService.findByTrackingId(params.code, userId, role)
      // Puis retourne le résumé complet
      const report = await reportService.getSummary(params.code)
      return {
        trackingCode:     report.trackingId,
        role:             report.type,
        category:         report.categorie,
        anonymat_level:   report.anonymatLevel,
        report_status:    report.status,
        is_crisis:        report.crisisDetected,
        establishment_id: report.etablissementId,
        initial_feeling:  report.summary?.initialFeeling ?? null,
        mood:             report.summary?.mood ?? null,
        adult_contact:    report.summary?.adultContact ?? null,
        contact_team:     report.summary?.contactTeam ?? null,
        savedAt:          report.summary?.updatedAt ?? report.updatedAt
      }
    } catch (e) {
      const { status, body } = handleError(e)
      set.status = status
      return body
    }
  })

  /**
   * GET /parents/children/reports
   * Réservé : PARENT
   * Retourne automatiquement tous les rapports des enfants liés au parent connecté.
   *
   * Réponses :
   *   200 → liste des rapports des enfants
   *   401 → token absent ou invalide
   *   403 → accès refusé (pas un parent)
   */
  .get('/children/reports', async ({ bearer, set }) => {
    try {
      const { userId } = requireParent(bearer ?? '')

      const children = await prisma.user.findMany({
        where: { parentId: userId },
        select: {
          id:        true,
          firstName: true,
          lastName:  true,
          email:     true,
          reports: {
            orderBy: { createdAt: 'desc' },
            select: {
              id:             true,
              trackingId:     true,
              type:           true,
              categorie:      true,
              status:         true,
              severity:       true,
              crisisDetected: true,
              createdAt:      true,
              updatedAt:      true
            }
          }
        }
      })

      if (children.length === 0) {
        return { message: 'Aucun enfant lié à ce compte', children: [] }
      }

      return {
        total_children: children.length,
        children: children.map(child => ({
          id:            child.id,
          firstName:     child.firstName,
          lastName:      child.lastName,
          email:         child.email,
          total_reports: child.reports.length,
          reports:       child.reports
        }))
      }

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
   * Le message est sauvegardé en base via contactService.
   *
   * Réponses :
   *   200 → message envoyé et sauvegardé
   *   422 → body invalide
   */
  .post('/contact', async ({ body, set }) => {
    try {
      const saved = await contactService.create(body)
      return {
        message:     'Merci pour votre message. Nous allons vous contacter sous peu.',
        parentName:  saved.parentName,
        parentEmail: saved.parentEmail,
        sentAt:      saved.createdAt
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

  /**
   * POST /parents/link-child
   * Réservé : PARENT
   * Permet à un parent de lier son compte à son enfant via
   * prénom, nom et date de naissance.
   *
   * Réponses :
   *   200 → lien créé avec succès
   *   404 → aucun étudiant trouvé avec ces informations
   *   401 → token absent ou invalide
   *   403 → accès refusé (pas un parent)
   */
  .post('/link-child', async ({ body, bearer, set }) => {
    try {
      const { userId } = requireParent(bearer ?? '')

      const student = await prisma.user.findFirst({
        where: {
          firstName: body.firstName,
          lastName:  body.lastName,
          birthDate: new Date(body.birthDate),
          role:      'STUDENT'
        }
      })

      if (!student) throw new Error('STUDENT_NOT_FOUND')

      await prisma.user.update({
        where: { id: student.id },
        data:  { parentId: userId }
      })

      return {
        message:   'Lien parent/enfant créé avec succès',
        studentId: student.id,
        parentId:  userId,
        childName: `${student.firstName} ${student.lastName}`
      }

    } catch (e) {
      const { status, body } = handleError(e)
      set.status = status
      return body
    }
  }, {
    body: t.Object({
      firstName: t.String({ minLength: 2 }),
      lastName:  t.String({ minLength: 2 }),
      birthDate: t.String()  // format YYYY-MM-DD ex: 2010-05-15
    })
  })
