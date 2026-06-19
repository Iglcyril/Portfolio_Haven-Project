import type { ReportStatus } from '../../../types'

export const ACCENT = '#00A176'

export const STATUS_META: Record<ReportStatus, { label: string; color: string }> = {
  active:   { label: 'En cours', color: '#00A176' },
  resolved: { label: 'Résolu',   color: '#8ED4BF' },
  archived: { label: 'Archivé',  color: 'var(--c-archived)' },
}

export type SortKey = 'date' | 'severity' | 'progress'
export type StatusFilter = 'all' | ReportStatus
