const STAGES = ['DÉPOSÉ', 'EXAMINÉ', 'EN COURS', 'RÉSOLU']

export function ProgressTracker({ stage, color }: { stage: number; color: string }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
        {STAGES.map((_, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < STAGES.length - 1 ? 1 : 0 }}>
            <div style={{
              width: i === stage ? 10 : 7,
              height: i === stage ? 10 : 7,
              borderRadius: '50%',
              background: i <= stage ? color : 'var(--c-progress-track)',
              flexShrink: 0,
              transition: 'background 0.28s',
            }} />
            {i < STAGES.length - 1 && (
              <div style={{
                flex: 1,
                height: 2,
                background: i < stage ? color : 'var(--c-progress-track)',
                borderRadius: 1,
                margin: '0 3px',
                transition: 'background 0.28s',
              }} />
            )}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {STAGES.map((label, i) => (
          <span key={label} style={{
            fontFamily: "'Manrope', sans-serif",
            fontSize: '0.62rem',
            fontWeight: i === stage ? 700 : 500,
            color: i === stage ? color : 'var(--c-text-muted)',
            letterSpacing: '0.04em',
          }}>
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}
