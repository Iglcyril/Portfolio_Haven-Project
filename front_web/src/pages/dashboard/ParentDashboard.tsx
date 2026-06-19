import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, CheckCircle, Archive } from 'lucide-react'
import DashboardLayout from '../../layouts/DashboardLayout'
import {
  getParentChildren, getParentReports, getCurrentParent,
  ESTABLISHMENT_CONTACTS,
} from '../../services/parentData'
import type { Child, ParentReport, User as UserType } from '../../types'
import { SEVERITY_ORDER } from '../../constants/severity'
import { ACCENT, type SortKey, type StatusFilter } from './parent/constants'
import { StatsBar } from './parent/StatsBar'
import { FilterBar } from './parent/FilterBar'
import { ReportCard } from './parent/ReportCard'
import { DetailPanel } from './parent/DetailPanel'
import { EstablishmentPanel } from './parent/EstablishmentPanel'
import { ChildSelector } from './parent/ChildSelector'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sortReports(reports: ParentReport[], key: SortKey) {
  return [...reports].sort((a, b) => {
    if (key === 'date')     return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    if (key === 'severity') return SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity)
    return b.progressPercent - a.progressPercent
  })
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ParentDashboard() {
  const [allReports, setAllReports] = useState<ParentReport[]>([])
  const [children, setChildren]     = useState<Child[]>([])
  const [user, setUser]             = useState<UserType | null>(null)
  const [selected, setSelected]     = useState<ParentReport | null>(null)
  const [search, setSearch]         = useState('')
  const [sort, setSort]             = useState<SortKey>('date')

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

  const handleArchive = (id: string) => {
    setAllReports(prev => prev.map(r => r.id === id ? { ...r, status: 'archived' as const } : r))
    setSelected(null)
  }

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
              onArchive={() => handleArchive(selected.id)}
            />
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  )
}
