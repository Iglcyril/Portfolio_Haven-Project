import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Clock,
  CheckCircle,
  Archive,
  AlertTriangle,
  ChevronRight,
  X,
  ArrowUpDown,
  Search,
  Shield,
  User,
} from 'lucide-react'
import DashboardLayout from '../../layouts/DashboardLayout'
import { getStudentReports, getCurrentStudent, EMERGENCY_CONTACTS } from '../../services/reports'
import { useIsMobile } from '../../hooks/useMediaQuery'
import type { Report, ReportStatus, User as UserType } from '../../types'
import { SEVERITY_META, SEVERITY_ORDER } from '../../constants/severity'
import { formatDate } from '../../utils/dateFormatting'

// ─── Constants ────────────────────────────────────────────────────────────────

const ACCENT = '#00A176'

const NAV_ITEMS = [
  { label: 'Signalements', href: '/dashboard/student', icon: <FileText size={16} /> },
  { label: 'Actifs',       href: '/dashboard/student?status=active',   icon: <Clock size={16} /> },
  { label: 'Résolus',      href: '/dashboard/student?status=resolved',  icon: <CheckCircle size={16} /> },
  { label: 'Archivés',     href: '/dashboard/student?status=archived',  icon: <Archive size={16} /> },
]

// archived uses CSS var so it works in both light and dark
const STATUS_META: Record<ReportStatus, { label: string; color: string }> = {
  active:   { label: 'En cours', color: '#00A176' },
  resolved: { label: 'Résolu',   color: '#8ED4BF' },
  archived: { label: 'Archivé',  color: 'var(--c-archived)' },
}

type SortKey = 'date' | 'severity' | 'progress'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sortReports(reports: Report[], key: SortKey): Report[] {
  return [...reports].sort((a, b) => {
    if (key === 'date')     return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    if (key === 'severity') return SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity)
    return b.progressPercent - a.progressPercent
  })
}

// ─── Stats bar ────────────────────────────────────────────────────────────────

