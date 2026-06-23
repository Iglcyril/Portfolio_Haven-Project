import { api } from './api'
import { getProfile } from './authService'
import type { User, Child, ParentReport, EstablishmentContact, TimelineEntry, ReportEvent } from '../types'

// ─── Establishment contacts (données statiques) ───────────────────────────────

export const ESTABLISHMENT_CONTACTS: EstablishmentContact[] = [
  { name: 'Directeur de l\'établissement', role: 'director', phone: '—', initials: 'DI' },
  { name: 'Référent harcèlement',          role: 'referent', phone: '—', initials: 'RH' },
]

// ─── Mapping backend → frontend ───────────────────────────────────────────────

const CATEGORIE_LABELS: Record<string, string> = {
  harcelement_scolaire: 'Harcèlement scolaire',
  violence_physique:    'Violence physique',
  violence_verbale:     'Violence verbale',
  cyberharcelement:     'Cyberharcèlement',
  discrimination:       'Discrimination',
  mal_etre:             'Mal-être',
  autre:                'Signalement',
}

const STATUS_MAP: Record<string, ParentReport['status']> = {
  EN_ATTENTE: 'active',
  EN_COURS:   'active',
  RESOLU:     'resolved',
  ARCHIVE:    'archived',
}

const SEVERITY_MAP: Record<string, ParentReport['severity']> = {
  ELEVE: 'high',
  MOYEN: 'medium',
  BAS:   'low',
}

const ANONYMITY_MAP: Record<string, ParentReport['anonymityLevel']> = {
  total:       'anonymous',
  partiel:     'semi',
  pas_anonyme: 'visible',
}

const PROGRESS_MAP: Record<string, number> = {
  EN_ATTENTE: 10,
  EN_COURS:   65,
  RESOLU:     100,
  ARCHIVE:    100,
}

// Types bruts retournés par le backend
interface BackendChildReport {
  id:             string
  trackingId:     string
  type:           string
  categorie:      string
  status:         string
  severity:       string
  crisisDetected: boolean
  createdAt:      string
  updatedAt:      string
  anonymatLevel?: string
  messages?: Array<{ id: string; sender: string; content: string; createdAt: string }>
  assignedTo?: { id: string; firstName?: string; lastName?: string; email: string } | null
}

interface BackendChild {
  id:            string
  firstName?:    string
  lastName?:     string
  email:         string
  total_reports: number
  reports:       BackendChildReport[]
}

interface ChildrenResponse {
  total_children: number
  children:       BackendChild[]
}

function buildTimeline(report: BackendChildReport): TimelineEntry[] {
  const entries: TimelineEntry[] = [
    {
      id:          `${report.id}-created`,
      date:        report.createdAt,
      label:       'Signalement enregistré',
      description: `Le signalement ${report.trackingId} a été enregistré.`,
      actor:       'system',
    },
  ]

  if (report.assignedTo) {
    const name = [report.assignedTo.firstName, report.assignedTo.lastName].filter(Boolean).join(' ')
      || report.assignedTo.email
    entries.push({
      id:          `${report.id}-assigned`,
      date:        report.updatedAt,
      label:       'Prise en charge',
      description: `Dossier assigné à ${name}.`,
      actor:       'referent',
    })
  }

  if (report.messages) {
    for (const msg of report.messages) {
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

  if (report.status === 'RESOLU') {
    entries.push({
      id:          `${report.id}-resolved`,
      date:        report.updatedAt,
      label:       'Dossier résolu',
      description: 'Le signalement a été traité et clôturé.',
      actor:       'system',
    })
  }

  return entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

function buildEvents(report: BackendChildReport): ReportEvent[] {
  if (!report.messages) return []
  const actor = report.assignedTo
    ? ([report.assignedTo.firstName, report.assignedTo.lastName].filter(Boolean).join(' ') || report.assignedTo.email)
    : 'Référent'
  return report.messages
    .filter(m => m.sender === 'STAFF')
    .map(m => {
      try {
        const parsed = JSON.parse(m.content) as { type: string; comment?: string | null }
        return { id: m.id, type: parsed.type, comment: parsed.comment ?? undefined, createdAt: m.createdAt, actor }
      } catch {
        return null
      }
    })
    .filter((e): e is ReportEvent => e !== null)
}

function mapChildReport(r: BackendChildReport, childId: string): ParentReport {
  const assignedName = r.assignedTo
    ? ([r.assignedTo.firstName, r.assignedTo.lastName].filter(Boolean).join(' ') || r.assignedTo.email)
    : undefined

  return {
    id:             r.id,
    childId,
    caseNumber:     r.trackingId,
    title:          CATEGORIE_LABELS[r.categorie] ?? r.categorie,
    description:    r.messages?.find(m => m.sender === 'USER')?.content ?? '',
    category:       CATEGORIE_LABELS[r.categorie] ?? r.categorie,
    severity:       SEVERITY_MAP[r.severity]      ?? 'low',
    status:         STATUS_MAP[r.status]          ?? 'active',
    anonymityLevel: ANONYMITY_MAP[r.anonymatLevel ?? ''] ?? 'anonymous',
    progressPercent: PROGRESS_MAP[r.status]       ?? 10,
    createdAt:      r.createdAt,
    updatedAt:      r.updatedAt,
    referentName:   assignedName,
    timeline:       buildTimeline(r),
    events:         buildEvents(r),
  }
}

function mapChild(c: BackendChild): Child {
  const firstName = c.firstName ?? ''
  const lastName  = c.lastName  ?? ''
  const fullName  = [firstName, lastName].filter(Boolean).join(' ') || c.email
  return {
    id:             c.id,
    firstName,
    lastName,
    fullName,
    className:      '',
    dateOfBirth:    '',
    avatarInitials: fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
  }
}

// ─── Service functions ────────────────────────────────────────────────────────

async function fetchChildrenData(): Promise<ChildrenResponse> {
  return api.get<ChildrenResponse>('/parents/children/reports')
}

export async function getParentChildren(): Promise<Child[]> {
  const data = await fetchChildrenData()
  return (data.children ?? []).map(mapChild)
}

export async function getParentReports(childId?: string): Promise<ParentReport[]> {
  const data = await fetchChildrenData()
  const all = (data.children ?? []).flatMap(child =>
    child.reports.map(r => mapChildReport(r, child.id))
  )
  return childId ? all.filter(r => r.childId === childId) : all
}

export async function getCurrentParent(): Promise<User> {
  const profile = await getProfile()
  const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ') || profile.email
  return {
    id:                profile.id,
    fullName,
    email:             profile.email,
    portal:            'parent',
    establishmentName: '',
    avatarInitials:    fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
  }
}

export async function linkChild(
  firstName: string,
  lastName: string,
  birthDate: string,
): Promise<void> {
  await api.post('/parents/link-child', { firstName, lastName, birthDate })
}
