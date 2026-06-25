import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  page:         number
  totalPages:   number
  total:        number
  onPageChange: (page: number) => void
}

export function Pagination({ page, totalPages, total, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  const btnBase: React.CSSProperties = {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    width:          32,
    height:         32,
    borderRadius:   8,
    border:         '1px solid var(--c-border)',
    background:     'transparent',
    cursor:         'pointer',
    fontFamily:     "'Manrope', sans-serif",
    fontSize:       '0.82rem',
    fontWeight:     500,
    color:          'var(--c-text-sub)',
    transition:     'background 0.15s, color 0.15s, border-color 0.15s',
  }

  return (
    <div style={{
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      gap:            6,
      paddingTop:     20,
      paddingBottom:  8,
    }}>
      {/* Prev */}
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        style={{ ...btnBase, opacity: page <= 1 ? 0.3 : 1, cursor: page <= 1 ? 'not-allowed' : 'pointer' }}
        onMouseEnter={e => { if (page > 1) { e.currentTarget.style.background = 'var(--c-card-hover)'; e.currentTarget.style.color = 'var(--c-text)' } }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--c-text-sub)' }}
      >
        <ChevronLeft size={14} />
      </button>

      {/* Page numbers */}
      {pages.map(p => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          style={{
            ...btnBase,
            background:   p === page ? 'var(--c-card-selected)' : 'transparent',
            color:        p === page ? 'var(--c-text)' : 'var(--c-text-sub)',
            fontWeight:   p === page ? 700 : 500,
            borderColor:  p === page ? 'transparent' : 'var(--c-border)',
          }}
          onMouseEnter={e => { if (p !== page) { e.currentTarget.style.background = 'var(--c-card-hover)'; e.currentTarget.style.color = 'var(--c-text)' } }}
          onMouseLeave={e => { if (p !== page) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--c-text-sub)' } }}
        >
          {p}
        </button>
      ))}

      {/* Next */}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        style={{ ...btnBase, opacity: page >= totalPages ? 0.3 : 1, cursor: page >= totalPages ? 'not-allowed' : 'pointer' }}
        onMouseEnter={e => { if (page < totalPages) { e.currentTarget.style.background = 'var(--c-card-hover)'; e.currentTarget.style.color = 'var(--c-text)' } }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--c-text-sub)' } }
      >
        <ChevronRight size={14} />
      </button>

      <span style={{
        marginLeft:  8,
        color:       'var(--c-text-muted)',
        fontFamily:  "'Manrope', sans-serif",
        fontSize:    '0.75rem',
      }}>
        {total} signalement{total > 1 ? 's' : ''}
      </span>
    </div>
  )
}
