/**
 * index.ts
 * ---------
 * Point d'entrée du serveur Haven API.
 * Responsabilités :
 *   1. Valider les variables d'environnement critiques au démarrage
 *   2. Initialiser le serveur Elysia avec les middlewares globaux
 *   3. Enregistrer toutes les routes de l'application
 *   4. Exposer un endpoint /health pour les checks de disponibilité
 *
 * Pour ajouter une nouvelle famille de routes :
 *   1. Créer le fichier dans src/routes/
 *   2. L'importer ici
 *   3. L'enregistrer avec .use(nouvellesRoutes)
 *
 * Variables d'environnement requises :
 *   DATABASE_URL  → URL de connexion PostgreSQL
 *   JWT_SECRET    → clé secrète pour signer les tokens JWT
 *   PORT          → optionnel
 */

import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { bearer } from '@elysiajs/bearer'
import { authRoutes } from './routes/auth.routes'

// --- Validation des variables d'environnement ---
const requiredEnv = ['DATABASE_URL', 'JWT_SECRET']
for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.error(`[Haven] Missing required env variable: ${key}`)
    process.exit(1)
  }
}

const app = new Elysia()
  .use(cors())
  .use(bearer())
  .use(authRoutes)    // /api/auth/*
  // .use(reportRoutes)
  // .use(chatRoutes)
  .get('/health', () => ({ status: 'ok', project: 'Haven' }))
  .listen(process.env.PORT ?? 3000)

console.log(`Haven API running on port ${app.server?.port}`)
