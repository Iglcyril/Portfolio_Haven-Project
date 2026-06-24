type WsClient = { userId: string; role: string }

class WsManager {
  private clients = new Map<object, WsClient>()

  add(ws: object, userId: string, role: string) {
    this.clients.set(ws, { userId, role })
  }

  remove(ws: object) {
    this.clients.delete(ws)
  }

  broadcastCrisis(payload: {
    type: 'crisis_alert'
    trackingCode: string
    category: string
  }) {
    const msg = JSON.stringify(payload)
    for (const [ws, { role }] of this.clients) {
      if (['SUPERVISOR', 'ADMIN'].includes(role)) {
        try { (ws as { send: (m: string) => void }).send(msg) } catch { /* client déconnecté */ }
      }
    }
  }
}

export const wsManager = new WsManager()
