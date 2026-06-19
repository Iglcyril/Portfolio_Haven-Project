import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, Clock, AlertCircle, CheckCircle, Archive, BarChart2, UserPlus,
} from 'lucide-react'
import DashboardLayout from '../../layouts/DashboardLayout'
import {
  MOCK_DIRECTOR, MOCK_REFERENT, MOCK_TEAM, MOCK_PRO_REPORTS, ROLE_LABELS,
} from '../../services/professionalData'
import type { ProReport, TeamMember, ReportEvent, Severity } from '../../types'
import { SEVERITY_ORDER_MAP } from '../../constants/severity'
import { PRIMARY, type SortKey, type StatusFilter, severityKey } from './professional/constants'
import { ReportCard } from './professional/ReportCard'
import { SortBar } from './professional/SortBar'
import { DetailPanel } from './professional/DetailPanel'
import { TeamCard } from './professional/TeamCard'
import { AddMemberForm } from './professional/AddMemberForm'
import { StatsTab } from './professional/StatsTab'
import { TeamSidebarFooter } from './professional/TeamSidebarFooter'

// ─── Main dashboard ───────────────────────────────────────────────────────────

export default function ProfessionalDashboard() {
  const [searchParams] = useSearchParams()

  const role   = searchParams.get('role') ?? 'referent'
  const tab    = searchParams.get('tab')  ?? 'reports'
  const status = (searchParams.get('status') ?? 'active') as StatusFilter

  const isDirector = role === 'director'
  const user = isDirector ? MOCK_DIRECTOR : MOCK_REFERENT

  const [reports, setReports] = useState<ProReport[]>(MOCK_PRO_REPORTS)
  const [team, setTeam]       = useState<TeamMember[]>(MOCK_TEAM)
  const [selectedId, setSelectedId]       = useState<string | null>(null)
  const [sort, setSort]                   = useState<SortKey>('severity')
  const [showAddMember, setShowAddMember] = useState(false)

  const selectedReport = reports.find(r => r.id === selectedId) ?? null

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

  const handleArchive = (id: string) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: 'archived' as const } : r))
    setSelectedId(null)
  }

  const filtered = useMemo(() => {
    let list = reports
    if (status === 'active')     list = list.filter(r => r.status === 'active' && r.assignedTo)
    if (status === 'unassigned') list = list.filter(r => r.status === 'active' && !r.assignedTo)
    if (status === 'resolved')   list = list.filter(r => r.status === 'resolved')
    if (status === 'archived')   list = list.filter(r => r.status === 'archived')

    if (!isDirector && (status === 'active' || status === 'resolved'))
      list = list.filter(r => r.assignedTo === user.fullName)

    return [...list].sort((a, b) => {
      if (sort === 'severity') return SEVERITY_ORDER_MAP[severityKey(a)] - SEVERITY_ORDER_MAP[severityKey(b)]
      if (sort === 'date')     return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      if (sort === 'stage')    return b.progressStage - a.progressStage
      if (sort === 'referent') return (a.assignedTo ?? '').localeCompare(b.assignedTo ?? '')
      return 0
    })
  }, [reports, status, sort, isDirector, user.fullName])

  const activeCount     = isDirector
    ? reports.filter(r => r.status === 'active' && r.assignedTo).length
    : reports.filter(r => r.status === 'active' && r.assignedTo === user.fullName).length
  const unassignedCount = reports.filter(r => r.status === 'active' && !r.assignedTo).length

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

        {/* Stats tab */}
        {tab === 'stats' && (
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <StatsTab />
          </div>
        )}

        {/* Team tab */}
        {tab === 'team' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--c-text)' }}>
                Équipe Haven
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--c-text-muted)', background: 'var(--c-badge)', borderRadius: 20, padding: '4px 12px' }}>
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
                    style={{ height: '100%' }}
                  >
                    <TeamCard member={m} isDirector={isDirector} onRemove={handleRemoveMember} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Reports tab */}
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
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--c-text-muted)', background: 'var(--c-badge)', borderRadius: 20, padding: '4px 12px' }}>
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
                  onArchive={handleArchive}
                />
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
