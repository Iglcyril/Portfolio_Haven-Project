/**
 * auth.ts
 * ---------------
 * Endpoints liés à l'authentification.
 * Préfixe : /auth
 *
 * Routes :
 *   POST  /auth/register → création de compte (public)
 *   POST  /auth/login    → connexion et JWT (public)
 *   GET   /auth/profile  → profil connecté (JWT requis)
 */

import { Elysia, t } from 'elysia'
import { bearer } from '@elysiajs/bearer'
import { authService } from '../services/auth.service'
import { requireAuth } from '../middlewares/auth.middleware'
import { handleError } from '../middlewares/error.middleware'

export const authRoutes = new Elysia({ prefix: '/auth' })
  .use(bearer())

  /**
   * POST /auth/register
   * Réponses : 201 compte créé | 409 email déjà utilisé
   *
   * Champs obligatoires : email, password
   * Champs optionnels  : role, firstName, lastName, birthDate
   *
   * Note : pour les STUDENT, firstName, lastName et birthDate
   * sont nécessaires pour le lien parent/enfant via POST /parents/link-child.
   * Format birthDate : YYYY-MM-DD ex: 2010-05-15
   */
  .post('/register', async ({ body, set }) => {
    try {
      const result = await authService.register(body)
      set.status = 201
      return result
    } catch (e) {
      const { status, body: err } = handleError(e)
      set.status = status
      return err
    }
  }, {
    body: t.Object({
      email:     t.String({ format: 'email', error: 'Adresse email invalide' }),
      password:  t.String({
        minLength: 8,
        pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}$',
        error: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre'
      }),
      firstName: t.Optional(t.String({ minLength: 2, error: 'Le prénom doit contenir au moins 2 caractères' })),
      lastName:  t.Optional(t.String({ minLength: 2, error: 'Le nom doit contenir au moins 2 caractères' })),
      birthDate: t.Optional(t.String()),
      role: t.Optional(t.Union([
        t.Literal('STUDENT'),
        t.Literal('SUPERVISOR'),
        t.Literal('PARENT')
      ]))
    })
  })

  /**
   * POST /auth/login
   * Réponses : 200 JWT retourné | 401 credentials invalides
   */
  .post('/login', async ({ body, set }) => {
    try {
      return await authService.login(body)
    } catch (e) {
      const { status, body: err } = handleError(e)
      set.status = status
      return err
    }
  }, {
    body: t.Object({
      email:    t.String(),
      password: t.String()
    })
  })

  /**
   * GET /auth/profile
   * Réponses : 200 profil | 401 token invalide | 404 compte introuvable
   */
  .get('/profile', async ({ bearer, set }) => {
    try {
      const { userId } = requireAuth(bearer ?? '')
      return await authService.getProfile(userId)
    } catch (e) {
      const { status, body: err } = handleError(e)
      set.status = status
      return err
    }
  })

  /**
   * GET /auth/me/export
   * RGPD — droit d'accès aux données personnelles.
   * Réponses : 200 export JSON | 401 non connecté | 403 rôle non autorisé
   */
  .get('/me/export', async ({ bearer, set }) => {
    try {
      const { userId, role } = requireAuth(bearer ?? '')
      return await authService.exportMyData(userId, role)
    } catch (e) {
      const { status, body: err } = handleError(e)
      set.status = status
      return err
    }
  })

  /**
   * DELETE /auth/me
   * RGPD — droit à l'effacement.
   * Anonymise les données puis supprime le compte connecté.
   * Réponses : 204 supprimé | 401 non connecté | 409 dossiers actifs (staff)
   */
  .delete('/me', async ({ bearer, set }) => {
    try {
      const { userId, role } = requireAuth(bearer ?? '')
      await authService.deleteMyAccount(userId, role)
      set.status = 204
      return null
    } catch (e) {
      const { status, body: err } = handleError(e)
      set.status = status
      return err
    }
  })
