import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import type { ParentReport, Child } from '../../../types'
import { SEVERITY_META } from '../../../constants/severity'
import { formatDate } from '../../../utils/dateFormatting'
import { ACCENT, STATUS_META } from './constants'
import { ProgressTracker, getStage } from './ProgressTracker'

export function ReportCard({ report, child, selected, onClick }: {
  report: ParentReport
  child?: Child
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
        transition: 'border-color 0.2s, background 0.2s, box-shadow 0.28s',
      }}
      onMouseEnter={e => { if (!selected) e.currentTarget.style.background = 'var(--c-card-hover)' }}
      onMouseLeave={e => { if (!selected) e.currentTarget.style.background = 'var(--c-card)' }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
        {child && (
          <div style={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            background: ACCENT,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Manrope', sans-serif",
            fontSize: '0.75rem',
            fontWeight: 700,
            color: '#fff',
            flexShrink: 0,
          }}>
            {child.avatarInitials}
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          {child && (
            <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: '0.72rem', fontWeight: 700, color: 'var(--c-text-muted)', marginBottom: 2 }}>
              {child.fullName} · {child.className}
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: '0.72rem', fontWeight: 700, color: ACCENT, letterSpacing: '0.05em' }}>
              {report.caseNumber}
            </span>
            <span style={{
              padding: '2px 8px',
              borderRadius: 9999,
              background: sev.bg,
              color: sev.color,
              fontFamily: "'Manrope', sans-serif",
              fontSize: '0.66rem',
              fontWeight: 700,
            }}>
              {sev.label}
            </span>
            <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: '0.70rem', fontWeight: 600, color: sta.color }}>
              {sta.label}
            </span>
          </div>
          <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: '0.90rem', fontWeight: 700, color: 'var(--c-text)', whiteSpace: 'nowrap' as const, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {report.title}
          </div>
        </div>
        <span style={{ color: selected ? ACCENT : 'var(--c-icon)', display: 'flex', flexShrink: 0 }}>
          <ChevronRight size={14} />
        </span>
      </div>

      {/* Category + date */}
      <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: '0.75rem', color: 'var(--c-text-sub)', marginBottom: 12 }}>
        {report.category} · Mis à jour le {formatDate(report.updatedAt)}
      </div>

      {/* 4-step tracker */}
      <ProgressTracker stage={stage} color={sev.color} />
    </motion.button>
  )
}
