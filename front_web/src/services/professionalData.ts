import { api } from './api'
import { getProfile } from './authService'
import { CATEGORIE_LABELS, STATUS_MAP, SEVERITY_MAP, ANONYMITY_MAP } from './reportMappings'
import type { User, TeamMember, ProReport, TimelineEntry } from '../types'

// ─── Constantes UI (inchangées) ───────────────────────────────────────────────

export const ROLE_LABELS: Record<string, string> = {
  director:     'Directeur·rice',
  cpe:          'CPE',
  nurse:        'Infirmier·ère',
  aed:          'AED',
  teacher:      'Professeur·e',
  socialWorker: 'Assistant·e Social·e',
  other:        'Autre',
}

export const EVENT_TYPES = [
  'Entretien',
  'Médiation',
  'Convocation',
  'Observation',
  'Sanction',
  'Signalement interne',
  'Autre',
]

export const EVENT_COLORS: Record<string, string> = {
  'Entretien':           '#2EAB7B',
  'Médiation':           '#8ED4BF',
  'Convocation':         '#E67E22',
  'Observation':         '#3498DB',
  'Sanction':            '#C0392B',
  'Signalement interne': '#9B59B6',
  'Autre':               '#7F8C8D',
}

// ─── Stats types ─────────────────────────────────────────────────────────────

export interface RealStats {
  total:              number
  tauxPriseEnCharge:  number
  avgResolutionDays:  number | null
  weekly:             Array<{ label: string; total: number; high: number; medium: number; low: number }>
  monthly:            Array<{ label: string; total: number; high: number; medium: number; low: number }>
  yearly:             Array<{ label: string; total: number; high: number; medium: number; low: number }>
  bySeverity:         Array<{ name: string; value: number; color: string }>
  byCategory:         Array<{ category: string; count: number }>
  byStatus:           Array<{ status: string; count: number }>
}

// ─── Mapping backend → frontend ───────────────────────────────────────────────

const ANON_LABEL_MAP: Record<string, string> = {
  total:       'Anonyme',
  partiel:     'Semi-anonyme',
  pas_anonyme: 'Visible',
}

const PROGRESS_STAGE_MAP: Record<string, number> = {
  EN_ATTENTE: 0,
  EN_COURS:   2,
  RESOLU:     3,
  ARCHIVE:    3,
}

const PROGRESS_MAP: Record<string, number> = {
  EN_ATTENTE: 10,
  EN_COURS:   50,
  RESOLU:     100,
  ARCHIVE:    100,
}

// Types bruts du backend
interface BackendReport {
  id:             string
  trackingId:     string
  type:           string
  categorie:      string
  anonymatLevel:  string
  isAnonymous:    boolean
  crisisDetected: boolean
  status:         string
  severity:       string
  createdAt:      string
  updatedAt:      string
  userId?:        string | null
  user?:          { firstName?: string | null; lastName?: string | null } | null
  assignedTo?:    { id: string; firstName?: string; lastName?: string; email: string } | null
  messages?:      Array<{ id: string; sender: string; content: string; createdAt: string }>
  summary?:       { classLevel?: string | null } | null
}

interface AdminReportsResponse {
  data:       BackendReport[]
  total:      number
  page:       number
  totalPages: number
}

interface BackendTeamMember {
  id:       string
  name:     string
  role:     string
  email:    string
  jobTitle: string | null
  isCoRef:  boolean
}

interface AdminTeamResponse {
  hierarchy:  string[]
  total:      number
  team_info:  BackendTeamMember[]
}

