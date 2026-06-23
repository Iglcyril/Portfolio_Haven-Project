import { motion } from 'framer-motion'
import { X, User, Shield, Archive } from 'lucide-react'
import type { ParentReport, Child } from '../../../types'
import { SEVERITY_META } from '../../../constants/severity'
import { formatDate } from '../../../utils/dateFormatting'
import { useIsMobile } from '../../../hooks/useMediaQuery'
import { EVENT_COLORS } from '../../../services/professionalData'
import { ACCENT, STATUS_META } from './constants'
import { ProgressTracker } from './ProgressTracker'
import { getStage } from './progressUtils'

export function DetailPanel({ report, child, onClose, onArchive }: {
  report: ParentReport
  child?: Child
  onClose: () => void
  onArchive: () => void
}) {
  const sev      = SEVERITY_META[report.severity]
  const sta      = STATUS_META[report.status]
  const stage    = getStage(report)
  const isMobile = useIsMobile()

  const panelStyle: React.CSSProperties = isMobile
    ? { position: 'fixed', inset: 0, top: 56, background: 'var(--c-panel)', zIndex: 60, overflowY: 'auto', padding: 20, transition: 'background 0.28s' }
    : { width: 360, flexShrink: 0, background: 'var(--c-panel)', borderLeft: '1px solid var(--c-border)', overflowY: 'auto', padding: '28px 24px', transition: 'background 0.28s, border-color 0.28s' }

  return (
    <motion.div
      initial={isMobile ? { y: '100%' } : { x: 360 }}
      animate={isMobile ? { y: 0 } : { x: 0 }}
      exit={isMobile ? { y: '100%' } : { x: 360 }}
      transition={{ type: 'spring', stiffness: 320, damping: 36 }}
      style={panelStyle}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: '0.72rem', fontWeight: 700, color: ACCENT, letterSpacing: '0.06em', marginBottom: 4 }}>
            {report.caseNumber}
          </div>
          <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '1.15rem', fontWeight: 700, color: 'var(--c-text)', margin: 0, lineHeight: 1.3 }}>
            {report.title}
          </h2>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'var(--c-badge)', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--c-icon)', flexShrink: 0, marginLeft: 12 }}
        >
          <X size={15} />
        </button>
      </div>

      {/* Child info */}
      {child && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 12, background: 'var(--c-card)', border: '1px solid var(--c-border)', marginBottom: 16, transition: 'background 0.28s, border-color 0.28s' }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Manrope', sans-serif", fontSize: '0.75rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
            {child.avatarInitials}
          </div>
          <div>
            <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: '0.82rem', fontWeight: 700, color: 'var(--c-text)' }}>{child.fullName}</div>
            <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: '0.70rem', color: 'var(--c-text-muted)' }}>{child.className}</div>
          </div>
        </div>
      )}

      {/* Badges */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const, marginBottom: 18 }}>
        <span style={{ padding: '4px 10px', borderRadius: 9999, background: sev.bg, color: sev.color, fontFamily: "'Manrope', sans-serif", fontSize: '0.72rem', fontWeight: 700 }}>
          Gravité : {sev.label}
        </span>
        <span style={{ padding: '4px 10px', borderRadius: 9999, background: 'var(--c-badge)', color: sta.color, fontFamily: "'Manrope', sans-serif", fontSize: '0.72rem', fontWeight: 700 }}>
          {sta.label}
        </span>
        <span style={{ padding: '4px 10px', borderRadius: 9999, background: 'var(--c-badge)', color: 'var(--c-text-sub)', fontFamily: "'Manrope', sans-serif", fontSize: '0.72rem', fontWeight: 600 }}>
          {report.category}
        </span>
      </div>

      {/* Progress tracker */}
      <div style={{ marginBottom: 20, padding: '14px 14px', borderRadius: 12, background: 'var(--c-card)', border: '1px solid var(--c-border)', transition: 'background 0.28s, border-color 0.28s' }}>
        <ProgressTracker stage={stage} color={sev.color} />
      </div>

      {/* Referent */}
      {report.referentName && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 12, background: 'var(--c-card)', border: '1px solid var(--c-border)', marginBottom: 18, transition: 'background 0.28s, border-color 0.28s' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${ACCENT}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <User size={14} color={ACCENT} />
          </div>
          <div>
            <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: '0.70rem', color: 'var(--c-text-muted)', marginBottom: 1 }}>Référent assigné</div>
            <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: '0.82rem', fontWeight: 700, color: 'var(--c-text)' }}>{report.referentName}</div>
          </div>
        </div>
      )}

      {/* Description */}
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: '0.70rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: 'var(--c-text-muted)', marginBottom: 8 }}>
          Description
        </div>
        <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: '0.83rem', color: 'var(--c-text-sub)', lineHeight: 1.6, margin: 0 }}>
          {report.description}
        </p>
      </div>

      {/* Anonymity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 12, background: 'var(--c-card)', border: '1px solid var(--c-border)', marginBottom: 22, transition: 'background 0.28s, border-color 0.28s' }}>
        <Shield size={14} color={ACCENT} />
        <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: '0.78rem', color: 'var(--c-text-sub)' }}>
          Niveau d'anonymat :{' '}
          <strong style={{ color: 'var(--c-text)' }}>
            {report.anonymityLevel === 'anonymous' ? 'Anonyme' : report.anonymityLevel === 'semi' ? 'Semi-anonyme' : 'Visible'}
          </strong>
        </span>
      </div>

      {/* Archive action */}
      {report.status === 'resolved' && (
        <button
          onClick={onArchive}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '10px 14px',
            borderRadius: 12,
            border: '1px solid var(--c-border)',
            background: 'var(--c-badge)',
            color: 'var(--c-text-muted)',
            fontFamily: "'Manrope', sans-serif",
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: 'pointer',
            marginBottom: 22,
            transition: 'background 0.2s, border-color 0.2s, color 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(140,160,155,0.12)'
            e.currentTarget.style.borderColor = 'rgba(140,160,155,0.5)'
            e.currentTarget.style.color = 'var(--c-text-sub)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'var(--c-badge)'
            e.currentTarget.style.borderColor = 'var(--c-border)'
            e.currentTarget.style.color = 'var(--c-text-muted)'
          }}
        >
          <Archive size={14} />
          Archiver ce signalement
        </button>
      )}

      {/* Timeline */}
      <div>
        <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: '0.70rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: 'var(--c-text-muted)', marginBottom: 16 }}>
          Historique
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {[...report.timeline].reverse().map((entry, i, arr) => (
            <div key={entry.id} style={{ display: 'flex', gap: 14 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 20, flexShrink: 0 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: i === 0 ? ACCENT : 'transparent', border: `2px solid ${i === 0 ? ACCENT : 'var(--c-border)'}`, flexShrink: 0, marginTop: 2 }} />
                {i < arr.length - 1 && <div style={{ width: 1, flex: 1, background: 'var(--c-divider)', marginTop: 4 }} />}
              </div>
              <div style={{ paddingBottom: i < arr.length - 1 ? 20 : 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 3 }}>
                  <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: '0.82rem', fontWeight: 700, color: i === 0 ? 'var(--c-text)' : 'var(--c-text-sub)' }}>{entry.label}</span>
                  <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: '0.68rem', color: 'var(--c-text-muted)' }}>{formatDate(entry.date)}</span>
                </div>
                <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: '0.80rem', color: 'var(--c-text-sub)', margin: 0, lineHeight: 1.5 }}>{entry.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Staff events */}
      {report.events.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: '0.70rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: 'var(--c-text-muted)', marginBottom: 16 }}>
            Actions de suivi
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[...report.events]
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map((ev, i, arr) => (
                <div key={ev.id} style={{ display: 'flex', gap: 14 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 20, flexShrink: 0 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: i === 0 ? ACCENT : 'transparent', border: `2px solid ${i === 0 ? ACCENT : 'var(--c-border)'}`, flexShrink: 0, marginTop: 2 }} />
                    {i < arr.length - 1 && <div style={{ width: 1, flex: 1, background: 'var(--c-divider)', marginTop: 4 }} />}
                  </div>
                  <div style={{ paddingBottom: i < arr.length - 1 ? 20 : 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' as const, marginBottom: 2 }}>
                      <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: '0.67rem', fontWeight: 700, borderRadius: 5, padding: '1px 7px', color: EVENT_COLORS[ev.type] ?? ACCENT, background: `${EVENT_COLORS[ev.type] ?? ACCENT}20` }}>
                        {ev.type}
                      </span>
                      <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: '0.68rem', color: 'var(--c-text-muted)' }}>{formatDate(ev.createdAt)}</span>
                    </div>
                    {ev.comment && <p style={{ fontFamily: "'Manrope', sans-serif", margin: '2px 0', fontSize: '0.80rem', color: 'var(--c-text-sub)', lineHeight: 1.5 }}>{ev.comment}</p>}
                    <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: '0.70rem', color: 'var(--c-text-muted)', marginTop: 1 }}>— {ev.actor}</div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}
