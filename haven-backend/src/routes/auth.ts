/**
 * auth.routes.ts
 * ---------------
 * Endpoints liés à l'authentification.
 * Préfixe : /api/auth
 *
 * Routes :
 *   POST  /api/auth/register → création de compte (public)
 *   POST  /api/auth/login    → connexion et JWT (public)
 *   GET   /api/auth/profile  → profil connecté (JWT requis)
 */

import { Elysia, t } from 'elysia'
import { bearer } from '@elysiajs/bearer'
import { authService } from '../services/auth.service'
import { requireAuth } from '../middlewares/auth.middleware'
import { handleError } from '../middlewares/error.middleware'

export const authRoutes = new Elysia({ prefix: '/api/auth' })
  .use(bearer())

  /**
   * POST /api/auth/register
   * Réponses : 201 compte créé | 409 email déjà utilisé
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
      email:    t.String({ format: 'email' }),
      password: t.String({ minLength: 8 }),
      role: t.Optional(t.Union([
        t.Literal('STUDENT'),
        t.Literal('SUPERVISOR'),
        t.Literal('PARENT')
      ]))
    })
  })

  /**
   * POST /api/auth/login
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
   * GET /api/auth/profile
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
