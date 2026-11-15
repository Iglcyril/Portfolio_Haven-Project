/**
 * Tests unitaires : traduction des erreurs métier en codes HTTP (src/middlewares/error.middleware.ts)
 * Lancer : bun test
 */
import { describe, expect, spyOn, test } from 'bun:test'
import { handleError } from '../src/middlewares/error.middleware'

describe('handleError', () => {
  test('INVALID_TOKEN donne un 401', () => {
    expect(handleError(new Error('INVALID_TOKEN')).status).toBe(401)
  })

  test('FORBIDDEN donne un 403', () => {
    expect(handleError(new Error('FORBIDDEN')).status).toBe(403)
  })

  test('REPORT_NOT_FOUND donne un 404', () => {
    expect(handleError(new Error('REPORT_NOT_FOUND')).status).toBe(404)
  })

  test("une erreur inconnue donne un 500, sans exposer le détail technique au client", () => {
    const log = spyOn(console, 'error').mockImplementation(() => {})
    const { status, body } = handleError(new Error('relation "User" does not exist'))
    expect(status).toBe(500)
    expect(JSON.stringify(body)).not.toContain('User')
    log.mockRestore()
  })
})
