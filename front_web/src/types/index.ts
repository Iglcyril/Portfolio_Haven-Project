// ─── Enums ────────────────────────────────────────────────────────────────────

export type Severity = 'high' | 'medium' | 'low'
export type ReportStatus = 'active' | 'resolved' | 'archived'
export type AnonymityLevel = 'anonymous' | 'semi' | 'visible'
export type PortalType = 'student' | 'parent' | 'professional'

// ─── User ─────────────────────────────────────────────────────────────────────

export interface User {
  id: string
  fullName: string
  email: string
  portal: PortalType
  establishmentName: string
  className?: string        // students only
  avatarInitials: string
}

// ─── Report ───────────────────────────────────────────────────────────────────

export interface TimelineEntry {
  id: string
  date: string              // ISO
  label: string
  description: string
  actor: 'system' | 'referent' | 'student'
}

export interface Report {
  id: string
  caseNumber: string        // HVN-xxx
  title: string
  description: string
  category: string
  severity: Severity
  status: ReportStatus
  anonymityLevel: AnonymityLevel
  progressPercent: number   // 0–100
  createdAt: string         // ISO
  updatedAt: string         // ISO
  timeline: TimelineEntry[]
  referentName?: string     // assigned referent
  events: ReportEvent[]
}

// ─── Emergency ────────────────────────────────────────────────────────────────

export interface EmergencyContact {
  number: string
  label: string
  description: string
  color: string
}

// ─── Parent ───────────────────────────────────────────────────────────────────

export interface Child {
  id: string
  firstName: string
  lastName: string
  fullName: string
  className: string
  dateOfBirth: string
  avatarInitials: string
}

export interface ParentReport extends Report {
  childId: string
}

export interface EstablishmentContact {
  name: string
  role: 'director' | 'referent'
  phone: string
  initials: string
}

// ─── Professional ─────────────────────────────────────────────────────────────

export type ProfessionalRole =
  | 'director' | 'cpe' | 'nurse' | 'aed'
  | 'teacher' | 'socialWorker' | 'other'

export interface TeamMember {
  id: string
  fullName: string
  firstName: string
  lastName: string
  avatarInitials: string
  role: ProfessionalRole       // Haven role
  roleLabel: string            // human-readable
  jobTitle: string             // poste établissement
  phone: string
  email: string
  activeCount: number
  resolvedCount: number
}

export interface ReportEvent {
  id: string
  type: string
  comment?: string
  createdAt: string            // ISO
  actor: string                // fullName of the referent who added it
}

export interface ProReport extends Omit<Report, 'severity'> {
  severity?: Severity          // undefined = not yet classified by director
  assignedTo?: string          // fullName of assigned referent
  progressStage: number        // 0-3
  anonLevel: string            // 'Anonyme' | 'Semi-anonyme' | 'Visible'
  studentClass?: string
  studentName?: string
  events: ReportEvent[]
}
