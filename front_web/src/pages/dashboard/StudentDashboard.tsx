import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Clock, CheckCircle, Archive, AlertTriangle } from 'lucide-react'
import DashboardLayout from '../../layouts/DashboardLayout'
import { getStudentReports, getCurrentStudent, EMERGENCY_CONTACTS } from '../../services/reports'
import type { Report, User as UserType } from '../../types'
import { SEVERITY_ORDER } from '../../constants/severity'
import { ACCENT, type SortKey, type StatusFilter } from './student/constants'
import { StatsBar } from './student/StatsBar'
import { FilterBar } from './student/FilterBar'
import { ReportCard } from './student/ReportCard'
import { DetailPanel } from './student/DetailPanel'

// ─── Constants ────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { label: 'Signalements', href: '/dashboard/student', icon: <FileText size={16} /> },
  { label: 'Actifs',       href: '/dashboard/student?status=active',   icon: <Clock size={16} /> },
  { label: 'Résolus',      href: '/dashboard/student?status=resolved',  icon: <CheckCircle size={16} /> },
  { label: 'Archivés',     href: '/dashboard/student?status=archived',  icon: <Archive size={16} /> },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sortReports(reports: Report[], key: SortKey): Report[] {
  return [...reports].sort((a, b) => {
    if (key === 'date')     return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    if (key === 'severity') return SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity)
    return b.progressPercent - a.progressPercent
  })
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

  const handleArchive = (id: string) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: 'archived' as const } : r))
    setSelected(null)
  }

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
              onArchive={() => handleArchive(selected.id)}
            />
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  )
}
