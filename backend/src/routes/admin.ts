/**
 * admin.ts
 * ----------------
 * Routes d'administration — réservées aux ADMIN et SUPERVISOR.
 * Préfixe : /admin
 *
 * Routes :
 *   GET   /admin/reports              → liste tous les signalements
 *   GET   /admin/reports/:id          → détail d'un signalement
 *   GET   /admin/reports/:id/summary  → résumé complet du signalement
 *   POST  /admin/reports/:id/assign   → assigner un référent
 *   PATCH /admin/reports/:id          → modifier statut, catégorie, niveau
 *   GET   /admin/stats                → statistiques par établissement
 *   GET   /admin/team                 → liste de l'équipe (inclut jobTitle et isCoRef)
 *   PATCH /admin/users/:userId        → mettre à jour jobTitle, isCoRef, ou promouvoir en ADMIN
 *   PATCH /admin/users/:studentId/parent → lier un parent à un étudiant
 */

import { Elysia, t } from 'elysia'
import { bearer } from '@elysiajs/bearer'
import { requireStaff, requireSupervisor } from '../middlewares/auth.middleware'
import { handleError } from '../middlewares/error.middleware'
import { reportService } from '../services/report.service'
import { authService } from '../services/auth.service'
import { prisma } from '../lib/prisma'

