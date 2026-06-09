/**
 * auth.service.ts
 * ----------------
 * Service responsable de toute la logique d'authentification.
 *
 * Méthodes :
 *   - register   → crée un compte et retourne un JWT
 *   - login      → vérifie les credentials et retourne un JWT
 *   - getProfile → retourne le profil d'un utilisateur connecté
 */

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// Prisma v7 — nécessite un adapter explicite pour la connexion PostgreSQL
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const JWT_SECRET = process.env.JWT_SECRET!

export type RegisterInput = {
  email: string
  password: string
  role?: 'STUDENT' | 'SUPERVISOR' | 'ADMIN' | 'PARENT'
}

export type LoginInput = {
  email: string
  password: string
}

export const authService = {

  /**
   * Crée un nouveau compte utilisateur.
   * - Vérifie que l'email n'est pas déjà utilisé
   * - Hash le mot de passe avec bcrypt (coût 12)
   * - Génère un JWT valable 7 jours
   * Lance EMAIL_ALREADY_EXISTS si l'email existe déjà.
   */
  async register({ email, password, role = 'STUDENT' }: RegisterInput) {
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      throw new Error('EMAIL_ALREADY_EXISTS')
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: { email, passwordHash, role },
      select: { id: true, email: true, role: true, createdAt: true }
    })

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    return { user, token }
  },

  /**
   * Authentifie un utilisateur existant.
   * Lance INVALID_CREDENTIALS si email ou mot de passe incorrect.
   * Note : le message est volontairement vague pour ne pas révéler
   * si c'est l'email ou le mot de passe qui est incorrect.
   */
  async login({ email, password }: LoginInput) {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      throw new Error('INVALID_CREDENTIALS')
    }

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      throw new Error('INVALID_CREDENTIALS')
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    return {
      user: { id: user.id, email: user.email, role: user.role },
      token
    }
  },

  /**
   * Retourne le profil de l'utilisateur actuellement connecté.
   * Lance USER_NOT_FOUND si l'id du token ne correspond à aucun compte.
   */
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true, createdAt: true }
    })
    if (!user) throw new Error('USER_NOT_FOUND')
    return user
  }
}
