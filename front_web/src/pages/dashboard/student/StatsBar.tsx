import type { Report } from '../../../types'
import { ACCENT } from './constants'

export function StatsBar({ reports }: { reports: Report[] }) {
  const active   = reports.filter(r => r.status === 'active').length
  const resolved = reports.filter(r => r.status === 'resolved').length
  const archived = reports.filter(r => r.status === 'archived').length

  const stats = [
    { label: 'Total',    value: reports.length, color: 'var(--c-text-sub)' },
    { label: 'En cours', value: active,          color: ACCENT },
    { label: 'Résolus',  value: resolved,        color: '#8ED4BF' },
    { label: 'Archivés', value: archived,        color: 'var(--c-archived)' },
  ]

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 12,
      marginBottom: 24,
    }}>
      {stats.map(s => (
        <div key={s.label} style={{
          background: 'var(--c-card)',
          borderRadius: 14,
          padding: '14px 16px',
          border: '1px solid var(--c-border)',
          boxShadow: 'var(--c-card-shadow)',
          transition: 'background 0.28s ease, border-color 0.28s ease',
        }}>
          <div style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontSize: '1.8rem',
            fontWeight: 700,
            color: s.color,
            lineHeight: 1,
          }}>
            {s.value}
          </div>
          <div style={{
            fontFamily: "'Manrope', sans-serif",
            fontSize: '0.75rem',
            color: 'var(--c-text-muted)',
            marginTop: 4,
          }}>
            {s.label}
          </div>
        </div>
      ))}
    </div>
  )
}
