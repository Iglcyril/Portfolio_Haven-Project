/**
 * contact.service.ts
 * -------------------
 * Service responsable des messages de contact envoyés par les parents
 * (formulaire générique, non lié à un signalement précis).
 */

import { prisma } from '../lib/prisma'

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
