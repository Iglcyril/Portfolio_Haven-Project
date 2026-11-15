/**
 * Tests unitaires : vérification des jetons et des rôles (src/middlewares/auth.middleware.ts)
 * Lancer : bun test
 */
import { beforeAll, describe, expect, test } from 'bun:test'
import jwt from 'jsonwebtoken'

// Le middleware lit JWT_SECRET au chargement : on le définit avant l'import.
const SECRET = 'secret-de-test'
process.env.JWT_SECRET = SECRET
const { verifyToken, requireRole, requireStaff, requireAuth } = await import('../src/middlewares/auth.middleware')

const sign = (role: string, secret = SECRET, options: jwt.SignOptions = { expiresIn: '1h' }) =>
  jwt.sign({ userId: 'user-1', role }, secret, options)

let studentToken: string
let supervisorToken: string

beforeAll(() => {
  studentToken = sign('STUDENT')
  supervisorToken = sign('SUPERVISOR')
})

describe('verifyToken', () => {
  test('accepte un jeton valide et renvoie son contenu', () => {
    const payload = verifyToken(studentToken)
    expect(payload.userId).toBe('user-1')
    expect(payload.role).toBe('STUDENT')
  })

  test('refuse un jeton signé avec une autre clé', () => {
    expect(() => verifyToken(sign('ADMIN', 'mauvaise-cle'))).toThrow('INVALID_TOKEN')
  })

  test('refuse un jeton dont le contenu a été modifié (rôle changé en ADMIN)', () => {
    const [header, , signature] = studentToken.split('.')
    const forgedPayload = Buffer.from(JSON.stringify({ userId: 'user-1', role: 'ADMIN' })).toString('base64url')
    expect(() => verifyToken(`${header}.${forgedPayload}.${signature}`)).toThrow('INVALID_TOKEN')
  })

  test('refuse un jeton expiré', () => {
    const expired = sign('STUDENT', SECRET, { expiresIn: -10 })
    expect(() => verifyToken(expired)).toThrow('INVALID_TOKEN')
  })

  test('refuse un jeton vide', () => {
    expect(() => verifyToken('')).toThrow('INVALID_TOKEN')
  })
})

describe('requireRole', () => {
  test('laisse passer un rôle autorisé', () => {
    expect(requireStaff(supervisorToken).role).toBe('SUPERVISOR')
  })

  test('refuse un rôle non autorisé avec FORBIDDEN', () => {
    expect(() => requireStaff(studentToken)).toThrow('FORBIDDEN')
  })

  test("vérifie le jeton avant le rôle : un jeton invalide donne INVALID_TOKEN, pas FORBIDDEN", () => {
    expect(() => requireRole('jeton-invalide', ['ADMIN'])).toThrow('INVALID_TOKEN')
  })

  test('requireAuth accepte tous les rôles connectés', () => {
    for (const role of ['STUDENT', 'SUPERVISOR', 'ADMIN', 'PARENT'] as const) {
      expect(requireAuth(sign(role)).role).toBe(role)
    }
  })
})
