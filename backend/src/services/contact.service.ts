/**
 * contact.service.ts
 * -------------------
 * Service responsable des messages de contact envoyés par les parents
 * (formulaire générique, non lié à un signalement précis).
 */

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

// Prisma v7 — nécessite un adapter explicite pour la connexion PostgreSQL
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

export type CreateParentMessageInput = {
  parentName:  string
  parentEmail: string
  message:     string
}

export const contactService = {

  /**
   * Enregistre un message de contact envoyé par un parent.
   */
  async create({ parentName, parentEmail, message }: CreateParentMessageInput) {
    return prisma.parentMessage.create({
      data: { parentName, parentEmail, message }
    })
  }
}
