import { useState, useEffect } from 'react'
import { X, Shield } from 'lucide-react'
import { motion } from 'framer-motion'
import type { TeamMember, ProfessionalRole } from '../../../types'
import { PRIMARY, ROLE_OPTIONS } from './constants'
import { updateTeamMemberCoRef } from '../../../services/professionalData'

const iStyle: React.CSSProperties = {
  background: 'var(--c-input-bg)',
  border: '1.5px solid var(--c-input-border)',
  borderRadius: 10, padding: '9px 12px',
  color: 'var(--c-text)', fontSize: 13,
  fontFamily: 'inherit', outline: 'none',
  width: '100%', boxSizing: 'border-box', minWidth: 0,
}

export function EditMemberForm({ member, onSave, onCancel, coRefCount, isDirector }: {
  member: TeamMember
  onSave: (updated: TeamMember) => void
  onCancel: () => void
  coRefCount: number
  isDirector: boolean
}) {
  const nameParts = member.fullName.split(' ')
  const [form, setForm] = useState({
    firstName: member.firstName ?? nameParts[0] ?? '',
    lastName:  member.lastName  ?? nameParts.slice(1).join(' ') ?? '',
    role:      member.role as ProfessionalRole,
    jobTitle:  member.jobTitle,
    phone:     member.phone,
    isCoRef:   member.isCoRef ?? false,
  })
  const [coRefError, setCoRefError] = useState<string | null>(null)
  const [coRefLoading, setCoRefLoading] = useState(false)

  const canSubmit = form.firstName.trim() && form.lastName.trim() && form.phone.trim()

  const toggleCoRef = async () => {
    if (!isDirector) return
    const next = !form.isCoRef
    if (next && coRefCount >= 2 && !form.isCoRef) {
      setCoRefError('Limite de 2 co-responsables atteinte')
      return
    }
    setCoRefLoading(true)
    setCoRefError(null)
    try {
      await updateTeamMemberCoRef(member.id, next)
      setForm(p => ({ ...p, isCoRef: next }))
    } catch (e) {
      setCoRefError(e instanceof Error ? e.message : 'Erreur')
    } finally {
      setCoRefLoading(false)
    }
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel])

  const submit = () => {
    if (!canSubmit) return
    const initials  = `${form.firstName[0]}${form.lastName[0]}`.toUpperCase()
    const roleLabel = ROLE_OPTIONS.find(r => r.key === form.role)?.label ?? form.role
    onSave({
      ...member,
      fullName:       `${form.firstName} ${form.lastName}`,
      firstName:      form.firstName,
      lastName:       form.lastName,
      avatarInitials: initials,
      role:           form.role,
      roleLabel,
      jobTitle:       form.jobTitle,
      phone:          form.phone,
      isCoRef:        form.isCoRef,
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      style={{
        background: 'var(--c-card)', border: `1.5px solid ${PRIMARY}`,
        borderRadius: 14, padding: '18px',
        boxShadow: 'var(--c-card-shadow)',
        height: '100%', boxSizing: 'border-box',
        position: 'relative',
      }}
    >
      <button
        onClick={onCancel}
        title="Fermer"
        style={{
          position: 'absolute', top: 12, right: 12,
          background: 'var(--c-badge)', border: 'none', borderRadius: 7,
          padding: 5, cursor: 'pointer', color: 'var(--c-text-muted)',
          display: 'flex', transition: 'background 0.15s, color 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(192,57,43,0.15)'; e.currentTarget.style.color = '#C0392B' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'var(--c-badge)'; e.currentTarget.style.color = 'var(--c-text-muted)' }}
      >
        <X size={13} />
      </button>

      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-text)', marginBottom: 14, paddingRight: 28 }}>
        Modifier le membre
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        <input placeholder="Prénom" value={form.firstName} onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))} style={iStyle} />
        <input placeholder="Nom" value={form.lastName} onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))} style={iStyle} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value as ProfessionalRole }))} style={iStyle}>
          {ROLE_OPTIONS.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}
        </select>
        <input placeholder="Poste" value={form.jobTitle} onChange={e => setForm(p => ({ ...p, jobTitle: e.target.value }))} style={iStyle} />
      </div>
      <input
        placeholder="Téléphone"
        value={form.phone}
        onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
        style={{ ...iStyle, marginBottom: 12 }}
      />
      {isDirector && member.role !== 'director' && (
        <div style={{ marginBottom: 12 }}>
          <button
            onClick={toggleCoRef}
            disabled={coRefLoading}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 12px', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit',
              background: form.isCoRef ? `${PRIMARY}12` : 'var(--c-badge)',
              border: `1.5px solid ${form.isCoRef ? PRIMARY : 'var(--c-border)'}`,
              color: form.isCoRef ? PRIMARY : 'var(--c-text-muted)',
              transition: 'all 0.2s',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, fontWeight: 700 }}>
              <Shield size={13} />
              Co-responsable Haven
            </span>
            <div style={{
              width: 36, height: 20, borderRadius: 10, position: 'relative',
              background: form.isCoRef ? PRIMARY : 'var(--c-border)',
              transition: 'background 0.2s', flexShrink: 0,
            }}>
              <div style={{
                position: 'absolute', top: 3, left: form.isCoRef ? 19 : 3,
                width: 14, height: 14, borderRadius: '50%', background: '#fff',
                transition: 'left 0.2s',
              }} />
            </div>
          </button>
          {coRefError && (
            <div style={{ fontSize: 11, color: '#C0392B', marginTop: 5, paddingLeft: 4 }}>
              {coRefError}
            </div>
          )}
        </div>
      )}
      <button
        onClick={submit}
        disabled={!canSubmit}
        style={{
          width: '100%', padding: '10px', borderRadius: 10,
          background: canSubmit ? PRIMARY : 'var(--c-badge)',
          color: canSubmit ? '#fff' : 'var(--c-text-muted)',
          border: 'none', fontSize: 13, fontWeight: 700, cursor: canSubmit ? 'pointer' : 'not-allowed',
          fontFamily: 'inherit', transition: 'background 0.2s',
        }}
      >
        Enregistrer
      </button>
    </motion.div>
  )
}
