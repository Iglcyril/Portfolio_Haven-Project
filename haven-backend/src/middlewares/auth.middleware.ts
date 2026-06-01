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
 *   - requireStudent    → autorise Student uniquement
 *   - requireSupervisor → autorise Supervisor uniquement
 *   - requireParent     → autorise Parent uniquement
 */

import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET!

// Contenu décodé d'un token JWT Haven
export type JWTPayload = {
  userId: string
  role: 'STUDENT' | 'SUPERVISOR' | 'PARENT'
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
 *
 * @param token        - Le bearer token extrait du header Authorization
 * @param allowedRoles - Liste des rôles qui peuvent accéder à cette route
 */
export function requireRole(
  token: string,
  allowedRoles: Array<'STUDENT' | 'SUPERVISOR' | 'PARENT'>
): JWTPayload {
  const payload = verifyToken(token)

  if (!allowedRoles.includes(payload.role)) {
    throw new Error('FORBIDDEN')
  }

  return payload
}

// --- Raccourcis à utiliser directement dans les routes ---

/** Toute personne connectée (Student, Supervisor ou Parent) */
export const requireAuth = (t: string) =>
  requireRole(t, ['STUDENT', 'SUPERVISOR', 'PARENT'])

/** Réservé aux étudiants */
export const requireStudent = (t: string) =>
  requireRole(t, ['STUDENT'])

/** Réservé aux superviseurs (psychologues, staff pédagogique) */
export const requireSupervisor = (t: string) =>
  requireRole(t, ['SUPERVISOR'])

/** Réservé aux parents */
export const requireParent = (t: string) =>
  requireRole(t, ['PARENT'])
