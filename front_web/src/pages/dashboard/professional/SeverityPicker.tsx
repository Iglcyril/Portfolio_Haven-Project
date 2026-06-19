import type { Severity } from '../../../types'
import { SEVERITY_COLOR } from '../../../constants/severity'

export function SeverityPicker({ value, onChange }: { value?: Severity; onChange: (s: Severity) => void }) {
  const levels: { key: Severity; label: string }[] = [
    { key: 'high',   label: 'Élevé' },
    { key: 'medium', label: 'Moyen' },
    { key: 'low',    label: 'Faible' },
  ]
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {levels.map(l => {
        const active = value === l.key
        return (
          <button
            key={l.key}
            onClick={() => onChange(l.key)}
            style={{
              flex: 1, padding: '8px 0', borderRadius: 8, border: 'none',
              background: active ? `${SEVERITY_COLOR[l.key]}25` : 'var(--c-input-bg)',
              color: active ? SEVERITY_COLOR[l.key] : 'var(--c-text-muted)',
              fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              outline: active ? `1.5px solid ${SEVERITY_COLOR[l.key]}` : '1px solid var(--c-input-border)',
              transition: 'all 0.15s',
            }}
          >
            {l.label}
          </button>
        )
      })}
    </div>
  )
}
