import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock, CheckCircle, Archive, ChevronRight,
  X, ArrowUpDown, Search, Shield, User,
  Phone, FileText,
} from 'lucide-react'
import DashboardLayout from '../../layouts/DashboardLayout'
import {
  getParentChildren, getParentReports, getCurrentParent,
  ESTABLISHMENT_CONTACTS,
} from '../../services/parentData'
import { useIsMobile } from '../../hooks/useMediaQuery'
import type { Child, ParentReport, ReportStatus, User as UserType, EstablishmentContact } from '../../types'

// ─── Constants ────────────────────────────────────────────────────────────────

const ACCENT = '#2EAB7B'

const SEVERITY_META = {
  high:   { label: 'Élevé',  color: '#C0392B', bg: 'rgba(192,57,43,0.12)' },
  medium: { label: 'Moyen',  color: '#E67E22', bg: 'rgba(230,126,34,0.12)' },
  low:    { label: 'Faible', color: '#2EAB7B', bg: 'rgba(46,171,123,0.12)' },
}

const STATUS_META: Record<ReportStatus, { label: string; color: string }> = {
  active:   { label: 'En cours', color: '#2EAB7B' },
  resolved: { label: 'Résolu',   color: '#8ED4BF' },
  archived: { label: 'Archivé',  color: 'var(--c-archived)' },
}

// 4-step progress tracker stages (matching mobile app)
const STAGES = ['DÉPOSÉ', 'EXAMINÉ', 'EN COURS', 'RÉSOLU']

function getStage(report: ParentReport): number {
  if (report.status === 'resolved' || report.status === 'archived' || report.progressPercent >= 90) return 3
  if (report.progressPercent >= 60) return 2
  if (report.progressPercent >= 30) return 1
  return 0
}

type SortKey = 'date' | 'severity' | 'progress'
const SEVERITY_ORDER = ['high', 'medium', 'low']

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso))
}

function sortReports(reports: ParentReport[], key: SortKey) {
  return [...reports].sort((a, b) => {
    if (key === 'date')     return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    if (key === 'severity') return SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity)
    return b.progressPercent - a.progressPercent
  })
}

// ─── Establishment contacts panel ─────────────────────────────────────────────

