/**
 * index.ts
 * ---------
 * Point d'entrée du serveur Haven API.
 * Responsabilités :
 *   1. Valider les variables d'environnement critiques au démarrage
 *   2. Initialiser le serveur Elysia avec les middlewares globaux
 *   3. Enregistrer toutes les routes de l'application
 *   4. Exposer un endpoint /health pour les checks de disponibilité
 *   5. Exposer la documentation Swagger sur /swagger
 *
 * Pour ajouter une nouvelle famille de routes :
 *   1. Créer le fichier dans src/routes/
 *   2. L'importer ici
 *   3. L'enregistrer avec .use(nouvellesRoutes)
 *
 * Variables d'environnement requises :
 *   DATABASE_URL  → URL de connexion PostgreSQL
 *   JWT_SECRET    → clé secrète pour signer les tokens JWT
 *   PORT          → optionnel, défaut 3000
 */

import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { bearer } from '@elysiajs/bearer'
import { swagger } from '@elysiajs/swagger'
import { authRoutes } from './routes/auth.routes'
import { adminRoutes } from './routes/admin.routes'
import { parentsRoutes } from './routes/parents.routes'
import { reportsRoutes } from './routes/reports.routes'
// import { chatRoutes } from './routes/chat.routes' → à ajouter quand Haven Lab fournit leur API

// --- Validation des variables d'environnement ---
// Le serveur refuse de démarrer s'il manque une variable critique.
const requiredEnv = ['DATABASE_URL', 'JWT_SECRET']
for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.error(`[Haven] Missing required env variable: ${key}`)
    process.exit(1)
  }
}

const app = new Elysia()

  // CORS — autorise les requêtes depuis le frontend Flutter
  .use(cors())

  // Bearer — extrait le token du header Authorization: Bearer <token>
  .use(bearer())

  // Swagger — documentation interactive accessible sur /swagger
  // Le bouton Authorize en haut à droite permet de renseigner le JWT
  // et de l'utiliser automatiquement sur toutes les routes protégées
  .use(swagger({
    documentation: {
      info: {
        title: 'Haven API',
        version: '0.1.0',
        description: 'Bullying report API for schools'
      },
      // Configuration du schéma de sécurité Bearer JWT
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          }
        }
      },
      // Applique bearerAuth à toutes les routes par défaut
      security: [{ bearerAuth: [] }]
    }
  }))

  // --- Routes ---
  .use(authRoutes)    // /api/auth/*    → authentification
  .use(adminRoutes)   // /api/admin/*   → administration
  .use(parentsRoutes) // /api/parents/* → suivi parents
  .use(reportsRoutes) // /api/reports/* → signalements
  // .use(chatRoutes) // /api/chat/*    → chatbot Haven Lab (à venir)

  // Health check — vérifie que le serveur tourne
  .get('/health', () => ({ status: 'ok', project: 'Haven', version: '0.1.0' }))

  .listen(process.env.PORT ?? 3000)

console.log(`Haven API running on port ${app.server?.port}`)
console.log(`Swagger disponible sur http://localhost:${app.server?.port}/swagger`)
