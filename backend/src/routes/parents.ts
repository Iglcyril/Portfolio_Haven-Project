/**
 * parents.ts
 * ------------------
 * Routes de suivi pour les parents.
 * Préfixe : /parents
 *
 * Routes :
 *   GET  /parents/report/:code       → suivi d'un rapport par tracking code
 *   GET  /parents/children/reports   → tous les rapports des enfants liés
 *   POST /parents/contact            → formulaire de contact pour les parents
 *   POST /parents/link-child         → lier un parent à son enfant
 *
 * Connecté à Prisma via reportService.findByTrackingId()
 */

import { Elysia, t } from 'elysia'
import { bearer } from '@elysiajs/bearer'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { requireAuth, requireParent } from '../middlewares/auth.middleware'
import { handleError } from '../middlewares/error.middleware'
import { reportService } from '../services/report.service'

// Prisma v7 — nécessite un adapter explicite pour la connexion PostgreSQL
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

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
   * GET /parents/children/reports
   * Réservé : PARENT
   * Retourne automatiquement tous les rapports des enfants liés au parent connecté.
   * Le parent n'a pas besoin du tracking code.
   *
   * Réponses :
   *   200 → liste des rapports des enfants
   *   401 → token absent ou invalide
   *   403 → accès refusé (pas un parent)
   */
  .get('/children/reports', async ({ bearer, set }) => {
    try {
      const { userId } = requireParent(bearer ?? '')

      // Récupère tous les enfants liés au parent avec leurs rapports
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
              updatedAt:      true,
              // On ne retourne pas le contenu — données sensibles
              messages:       false
            }
          }
        }
      })

      if (children.length === 0) {
        return {
          message:  'Aucun enfant lié à ce compte',
          children: []
        }
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

  /**
   * POST /parents/link-child
   * Réservé : PARENT
   * Permet à un parent de lier son compte à son enfant via
   * prénom, nom et date de naissance.
   * Si l'étudiant est trouvé → lien créé automatiquement.
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

      // Cherche l'étudiant correspondant en base
      const student = await prisma.user.findFirst({
        where: {
          firstName: body.firstName,
          lastName:  body.lastName,
          birthDate: new Date(body.birthDate),
          role:      'STUDENT'
        }
      })

      if (!student) throw new Error('STUDENT_NOT_FOUND')

      // Crée le lien parent → enfant
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