function buildTimeline(r: BackendReport): TimelineEntry[] {
  const entries: TimelineEntry[] = [
    {
      id:          `${r.id}-created`,
      date:        r.createdAt,
      label:       'Signalement enregistré',
      description: `Signalement ${r.trackingId} enregistré dans Haven.`,
      actor:       'system',
    },
  ]

  if (r.assignedTo) {
    const name = [r.assignedTo.firstName, r.assignedTo.lastName].filter(Boolean).join(' ')
      || r.assignedTo.email
    entries.push({
      id:          `${r.id}-assigned`,
      date:        r.updatedAt,
      label:       'Prise en charge',
      description: `Assigné à ${name}.`,
      actor:       'referent',
    })
  }

  if (r.messages) {
    for (const msg of r.messages) {
      if (msg.sender === 'STAFF') continue
      entries.push({
        id:          msg.id,
        date:        msg.createdAt,
        label:       msg.sender === 'USER' ? 'Déclaration de l\'élève' : 'Message de suivi',
        description: msg.content,
        actor:       msg.sender === 'USER' ? 'student' : 'referent',
      })
    }
  }

  if (r.status === 'RESOLU') {
    entries.push({
      id:          `${r.id}-resolved`,
      date:        r.updatedAt,
      label:       'Dossier résolu',
      description: 'Signalement traité et clôturé.',
      actor:       'system',
    })
  }

  if (r.status === 'ARCHIVE') {
    entries.push({
      id:          `${r.id}-archived`,
      date:        r.updatedAt,
      label:       'Archivé',
      description: 'Dossier archivé.',
      actor:       'system',
    })
  }

  return entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

function mapProReport(r: BackendReport): ProReport {
  const assignedName = r.assignedTo
    ? ([r.assignedTo.firstName, r.assignedTo.lastName].filter(Boolean).join(' ') || r.assignedTo.email)
    : undefined

  const firstUserMsg = r.messages?.find(m => m.sender === 'USER')?.content ?? ''

  const studentName = r.user
    ? [r.user.firstName, r.user.lastName].filter(Boolean).join(' ') || undefined
    : undefined

  const events: import('../types').ReportEvent[] = []
  if (r.messages) {
    for (const msg of r.messages) {
      if (msg.sender !== 'STAFF') continue
      try {
        const parsed = JSON.parse(msg.content) as { type: string; comment?: string | null }
        events.push({
          id:        msg.id,
          type:      parsed.type,
          comment:   parsed.comment ?? undefined,
          createdAt: msg.createdAt,
          actor:     'Référent',
        })
      } catch { /* skip malformed */ }
    }
  }

  return {
    id:              r.id,
    caseNumber:      r.trackingId,
    title:           CATEGORIE_LABELS[r.categorie] ?? r.categorie,
    description:     firstUserMsg,
    category:        CATEGORIE_LABELS[r.categorie] ?? r.categorie,
    severity:        r.severity && r.severity !== 'BAS' ? SEVERITY_MAP[r.severity] : undefined,
    status:          STATUS_MAP[r.status]           ?? 'active',
    anonymityLevel:  ANONYMITY_MAP[r.anonymatLevel] ?? 'anonymous',
    anonLevel:       ANON_LABEL_MAP[r.anonymatLevel] ?? 'Anonyme',
    progressPercent: PROGRESS_MAP[r.status]         ?? 10,
    progressStage:   PROGRESS_STAGE_MAP[r.status]   ?? 0,
    crisisDetected:  r.crisisDetected,
    createdAt:       r.createdAt,
    updatedAt:       r.updatedAt,
    assignedTo:      assignedName,
    referentName:    assignedName,
    studentClass:    r.summary?.classLevel ?? undefined,
    studentName,
    timeline:        buildTimeline(r),
    events,
  }
}

function mapTeamMember(m: BackendTeamMember): TeamMember {
  const parts     = m.name.trim().split(/\s+/)
  const firstName = parts[0] ?? ''
  const lastName  = parts.slice(1).join(' ')
  const role      = m.role === 'ADMIN' ? 'director' : 'other'

  return {
    id:             m.id,
    fullName:       m.name,
    firstName,
    lastName,
    avatarInitials: [firstName[0], lastName[0]].filter(Boolean).join('').toUpperCase() || '??',
    role:           role as TeamMember['role'],
    roleLabel:      ROLE_LABELS[role],
    jobTitle:       m.jobTitle ?? '',
    phone:          '',
    email:          m.email,
    activeCount:    0,
    resolvedCount:  0,
    isCoRef:        m.isCoRef,
  }
}

// ─── Team localStorage persistence ───────────────────────────────────────────

const LS_OVERRIDES = 'haven_team_overrides'
const LS_LOCAL     = 'haven_team_local'

function loadOverrides(): Record<string, Partial<TeamMember>> {
  try { return JSON.parse(localStorage.getItem(LS_OVERRIDES) ?? '{}') } catch { return {} }
}

function loadLocalMembers(): TeamMember[] {
  try { return JSON.parse(localStorage.getItem(LS_LOCAL) ?? '[]') } catch { return [] }
}

export function saveTeamMemberOverride(m: TeamMember): void {
  const overrides = loadOverrides()
  overrides[m.id] = { fullName: m.fullName, firstName: m.firstName, lastName: m.lastName,
    avatarInitials: m.avatarInitials, role: m.role, roleLabel: m.roleLabel,
    jobTitle: m.jobTitle, phone: m.phone, isCoRef: m.isCoRef }
  localStorage.setItem(LS_OVERRIDES, JSON.stringify(overrides))
}

export async function updateTeamMemberCoRef(userId: string, isCoRef: boolean): Promise<void> {
  await api.patch(`/admin/users/${userId}`, { isCoRef })
}

export function saveLocalTeamMember(m: TeamMember): void {
  const locals = loadLocalMembers().filter(x => x.id !== m.id)
  localStorage.setItem(LS_LOCAL, JSON.stringify([...locals, m]))
}

export function removeLocalTeamMember(id: string): void {
  if (id.startsWith('tm_new_')) {
    localStorage.setItem(LS_LOCAL, JSON.stringify(loadLocalMembers().filter(m => m.id !== id)))
  } else {
    const overrides = loadOverrides()
    delete overrides[id]
    localStorage.setItem(LS_OVERRIDES, JSON.stringify(overrides))
  }
}

// ─── Service functions ────────────────────────────────────────────────────────

export interface PaginatedProReports {
  data:       ProReport[]
  total:      number
  page:       number
  totalPages: number
}

export async function getProReports(page = 1, limit = 10, status?: string): Promise<PaginatedProReports> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) })
  if (status && status !== 'all') params.set('status', status.toUpperCase())
  const res = await api.get<AdminReportsResponse>(`/admin/reports?${params}`)
  return { ...res, data: res.data.map(mapProReport) }
}

