import type { ProReport } from '../../../types'

export const PRIMARY = '#2EAB7B'
export const STAGES  = ['DÉPOSÉ', 'EXAMINÉ', 'EN COURS', 'RÉSOLU']

export type SortKey      = 'severity' | 'date' | 'stage' | 'referent'
export type StatusFilter = 'active' | 'unassigned' | 'resolved' | 'archived'

export const ROLE_OPTIONS: { key: string; label: string }[] = [
  { key: 'cpe',         label: 'CPE' },
  { key: 'teacher',     label: 'Professeur·e' },
  { key: 'nurse',       label: 'Infirmier·ère' },
  { key: 'aed',         label: 'AED' },
  { key: 'socialWorker', label: 'Assistant·e Social·e' },
  { key: 'other',       label: 'Autre' },
]

export function severityKey(r: ProReport) { return r.severity ?? 'none' }
