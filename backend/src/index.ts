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

import { Elysia, t } from 'elysia'
import { cors } from '@elysiajs/cors'
import { bearer } from '@elysiajs/bearer'
import { swagger } from '@elysiajs/swagger'
import { authRoutes } from './routes/auth'
import { adminRoutes } from './routes/admin'
import { parentsRoutes } from './routes/parents'
import { reportsRoutes } from './routes/reports'
import { verifyToken } from './middlewares/auth.middleware'
import { wsManager } from './ws/ws-manager'
// import { chatRoutes } from './routes/chat' → à ajouter quand Haven Lab fournit leur API

// --- Validation des variables d'environnement ---
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
  .use(swagger({
    documentation: {
      info: {
        title: 'Haven API',
        version: '0.1.0',
        description: 'Bullying report API for schools'
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        }
      },
      security: [{ bearerAuth: [] }]
    }
  }))

  // --- Routes ---
  .use(authRoutes)    // /auth/*     → authentification
  .use(adminRoutes)   // /admin/*    → administration
  .use(parentsRoutes) // /parents/*  → suivi parents
  .use(reportsRoutes) // /reports/*  → signalements
  // .use(chatRoutes) // /chat/*     → chatbot Haven Lab (à venir)

  // Health check
  .get('/health', () => ({ status: 'ok', project: 'Haven', version: '0.1.0' }))

  // WebSocket — alertes temps réel pour le staff (SUPERVISOR / ADMIN)
  // Connexion : ws://host:port/ws?token=<JWT>
  .ws('/ws', {
    query: t.Object({ token: t.Optional(t.String()) }),
    open(ws) {
      const token = (ws.data as { query?: { token?: string } }).query?.token
      if (!token) { ws.close(); return }
      try {
        const { userId, role } = verifyToken(token)
        if (!['SUPERVISOR', 'ADMIN'].includes(role)) { ws.close(); return }
        wsManager.add(ws, userId, role)
      } catch {
        ws.close()
      }
    },
    close(ws) {
      wsManager.remove(ws)
    },
  })

  .listen(process.env.PORT ?? 3000)

console.log(`Haven API running on port ${app.server?.port}`)
console.log(`Swagger disponible sur http://localhost:${app.server?.port}/swagger`)
