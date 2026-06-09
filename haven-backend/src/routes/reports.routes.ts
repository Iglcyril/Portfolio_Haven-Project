/**
 * reports.routes.ts
 * ------------------
 * Routes de signalement pour les étudiants.
 * Préfixe : /api/reports
 *
 * Routes :
 *   POST /api/reports → soumettre un signalement
 *
 * Note : les données sont statiques pour l'instant.
 * À remplacer par des requêtes Prisma quand le Report Service sera connecté.
 */

import { Elysia, t } from 'elysia'
import { bearer } from '@elysiajs/bearer'
import { requireAuth } from '../middlewares/auth.middleware'
import { handleError } from '../middlewares/error.middleware'

// --- Génération du tracking code ---
// Format HVN-XXXX-XXXX → HVN pour Haven, suivi de 8 caractères
// alphanumériques divisés en deux groupes de 4 pour faciliter la lecture
function generateTrackingCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const randomPart = (length: number) =>
    Array.from({ length }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join('')
  return `HVN-${randomPart(4)}-${randomPart(4)}`
}

// --- Détection de mots clés de crise ---
// Liste à compléter — prendre en compte les fautes d'orthographe courantes
const alertKeywords = [
  'suicide',
  'me suicider',
  'me tuer',
  'je veux mourir',
  'je ne veux plus vivre',
  'je veux me faire du mal',
  'je veux me tuer',
  'en finir',
  'violer',
  'viol'
]

/**
 * Vérifie si le contenu du rapport contient des mots clés de crise.
 * La comparaison est insensible à la casse.
 */
function containsAlertKeywords(message: string): boolean {
  const lowerCaseMessage = message.toLowerCase()
  return alertKeywords.some(keyword => lowerCaseMessage.includes(keyword))
}

// --- Types de validation ---

// Type de signalement
const reportType = t.Union([
  t.Literal('victime'),
  t.Literal('temoin')
])

// Niveau d'anonymat
const anonymatLevel = t.Union([
  t.Literal('total'),    // identité complètement cachée
  t.Literal('partiel'),  // identité visible uniquement pour le superviseur
  t.Literal('pas_anonyme')
])

// Catégories de signalement
const reportCategories = t.Union([
  t.Literal('harcelement_scolaire'),
  t.Literal('violence_physique'),
  t.Literal('violence_verbale'),
  t.Literal('cyberharcelement'),
  t.Literal('discrimination'),
  t.Literal('mal_etre'),
  t.Literal('autre')
])

export const reportsRoutes = new Elysia({ prefix: '/api/reports' })
  .use(bearer())

  /**
   * POST /api/reports
   * Réservé : STUDENT (et tout utilisateur connecté)
   * Soumet un nouveau signalement de harcèlement.
   * - Génère un tracking code unique
   * - Détecte les mots clés de crise
   * - Retourne les numéros d'urgence si crise détectée
   * À faire : sauvegarder en base via prisma.report.create()
   */
  .post('/', async ({ body, bearer, set }) => {
    try {
      requireAuth(bearer ?? '')

      const trackingCode = generateTrackingCode()
      const crisisAlert = containsAlertKeywords(body.contenu)

      // À faire : remplacer par une vraie requête Prisma
      // await prisma.report.create({
      //   data: {
      //     trackingCode,
      //     userId:      payload.userId,
      //     type:        body.type,
      //     isAnonymous: body.anonymat_level === 'total',
      //     status:      'PENDING',
      //     severity:    'LOW'
      //   }
      // })

      return {
        trackingCode,
        statut: 'recu',
        crisisDetected: crisisAlert,
        createdAt: new Date().toISOString(),
        // Si mots clés détectés → numéros d'urgence avec message réconfortant
        ...(crisisAlert && {
          urgence: {
            message: 'Tu n\'es pas seul(e). Contacte immédiatement :',
            numeros: [
              { nom: 'Prévention suicide',              numero: '3114' },
              { nom: 'Enfance en danger',               numero: '119'  },
              { nom: 'Cyberharcèlement',                numero: '3018' },
              { nom: 'Personnes sourdes ou malentendantes', numero: '114'  }
            ]
          }
        })
      }

    } catch (e) {
      const { status, body } = handleError(e)
      set.status = status
      return body
    }
  }, {
    body: t.Object({
      type:             reportType,
      anonymat_level:   anonymatLevel,
      contenu:          t.String({ minLength: 10 }),
      categorie:        reportCategories,
      etablissement_id: t.String()
    })
  })
