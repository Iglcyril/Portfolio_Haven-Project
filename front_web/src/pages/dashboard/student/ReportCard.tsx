import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import type { Report } from '../../../types'
import { SEVERITY_META } from '../../../constants/severity'
import { formatDate } from '../../../utils/dateFormatting'
import { ACCENT, STATUS_META } from './constants'
import { ProgressTracker } from './ProgressTracker'
import { getStage } from './progressUtils'

export function ReportCard({ report, selected, onClick }: {
  report: Report
  selected: boolean
  onClick: () => void
}) {
  const sev   = SEVERITY_META[report.severity]
  const sta   = STATUS_META[report.status]
  const stage = getStage(report)

  return (
    <motion.button
      layout
      onClick={onClick}
      whileHover={{ scale: 1.005 }}
      whileTap={{ scale: 0.998 }}
      style={{
        width: '100%',
        textAlign: 'left',
        background: selected ? 'var(--c-card-selected)' : 'var(--c-card)',
        border: `1px solid ${selected ? `${ACCENT}40` : 'var(--c-border)'}`,
        borderRadius: 16,
        padding: '16px 18px',
        cursor: 'pointer',
        boxShadow: selected ? 'none' : 'var(--c-card-shadow)',
        transition: 'border-color 0.2s, background 0.2s, box-shadow 0.28s ease',
      }}
      onMouseEnter={e => { if (!selected) e.currentTarget.style.background = 'var(--c-card-hover)' }}
      onMouseLeave={e => { if (!selected) e.currentTarget.style.background = 'var(--c-card)' }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 10 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontFamily: "'Manrope', sans-serif",
            fontSize: '0.72rem',
            fontWeight: 700,
            color: ACCENT,
            letterSpacing: '0.06em',
            marginBottom: 3,
          }}>
            {report.caseNumber}
          </div>
          <div style={{
            fontFamily: "'Manrope', sans-serif",
            fontSize: '0.92rem',
            fontWeight: 700,
            color: 'var(--c-text)',
            whiteSpace: 'nowrap' as const,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {report.title}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5, flexShrink: 0 }}>
          <span style={{
            padding: '3px 9px',
            borderRadius: 9999,
            background: sev.bg,
            color: sev.color,
            fontFamily: "'Manrope', sans-serif",
            fontSize: '0.70rem',
            fontWeight: 700,
          }}>
            {sev.label}
          </span>
          <span style={{
            fontFamily: "'Manrope', sans-serif",
            fontSize: '0.70rem',
            fontWeight: 600,
            color: sta.color,
          }}>
            {sta.label}
          </span>
        </div>
      </div>

      {/* Category + date */}
      <div style={{
        fontFamily: "'Manrope', sans-serif",
        fontSize: '0.75rem',
        color: 'var(--c-text-sub)',
        marginBottom: 12,
      }}>
        {report.category} · Mis à jour le {formatDate(report.updatedAt)}
      </div>

      {/* 4-step tracker */}
      <ProgressTracker stage={stage} color={sev.color} />

      {/* Chevron */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
        <span style={{ color: selected ? ACCENT : 'var(--c-icon)', display: 'flex' }}>
          <ChevronRight size={14} />
        </span>
      </div>
    </motion.button>
  )
}
