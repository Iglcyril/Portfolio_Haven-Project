import type { Severity } from '../types'

export const SEVERITY_META: Record<Severity, { label: string; color: string; bg: string }> = {
  high:   { label: 'Élevé',  color: '#C0392B', bg: 'rgba(192,57,43,0.12)' },
  medium: { label: 'Moyen',  color: '#E67E22', bg: 'rgba(230,126,34,0.12)' },
  low:    { label: 'Faible', color: '#2EAB7B', bg: 'rgba(46,171,123,0.12)' },
}

// Array form — for indexOf-based sorting (Student, Parent dashboards)
export const SEVERITY_ORDER: Severity[] = ['high', 'medium', 'low']

// Map form — for record-based sorting (Professional dashboard, includes 'none')
export const SEVERITY_ORDER_MAP: Record<string, number> = { high: 0, medium: 1, low: 2, none: 3 }

// Split maps derived from SEVERITY_META (Professional dashboard uses these separately)
export const SEVERITY_COLOR: Record<string, string> = {
  high:   SEVERITY_META.high.color,
  medium: SEVERITY_META.medium.color,
  low:    SEVERITY_META.low.color,
  none:   'rgba(140,160,155,0.8)',
}

export const SEVERITY_LABEL: Record<string, string> = {
  high:   SEVERITY_META.high.label,
  medium: SEVERITY_META.medium.label,
  low:    SEVERITY_META.low.label,
  none:   'À classer',
}
