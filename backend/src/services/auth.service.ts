/**
 * auth.service.ts
 * ----------------
 * Service responsable de toute la logique d'authentification.
 *
 * Méthodes :
 *   - register   → crée un compte et retourne un JWT
 *   - login      → vérifie les credentials et retourne un JWT
 *   - getProfile → retourne le profil d'un utilisateur connecté
 *   - listStaff  → retourne la liste des superviseurs et admins
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
  email:      string
  password:   string
  role?:      'STUDENT' | 'SUPERVISOR' | 'ADMIN' | 'PARENT'
  firstName?: string    // Prénom - requis pour STUDENT et PARENT
  lastName?:  string    // Nom - requis pour STUDENT et PARENT
  birthDate?: string    // Date de naissance - requis pour STUDENT (format: YYYY-MM-DD)
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
  async register({ email, password, role = 'STUDENT', firstName, lastName, birthDate }: RegisterInput) {
    if (role === 'STUDENT' && (!firstName?.trim() || !lastName?.trim() || !birthDate)) {
      throw new Error('STUDENT_FIELDS_REQUIRED')
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      throw new Error('EMAIL_ALREADY_EXISTS')
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role,
        firstName,
        lastName,
        birthDate: birthDate ? new Date(birthDate) : undefined
      },
      select: {
        id:        true,
        email:     true,
        role:      true,
        firstName: true,
        lastName:  true,
        birthDate: true,
        createdAt: true
      }
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
      user: { id: user.id, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName },
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
      select: {
        id:        true,
        email:     true,
        role:      true,
        firstName: true,
        lastName:  true,
        birthDate: true,
        createdAt: true
      }
    })
    if (!user) throw new Error('USER_NOT_FOUND')
    return user
  },

  /**
   * RGPD — droit d'accès.
   * Retourne les signalements (+ messages) de l'utilisateur connecté.
   *   STUDENT → ses propres rapports
   *   PARENT  → les rapports de ses enfants
   *   Autres  → 403
   */
  async exportMyData(userId: string, role: string) {
    if (role === 'STUDENT') {
      const reports = await prisma.report.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        select: {
          trackingId:     true,
          type:           true,
          categorie:      true,
          anonymatLevel:  true,
          status:         true,
          severity:       true,
          crisisDetected: true,
          createdAt:      true,
          updatedAt:      true,
          messages: {
            orderBy: { createdAt: 'asc' },
            select: { sender: true, content: true, createdAt: true }
          }
        }
      })
      return { exportedAt: new Date().toISOString(), type: 'student_export', reports }
    }

    if (role === 'PARENT') {
      const children = await prisma.user.findMany({
        where: { parentId: userId },
        select: {
          firstName: true,
          lastName:  true,
          reports: {
            orderBy: { createdAt: 'desc' },
            select: {
              trackingId:     true,
              type:           true,
              categorie:      true,
              anonymatLevel:  true,
              status:         true,
              severity:       true,
              crisisDetected: true,
              createdAt:      true,
              updatedAt:      true,
              messages: {
                orderBy: { createdAt: 'asc' },
                select: { sender: true, content: true, createdAt: true }
              }
            }
          }
        }
      })
      return { exportedAt: new Date().toISOString(), type: 'parent_export', children }
    }

    throw new Error('FORBIDDEN')
  },

  /**
   * RGPD — droit à l'effacement.
   * Anonymise les données puis supprime le compte.
   *   SUPERVISOR/ADMIN avec dossiers actifs → bloqué (ACCOUNT_HAS_ACTIVE_DOSSIERS)
   *   Sinon → anonymisation + suppression
   */
  async deleteMyAccount(userId: string, role: string) {
    if (role === 'SUPERVISOR' || role === 'ADMIN') {
      const active = await prisma.report.count({
        where: {
          assignedToId: userId,
          status: { in: ['EN_ATTENTE', 'EN_COURS'] }
        }
      })
      if (active > 0) throw new Error('ACCOUNT_HAS_ACTIVE_DOSSIERS')

      // Déréférencement des dossiers archivés/résolus
      await prisma.report.updateMany({
        where: { assignedToId: userId },
        data:  { assignedToId: null }
      })
    }

    // Anonymise les signalements de l'utilisateur (STUDENT / PARENT)
    await prisma.report.updateMany({
      where: { userId },
      data:  { userId: null }
    })

    // Délie les enfants si c'est un parent
    if (role === 'PARENT') {
      await prisma.user.updateMany({
        where: { parentId: userId },
        data:  { parentId: null }
      })
    }

    await prisma.user.delete({ where: { id: userId } })
  },

  /**
   * Retourne les comptes ADMIN et SUPERVISOR (équipe interne).
   * Utilisé par GET /admin/team.
   */
  async listStaff() {
    return prisma.user.findMany({
      where: { role: { in: ['ADMIN', 'SUPERVISOR'] } },
      select: {
        id:        true,
        email:     true,
        role:      true,
        firstName: true,
        lastName:  true
      }
    })
  }

}
