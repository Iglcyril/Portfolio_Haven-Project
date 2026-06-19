import { motion } from 'framer-motion'
import { Tag } from 'lucide-react'
import type { ProReport } from '../../../types'
import { SEVERITY_COLOR } from '../../../constants/severity'
import { formatShort } from '../../../utils/dateFormatting'
import { PRIMARY, severityKey } from './constants'
import { ProgressTracker } from './ProgressTracker'
import { SeverityBadge } from './SeverityBadge'

export function ReportCard({ report, selected, onClick, isArchived }: {
  report: ProReport
  selected: boolean
  onClick: () => void
  isArchived: boolean
}) {
  const color = SEVERITY_COLOR[severityKey(report)]
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      onClick={onClick}
      style={{
        background: selected ? 'var(--c-card-selected)' : 'var(--c-card)',
        border: `1.5px solid ${selected ? PRIMARY : 'var(--c-border)'}`,
        borderRadius: 14, padding: '14px 16px',
        cursor: 'pointer',
        transition: 'border-color 0.2s, background 0.2s',
        boxShadow: 'var(--c-card-shadow)',
        opacity: isArchived ? 0.65 : 1,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            <span style={{ fontSize: 11, color: 'var(--c-text-muted)', fontWeight: 600 }}>{report.caseNumber}</span>
            {report.studentClass && (
              <span style={{ fontSize: 11, color: 'var(--c-text-muted)' }}>· {report.studentClass}</span>
            )}
          </div>
          <p style={{
            margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--c-text)', lineHeight: 1.3,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {report.title}
          </p>
        </div>
        <SeverityBadge severity={report.severity} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11, color: 'var(--c-text-muted)' }}>
          <Tag size={10} style={{ marginRight: 3, verticalAlign: 'middle' }} />
          {report.category}
        </span>
        <span style={{ fontSize: 11, color: 'var(--c-text-muted)' }}>·</span>
        <span style={{ fontSize: 11, color: 'var(--c-text-muted)' }}>{formatShort(report.createdAt)}</span>
        {report.assignedTo ? (
          <>
            <span style={{ fontSize: 11, color: 'var(--c-text-muted)' }}>·</span>
            <span style={{ fontSize: 11, color: PRIMARY, fontWeight: 600 }}>{report.assignedTo}</span>
          </>
        ) : (
          <>
            <span style={{ fontSize: 11, color: 'var(--c-text-muted)' }}>·</span>
            <span style={{ fontSize: 11, color: '#E67E22', fontWeight: 600 }}>Non attribué</span>
          </>
        )}
      </div>

      <ProgressTracker stage={report.progressStage} color={color} />
    </motion.div>
  )
}
