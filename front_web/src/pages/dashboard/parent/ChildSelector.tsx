import { FileText } from 'lucide-react'
import type { Child } from '../../../types'
import { ACCENT } from './constants'

export function ChildSelector({
  children,
  selectedId,
  onSelect,
  reportCounts,
}: {
  children: Child[]
  selectedId: string | null
  onSelect: (id: string | null) => void
  reportCounts: Record<string, number>
}) {
  return (
    <div>
      <div style={{
        fontFamily: "'Manrope', sans-serif",
        fontSize: '0.66rem',
        fontWeight: 700,
        letterSpacing: '0.10em',
        textTransform: 'uppercase' as const,
        color: 'rgba(255,255,255,0.28)',
        padding: '0 12px',
        marginBottom: 6,
      }}>
        Enfants
      </div>

      <button
        onClick={() => onSelect(null)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          borderRadius: 10,
          border: 'none',
          background: !selectedId ? `${ACCENT}20` : 'transparent',
          cursor: 'pointer',
          marginBottom: 2,
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => { if (selectedId) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
        onMouseLeave={e => { if (selectedId) e.currentTarget.style.background = 'transparent' }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: !selectedId ? ACCENT : 'rgba(255,255,255,0.40)', display: 'flex' }}>
            <FileText size={14} />
          </span>
          <span style={{
            fontFamily: "'Manrope', sans-serif",
            fontSize: '0.85rem',
            fontWeight: !selectedId ? 700 : 500,
            color: !selectedId ? '#fff' : 'rgba(255,255,255,0.55)',
          }}>
            Tous les enfants
          </span>
        </span>
      </button>

      {children.map(child => {
        const isSelected = selectedId === child.id
        const count = reportCounts[child.id] ?? 0
        return (
          <button
            key={child.id}
            onClick={() => onSelect(child.id)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              borderRadius: 10,
              border: 'none',
              background: isSelected ? `${ACCENT}20` : 'transparent',
              cursor: 'pointer',
              marginBottom: 2,
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
            onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
              <div style={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                background: isSelected ? ACCENT : 'rgba(255,255,255,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: "'Manrope', sans-serif",
                fontSize: '0.62rem',
                fontWeight: 700,
                color: '#fff',
                flexShrink: 0,
                transition: 'background 0.15s',
              }}>
                {child.avatarInitials}
              </div>
              <div style={{ minWidth: 0, textAlign: 'left' as const }}>
                <div style={{
                  fontFamily: "'Manrope', sans-serif",
                  fontSize: '0.84rem',
                  fontWeight: isSelected ? 700 : 500,
                  color: isSelected ? '#fff' : 'rgba(255,255,255,0.55)',
                  whiteSpace: 'nowrap' as const,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {child.firstName} {child.lastName}
                </div>
                <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: '0.68rem', color: 'rgba(255,255,255,0.30)' }}>
                  {child.className}
                </div>
              </div>
            </div>
            {count > 0 && (
              <span style={{
                minWidth: 18,
                height: 18,
                borderRadius: 9999,
                background: isSelected ? ACCENT : 'rgba(255,255,255,0.10)',
                color: isSelected ? '#fff' : 'rgba(255,255,255,0.45)',
                fontFamily: "'Manrope', sans-serif",
                fontSize: '0.67rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 4px',
                flexShrink: 0,
              }}>
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
