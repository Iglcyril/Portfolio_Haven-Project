import type { ReportStatus } from '../../../types'

export const ACCENT = '#2EAB7B'

export const STATUS_META: Record<ReportStatus, { label: string; color: string }> = {
  active:   { label: 'En cours', color: '#2EAB7B' },
  resolved: { label: 'Résolu',   color: '#8ED4BF' },
  archived: { label: 'Archivé',  color: 'var(--c-archived)' },
}

export type SortKey = 'date' | 'severity' | 'progress'
export type StatusFilter = 'all' | ReportStatus
