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
  email: string,
  password: string,
  persistent: boolean,
  profile: { firstName: string; lastName: string; birthDate?: string },
): Promise<AuthUser> {
  const data = await api.post<AuthResponse>('/auth/register', {
    email,
    password,
    firstName: profile.firstName,
    lastName:  profile.lastName,
    birthDate: profile.birthDate,
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
