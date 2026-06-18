import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, Clock, AlertCircle, CheckCircle, Archive, BarChart2,
  X, ChevronDown, Phone, UserCheck, Send, ChevronRight,
  Calendar, Tag, UserPlus, Trash2,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'
import DashboardLayout from '../../layouts/DashboardLayout'
import {
  MOCK_DIRECTOR, MOCK_REFERENT, MOCK_TEAM, MOCK_PRO_REPORTS, MOCK_STATS,
  EVENT_TYPES, EVENT_COLORS, ROLE_LABELS,
} from '../../services/professionalData'
import type { ProReport, TeamMember, ReportEvent, ProfessionalRole, Severity } from '../../types'
import { useIsMobile } from '../../hooks/useMediaQuery'

// ─── Constants ────────────────────────────────────────────────────────────────

const PRIMARY  = '#2EAB7B'
const STAGES   = ['DÉPOSÉ', 'EXAMINÉ', 'EN COURS', 'RÉSOLU']

type SortKey      = 'severity' | 'date' | 'stage' | 'referent'
type StatusFilter = 'active' | 'unassigned' | 'resolved' | 'archived'

const SEVERITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2, none: 3 }
const SEVERITY_COLOR: Record<string, string>  = {
  high: '#C0392B', medium: '#E67E22', low: '#2EAB7B', none: 'rgba(140,160,155,0.8)',
}
const SEVERITY_LABEL: Record<string, string>  = {
  high: 'Élevé', medium: 'Moyen', low: 'Faible', none: 'À classer',
}