function StatsBar({ reports }: { reports: Report[] }) {
  const active   = reports.filter(r => r.status === 'active').length
  const resolved = reports.filter(r => r.status === 'resolved').length
  const archived = reports.filter(r => r.status === 'archived').length

  const stats = [
    { label: 'Total',    value: reports.length, color: 'var(--c-text-sub)' },
    { label: 'En cours', value: active,          color: ACCENT },
    { label: 'Résolus',  value: resolved,        color: '#8ED4BF' },
    { label: 'Archivés', value: archived,        color: 'var(--c-archived)' },
  ]

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 12,
      marginBottom: 24,
    }}>
      {stats.map(s => (
        <div key={s.label} style={{
          background: 'var(--c-card)',
          borderRadius: 14,
          padding: '14px 16px',
          border: '1px solid var(--c-border)',
          boxShadow: 'var(--c-card-shadow)',
          transition: 'background 0.28s ease, border-color 0.28s ease',
        }}>
          <div style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontSize: '1.8rem',
            fontWeight: 700,
            color: s.color,
            lineHeight: 1,
          }}>
            {s.value}
          </div>
          <div style={{
            fontFamily: "'Manrope', sans-serif",
            fontSize: '0.75rem',
            color: 'var(--c-text-muted)',
            marginTop: 4,
          }}>
            {s.label}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── 4-step progress tracker ──────────────────────────────────────────────────

const STAGES = ['DÉPOSÉ', 'EXAMINÉ', 'EN COURS', 'RÉSOLU']

function getStage(report: Report): number {
  if (report.status === 'resolved' || report.status === 'archived' || report.progressPercent >= 90) return 3
  if (report.progressPercent >= 60) return 2
  if (report.progressPercent >= 30) return 1
  return 0
}

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

// ─── Report card ──────────────────────────────────────────────────────────────

function ReportCard({ report, selected, onClick }: {
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

// ─── Timeline ─────────────────────────────────────────────────────────────────

function Timeline({ entries }: { entries: Report['timeline'] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {entries.map((entry, i) => (
        <div key={entry.id} style={{ display: 'flex', gap: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 20, flexShrink: 0 }}>
            <div style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: i === 0 ? ACCENT : 'transparent',
              border: `2px solid ${i === 0 ? ACCENT : 'var(--c-border)'}`,
              flexShrink: 0,
              marginTop: 2,
            }} />
            {i < entries.length - 1 && (
              <div style={{ width: 1, flex: 1, background: 'var(--c-divider)', marginTop: 4 }} />
            )}
          </div>
          <div style={{ paddingBottom: i < entries.length - 1 ? 20 : 0 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 3 }}>
              <span style={{
                fontFamily: "'Manrope', sans-serif",
                fontSize: '0.82rem',
                fontWeight: 700,
                color: i === 0 ? 'var(--c-text)' : 'var(--c-text-sub)',
              }}>
                {entry.label}
              </span>
              <span style={{
                fontFamily: "'Manrope', sans-serif",
                fontSize: '0.68rem',
                color: 'var(--c-text-muted)',
              }}>
                {formatDate(entry.date)}
              </span>
            </div>
            <p style={{
              fontFamily: "'Manrope', sans-serif",
              fontSize: '0.80rem',
              color: 'var(--c-text-sub)',
              margin: 0,
              lineHeight: 1.5,
            }}>
              {entry.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Detail panel ─────────────────────────────────────────────────────────────

function DetailPanel({ report, onClose }: { report: Report; onClose: () => void }) {
  const sev   = SEVERITY_META[report.severity]
  const sta   = STATUS_META[report.status]
  const stage = getStage(report)
  const isMobile = useIsMobile()

  const panelStyle: React.CSSProperties = isMobile
    ? {
        position: 'fixed',
        inset: 0,
        top: 56,
        background: 'var(--c-panel)',
        zIndex: 60,
        overflowY: 'auto',
        padding: 20,
        transition: 'background 0.28s ease',
      }
    : {
        width: 360,
        flexShrink: 0,
        background: 'var(--c-panel)',
        borderLeft: '1px solid var(--c-border)',
        overflowY: 'auto',
        padding: '28px 24px',
        transition: 'background 0.28s ease, border-color 0.28s ease',
      }

  return (
    <motion.div
      initial={isMobile ? { y: '100%' } : { x: 360 }}
      animate={isMobile ? { y: 0 } : { x: 0 }}
      exit={isMobile ? { y: '100%' } : { x: 360 }}
      transition={{ type: 'spring', stiffness: 320, damping: 36 }}
      style={panelStyle}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{
            fontFamily: "'Manrope', sans-serif",
            fontSize: '0.72rem',
            fontWeight: 700,
            color: ACCENT,
            letterSpacing: '0.06em',
            marginBottom: 4,
          }}>
            {report.caseNumber}
          </div>
          <h2 style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontSize: '1.15rem',
            fontWeight: 700,
            color: 'var(--c-text)',
            margin: 0,
            lineHeight: 1.3,
          }}>
            {report.title}
          </h2>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'var(--c-badge)',
            border: 'none',
            borderRadius: '50%',
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--c-icon)',
            flexShrink: 0,
            marginLeft: 12,
            transition: 'background 0.28s ease',
          }}
        >
          <X size={15} />
        </button>
      </div>

      {/* Badges */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const, marginBottom: 20 }}>
        <span style={{
          padding: '4px 10px',
          borderRadius: 9999,
          background: sev.bg,
          color: sev.color,
          fontFamily: "'Manrope', sans-serif",
          fontSize: '0.72rem',
          fontWeight: 700,
        }}>
          Gravité : {sev.label}
        </span>
        <span style={{
          padding: '4px 10px',
          borderRadius: 9999,
          background: 'var(--c-badge)',
          color: sta.color,
          fontFamily: "'Manrope', sans-serif",
          fontSize: '0.72rem',
          fontWeight: 700,
          transition: 'background 0.28s ease',
        }}>
          {sta.label}
        </span>
        <span style={{
          padding: '4px 10px',
          borderRadius: 9999,
          background: 'var(--c-badge)',
          color: 'var(--c-text-sub)',
          fontFamily: "'Manrope', sans-serif",
          fontSize: '0.72rem',
          fontWeight: 600,
          transition: 'background 0.28s ease',
        }}>
          {report.category}
        </span>
      </div>

      {/* 4-step tracker */}
      <div style={{
        marginBottom: 20,
        padding: '14px',
        borderRadius: 12,
        background: 'var(--c-card)',
        border: '1px solid var(--c-border)',
        transition: 'background 0.28s ease, border-color 0.28s ease',
      }}>
        <ProgressTracker stage={stage} color={sev.color} />
      </div>

      {/* Referent */}
      {report.referentName && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 14px',
          borderRadius: 12,
          background: 'var(--c-card)',
          border: '1px solid var(--c-border)',
          marginBottom: 20,
          transition: 'background 0.28s ease, border-color 0.28s ease',
        }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: `${ACCENT}30`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <User size={14} color={ACCENT} />
          </div>
          <div>
            <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: '0.70rem', color: 'var(--c-text-muted)', marginBottom: 1 }}>
              Référent assigné
            </div>
            <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: '0.82rem', fontWeight: 700, color: 'var(--c-text)' }}>
              {report.referentName}
            </div>
          </div>
        </div>
      )}

      {/* Description */}
      <div style={{ marginBottom: 24 }}>
        <div style={{
          fontFamily: "'Manrope', sans-serif",
          fontSize: '0.70rem',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase' as const,
          color: 'var(--c-text-muted)',
          marginBottom: 8,
        }}>
          Description
        </div>
        <p style={{
          fontFamily: "'Manrope', sans-serif",
          fontSize: '0.83rem',
          color: 'var(--c-text-sub)',
          lineHeight: 1.6,
          margin: 0,
        }}>
          {report.description}
        </p>
      </div>

      {/* Anonymity */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 14px',
        borderRadius: 12,
        background: 'var(--c-card)',
        border: '1px solid var(--c-border)',
        marginBottom: 24,
        transition: 'background 0.28s ease, border-color 0.28s ease',
      }}>
        <Shield size={14} color={ACCENT} />
        <span style={{
          fontFamily: "'Manrope', sans-serif",
          fontSize: '0.78rem',
          color: 'var(--c-text-sub)',
        }}>
          Niveau d'anonymat :{' '}
          <strong style={{ color: 'var(--c-text)' }}>
            {report.anonymityLevel === 'anonymous' ? 'Anonyme' :
             report.anonymityLevel === 'semi' ? 'Semi-anonyme' : 'Visible'}
          </strong>
        </span>
      </div>

      {/* Timeline */}
      <div>
        <div style={{
          fontFamily: "'Manrope', sans-serif",
          fontSize: '0.70rem',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase' as const,
          color: 'var(--c-text-muted)',
          marginBottom: 16,
        }}>
          Historique
        </div>
        <Timeline entries={[...report.timeline].reverse()} />
      </div>
    </motion.div>
  )
}

