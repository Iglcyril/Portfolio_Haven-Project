import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'
import { getStats } from '../../../services/professionalData'
import type { RealStats } from '../../../services/professionalData'
import { CATEGORIE_LABELS } from '../../../services/reportMappings'
import { PRIMARY } from './constants'

type Period = 'weekly' | 'monthly' | 'yearly'

export function StatsTab() {
  const [period, setPeriod]   = useState<Period>('monthly')
  const [stats, setStats]     = useState<RealStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    getStats()
      .then(s => { setStats(s); setError(null) })
      .catch(() => setError('Impossible de charger les statistiques.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--c-text-muted)', fontSize: 14 }}>
        Chargement des statistiques…
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#C0392B', fontSize: 14 }}>
        {error ?? 'Erreur inconnue'}
      </div>
    )
  }

  const periodData = stats[period]
  const maxCatCount = Math.max(...stats.byCategory.map(c => c.count), 1)

  return (
    <div style={{ padding: '24px 20px', maxWidth: 800, margin: '0 auto' }}>

      {/* Header + period selector */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
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

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          {
            label: 'Signalements total',
            value: String(stats.total),
          },
          {
            label: 'Taux de prise en charge',
            value: `${stats.tauxPriseEnCharge}%`,
          },
          {
            label: 'Délai moyen de résolution',
            value: stats.avgResolutionDays !== null ? `${stats.avgResolutionDays}j` : '—',
          },
        ].map(kpi => (
          <div
            key={kpi.label}
            style={{
              background: 'var(--c-card)', borderRadius: 12, padding: '16px 18px',
              border: '1px solid var(--c-border)', boxShadow: 'var(--c-card-shadow)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 24, fontWeight: 800, color: PRIMARY, lineHeight: 1.2 }}>{kpi.value}</div>
            <div style={{ fontSize: 11, color: 'var(--c-text-muted)', marginTop: 4, fontWeight: 600 }}>{kpi.label}</div>
          </div>
        ))}
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
          <BarChart data={periodData} barSize={28} barGap={2}>
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

      {/* Donut + categories */}
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
                data={stats.bySeverity}
                cx={60} cy={60}
                innerRadius={38} outerRadius={60}
                dataKey="value" strokeWidth={0}
              >
                {stats.bySeverity.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {stats.bySeverity.map(s => (
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
            PAR CATÉGORIE
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {stats.byCategory.slice(0, 6).map(c => (
              <div key={c.category}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: 12, color: 'var(--c-text-sub)', fontWeight: 600 }}>
                    {CATEGORIE_LABELS[c.category] ?? c.category}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--c-text)', fontWeight: 700 }}>{c.count}</span>
                </div>
                <div style={{ height: 4, borderRadius: 2, background: 'var(--c-progress-track)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 2, background: PRIMARY,
                    width: `${(c.count / maxCatCount) * 100}%`,
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