const ROLE_OPTIONS: { key: ProfessionalRole; label: string }[] = [
  { key: 'cpe',         label: 'CPE' },
  { key: 'teacher',     label: 'Professeur·e' },
  { key: 'nurse',       label: 'Infirmier·ère' },
  { key: 'aed',         label: 'AED' },
  { key: 'socialWorker', label: 'Assistant·e Social·e' },
  { key: 'other',       label: 'Autre' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}
function formatShort(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}
function severityKey(r: ProReport) { return r.severity ?? 'none' }

// ─── Progress tracker (color driven by severity) ──────────────────────────────

function ProgressTracker({ stage, color }: { stage: number; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0 }}>
      {STAGES.map((label, i) => {
        const done    = i < stage
        const current = i === stage
        const fill    = done || current ? color : 'var(--c-progress-track)'
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', flex: i < STAGES.length - 1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{
                width: 10, height: 10, borderRadius: '50%',
                background: fill,
                border: `2px solid ${fill}`,
                transition: 'background 0.3s',
                flexShrink: 0,
              }} />
              <span style={{
                fontSize: 9, fontWeight: current ? 700 : 500,
                color: done || current ? color : 'var(--c-text-muted)',
                whiteSpace: 'nowrap', transition: 'color 0.3s',
              }}>
                {label}
              </span>
            </div>
            {i < STAGES.length - 1 && (
              <div style={{
                height: 2, flex: 1, marginTop: 4,
                background: done ? color : 'var(--c-progress-track)',
                transition: 'background 0.3s',
              }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Severity badge ───────────────────────────────────────────────────────────

function SeverityBadge({ severity }: { severity?: Severity }) {
  const key = severity ?? 'none'
  return (
    <span style={{
      fontSize: 10, fontWeight: 700,
      color: SEVERITY_COLOR[key],
      background: `${SEVERITY_COLOR[key]}22`,
      borderRadius: 6, padding: '2px 7px',
      letterSpacing: '0.04em',
      border: key === 'none' ? `1px dashed ${SEVERITY_COLOR[key]}` : 'none',
    }}>
      {SEVERITY_LABEL[key]}
    </span>
  )
}

// ─── Severity picker (director) ───────────────────────────────────────────────

function SeverityPicker({
  value, onChange,
}: { value?: Severity; onChange: (s: Severity) => void }) {
  const levels: { key: Severity; label: string }[] = [
    { key: 'high',   label: 'Élevé' },
    { key: 'medium', label: 'Moyen' },
    { key: 'low',    label: 'Faible' },
  ]
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {levels.map(l => {
        const active = value === l.key
        return (
          <button
            key={l.key}
            onClick={() => onChange(l.key)}
            style={{
              flex: 1, padding: '8px 0', borderRadius: 8, border: 'none',
              background: active ? `${SEVERITY_COLOR[l.key]}25` : 'var(--c-input-bg)',
              color: active ? SEVERITY_COLOR[l.key] : 'var(--c-text-muted)',
              fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              outline: active ? `1.5px solid ${SEVERITY_COLOR[l.key]}` : '1px solid var(--c-input-border)',
              transition: 'all 0.15s',
            }}
          >
            {l.label}
          </button>
        )
      })}
    </div>
  )
}

// ─── Report card ──────────────────────────────────────────────────────────────

function ReportCard({
  report, selected, onClick, isArchived,
}: { report: ProReport; selected: boolean; onClick: () => void; isArchived: boolean }) {
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

// ─── Sort bar ─────────────────────────────────────────────────────────────────

function SortBar({ sort, setSort }: { sort: SortKey; setSort: (k: SortKey) => void }) {
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

// ─── Detail panel ─────────────────────────────────────────────────────────────

function DetailPanel({
  report, isDirector, team, onClose, onAssign, onSetSeverity, onAdvanceStage, onAddEvent,
}: {
  report: ProReport
  isDirector: boolean
  team: TeamMember[]
  onClose: () => void
  onAssign: (id: string, name: string | undefined) => void
  onSetSeverity: (id: string, severity: Severity) => void
  onAdvanceStage: (id: string) => void
  onAddEvent: (id: string, event: Omit<ReportEvent, 'id'>) => void
}) {
  const isMobile = useIsMobile()
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
        <span style={{
          fontSize: 10, fontWeight: 600, color: 'var(--c-text-muted)',
          background: 'var(--c-badge)', borderRadius: 6, padding: '2px 7px',
        }}>
          {report.anonLevel}
        </span>
        {report.studentClass && (
          <span style={{
            fontSize: 10, fontWeight: 600, color: 'var(--c-text-muted)',
            background: 'var(--c-badge)', borderRadius: 6, padding: '2px 7px',
          }}>
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
      <div style={{
        background: 'var(--c-card)', borderRadius: 12, padding: '14px 16px', marginBottom: 20,
        border: '1px solid var(--c-border)',
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--c-text-muted)', marginBottom: 12, letterSpacing: '0.06em' }}>
          AVANCEMENT
        </div>
        <ProgressTracker stage={report.progressStage} color={color} />
      </div>

      {/* ── Director: set severity (only if not yet classified) ── */}
      {isDirector && !report.severity && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--c-text-muted)', marginBottom: 8, letterSpacing: '0.06em' }}>
            NIVEAU DE GRAVITÉ
          </div>
          <SeverityPicker
            value={report.severity}
            onChange={s => onSetSeverity(report.id, s)}
          />
        </div>
      )}

      {/* ── Director: assign referent ── */}
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
                    onClick={() => { onAssign(report.id, undefined); setShowDropdown(false) }}
                    style={dropItemStyle}
                  >
                    <span style={{ color: '#E67E22', fontStyle: 'italic' }}>Retirer l'attribution</span>
                  </button>
                  {team.map(m => (
                    <button
                      key={m.id}
                      onClick={() => { onAssign(report.id, m.fullName); setShowDropdown(false) }}
                      style={{
                        ...dropItemStyle,
                        background: report.assignedTo === m.fullName ? `${PRIMARY}15` : 'transparent',
                      }}
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

      {/* ── Referent: advance stage ── */}
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

      {/* Unified timeline: system entries + referent events merged by date */}
      {(() => {
        type TimelineItem =
          | { kind: 'system'; id: string; date: string; label: string; description: string }
          | { kind: 'event';  id: string; date: string; type: string; comment?: string; actor: string }

        const items: TimelineItem[] = [
          ...report.timeline.map(e => ({ kind: 'system' as const, id: e.id, date: e.date, label: e.label, description: e.description })),
          ...report.events.map(e  => ({ kind: 'event'  as const, id: e.id, date: e.createdAt, type: e.type, comment: e.comment, actor: e.actor })),
        ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

        return (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--c-text-muted)', marginBottom: 12, letterSpacing: '0.06em' }}>
              CHRONOLOGIE
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <AnimatePresence initial={false}>
                {items.map((item, i) => {
                  const isLast = i === items.length - 1
                  const dotColor = item.kind === 'event' ? (EVENT_COLORS[item.type] ?? PRIMARY) : color
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ display: 'flex', gap: 12 }}
                    >
                      {/* Spine */}
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

                      {/* Content */}
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
        )
      })()}

      {/* ── Referent: add event ── */}
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
                  actor: MOCK_REFERENT.fullName,
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

const dropItemStyle: React.CSSProperties = {
  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
  padding: '10px 14px', background: 'transparent', border: 'none',
  cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
  transition: 'background 0.15s',
}

// ─── Team card ────────────────────────────────────────────────────────────────

function TeamCard({
  member, isDirector, onRemove,
}: { member: TeamMember; isDirector: boolean; onRemove: (id: string) => void }) {
  return (
    <div style={{
      background: 'var(--c-card)', border: '1px solid var(--c-border)',
      borderRadius: 14, padding: '16px',
      boxShadow: 'var(--c-card-shadow)',
      display: 'flex', flexDirection: 'column', gap: 12,
      position: 'relative',
    }}>
      {isDirector && (
        <button
          onClick={() => onRemove(member.id)}
          title="Retirer du groupe"
          style={{
            position: 'absolute', top: 12, right: 12,
            background: 'var(--c-badge)', border: 'none', borderRadius: 7,
            padding: 5, cursor: 'pointer', color: 'var(--c-text-muted)',
            display: 'flex', transition: 'background 0.15s, color 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(192,57,43,0.15)'
            e.currentTarget.style.color = '#C0392B'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'var(--c-badge)'
            e.currentTarget.style.color = 'var(--c-text-muted)'
          }}
        >
          <Trash2 size={13} />
        </button>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingRight: isDirector ? 28 : 0 }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%', background: PRIMARY,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 700, fontSize: 15, flexShrink: 0,
        }}>
          {member.avatarInitials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--c-text)' }}>{member.fullName}</div>
          <div style={{ fontSize: 12, color: 'var(--c-text-muted)' }}>{member.jobTitle}</div>
        </div>
        <span style={{
          fontSize: 10, fontWeight: 700, color: PRIMARY, background: `${PRIMARY}18`,
          borderRadius: 6, padding: '2px 8px', flexShrink: 0,
        }}>
          {member.roleLabel}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ flex: 1, background: 'var(--c-badge)', borderRadius: 10, padding: '10px 12px', textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: member.activeCount > 0 ? '#E67E22' : 'var(--c-text)' }}>
            {member.activeCount}
          </div>
          <div style={{ fontSize: 10, color: 'var(--c-text-muted)', fontWeight: 600 }}>En cours</div>
        </div>
        <div style={{ flex: 1, background: 'var(--c-badge)', borderRadius: 10, padding: '10px 12px', textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: PRIMARY }}>{member.resolvedCount}</div>
          <div style={{ fontSize: 10, color: 'var(--c-text-muted)', fontWeight: 600 }}>Traités</div>
        </div>
      </div>

      <a
        href={`tel:${member.phone}`}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px',
          background: `${PRIMARY}12`, borderRadius: 10,
          color: PRIMARY, textDecoration: 'none', fontSize: 13, fontWeight: 600,
          transition: 'background 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = `${PRIMARY}22`)}
        onMouseLeave={e => (e.currentTarget.style.background = `${PRIMARY}12`)}
      >
        <Phone size={13} />
        {member.phone}
      </a>
    </div>
  )
}

// ─── Add member form ──────────────────────────────────────────────────────────

function AddMemberForm({ onAdd, onCancel }: {
  onAdd: (m: TeamMember) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState({
    firstName: '', lastName: '', role: 'cpe' as ProfessionalRole,
    jobTitle: '', phone: '',
  })
  const canSubmit = form.firstName.trim() && form.lastName.trim() && form.jobTitle.trim() && form.phone.trim()

  const submit = () => {
    if (!canSubmit) return
    const initials = `${form.firstName[0]}${form.lastName[0]}`.toUpperCase()
    const roleLabel = ROLE_OPTIONS.find(r => r.key === form.role)?.label ?? form.role
    onAdd({
      id: `tm_new_${Date.now()}`,
      fullName: `${form.firstName} ${form.lastName}`,
      firstName: form.firstName,
      lastName: form.lastName,
      avatarInitials: initials,
      role: form.role,
      roleLabel,
      jobTitle: form.jobTitle,
      phone: form.phone,
      email: '',
      activeCount: 0,
      resolvedCount: 0,
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      style={{
        background: 'var(--c-card)', border: `1.5px solid ${PRIMARY}`,
        borderRadius: 14, padding: '18px',
        boxShadow: 'var(--c-card-shadow)',
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-text)', marginBottom: 14 }}>
        Ajouter un membre
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        <input
          placeholder="Prénom"
          value={form.firstName}
          onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))}
          style={iStyle}
        />
        <input
          placeholder="Nom"
          value={form.lastName}
          onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))}
          style={iStyle}
        />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        <select
          value={form.role}
          onChange={e => setForm(p => ({ ...p, role: e.target.value as ProfessionalRole }))}
          style={iStyle}
        >
          {ROLE_OPTIONS.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}
        </select>
        <input
          placeholder="Poste établissement"
          value={form.jobTitle}
          onChange={e => setForm(p => ({ ...p, jobTitle: e.target.value }))}
          style={iStyle}
        />
      </div>
      <input
        placeholder="Téléphone"
        value={form.phone}
        onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
        style={{ ...iStyle, width: '100%', boxSizing: 'border-box', marginBottom: 12 }}
      />
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={submit}
          disabled={!canSubmit}
          style={{
            flex: 1, padding: '10px', borderRadius: 10,
            background: canSubmit ? PRIMARY : 'var(--c-badge)',
            color: canSubmit ? '#fff' : 'var(--c-text-muted)',
            border: 'none', fontSize: 13, fontWeight: 700, cursor: canSubmit ? 'pointer' : 'not-allowed',
            fontFamily: 'inherit', transition: 'background 0.2s',
          }}
        >
          Ajouter
        </button>
        <button
          onClick={onCancel}
          style={{
            padding: '10px 16px', borderRadius: 10,
            background: 'var(--c-badge)', color: 'var(--c-text-muted)',
            border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          Annuler
        </button>
      </div>
    </motion.div>
  )
}

const iStyle: React.CSSProperties = {
  background: 'var(--c-input-bg)',
  border: '1.5px solid var(--c-input-border)',
  borderRadius: 10, padding: '9px 12px',
  color: 'var(--c-text)', fontSize: 13,
  fontFamily: 'inherit', outline: 'none',
}

// ─── Statistics tab ───────────────────────────────────────────────────────────

type Period = 'weekly' | 'monthly' | 'yearly'

function StatsTab() {
  const [period, setPeriod] = useState<Period>('monthly')
  const data = MOCK_STATS[period]
  // Separate max for académie bars — independent from chart data
  const maxAcademieTotal = Math.max(...MOCK_STATS.byAcademie.map(a => a.total))

  return (
    <div style={{ padding: '24px 20px', maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--c-text)' }}>Statistiques</h2>
        <div style={{ display: 'flex', gap: 4, background: 'var(--c-badge)', borderRadius: 10, padding: 3 }}>
          {([['weekly', 'Semaine'], ['monthly', 'Mois'], ['yearly', 'Année']] as [Period, string][]).map(([k, l]) => (
            <button
              key={k}
              onClick={() => setPeriod(k)}
              style={{
                padding: '6px 14px', borderRadius: 8, border: 'none',
                background: period === k ? PRIMARY : 'transparent',
                color: period === k ? '#fff' : 'var(--c-text-muted)',
                fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                transition: 'background 0.2s, color 0.2s',
              }}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Bar chart */}
      <div style={{
        background: 'var(--c-card)', borderRadius: 14, padding: '20px',
        border: '1px solid var(--c-border)', marginBottom: 20,
        boxShadow: 'var(--c-card-shadow)',
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--c-text-muted)', marginBottom: 16, letterSpacing: '0.06em' }}>
          SIGNALEMENTS PAR PÉRIODE
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} barSize={28} barGap={2}>
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#888' }} />
            <YAxis allowDecimals={false} axisLine={false} tickLine={false} width={24} tick={{ fontSize: 11, fill: '#888' }} />
            <Tooltip
              contentStyle={{
                background: 'var(--c-panel)', border: '1px solid var(--c-border)',
                borderRadius: 10, fontSize: 12,
              }}
              cursor={{ fill: 'rgba(46,171,123,0.06)' }}
            />
            <Bar dataKey="high"   name="Élevé"  stackId="a" fill="#C0392B" radius={[0, 0, 0, 0]} />
            <Bar dataKey="medium" name="Moyen"  stackId="a" fill="#E67E22" radius={[0, 0, 0, 0]} />
            <Bar dataKey="low"    name="Faible" stackId="a" fill="#2EAB7B" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 8 }}>
          {[['#C0392B', 'Élevé'], ['#E67E22', 'Moyen'], ['#2EAB7B', 'Faible']].map(([color, label]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
              <span style={{ fontSize: 11, color: 'var(--c-text-muted)' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Donut + académie */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
        <div style={{
          background: 'var(--c-card)', borderRadius: 14, padding: '20px',
          border: '1px solid var(--c-border)', boxShadow: 'var(--c-card-shadow)',
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--c-text-muted)', marginBottom: 12, letterSpacing: '0.06em' }}>
            RÉPARTITION PAR GRAVITÉ
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <PieChart width={130} height={130}>
              <Pie
                data={MOCK_STATS.bySeverity}
                cx={60} cy={60}
                innerRadius={38} outerRadius={60}
                dataKey="value" strokeWidth={0}
              >
                {MOCK_STATS.bySeverity.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {MOCK_STATS.bySeverity.map(s => (
                <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: s.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: 'var(--c-text-sub)' }}>{s.name}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-text)', marginLeft: 'auto' }}>{s.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{
          background: 'var(--c-card)', borderRadius: 14, padding: '20px',
          border: '1px solid var(--c-border)', boxShadow: 'var(--c-card-shadow)',
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--c-text-muted)', marginBottom: 12, letterSpacing: '0.06em' }}>
            PAR ACADÉMIE / RECTORAT
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {MOCK_STATS.byAcademie.slice(0, 6).map(a => (
              <div key={a.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: 12, color: 'var(--c-text-sub)', fontWeight: 600 }}>{a.name}</span>
                  <span style={{ fontSize: 12, color: 'var(--c-text)', fontWeight: 700 }}>{a.total}</span>
                </div>
                <div style={{ height: 4, borderRadius: 2, background: 'var(--c-progress-track)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 2, background: PRIMARY,
                    width: `${(a.total / maxAcademieTotal) * 100}%`,
                    transition: 'width 0.4s ease',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Team sidebar footer ──────────────────────────────────────────────────────

function TeamSidebarFooter({ team }: { team: TeamMember[] }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 12px', borderRadius: 10, border: 'none',
          background: 'rgba(46,171,123,0.10)', cursor: 'pointer', color: PRIMARY,
          fontFamily: "'Manrope', sans-serif", fontSize: '0.78rem',
          fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Phone size={13} />
          Équipe
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} style={{ fontSize: '0.7rem' }}>
          ▾
        </motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ paddingTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {team.map(m => (
                <a
                  key={m.id} href={`tel:${m.phone}`}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '7px 12px', borderRadius: 9, textDecoration: 'none',
                    background: `${PRIMARY}12`, transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = `${PRIMARY}22`)}
                  onMouseLeave={e => (e.currentTarget.style.background = `${PRIMARY}12`)}
                >
                  <div>
                    <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>
                      {m.firstName} {m.lastName}
                    </div>
                    <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: '0.68rem', color: 'rgba(255,255,255,0.38)' }}>
                      {m.roleLabel}
                    </div>
                  </div>
                  <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: '0.72rem', fontWeight: 700, color: PRIMARY }}>
                    {m.phone}
                  </span>
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Main dashboard ───────────────────────────────────────────────────────────

export default function ProfessionalDashboard() {
  const [searchParams] = useSearchParams()

  const role   = searchParams.get('role') ?? 'referent'
  const tab    = searchParams.get('tab')  ?? 'reports'
  const status = (searchParams.get('status') ?? 'active') as StatusFilter

  const isDirector = role === 'director'
  const user = isDirector ? MOCK_DIRECTOR : MOCK_REFERENT

  // ── State ──
  const [reports, setReports] = useState<ProReport[]>(MOCK_PRO_REPORTS)
  const [team, setTeam]       = useState<TeamMember[]>(MOCK_TEAM)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [sort, setSort]             = useState<SortKey>('severity')
  const [showAddMember, setShowAddMember] = useState(false)

  const selectedReport = reports.find(r => r.id === selectedId) ?? null

  // ── Handlers ──
  const handleAssign = (id: string, name: string | undefined) =>
    setReports(prev => prev.map(r => r.id === id ? { ...r, assignedTo: name } : r))

  const handleSetSeverity = (id: string, severity: Severity) =>
    setReports(prev => prev.map(r => r.id === id ? { ...r, severity } : r))

  const handleAdvanceStage = (id: string) =>
    setReports(prev => prev.map(r => {
      if (r.id !== id || r.progressStage >= 3) return r
      const next = r.progressStage + 1
      return {
        ...r, progressStage: next,
        status: next >= 3 ? 'resolved' : r.status,
        progressPercent: [10, 30, 65, 100][next],
        updatedAt: new Date().toISOString(),
      }
    }))

  const handleAddEvent = (id: string, event: Omit<ReportEvent, 'id'>) =>
    setReports(prev => prev.map(r =>
      r.id !== id ? r : {
        ...r,
        events: [...r.events, { ...event, id: `ev_${Date.now()}` }],
        updatedAt: new Date().toISOString(),
      }
    ))

  const handleAddMember = (m: TeamMember) => {
    setTeam(prev => [...prev, m])
    setShowAddMember(false)
  }

  const handleRemoveMember = (id: string) =>
    setTeam(prev => prev.filter(m => m.id !== id))

  // ── Filtering ──
  const filtered = useMemo(() => {
    let list = reports
    if (status === 'active')     list = list.filter(r => r.status === 'active' && r.assignedTo)
    if (status === 'unassigned') list = list.filter(r => r.status === 'active' && !r.assignedTo)
    if (status === 'resolved')   list = list.filter(r => r.status === 'resolved')
    if (status === 'archived')   list = list.filter(r => r.status === 'archived')

    if (!isDirector && (status === 'active' || status === 'resolved'))
      list = list.filter(r => r.assignedTo === user.fullName)

    return [...list].sort((a, b) => {
      if (sort === 'severity') return SEVERITY_ORDER[severityKey(a)] - SEVERITY_ORDER[severityKey(b)]
      if (sort === 'date')     return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      if (sort === 'stage')    return b.progressStage - a.progressStage
      if (sort === 'referent') return (a.assignedTo ?? '').localeCompare(b.assignedTo ?? '')
      return 0
    })
  }, [reports, status, sort, isDirector, user.fullName])

  const activeCount     = reports.filter(r => r.status === 'active' && r.assignedTo).length
  const unassignedCount = reports.filter(r => r.status === 'active' && !r.assignedTo).length

  // ── Nav items ──
  const base = `/dashboard/professional?role=${role}`

  const navItems = [
    {
      label: 'Équipe',
      href: `${base}&tab=team`,
      icon: <Users size={17} />,
      badge: team.length,
      isActive: (_p: string, s: string) => new URLSearchParams(s).get('tab') === 'team',
    },
    {
      label: 'Actifs',
      href: `${base}&tab=reports&status=active`,
      icon: <Clock size={17} />,
      badge: activeCount,
      isActive: (_p: string, s: string) => {
        const sp = new URLSearchParams(s)
        return sp.get('tab') === 'reports' && sp.get('status') === 'active'
      },
    },
    ...(isDirector ? [{
      label: 'Non attribués',
      href: `${base}&tab=reports&status=unassigned`,
      icon: <AlertCircle size={17} />,
      badge: unassignedCount,
      isActive: (_p: string, s: string) => {
        const sp = new URLSearchParams(s)
        return sp.get('tab') === 'reports' && sp.get('status') === 'unassigned'
      },
    }] : []),
    {
      label: 'Résolus',
      href: `${base}&tab=reports&status=resolved`,
      icon: <CheckCircle size={17} />,
      isActive: (_p: string, s: string) => {
        const sp = new URLSearchParams(s)
        return sp.get('tab') === 'reports' && sp.get('status') === 'resolved'
      },
    },
    {
      label: 'Archivés',
      href: `${base}&tab=reports&status=archived`,
      icon: <Archive size={17} />,
      isActive: (_p: string, s: string) => {
        const sp = new URLSearchParams(s)
        return sp.get('tab') === 'reports' && sp.get('status') === 'archived'
      },
    },
    {
      label: 'Statistiques',
      href: `${base}&tab=stats`,
      icon: <BarChart2 size={17} />,
      isActive: (_p: string, s: string) => new URLSearchParams(s).get('tab') === 'stats',
    },
  ]

  const roleBadge = (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '8px 12px', borderRadius: 10,
      background: isDirector ? 'rgba(192,57,43,0.15)' : 'rgba(46,171,123,0.10)',
      border: `1px solid ${isDirector ? 'rgba(192,57,43,0.3)' : 'rgba(46,171,123,0.2)'}`,
    }}>
      <div style={{ width: 6, height: 6, borderRadius: '50%', background: isDirector ? '#C0392B' : PRIMARY, flexShrink: 0 }} />
      <span style={{ fontSize: 12, fontWeight: 700, color: isDirector ? '#E74C3C' : PRIMARY }}>
        {isDirector ? 'Directeur·rice' : ROLE_LABELS[MOCK_TEAM[0].role]}
      </span>
    </div>
  )

  return (
    <DashboardLayout
      user={user}
      navItems={navItems}
      accentColor={PRIMARY}
      sidebarHeaderContent={roleBadge}
      sidebarFooterContent={<TeamSidebarFooter team={team} />}
    >
      <div style={{ display: 'flex', height: '100%' }}>

        {/* ── Stats tab ── */}
        {tab === 'stats' && (
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <StatsTab />
          </div>
        )}

        {/* ── Team tab ── */}
        {tab === 'team' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--c-text)' }}>
                Équipe Haven
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  fontSize: 12, fontWeight: 700, color: 'var(--c-text-muted)',
                  background: 'var(--c-badge)', borderRadius: 20, padding: '4px 12px',
                }}>
                  {team.length} membres
                </span>
                {isDirector && (
                  <button
                    onClick={() => setShowAddMember(v => !v)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '6px 14px', borderRadius: 20, border: 'none',
                      background: showAddMember ? 'var(--c-badge)' : PRIMARY,
                      color: showAddMember ? 'var(--c-text-muted)' : '#fff',
                      fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                      transition: 'background 0.2s, color 0.2s',
                    }}
                  >
                    <UserPlus size={14} />
                    {showAddMember ? 'Annuler' : 'Ajouter'}
                  </button>
                )}
              </div>
            </div>

            <AnimatePresence>
              {showAddMember && (
                <div style={{ marginBottom: 16 }}>
                  <AddMemberForm onAdd={handleAddMember} onCancel={() => setShowAddMember(false)} />
                </div>
              )}
            </AnimatePresence>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
              <AnimatePresence>
                {team.map(m => (
                  <motion.div
                    key={m.id}
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                  >
                    <TeamCard
                      member={m}
                      isDirector={isDirector}
                      onRemove={handleRemoveMember}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* ── Reports tab ── */}
        {tab === 'reports' && (
          <>
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--c-text)' }}>
                  {status === 'active'     && 'Signalements actifs'}
                  {status === 'unassigned' && 'Non attribués'}
                  {status === 'resolved'   && 'Résolus'}
                  {status === 'archived'   && 'Archivés'}
                </h2>
                <span style={{
                  fontSize: 12, fontWeight: 700, color: 'var(--c-text-muted)',
                  background: 'var(--c-badge)', borderRadius: 20, padding: '4px 12px',
                }}>
                  {filtered.length}
                </span>
              </div>

              <SortBar sort={sort} setSort={setSort} />

              <AnimatePresence mode="popLayout">
                {filtered.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--c-text-muted)' }}
                  >
                    <AlertCircle size={36} style={{ opacity: 0.3, marginBottom: 12 }} />
                    <p style={{ margin: 0, fontSize: 14 }}>Aucun signalement dans cette catégorie</p>
                  </motion.div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {filtered.map(r => (
                      <ReportCard
                        key={r.id}
                        report={r}
                        selected={r.id === selectedId}
                        isArchived={r.status === 'archived'}
                        onClick={() => setSelectedId(prev => prev === r.id ? null : r.id)}
                      />
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence>
              {selectedReport && (
                <DetailPanel
                  key={selectedReport.id}
                  report={selectedReport}
                  isDirector={isDirector}
                  team={team}
                  onClose={() => setSelectedId(null)}
                  onAssign={handleAssign}
                  onSetSeverity={handleSetSeverity}
                  onAdvanceStage={handleAdvanceStage}
                  onAddEvent={handleAddEvent}
                />
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
