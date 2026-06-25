import { randomBytes } from 'crypto'

interface WsTokenEntry {
  userId: string
  role:   string
  expiresAt: number
}

class WsTokenStore {
  private tokens = new Map<string, WsTokenEntry>()

  generate(userId: string, role: string): string {
    const token = randomBytes(32).toString('hex')
    this.tokens.set(token, { userId, role, expiresAt: Date.now() + 30_000 })
    return token
  }

  // Single-use : consomme et invalide le token après validation
  consume(token: string): WsTokenEntry | null {
    const entry = this.tokens.get(token)
    if (!entry) return null
    this.tokens.delete(token)
    if (Date.now() > entry.expiresAt) return null
    return entry
  }
}

export const wsTokenStore = new WsTokenStore()
