/**
 * auth.middleware.ts
 * ------------------
 * Gère la vérification des tokens JWT et les contrôles d'accès par rôle.
 * À utiliser dans toutes les routes protégées.
 *
 * Fonctions exportées :
 *   - verifyToken       → vérifie et décode un JWT brut
 *   - requireRole       → vérifie le token ET le rôle autorisé
 *   - requireAuth       → autorise tous les rôles (juste connecté)
 *   - requireSupervisor → autorise Supervisor uniquement
 *   - requireAdmin      → autorise Admin uniquement
 *   - requireParent     → autorise Parent uniquement
 *   - requireStaff      → autorise Supervisor et Admin (staff pédagogique)
 */

import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET!

export type JWTPayload = {
  userId: string
  role: 'STUDENT' | 'SUPERVISOR' | 'ADMIN' | 'PARENT'
}

/**
 * Décode et vérifie la signature d'un token JWT.
 * Lance INVALID_TOKEN si le token est expiré ou falsifié.
 */
export function verifyToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    throw new Error('INVALID_TOKEN')
  }
}

/**
 * Vérifie le token ET s'assure que le rôle de l'utilisateur
 * fait partie des rôles autorisés passés en paramètre.
 * Lance FORBIDDEN si le rôle n'est pas dans la liste.
 */
export function requireRole(
  token: string,
  allowedRoles: Array<'STUDENT' | 'SUPERVISOR' | 'ADMIN' | 'PARENT'>
): JWTPayload {
  const payload = verifyToken(token)

  if (!allowedRoles.includes(payload.role)) {
    throw new Error('FORBIDDEN')
  }

  return payload
}

// --- Raccourcis à utiliser directement dans les routes ---

/** Toute personne connectée (Student, Supervisor, Admin ou Parent) */
export const requireAuth = (t: string) =>
  requireRole(t, ['STUDENT', 'SUPERVISOR', 'ADMIN', 'PARENT'])

/** Réservé aux superviseurs (psychologues, staff pédagogique) */
export const requireSupervisor = (t: string) =>
  requireRole(t, ['SUPERVISOR'])

/** Réservé aux administrateurs de la plateforme */
export const requireAdmin = (t: string) =>
  requireRole(t, ['ADMIN'])

/** Réservé aux parents */
export const requireParent = (t: string) =>
  requireRole(t, ['PARENT'])

/** Réservé au staff pédagogique (Supervisor ET Admin) */
export const requireStaff = (t: string) =>
  requireRole(t, ['SUPERVISOR', 'ADMIN'])
