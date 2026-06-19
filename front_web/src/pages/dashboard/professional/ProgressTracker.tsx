import { STAGES } from './constants'

export function ProgressTracker({ stage, color }: { stage: number; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0 }}>
      {STAGES.map((label, i) => {
        const done    = i < stage
        const current = i === stage
        const fill    = done || current ? color : 'var(--c-progress-track)'
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', flex: i < STAGES.length - 1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{
                width: 10, height: 10, borderRadius: '50%',
                background: fill,
                border: `2px solid ${fill}`,
                transition: 'background 0.3s',
                flexShrink: 0,
              }} />
              <span style={{
                fontSize: 9, fontWeight: current ? 700 : 500,
                color: done || current ? color : 'var(--c-text-muted)',
                whiteSpace: 'nowrap', transition: 'color 0.3s',
              }}>
                {label}
              </span>
            </div>
            {i < STAGES.length - 1 && (
              <div style={{
                height: 2, flex: 1, marginTop: 4,
                background: done ? color : 'var(--c-progress-track)',
                transition: 'background 0.3s',
              }} />
            )}
          </div>
        )
      })}
    </div>
  )
}
