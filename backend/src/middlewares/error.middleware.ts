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
  | 'INVALID_TOKEN'          // Token JWT absent, expiré ou falsifié
  | 'FORBIDDEN'              // Rôle insuffisant pour cette action
  | 'EMAIL_ALREADY_EXISTS'   // Tentative de register avec un email déjà pris
  | 'INVALID_CREDENTIALS'    // Email ou mot de passe incorrect au login
  | 'REPORT_NOT_FOUND'       // Rapport introuvable en base
  | 'USER_NOT_FOUND'         // Utilisateur introuvable en base
  | 'DELETE_TIMEOUT'         // Délai d'annulation de 5 minutes dépassé
  | 'STUDENT_NOT_FOUND'       // Aucun étudiant trouvé avec ces informations
  | 'STUDENT_ALREADY_LINKED'  // L'enfant est déjà rattaché à un autre compte parent
  | 'PARENT_NOT_FOUND'        // Aucun compte parent trouvé avec cet email
  | 'STUDENT_FIELDS_REQUIRED'       // Prénom, nom et date de naissance manquants pour un élève
  | 'ACCOUNT_HAS_ACTIVE_DOSSIERS'   // Le compte staff a des dossiers actifs — suppression bloquée
  | 'REPORT_ALREADY_LINKED'         // Le signalement est déjà rattaché à un autre compte

/**
 * Table de correspondance : code d'erreur métier → HTTP status + message public.
 * Le message public est ce que le client reçoit — ne jamais y mettre
 * de détails techniques (stack trace, requête SQL, etc.)
 */
const errorMap: Record<AppError, { status: number; message: string }> = {
  INVALID_TOKEN:        { status: 401, message: 'Token invalide ou expiré' },
  FORBIDDEN:            { status: 403, message: 'Accès refusé' },
  EMAIL_ALREADY_EXISTS: { status: 409, message: 'Cette adresse email est déjà utilisée' },
  INVALID_CREDENTIALS:  { status: 401, message: 'Email ou mot de passe incorrect' },
  REPORT_NOT_FOUND:     { status: 404, message: 'Signalement introuvable' },
  USER_NOT_FOUND:       { status: 404, message: 'Utilisateur introuvable' },
  DELETE_TIMEOUT:       { status: 403, message: 'Délai d\'annulation dépassé — impossible de supprimer ce signalement' },
  STUDENT_NOT_FOUND:       { status: 404, message: 'Aucun élève trouvé avec ces informations' },
  STUDENT_ALREADY_LINKED:  { status: 409, message: 'Cet élève est déjà rattaché à un autre compte parent' },
  PARENT_NOT_FOUND:        { status: 404, message: 'Aucun compte parent trouvé avec cet email' },
  STUDENT_FIELDS_REQUIRED:     { status: 422, message: 'Prénom, nom et date de naissance sont obligatoires pour un compte élève' },
  ACCOUNT_HAS_ACTIVE_DOSSIERS: { status: 409, message: 'Impossible de supprimer le compte : des dossiers actifs vous sont assignés. Veuillez les réaffecter avant de continuer.' },
  REPORT_ALREADY_LINKED:       { status: 409, message: 'Ce signalement est déjà rattaché à un autre compte' },
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
  return { status: 500, body: { error: 'Une erreur interne est survenue' } }
}
