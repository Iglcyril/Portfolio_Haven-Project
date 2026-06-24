import { api } from './api'
import { getProfile } from './authService'
import type { Report, User, EmergencyContact, TimelineEntry, ReportEvent } from '../types'

// ─── Emergency contacts (données statiques) ───────────────────────────────────

export const EMERGENCY_CONTACTS: EmergencyContact[] = [
  { number: '3020', label: 'Non au harcèlement', description: 'Harcèlement scolaire', color: '#2EAB7B' },
  { number: '3114', label: 'Prévention suicide',  description: 'Numéro national',       color: '#8ED4BF' },
  { number: '119',  label: 'Enfance en danger',   description: 'Allô enfance en danger', color: '#00A176' },
  { number: '15',   label: 'SAMU',                description: 'Urgence médicale',       color: '#FF6B6B' },
  { number: '17',   label: 'Police',              description: 'Urgence sécurité',       color: '#4A90D9' },
  { number: '18',   label: 'Pompiers',            description: 'Urgence incendie',       color: '#FF8C42' },
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

const STATUS_MAP: Record<string, Report['status']> = {
  EN_ATTENTE: 'active',
  EN_COURS:   'active',
  RESOLU:     'resolved',
  ARCHIVE:    'archived',
}

const SEVERITY_MAP: Record<string, Report['severity']> = {
  ELEVE: 'high',
  MOYEN: 'medium',
  BAS:   'low',
}

const ANONYMITY_MAP: Record<string, Report['anonymityLevel']> = {
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
  assignedTo?: { id: string; firstName?: string; lastName?: string; email: string } | null
  messages?: Array<{ id: string; sender: string; content: string; createdAt: string }>
}

function referentName(assignedTo?: BackendReport['assignedTo']): string | undefined {
  if (!assignedTo) return undefined
  const name = [assignedTo.firstName, assignedTo.lastName].filter(Boolean).join(' ')
  return name || assignedTo.email
}

function buildTimeline(report: BackendReport): TimelineEntry[] {
  const entries: TimelineEntry[] = [
    {
      id:          `${report.id}-created`,
      date:        report.createdAt,
      label:       'Signalement enregistré',
      description: `Votre signalement a été enregistré sous le numéro ${report.trackingId}.`,
      actor:       'system',
    },
  ]

  if (report.assignedTo) {
    entries.push({
      id:          `${report.id}-assigned`,
      date:        report.updatedAt,
      label:       'Prise en charge',
      description: `Votre dossier a été assigné à ${referentName(report.assignedTo)}.`,
      actor:       'referent',
    })
  }

  if (report.messages) {
    for (const msg of report.messages) {
      if (msg.sender === 'STAFF') continue
      entries.push({
        id:          msg.id,
        date:        msg.createdAt,
        label:       msg.sender === 'USER' ? 'Votre déclaration' : 'Message de suivi',
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
      description: 'Votre signalement a été traité et clôturé.',
      actor:       'system',
    })
  }

  if (report.status === 'ARCHIVE') {
    entries.push({
      id:          `${report.id}-archived`,
      date:        report.updatedAt,
      label:       'Archivé',
      description: 'Dossier archivé.',
      actor:       'system',
    })
  }

  return entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

function buildEvents(report: BackendReport): ReportEvent[] {
  if (!report.messages) return []
  const actor = referentName(report.assignedTo) ?? 'Référent'
  return report.messages
    .filter(m => m.sender === 'STAFF')
    .map(m => {
      try {
        const parsed = JSON.parse(m.content) as { type: string; comment?: string | null }
        return { id: m.id, type: parsed.type, comment: parsed.comment ?? undefined, createdAt: m.createdAt, actor } as ReportEvent
      } catch {
        return null
      }
    })
    .filter((e): e is ReportEvent => e !== null)
}

function mapReport(r: BackendReport): Report {
  return {
    id:             r.id,
    caseNumber:     r.trackingId,
    title:          CATEGORIE_LABELS[r.categorie] ?? r.categorie,
    description:    r.messages?.find(m => m.sender === 'USER')?.content ?? '',
    category:       CATEGORIE_LABELS[r.categorie] ?? r.categorie,
    severity:       SEVERITY_MAP[r.severity]     ?? 'low',
    status:         STATUS_MAP[r.status]         ?? 'active',
    anonymityLevel: ANONYMITY_MAP[r.anonymatLevel] ?? 'anonymous',
    progressPercent: PROGRESS_MAP[r.status]      ?? 10,
    createdAt:      r.createdAt,
    updatedAt:      r.updatedAt,
    referentName:   referentName(r.assignedTo),
    timeline:       buildTimeline(r),
    events:         buildEvents(r),
  }
}

// ─── Service functions ────────────────────────────────────────────────────────

export async function getStudentReports(): Promise<Report[]> {
  const raw = await api.get<BackendReport[]>('/reports')
  return raw.map(mapReport)
}

export async function getReportById(trackingCode: string): Promise<Report | undefined> {
  try {
    const raw = await api.get<BackendReport>(`/reports/${trackingCode}`)
    return mapReport(raw)
  } catch {
    return undefined
  }
}

export async function getCurrentStudent(): Promise<User> {
  const profile = await getProfile()
  const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ') || profile.email
  return {
    id:                profile.id,
    fullName,
    email:             profile.email,
    portal:            'student',
    establishmentName: '',
    avatarInitials:    fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
  }
}
