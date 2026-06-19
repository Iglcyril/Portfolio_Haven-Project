import { Search, X, ArrowUpDown } from 'lucide-react'
import { ACCENT, type SortKey, type StatusFilter } from './constants'

export function FilterBar({
  search, onSearch, statusFilter, onStatusFilter, sort, onSort, counts,
}: {
  search: string; onSearch: (v: string) => void
  statusFilter: StatusFilter; onStatusFilter: (v: StatusFilter) => void
  sort: SortKey; onSort: (v: SortKey) => void
  counts: Record<StatusFilter, number>
}) {
  const tabs: { key: StatusFilter; label: string }[] = [
    { key: 'all',      label: `Tous (${counts.all})` },
    { key: 'active',   label: `En cours (${counts.active})` },
    { key: 'resolved', label: `Résolus (${counts.resolved})` },
    { key: 'archived', label: `Archivés (${counts.archived})` },
  ]
  const sorts: { key: SortKey; label: string }[] = [
    { key: 'date',     label: 'Date' },
    { key: 'severity', label: 'Gravité' },
    { key: 'progress', label: 'Résolution' },
  ]

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--c-input-bg)', border: '1px solid var(--c-input-border)', borderRadius: 12, padding: '10px 14px', marginBottom: 12, transition: 'background 0.28s, border-color 0.28s' }}>
        <span style={{ color: 'var(--c-icon)', display: 'flex' }}><Search size={15} /></span>
        <input
          value={search}
          onChange={e => onSearch(e.target.value)}
          placeholder="Rechercher un signalement…"
          className="haven-search-input"
          style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontFamily: "'Manrope', sans-serif", fontSize: '0.87rem', color: 'var(--c-text)' }}
        />
        {search && (
          <button onClick={() => onSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-icon)', display: 'flex', padding: 0 }}>
            <X size={14} />
          </button>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' as const }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => onStatusFilter(tab.key)} style={{ padding: '6px 12px', borderRadius: 9999, border: 'none', background: statusFilter === tab.key ? `${ACCENT}20` : 'transparent', color: statusFilter === tab.key ? 'var(--c-text)' : 'var(--c-text-sub)', fontFamily: "'Manrope', sans-serif", fontSize: '0.78rem', fontWeight: statusFilter === tab.key ? 700 : 500, cursor: 'pointer', transition: 'all 0.15s', boxShadow: statusFilter === tab.key ? `0 0 0 1px ${ACCENT}50` : 'none', whiteSpace: 'nowrap' as const }}>
              {tab.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: 'var(--c-icon)', display: 'flex' }}><ArrowUpDown size={13} /></span>
          {sorts.map(s => (
            <button key={s.key} onClick={() => onSort(s.key)} style={{ padding: '5px 10px', borderRadius: 9999, border: 'none', background: sort === s.key ? 'var(--c-badge)' : 'transparent', color: sort === s.key ? 'var(--c-text)' : 'var(--c-text-muted)', fontFamily: "'Manrope', sans-serif", fontSize: '0.75rem', fontWeight: sort === s.key ? 700 : 500, cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap' as const }}>
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
