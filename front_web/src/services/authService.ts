import { api, setToken, clearToken } from './api'

export type Role = 'STUDENT' | 'PARENT' | 'SUPERVISOR' | 'ADMIN'
export type PortalKey = 'students' | 'parents' | 'professionals'

export interface AuthUser {
  id: string
  email: string
  role: Role
  firstName?: string
  lastName?: string
  birthDate?: string
}

interface AuthResponse {
  token: string
  user: AuthUser
}

const PORTAL_TO_ROLE: Record<PortalKey, Role> = {
  students:      'STUDENT',
  parents:       'PARENT',
  professionals: 'SUPERVISOR',
}

export async function register(
  portal: PortalKey,
  name: string,
  email: string,
  password: string,
  persistent: boolean,
): Promise<AuthUser> {
  const parts = name.trim().split(/\s+/)
  const firstName = parts[0]
  const lastName = parts.slice(1).join(' ') || parts[0]

  const data = await api.post<AuthResponse>('/auth/register', {
    email,
    password,
    firstName,
    lastName,
    role: PORTAL_TO_ROLE[portal],
  })

  setToken(data.token, persistent)
  return data.user
}

export async function login(
  email: string,
  password: string,
  persistent: boolean,
): Promise<AuthUser> {
  const data = await api.post<AuthResponse>('/auth/login', { email, password })
  setToken(data.token, persistent)
  return data.user
}

export async function getProfile(): Promise<AuthUser> {
  return api.get<AuthUser>('/auth/profile')
}

export function logout() {
  clearToken()
}
