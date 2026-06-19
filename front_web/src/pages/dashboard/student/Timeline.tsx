import type { TimelineEntry } from '../../../types'
import { formatDate } from '../../../utils/dateFormatting'
import { ACCENT } from './constants'

export function Timeline({ entries }: { entries: TimelineEntry[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {entries.map((entry, i) => (
        <div key={entry.id} style={{ display: 'flex', gap: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 20, flexShrink: 0 }}>
            <div style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: i === 0 ? ACCENT : 'transparent',
              border: `2px solid ${i === 0 ? ACCENT : 'var(--c-border)'}`,
              flexShrink: 0,
              marginTop: 2,
            }} />
            {i < entries.length - 1 && (
              <div style={{ width: 1, flex: 1, background: 'var(--c-divider)', marginTop: 4 }} />
            )}
          </div>
          <div style={{ paddingBottom: i < entries.length - 1 ? 20 : 0 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 3 }}>
              <span style={{
                fontFamily: "'Manrope', sans-serif",
                fontSize: '0.82rem',
                fontWeight: 700,
                color: i === 0 ? 'var(--c-text)' : 'var(--c-text-sub)',
              }}>
                {entry.label}
              </span>
              <span style={{
                fontFamily: "'Manrope', sans-serif",
                fontSize: '0.68rem',
                color: 'var(--c-text-muted)',
              }}>
                {formatDate(entry.date)}
              </span>
            </div>
            <p style={{
              fontFamily: "'Manrope', sans-serif",
              fontSize: '0.80rem',
              color: 'var(--c-text-sub)',
              margin: 0,
              lineHeight: 1.5,
            }}>
              {entry.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
