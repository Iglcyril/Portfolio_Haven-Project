import { Pencil, Phone, Shield, Trash2 } from 'lucide-react'
import type { TeamMember } from '../../../types'
import { PRIMARY } from './constants'

export function TeamCard({ member, isDirector, onRemove, onEdit }: {
  member: TeamMember
  isDirector: boolean
  onRemove: (id: string) => void
  onEdit: (id: string) => void
}) {
  return (
    <div style={{
      background: 'var(--c-card)', border: '1px solid var(--c-border)',
      borderRadius: 14, padding: '16px',
      boxShadow: 'var(--c-card-shadow)',
      display: 'flex', flexDirection: 'column', gap: 12,
      position: 'relative',
      height: '100%', boxSizing: 'border-box',
    }}>
      {isDirector && (
        <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 6 }}>
          <button
            onClick={() => onEdit(member.id)}
            title="Modifier"
            style={{
              background: 'var(--c-badge)', border: 'none', borderRadius: 7,
              padding: 5, cursor: 'pointer', color: 'var(--c-text-muted)',
              display: 'flex', transition: 'background 0.15s, color 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = `${PRIMARY}22`
              e.currentTarget.style.color = PRIMARY
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'var(--c-badge)'
              e.currentTarget.style.color = 'var(--c-text-muted)'
            }}
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => onRemove(member.id)}
            title="Retirer du groupe"
            style={{
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
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingRight: isDirector ? 60 : 0 }}>
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
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
          <span style={{
            fontSize: 10, fontWeight: 700, color: PRIMARY, background: `${PRIMARY}18`,
            borderRadius: 6, padding: '2px 8px',
          }}>
            {member.roleLabel}
          </span>
          {member.isCoRef && (
            <span style={{
              fontSize: 10, fontWeight: 700, color: '#fff',
              background: PRIMARY, borderRadius: 6, padding: '2px 8px',
              display: 'flex', alignItems: 'center', gap: 3,
            }}>
              <Shield size={9} />
              CO-RESP.
            </span>
          )}
        </div>
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
