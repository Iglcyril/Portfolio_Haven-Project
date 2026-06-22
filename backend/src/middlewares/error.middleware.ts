/**
 * error.middleware.ts
 * --------------------
 * Centralise la gestion des erreurs métier de l'API Haven.
 * Évite de répéter les blocs try/catch et les codes HTTP dans chaque route.
 *
 * Pour ajouter une nouvelle erreur :
 *   1. Ajouter le nom dans le type AppError
 *   2. Ajouter l'entrée correspondante dans errorMap
 *   3. Lancer throw new Error('MON_ERREUR') depuis n'importe quel service
 */

// Liste exhaustive des erreurs métier de l'application
export type AppError =
  | 'INVALID_TOKEN'         // Token JWT absent, expiré ou falsifié
  | 'FORBIDDEN'             // Rôle insuffisant pour cette action
  | 'EMAIL_ALREADY_EXISTS'  // Tentative de register avec un email déjà pris
  | 'INVALID_CREDENTIALS'   // Email ou mot de passe incorrect au login
  | 'REPORT_NOT_FOUND'      // Rapport introuvable en base
  | 'USER_NOT_FOUND'        // Utilisateur introuvable en base
  | 'DELETE_TIMEOUT'        // Délai d'annulation de 5 minutes dépassé
  | 'STUDENT_NOT_FOUND'  // Aucun étudiant trouvé avec ces informations
  | 'PARENT_NOT_FOUND'  // Aucun compte parent trouvé avec cet email

/**
 * Table de correspondance : code d'erreur métier → HTTP status + message public.
 * Le message public est ce que le client reçoit — ne jamais y mettre
 * de détails techniques (stack trace, requête SQL, etc.)
 */
const errorMap: Record<AppError, { status: number; message: string }> = {
  INVALID_TOKEN:        { status: 401, message: 'Invalid or expired token' },
  FORBIDDEN:            { status: 403, message: 'Access denied' },
  EMAIL_ALREADY_EXISTS: { status: 409, message: 'Email already in use' },
  INVALID_CREDENTIALS:  { status: 401, message: 'Invalid email or password' },
  REPORT_NOT_FOUND:     { status: 404, message: 'Report not found' },
  USER_NOT_FOUND:       { status: 404, message: 'User not found' },
  DELETE_TIMEOUT:       { status: 403, message: 'Délai d\'annulation dépassé — impossible de supprimer ce signalement' },
  STUDENT_NOT_FOUND:    { status: 404, message: 'Aucun étudiant trouvé avec ces informations' },
  PARENT_NOT_FOUND:     { status: 404, message: 'Aucun compte parent trouvé avec cet email' },
}

/**
 * À appeler dans le bloc catch de chaque route.
 * Retourne le status HTTP et le body d'erreur prêt à envoyer au client.
 * Les erreurs inconnues sont loggées en console et retournent un 500 générique.
 *
 * @example
 * } catch (e) {
 *   const { status, body } = handleError(e)
 *   set.status = status
 *   return body
 * }
 */
export function handleError(e: unknown): { status: number; body: object } {
  const message = e instanceof Error ? e.message : 'UNKNOWN'
  const mapped = errorMap[message as AppError]

  if (mapped) {
    return { status: mapped.status, body: { error: mapped.message } }
  }

  // Erreur inattendue — on log côté serveur mais on n'expose rien au client
  console.error('[Haven] Unhandled error:', e)
  return { status: 500, body: { error: 'Internal server error' } }
}
