import { PRIMARY, type SortKey } from './constants'

export function SortBar({ sort, setSort }: { sort: SortKey; setSort: (k: SortKey) => void }) {
  const opts: { key: SortKey; label: string }[] = [
    { key: 'severity', label: 'Gravité' },
    { key: 'date',     label: 'Date' },
    { key: 'stage',    label: 'Résolution' },
    { key: 'referent', label: 'Référent' },
  ]
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
      <span style={{ fontSize: 12, color: 'var(--c-text-muted)', fontWeight: 600, marginRight: 4 }}>Trier :</span>
      {opts.map(o => (
        <button
          key={o.key}
          onClick={() => setSort(o.key)}
          style={{
            padding: '5px 12px', borderRadius: 20, border: 'none',
            background: sort === o.key ? PRIMARY : 'var(--c-badge)',
            color: sort === o.key ? '#fff' : 'var(--c-text-sub)',
            fontSize: 12, fontWeight: 600, cursor: 'pointer',
            fontFamily: 'inherit', transition: 'background 0.2s, color 0.2s',
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