function EstablishmentPanel({ contacts }: { contacts: EstablishmentContact[] }) {
  const [open, setOpen] = useState(false)
  const director  = contacts.filter(c => c.role === 'director')
  const referents = contacts.filter(c => c.role === 'referent')

  return (
    <div style={{ paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          borderRadius: 10,
          border: 'none',
          background: `${ACCENT}18`,
          cursor: 'pointer',
          color: ACCENT,
          fontFamily: "'Manrope', sans-serif",
          fontSize: '0.78rem',
          fontWeight: 700,
          letterSpacing: '0.06em',
          textTransform: 'uppercase' as const,
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Phone size={13} />
          Établissement
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ fontSize: '0.7rem' }}
        >
          ▾
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ paddingTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[...director, ...referents].map(c => (
                <a
                  key={c.phone}
                  href={`tel:${c.phone}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 12px',
                    borderRadius: 9,
                    textDecoration: 'none',
                    background: `${ACCENT}10`,
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = `${ACCENT}20`)}
                  onMouseLeave={e => (e.currentTarget.style.background = `${ACCENT}10`)}
                >
                  <div style={{
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    background: `${ACCENT}25`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: "'Manrope', sans-serif",
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    color: ACCENT,
                    flexShrink: 0,
                  }}>
                    {c.initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>
                      {c.name}
                    </div>
                    <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: '0.67rem', color: 'rgba(255,255,255,0.38)' }}>
                      {c.role === 'director' ? 'Chef d\'établissement' : 'Référent harcèlement'}
                    </div>
                  </div>
                  <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: '0.75rem', fontWeight: 700, color: ACCENT, flexShrink: 0 }}>
                    {c.phone}
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

// ─── Child selector (sidebar header) ──────────────────────────────────────────

function ChildSelector({
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

      {/* "Tous" option */}
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

      {/* One button per child */}
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
                <div style={{
                  fontFamily: "'Manrope', sans-serif",
                  fontSize: '0.68rem',
                  color: 'rgba(255,255,255,0.30)',
                }}>
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

// ─── 4-step progress tracker ──────────────────────────────────────────────────

function ProgressTracker({ stage, color }: { stage: number; color: string }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
        {STAGES.map((_, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < STAGES.length - 1 ? 1 : 0 }}>
            <div style={{
              width: i === stage ? 10 : 7,
              height: i === stage ? 10 : 7,
              borderRadius: '50%',
              background: i <= stage ? color : 'var(--c-progress-track)',
              flexShrink: 0,
              transition: 'background 0.28s',
            }} />
            {i < STAGES.length - 1 && (
              <div style={{
                flex: 1,
                height: 2,
                background: i < stage ? color : 'var(--c-progress-track)',
                borderRadius: 1,
                margin: '0 3px',
                transition: 'background 0.28s',
              }} />
            )}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {STAGES.map((label, i) => (
          <span key={label} style={{
            fontFamily: "'Manrope', sans-serif",
            fontSize: '0.62rem',
            fontWeight: i === stage ? 700 : 500,
            color: i === stage ? color : 'var(--c-text-muted)',
            letterSpacing: '0.04em',
          }}>
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── Stats bar ────────────────────────────────────────────────────────────────

function StatsBar({ reports }: { reports: ParentReport[] }) {
  const active   = reports.filter(r => r.status === 'active').length
  const resolved = reports.filter(r => r.status === 'resolved').length
  const archived = reports.filter(r => r.status === 'archived').length

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
      {[
        { label: 'Total',    value: reports.length, color: 'var(--c-text-sub)' },
        { label: 'En cours', value: active,          color: ACCENT },
        { label: 'Résolus',  value: resolved,        color: '#8ED4BF' },
        { label: 'Archivés', value: archived,        color: 'var(--c-archived)' },
      ].map(s => (
        <div key={s.label} style={{
          background: 'var(--c-card)',
          borderRadius: 14,
          padding: '14px 16px',
          border: '1px solid var(--c-border)',
          boxShadow: 'var(--c-card-shadow)',
          transition: 'background 0.28s, border-color 0.28s',
        }}>
          <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '1.8rem', fontWeight: 700, color: s.color, lineHeight: 1 }}>
            {s.value}
          </div>
          <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: '0.75rem', color: 'var(--c-text-muted)', marginTop: 4 }}>
            {s.label}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Report card ──────────────────────────────────────────────────────────────

function ReportCard({ report, child, selected, onClick }: {
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
        {/* Child avatar */}
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

// ─── Detail panel ─────────────────────────────────────────────────────────────

function DetailPanel({ report, child, onClose }: { report: ParentReport; child?: Child; onClose: () => void }) {
  const sev   = SEVERITY_META[report.severity]
  const sta   = STATUS_META[report.status]
  const stage = getStage(report)
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
    </motion.div>
  )
}

// ─── Filter bar ───────────────────────────────────────────────────────────────

type StatusFilter = 'all' | ReportStatus

function FilterBar({
  search, onSearch, statusFilter, onStatusFilter, sort, onSort,
  counts,
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

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ParentDashboard() {
  const [allReports, setAllReports] = useState<ParentReport[]>([])
  const [children, setChildren]     = useState<Child[]>([])
  const [user, setUser]             = useState<UserType | null>(null)
  const [selected, setSelected]     = useState<ParentReport | null>(null)
  const [search, setSearch]         = useState('')
  const [sort, setSort]             = useState<SortKey>('date')
  const isMobile                    = useIsMobile()

  const [searchParams, setSearchParams] = useSearchParams()
  const childId      = searchParams.get('child')
  const statusFilter = (searchParams.get('status') as StatusFilter) ?? 'all'

  const setChildId = (id: string | null) => {
    const params: Record<string, string> = {}
    if (id) params.child = id
    if (statusFilter !== 'all') params.status = statusFilter
    setSearchParams(params, { replace: true })
    setSelected(null)
  }

  const setStatusFilter = (v: StatusFilter) => {
    const params: Record<string, string> = {}
    if (childId) params.child = childId
    if (v !== 'all') params.status = v
    setSearchParams(params, { replace: true })
  }

  useEffect(() => {
    getParentReports().then(setAllReports)
    getParentChildren().then(setChildren)
    getCurrentParent().then(setUser)
  }, [])

  const childReports = childId ? allReports.filter(r => r.childId === childId) : allReports

  const filtered = sortReports(
    childReports.filter(r => {
      const matchStatus = statusFilter === 'all' || r.status === statusFilter
      const q = search.toLowerCase()
      const matchSearch = !q || r.title.toLowerCase().includes(q) || r.caseNumber.toLowerCase().includes(q) || r.category.toLowerCase().includes(q)
      return matchStatus && matchSearch
    }),
    sort,
  )

  const counts: Record<StatusFilter, number> = {
    all:      childReports.length,
    active:   childReports.filter(r => r.status === 'active').length,
    resolved: childReports.filter(r => r.status === 'resolved').length,
    archived: childReports.filter(r => r.status === 'archived').length,
  }

  // Active report count per child (for sidebar badges)
  const activePerChild: Record<string, number> = {}
  allReports.filter(r => r.status === 'active').forEach(r => {
    activePerChild[r.childId] = (activePerChild[r.childId] ?? 0) + 1
  })

  const navItems = [
    {
      label: 'En cours',
      href: '/dashboard/parent?status=active',
      icon: <Clock size={16} />,
      badge: allReports.filter(r => r.status === 'active').length,
      isActive: (_p: string, s: string) => new URLSearchParams(s).get('status') === 'active',
    },
    {
      label: 'Résolus',
      href: '/dashboard/parent?status=resolved',
      icon: <CheckCircle size={16} />,
      isActive: (_p: string, s: string) => new URLSearchParams(s).get('status') === 'resolved',
    },
    {
      label: 'Archivés',
      href: '/dashboard/parent?status=archived',
      icon: <Archive size={16} />,
      isActive: (_p: string, s: string) => new URLSearchParams(s).get('status') === 'archived',
    },
  ]

  if (!user) return null

  const selectedChild = selected ? children.find(c => c.id === selected.childId) : undefined

  return (
    <DashboardLayout
      user={user}
      navItems={navItems}
      accentColor={ACCENT}
      sidebarHeaderContent={
        <ChildSelector
          children={children}
          selectedId={childId}
          onSelect={setChildId}
          reportCounts={activePerChild}
        />
      }
      sidebarFooterContent={<EstablishmentPanel contacts={ESTABLISHMENT_CONTACTS} />}
    >
      <div style={{ display: 'flex', height: '100%' }}>
        {/* Main list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '28px 24px', minWidth: 0 }}>
          {/* Header */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: ACCENT }}>
                Espace parents
              </span>
            </div>
            <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '1.6rem', fontWeight: 700, color: 'var(--c-text)', margin: 0, transition: 'color 0.28s' }}>
              {childId
                ? `Signalements — ${children.find(c => c.id === childId)?.firstName ?? ''}`
                : 'Tous les signalements'}
            </h1>
          </div>

          <StatsBar reports={childReports} />
          <FilterBar search={search} onSearch={setSearch} statusFilter={statusFilter} onStatusFilter={setStatusFilter} sort={sort} onSort={setSort} counts={counts} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <AnimatePresence mode="popLayout">
              {filtered.length === 0 ? (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--c-text-muted)', fontFamily: "'Manrope', sans-serif", fontSize: '0.88rem' }}>
                  Aucun signalement trouvé.
                </motion.div>
              ) : (
                filtered.map(report => {
                  const child = children.find(c => c.id === report.childId)
                  return (
                    <motion.div key={report.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }} layout>
                      <ReportCard
                        report={report}
                        child={!childId ? child : undefined}
                        selected={selected?.id === report.id}
                        onClick={() => setSelected(selected?.id === report.id ? null : report)}
                      />
                    </motion.div>
                  )
                })
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Detail panel */}
        <AnimatePresence>
          {selected && (
            <DetailPanel
              key={selected.id}
              report={selected}
              child={selectedChild}
              onClose={() => setSelected(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  )
}
