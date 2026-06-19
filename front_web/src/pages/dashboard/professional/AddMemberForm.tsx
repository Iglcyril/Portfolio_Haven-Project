import { useState } from 'react'
import { motion } from 'framer-motion'
import type { TeamMember, ProfessionalRole } from '../../../types'
import { PRIMARY, ROLE_OPTIONS } from './constants'

const iStyle: React.CSSProperties = {
  background: 'var(--c-input-bg)',
  border: '1.5px solid var(--c-input-border)',
  borderRadius: 10, padding: '9px 12px',
  color: 'var(--c-text)', fontSize: 13,
  fontFamily: 'inherit', outline: 'none',
}

export function AddMemberForm({ onAdd, onCancel }: {
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
    const initials  = `${form.firstName[0]}${form.lastName[0]}`.toUpperCase()
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
