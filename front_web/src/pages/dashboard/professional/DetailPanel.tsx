import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, UserCheck, ChevronDown, ChevronRight, Send, Calendar, Archive } from 'lucide-react'
import type { ProReport, TeamMember, ReportEvent, Severity } from '../../../types'
import { SEVERITY_COLOR } from '../../../constants/severity'
import { formatDate } from '../../../utils/dateFormatting'
import { useIsMobile } from '../../../hooks/useMediaQuery'
import { EVENT_TYPES, EVENT_COLORS } from '../../../services/professionalData'
import { useAuth } from '../../../contexts/AuthContext'
import { PRIMARY, STAGES, severityKey } from './constants'
import { ProgressTracker } from './ProgressTracker'
import { SeverityBadge } from './SeverityBadge'
import { SeverityPicker } from './SeverityPicker'

const dropItemStyle: React.CSSProperties = {
  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
  padding: '10px 14px', background: 'transparent', border: 'none',
  cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
  transition: 'background 0.15s',
}

export function DetailPanel({
  report, isDirector, team, onClose, onAssign, onSetSeverity, onAdvanceStage, onAddEvent, onArchive,
}: {
  report: ProReport
  isDirector: boolean
  team: TeamMember[]
  onClose: () => void
  onAssign: (id: string, memberId: string | undefined, name: string | undefined) => void
  onSetSeverity: (id: string, severity: Severity) => void
  onAdvanceStage: (id: string) => void
  onAddEvent: (id: string, event: Omit<ReportEvent, 'id'>) => void
  onArchive: (id: string) => void
}) {
  const isMobile = useIsMobile()
  const { user: authUser } = useAuth()
  const actorName = authUser
    ? ([authUser.firstName, authUser.lastName].filter(Boolean).join(' ') || authUser.email)
    : 'Référent'

  const [eventType, setEventType]       = useState(EVENT_TYPES[0])
  const [eventComment, setEventComment] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)

  const canAdvance = report.progressStage < 3
  const color = SEVERITY_COLOR[severityKey(report)]

  const panelStyle: React.CSSProperties = isMobile ? {
    position: 'fixed', top: 56, bottom: 0, left: 0, right: 0,
    zIndex: 40, overflowY: 'auto',
    background: 'var(--c-panel)',
    borderTop: '1px solid var(--c-border)',
    padding: '20px 16px 100px',
  } : {
    width: 360, flexShrink: 0, overflowY: 'auto',
    borderLeft: '1px solid var(--c-border)',
    background: 'var(--c-panel)',
    padding: '24px 20px',
  }

  type TimelineItem =
    | { kind: 'system'; id: string; date: string; label: string; description: string }
    | { kind: 'event';  id: string; date: string; type: string; comment?: string; actor: string }

  const items: TimelineItem[] = [
    ...report.timeline.map(e => ({ kind: 'system' as const, id: e.id, date: e.date, label: e.label, description: e.description })),
    ...report.events.map(e  => ({ kind: 'event'  as const, id: e.id, date: e.createdAt, type: e.type, comment: e.comment, actor: e.actor })),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return (
    <motion.div
      initial={{ opacity: 0, x: isMobile ? 0 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: isMobile ? 0 : 20 }}
      transition={{ type: 'spring', stiffness: 340, damping: 34 }}
      style={panelStyle}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <span style={{ fontSize: 11, color: 'var(--c-text-muted)', fontWeight: 600 }}>{report.caseNumber}</span>
          <h2 style={{ margin: '4px 0 0', fontSize: 15, fontWeight: 700, color: 'var(--c-text)', lineHeight: 1.3 }}>
            {report.title}
          </h2>
        </div>
        <button onClick={onClose} style={{
          background: 'var(--c-badge)', border: 'none', borderRadius: 8,
          padding: 6, cursor: 'pointer', color: 'var(--c-text-sub)', flexShrink: 0, display: 'flex',
        }}>
          <X size={16} />
        </button>
      </div>

      {/* Meta */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
        <SeverityBadge severity={report.severity} />
        <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--c-text-muted)', background: 'var(--c-badge)', borderRadius: 6, padding: '2px 7px' }}>
          {report.anonLevel}
        </span>
        {report.studentClass && (
          <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--c-text-muted)', background: 'var(--c-badge)', borderRadius: 6, padding: '2px 7px' }}>
            {report.studentClass}
          </span>
        )}
      </div>

      {/* Description */}
      <p style={{ fontSize: 13, color: 'var(--c-text-sub)', lineHeight: 1.6, margin: '0 0 20px' }}>
        {report.description}
      </p>

      {/* Dates */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 10, color: 'var(--c-text-muted)', fontWeight: 600, marginBottom: 2 }}>Déposé le</div>
          <div style={{ fontSize: 13, color: 'var(--c-text)', fontWeight: 600 }}>
            <Calendar size={11} style={{ marginRight: 4, verticalAlign: 'middle' }} />
            {formatDate(report.createdAt)}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: 'var(--c-text-muted)', fontWeight: 600, marginBottom: 2 }}>Mis à jour</div>
          <div style={{ fontSize: 13, color: 'var(--c-text)', fontWeight: 600 }}>{formatDate(report.updatedAt)}</div>
        </div>
      </div>

      {/* Progress */}
      <div style={{ background: 'var(--c-card)', borderRadius: 12, padding: '14px 16px', marginBottom: 20, border: '1px solid var(--c-border)' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--c-text-muted)', marginBottom: 12, letterSpacing: '0.06em' }}>
          AVANCEMENT
        </div>
        <ProgressTracker stage={report.progressStage} color={color} />
      </div>

      {/* Director: set severity */}
      {isDirector && !report.severity && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--c-text-muted)', marginBottom: 8, letterSpacing: '0.06em' }}>
            NIVEAU DE GRAVITÉ
          </div>
          <SeverityPicker value={report.severity} onChange={s => onSetSeverity(report.id, s)} />
        </div>
      )}

      {/* Director: assign referent */}
      {isDirector && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--c-text-muted)', marginBottom: 8, letterSpacing: '0.06em' }}>
            RÉFÉRENT ASSIGNÉ
          </div>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowDropdown(v => !v)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px', borderRadius: 10,
                background: 'var(--c-input-bg)', border: '1.5px solid var(--c-input-border)',
                color: report.assignedTo ? 'var(--c-text)' : 'var(--c-text-muted)',
                fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <UserCheck size={14} style={{ color: PRIMARY }} />
                {report.assignedTo ?? 'Assigner à un référent…'}
              </span>
              <ChevronDown size={14} />
            </button>

            <AnimatePresence>
              {showDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                  style={{
                    position: 'absolute', top: '110%', left: 0, right: 0, zIndex: 10,
                    background: 'var(--c-panel)', border: '1px solid var(--c-border)',
                    borderRadius: 10, overflow: 'hidden',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                  }}
                >
                  <button
                    onClick={() => { onAssign(report.id, undefined, undefined); setShowDropdown(false) }}
                    style={dropItemStyle}
                  >
                    <span style={{ color: '#E67E22', fontStyle: 'italic' }}>Retirer l'attribution</span>
                  </button>
                  {team.map(m => (
                    <button
                      key={m.id}
                      onClick={() => { onAssign(report.id, m.id, m.fullName); setShowDropdown(false) }}
                      style={{ ...dropItemStyle, background: report.assignedTo === m.fullName ? `${PRIMARY}15` : 'transparent' }}
                    >
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%', background: PRIMARY,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontSize: 11, fontWeight: 700, flexShrink: 0,
                      }}>
                        {m.avatarInitials}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-text)' }}>{m.fullName}</div>
                        <div style={{ fontSize: 11, color: 'var(--c-text-muted)' }}>{m.roleLabel} · {m.activeCount} actifs</div>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Referent: advance stage */}
      {!isDirector && report.status === 'active' && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--c-text-muted)', marginBottom: 8, letterSpacing: '0.06em' }}>
            AVANCER LE DOSSIER
          </div>
          <button
            onClick={() => onAdvanceStage(report.id)}
            disabled={!canAdvance}
            style={{
              width: '100%', padding: '11px', borderRadius: 10,
              background: canAdvance ? PRIMARY : 'var(--c-badge)',
              color: canAdvance ? '#fff' : 'var(--c-text-muted)',
              border: 'none', fontSize: 14, fontWeight: 700,
              cursor: canAdvance ? 'pointer' : 'not-allowed',
              fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'background 0.2s',
            }}
          >
            {canAdvance ? (
              <> Passer à : <strong>{STAGES[report.progressStage + 1]}</strong> <ChevronRight size={16} /> </>
            ) : (
              'Dossier résolu'
            )}
          </button>
        </div>
      )}

      {/* Archive action */}
      {report.status === 'resolved' && (
        <div style={{ marginBottom: 20 }}>
          <button
            onClick={() => onArchive(report.id)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '10px 14px',
              borderRadius: 10,
              border: '1px solid var(--c-border)',
              background: 'var(--c-badge)',
              color: 'var(--c-text-muted)',
              fontFamily: 'inherit',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
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
            Archiver ce dossier
          </button>
        </div>
      )}

      {/* Unified timeline */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--c-text-muted)', marginBottom: 12, letterSpacing: '0.06em' }}>
          CHRONOLOGIE
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <AnimatePresence initial={false}>
            {items.map((item, i) => {
              const isLast    = i === items.length - 1
              const dotColor  = item.kind === 'event' ? (EVENT_COLORS[item.type] ?? PRIMARY) : color
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ display: 'flex', gap: 12 }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: dotColor,
                      marginTop: 4, flexShrink: 0,
                      boxShadow: item.kind === 'event' ? `0 0 0 2px ${dotColor}30` : 'none',
                    }} />
                    {!isLast && (
                      <div style={{ width: 1, flex: 1, background: 'var(--c-border)', margin: '3px 0', minHeight: 14 }} />
                    )}
                  </div>
                  <div style={{ paddingBottom: 16, flex: 1, minWidth: 0 }}>
                    {item.kind === 'system' ? (
                      <>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--c-text)' }}>{item.label}</div>
                        <div style={{ fontSize: 11, color: 'var(--c-text-muted)', margin: '1px 0 2px' }}>{formatDate(item.date)}</div>
                        <div style={{ fontSize: 12, color: 'var(--c-text-sub)' }}>{item.description}</div>
                      </>
                    ) : (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                          <span style={{
                            fontSize: 10, fontWeight: 700, borderRadius: 5, padding: '1px 7px',
                            color: EVENT_COLORS[item.type] ?? PRIMARY,
                            background: `${EVENT_COLORS[item.type] ?? PRIMARY}20`,
                          }}>
                            {item.type}
                          </span>
                          <span style={{ fontSize: 11, color: 'var(--c-text-muted)' }}>{formatDate(item.date)}</span>
                        </div>
                        {item.comment && (
                          <p style={{ margin: '4px 0 2px', fontSize: 12, color: 'var(--c-text-sub)', lineHeight: 1.5 }}>
                            {item.comment}
                          </p>
                        )}
                        <div style={{ fontSize: 11, color: 'var(--c-text-muted)', marginTop: 1 }}>— {item.actor}</div>
                      </>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Referent: add event */}
      {!isDirector && report.status === 'active' && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--c-text-muted)', marginBottom: 10, letterSpacing: '0.06em' }}>
            AJOUTER UNE ACTION
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <select
              value={eventType}
              onChange={e => setEventType(e.target.value)}
              style={{
                background: 'var(--c-input-bg)', border: '1.5px solid var(--c-input-border)',
                borderRadius: 10, padding: '10px 14px', color: 'var(--c-text)',
                fontSize: 13, fontFamily: 'inherit', outline: 'none', cursor: 'pointer',
              }}
            >
              {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <textarea
              placeholder="Commentaire (optionnel)…"
              value={eventComment}
              onChange={e => setEventComment(e.target.value)}
              rows={3}
              style={{
                background: 'var(--c-input-bg)', border: '1.5px solid var(--c-input-border)',
                borderRadius: 10, padding: '10px 14px', color: 'var(--c-text)',
                fontSize: 13, fontFamily: 'inherit', resize: 'vertical', outline: 'none',
              }}
            />
            <button
              onClick={() => {
                onAddEvent(report.id, {
                  type: eventType,
                  comment: eventComment.trim() || undefined,
                  createdAt: new Date().toISOString(),
                  actor: actorName,
                })
                setEventComment('')
              }}
              style={{
                padding: '11px', borderRadius: 10, background: PRIMARY, color: '#fff',
                border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              <Send size={15} />
              Enregistrer l'action
            </button>
          </div>
        </div>
      )}
    </motion.div>
  )
}