// ─── Filter / sort bar ────────────────────────────────────────────────────────

type StatusFilter = 'all' | ReportStatus

function FilterBar({
  search, onSearch,
  statusFilter, onStatusFilter,
  sort, onSort,
  counts,
}: {
  search: string
  onSearch: (v: string) => void
  statusFilter: StatusFilter
  onStatusFilter: (v: StatusFilter) => void
  sort: SortKey
  onSort: (v: SortKey) => void
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
    { key: 'progress', label: 'Avancement' },
  ]

  return (
    <div style={{ marginBottom: 20 }}>
      {/* Search */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        background: 'var(--c-input-bg)',
        border: '1px solid var(--c-input-border)',
        borderRadius: 12,
        padding: '10px 14px',
        marginBottom: 12,
        transition: 'background 0.28s ease, border-color 0.28s ease',
      }}>
        <span style={{ color: 'var(--c-icon)', display: 'flex' }}>
          <Search size={15} />
        </span>
        <input
          value={search}
          onChange={e => onSearch(e.target.value)}
          placeholder="Rechercher un signalement…"
          className="haven-search-input"
          style={{
            flex: 1,
            background: 'none',
            border: 'none',
            outline: 'none',
            fontFamily: "'Manrope', sans-serif",
            fontSize: '0.87rem',
            color: 'var(--c-text)',
          }}
        />
        {search && (
          <button
            onClick={() => onSearch('')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-icon)', display: 'flex', padding: 0 }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Tabs + sort */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' as const }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => onStatusFilter(tab.key)}
              style={{
                padding: '6px 12px',
                borderRadius: 9999,
                border: 'none',
                background: statusFilter === tab.key ? `${ACCENT}20` : 'transparent',
                color: statusFilter === tab.key ? 'var(--c-text)' : 'var(--c-text-sub)',
                fontFamily: "'Manrope', sans-serif",
                fontSize: '0.78rem',
                fontWeight: statusFilter === tab.key ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s',
                boxShadow: statusFilter === tab.key ? `0 0 0 1px ${ACCENT}50` : 'none',
                whiteSpace: 'nowrap' as const,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: 'var(--c-icon)', display: 'flex' }}>
            <ArrowUpDown size={13} />
          </span>
          {sorts.map(s => (
            <button
              key={s.key}
              onClick={() => onSort(s.key)}
              style={{
                padding: '5px 10px',
                borderRadius: 9999,
                border: 'none',
                background: sort === s.key ? 'var(--c-badge)' : 'transparent',
                color: sort === s.key ? 'var(--c-text)' : 'var(--c-text-muted)',
                fontFamily: "'Manrope', sans-serif",
                fontSize: '0.75rem',
                fontWeight: sort === s.key ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap' as const,
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function StudentDashboard() {
  const [reports, setReports] = useState<Report[]>([])
  const [user, setUser]       = useState<UserType | null>(null)
  const [selected, setSelected] = useState<Report | null>(null)
  const [search, setSearch]   = useState('')
  const [sort, setSort]       = useState<SortKey>('date')

  const [searchParams, setSearchParams] = useSearchParams()
  const statusFilter = (searchParams.get('status') as StatusFilter) ?? 'all'

  const setStatusFilter = (v: StatusFilter) => {
    if (v === 'all') setSearchParams({}, { replace: true })
    else setSearchParams({ status: v }, { replace: true })
  }

  useEffect(() => {
    getStudentReports().then(setReports)
    getCurrentStudent().then(setUser)
  }, [])

  const filtered = sortReports(
    reports.filter(r => {
      const matchStatus = statusFilter === 'all' || r.status === statusFilter
      const q = search.toLowerCase()
      const matchSearch = !q ||
        r.title.toLowerCase().includes(q) ||
        r.caseNumber.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q)
      return matchStatus && matchSearch
    }),
    sort,
  )

  const counts: Record<StatusFilter, number> = {
    all:      reports.length,
    active:   reports.filter(r => r.status === 'active').length,
    resolved: reports.filter(r => r.status === 'resolved').length,
    archived: reports.filter(r => r.status === 'archived').length,
  }

  const activeCount = reports.filter(r => r.status === 'active').length

  const navItemsWithBadge = NAV_ITEMS.map(item => {
    if (item.label === 'Actifs') return { ...item, badge: activeCount }
    return item
  })

  if (!user) return null

  return (
    <DashboardLayout
      user={user}
      navItems={navItemsWithBadge}
      emergencyContacts={EMERGENCY_CONTACTS}
      accentColor={ACCENT}
    >
      <div style={{ display: 'flex', height: '100%' }}>
        {/* Main list */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '28px 24px',
          minWidth: 0,
        }}>
          {/* Page header */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <AlertTriangle size={14} color={ACCENT} />
              <span style={{
                fontFamily: "'Manrope', sans-serif",
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase' as const,
                color: ACCENT,
              }}>
                Dashboard élève
              </span>
            </div>
            <h1 style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: '1.6rem',
              fontWeight: 700,
              color: 'var(--c-text)',
              margin: 0,
              transition: 'color 0.28s ease',
            }}>
              Mes signalements
            </h1>
          </div>

          <StatsBar reports={reports} />

          <FilterBar
            search={search}
            onSearch={setSearch}
            statusFilter={statusFilter}
            onStatusFilter={setStatusFilter}
            sort={sort}
            onSort={setSort}
            counts={counts}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <AnimatePresence mode="popLayout">
              {filtered.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    textAlign: 'center',
                    padding: '48px 24px',
                    color: 'var(--c-text-muted)',
                    fontFamily: "'Manrope', sans-serif",
                    fontSize: '0.88rem',
                  }}
                >
                  Aucun signalement trouvé.
                </motion.div>
              ) : (
                filtered.map(report => (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    layout
                  >
                    <ReportCard
                      report={report}
                      selected={selected?.id === report.id}
                      onClick={() => setSelected(selected?.id === report.id ? null : report)}
                    />
                  </motion.div>
                ))
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
              onClose={() => setSelected(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  )
}