export async function getTeamMembers(): Promise<TeamMember[]> {
  const res       = await api.get<AdminTeamResponse>('/admin/team')
  const overrides = loadOverrides()
  const backend   = res.team_info.map(m => {
    const base = mapTeamMember(m)
    return overrides[base.id] ? { ...base, ...overrides[base.id] } : base
  })
  return [...backend, ...loadLocalMembers()]
}

export async function getDirector(): Promise<User> {
  const profile = await getProfile()
  const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ') || profile.email
  return {
    id:                profile.id,
    fullName,
    email:             profile.email,
    portal:            'professional',
    establishmentName: '',
    avatarInitials:    fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
  }
}

export async function getReferentUser(): Promise<User> {
  return getDirector()
}

export async function getStats(): Promise<RealStats> {
  return api.get<RealStats>('/admin/stats')
}

// ─── Actions professionnelles ─────────────────────────────────────────────────

export type BackendStatus   = 'EN_ATTENTE' | 'EN_COURS' | 'RESOLU' | 'ARCHIVE'
export type BackendSeverity = 'BAS' | 'MOYEN' | 'ELEVE'

export async function updateStatus(trackingCode: string, status: BackendStatus): Promise<void> {
  await api.patch(`/admin/reports/${trackingCode}`, { status })
}

export async function updateSeverity(trackingCode: string, level: BackendSeverity): Promise<void> {
  await api.patch(`/admin/reports/${trackingCode}`, { level })
}

export async function assignReferent(trackingCode: string, referentId: string): Promise<void> {
  await api.post(`/admin/reports/${trackingCode}/assign`, { referent_id: referentId })
}

export async function saveEvent(trackingCode: string, type: string, comment?: string): Promise<void> {
  await api.post(`/admin/reports/${trackingCode}/events`, { type, comment })
}