export const adminRoutes = new Elysia({ prefix: '/admin' })
  .use(bearer())

  /**
   * GET /admin/reports
   * Réservé : ADMIN et SUPERVISOR
   * Retourne tous les signalements avec filtrage optionnel par status.
   */
  .get('/reports', async ({ query, bearer, set }) => {
    try {
      const { userId, role } = requireStaff(bearer ?? '')
      const page         = Math.max(1, parseInt(query.page   ?? '1',  10))
      const limit        = Math.min(50, Math.max(1, parseInt(query.limit  ?? '10', 10)))
      const statusFilter = query.status || undefined
      return await reportService.findAll(userId, role, page, limit, statusFilter)
    } catch (e) {
      const { status, body } = handleError(e)
      set.status = status
      return body
    }
  }, {
    query: t.Object({
      page:   t.Optional(t.String()),
      limit:  t.Optional(t.String()),
      status: t.Optional(t.String()),
    })
  })

  /**
   * GET /admin/reports/:id
   * Réservé : ADMIN et SUPERVISOR
   * Retourne le détail d'un signalement par trackingId.
   */
  .get('/reports/:id', async ({ params, bearer, set }) => {
    try {
      const { userId, role } = requireStaff(bearer ?? '')
      return await reportService.findByTrackingId(params.id, userId, role)
    } catch (e) {
      const { status, body } = handleError(e)
      set.status = status
      return body
    }
  })

  /**
   * GET /admin/reports/:id/summary
   * Réservé : ADMIN et SUPERVISOR
   * Retourne le résumé complet du signalement (données du chatbot).
   */
  .get('/reports/:id/summary', async ({ params, bearer, set }) => {
    try {
      requireStaff(bearer ?? '')
      const report = await reportService.getSummary(params.id)
      return {
        trackingCode:        report.trackingId,
        role:                report.type,
        category:            report.categorie,
        anonymat_level:      report.anonymatLevel,
        status:              report.status,
        is_crisis:           report.crisisDetected,
        establishment_id:    report.etablissementId,
        classe:              report.summary?.classLevel ?? null,
        identite:            report.summary?.identity ?? null,
        ressenti_initial:    report.summary?.initialFeeling ?? null,
        humeur:              report.summary?.mood ?? null,
        contact_adulte:      report.summary?.adultContact ?? null,
        interpeller_equipe:  report.summary?.contactTeam ?? null,
        contexte_vu:         report.summary?.witnessContext ?? null,
        infos_victime:       report.summary?.victimInfo ?? null,
        identite_victime:    report.summary?.victimIdentity ?? null,
        infos_harceleur:     report.summary?.bullyInfo ?? null,
        identite_harceleur:  report.summary?.bullyIdentity ?? null,
        description_situation: report.summary?.situationDescription ?? null,
        createdAt:           report.createdAt,
        updatedAt:           report.summary?.updatedAt ?? report.updatedAt
      }
    } catch (e) {
      const { status, body } = handleError(e)
      set.status = status
      return body
    }
  })

  /**
   * POST /admin/reports/:id/assign
   * Réservé : ADMIN et SUPERVISOR
   * Assigne un référent à un signalement.
   */
  .post('/reports/:id/assign', async ({ params, body, bearer, set }) => {
    try {
      requireStaff(bearer ?? '')
      return await reportService.assign(params.id, body.referent_id)
    } catch (e) {
      const { status, body } = handleError(e)
      set.status = status
      return body
    }
  }, {
    body: t.Object({
      referent_id: t.String()
    })
  })

  /**
   * PATCH /admin/reports/:id
   * Réservé : ADMIN et SUPERVISOR
   * Modifie le statut et/ou la sévérité d'un signalement.
   */
  .patch('/reports/:id', async ({ params, body, bearer, set }) => {
    try {
      requireStaff(bearer ?? '')
      const { status, level } = body

      let updatedStatus, updatedSeverity
      if (status) updatedStatus = await reportService.updateStatus(params.id, { status })
      if (level)  updatedSeverity = await reportService.updateSeverity(params.id, { severity: level })

      return {
        trackingCode: params.id,
        status:       updatedStatus?.status   ?? status   ?? null,
        level:        updatedSeverity?.severity ?? level   ?? null,
        updatedAt:    updatedSeverity?.updatedAt ?? updatedStatus?.updatedAt ?? new Date().toISOString()
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
        t.Literal('ARCHIVE')
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
   * POST /admin/reports/:id/events
   * Réservé : ADMIN et SUPERVISOR
   * Ajoute une action de suivi (événement) persistée comme ChatMessage STAFF.
   */
  .post('/reports/:id/events', async ({ params, body, bearer, set }) => {
    try {
      requireStaff(bearer ?? '')
      const report = await prisma.report.findUnique({ where: { trackingId: params.id } })
      if (!report) {
        set.status = 404
        return { error: 'REPORT_NOT_FOUND' }
      }
      const content = JSON.stringify({ type: body.type, comment: body.comment ?? null })
      const msg = await prisma.chatMessage.create({
        data: { reportId: report.id, sender: 'STAFF', content },
        select: { id: true, sender: true, content: true, createdAt: true }
      })
      return { success: true, message: msg }
    } catch (e) {
      const { status, body } = handleError(e)
      set.status = status
      return body
    }
  }, {
    body: t.Object({
      type:    t.String({ minLength: 1 }),
      comment: t.Optional(t.String()),
    })
  })

  /**
   * GET /admin/stats
   * Réservé : ADMIN et SUPERVISOR
   * Retourne les statistiques par établissement depuis la base.
   */
  .get('/stats', async ({ query, bearer, set }) => {
    try {
      requireStaff(bearer ?? '')
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
   * Retourne la liste de l'équipe depuis la base (inclut jobTitle et isCoRef).
   */
  .get('/team', async ({ query, bearer, set }) => {
    try {
      requireStaff(bearer ?? '')
      const { team_info } = query
      const hierarchy = ['SUPERVISOR', 'ADMIN']

      const staff = await authService.listStaff()
      const team = staff.map(member => ({
        id:       member.id,
        name:     [member.firstName, member.lastName].filter(Boolean).join(' ') || member.email,
        role:     member.role,
        email:    member.email,
        jobTitle: member.jobTitle ?? null,
        isCoRef:  member.isCoRef,
      }))

      const filtered = team_info
        ? team.filter(m => m.role === team_info.toUpperCase())
        : team

      return { hierarchy, total: filtered.length, team_info: filtered }

    } catch (e) {
      const { status, body } = handleError(e)
      set.status = status
      return body
    }
  })

  /**
   * PATCH /admin/users/:userId
   * Réservé : staff (SUPERVISOR ou ADMIN)
   * - jobTitle : tout staff peut mettre à jour le sien ; ADMIN peut mettre à jour n'importe qui
   * - isCoRef  : ADMIN uniquement, max 2 co-responsables dans toute l'équipe
   * - role → ADMIN : auto-promotion SUPERVISOR→ADMIN lors de l'onboarding (une seule fois, jobTitle null)
   */
  .patch('/users/:userId', async ({ params, body, bearer, set }) => {
    try {
      const { userId: tokenUserId, role: tokenRole } = requireStaff(bearer ?? '')

      const isSelf  = tokenUserId === params.userId
      const isAdmin = tokenRole === 'ADMIN'

      if (!isSelf && !isAdmin) {
        set.status = 403
        return { error: 'FORBIDDEN' }
      }

      const target = await prisma.user.findUnique({ where: { id: params.userId } })
      if (!target) throw new Error('USER_NOT_FOUND')

      const data: Record<string, unknown> = {}

      if (body.jobTitle !== undefined) {
        data.jobTitle = body.jobTitle
      }

      if (body.isCoRef !== undefined) {
        if (!isAdmin) {
          set.status = 403
          return { error: 'Seul un directeur peut désigner un co-responsable' }
        }
        if (body.isCoRef === true) {
          const coRefCount = await prisma.user.count({
            where: { isCoRef: true, id: { not: params.userId } }
          })
          if (coRefCount >= 2) {
            set.status = 400
            return { error: 'Limite de 2 co-responsables atteinte' }
          }
        }
        data.isCoRef = body.isCoRef
      }

      if (body.role === 'ADMIN') {
        if (!isSelf) {
          set.status = 403
          return { error: 'FORBIDDEN' }
        }
        if (target.role !== 'SUPERVISOR') {
          set.status = 400
          return { error: 'Seul un superviseur peut être promu directeur' }
        }
        if (target.jobTitle !== null) {
          set.status = 400
          return { error: 'Promotion déjà effectuée' }
        }
        data.role = 'ADMIN'
      }

      const updated = await prisma.user.update({
        where:  { id: params.userId },
        data,
        select: { id: true, email: true, role: true, firstName: true, lastName: true, jobTitle: true, isCoRef: true }
      })

      return updated

    } catch (e) {
      const { status, body } = handleError(e)
      set.status = status
      return body
    }
  }, {
    body: t.Object({
      jobTitle: t.Optional(t.String()),
      isCoRef:  t.Optional(t.Boolean()),
      role:     t.Optional(t.Literal('ADMIN')),
    })
  })

  /**
   * PATCH /admin/users/:userId/parent
   * Réservé : ADMIN et SUPERVISOR
   * Lie un compte parent à un compte étudiant.
   */
  .patch('/users/:userId/parent', async ({ params, body, bearer, set }) => {
    try {
      requireStaff(bearer ?? '')

      const student = await prisma.user.findUnique({ where: { id: params.userId } })
      if (!student) throw new Error('USER_NOT_FOUND')
      if (student.role !== 'STUDENT') {
        set.status = 400
        return { error: 'L\'utilisateur n\'est pas un étudiant' }
      }

      const parent = await prisma.user.findUnique({ where: { id: body.parentId } })
      if (!parent) throw new Error('USER_NOT_FOUND')
      if (parent.role !== 'PARENT') {
        set.status = 400
        return { error: 'L\'utilisateur n\'est pas un parent' }
      }

      await prisma.user.update({
        where: { id: params.studentId },
        data:  { parentId: body.parentId }
      })

      return {
        message:   'Lien parent/enfant créé avec succès',
        studentId: params.userId,
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
