const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'

const TOKEN_KEY = 'haven_token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string, _persistent?: boolean) {
  sessionStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(TOKEN_KEY)
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.error ?? body?.message ?? body?.summary ?? `Erreur ${res.status}`)
  }

  return res.json() as Promise<T>
}

export const api = {
  get:    <T>(path: string)                    => request<T>(path),
  post:   <T>(path: string, body: unknown)     => request<T>(path, { method: 'POST',   body: JSON.stringify(body) }),
  patch:  <T>(path: string, body: unknown)     => request<T>(path, { method: 'PATCH',  body: JSON.stringify(body) }),
  delete: <T>(path: string)                    => request<T>(path, { method: 'DELETE' }),
}
