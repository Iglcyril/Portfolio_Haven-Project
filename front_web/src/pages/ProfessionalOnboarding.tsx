import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen, Heart, Shield, GraduationCap, Users, HelpCircle,
  ChevronRight, X, Check, ArrowLeft,
} from 'lucide-react'
import { ROLE_LABELS } from '../services/professionalData'
import type { ProfessionalRole } from '../types'
// ROLE_LABELS used for director label in step 2

// ─── Role cards config ────────────────────────────────────────────────────────

const ROLES: { key: ProfessionalRole; label: string; icon: React.ReactNode; description: string }[] = [
  { key: 'director',    label: 'Directeur·rice',         icon: <Shield size={24} />,      description: 'Accès complet, attribution et supervision' },
  { key: 'cpe',         label: 'CPE',                    icon: <Users size={24} />,        description: "Conseiller·ère Principal·e d'Éducation" },
  { key: 'nurse',       label: 'Infirmier·ère',          icon: <Heart size={24} />,        description: 'Suivi médical et soutien aux élèves' },
  { key: 'aed',         label: 'AED',                    icon: <Shield size={24} />,       description: "Assistant·e d'Éducation" },
  { key: 'teacher',     label: 'Professeur·e',           icon: <BookOpen size={24} />,     description: 'Référent·e classe et signalements pédagogiques' },
  { key: 'socialWorker', label: 'Assistant·e Social·e',  icon: <GraduationCap size={24} />, description: 'Accompagnement social et familial' },
  { key: 'other',       label: 'Autre',                  icon: <HelpCircle size={24} />,   description: 'Autre rôle au sein de l\'établissement' },
]

const HAVEN_PRIMARY = '#2EAB7B'
const HAVEN_DARK    = '#0D2622'

// ─── Co-responsible chip ──────────────────────────────────────────────────────

interface CoRef {
  id: string
  firstName: string
  lastName: string
  role: string
}

function CoRefForm({ onAdd, existing }: { onAdd: (c: CoRef) => void; existing: CoRef[] }) {
  const [f, setF] = useState({ firstName: '', lastName: '', role: '' })
  const canAdd = f.firstName.trim() && f.lastName.trim() && f.role.trim()
  const add = () => {
    if (!canAdd) return
    onAdd({ id: Date.now().toString(), ...f })
    setF({ firstName: '', lastName: '', role: '' })
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 8 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <input
          placeholder="Prénom"
          value={f.firstName}
          onChange={e => setF(p => ({ ...p, firstName: e.target.value }))}
          style={inputStyle}
        />
        <input
          placeholder="Nom"
          value={f.lastName}
          onChange={e => setF(p => ({ ...p, lastName: e.target.value }))}
          style={inputStyle}
        />
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <input
          placeholder="Poste / rôle"
          value={f.role}
          onChange={e => setF(p => ({ ...p, role: e.target.value }))}
          style={{ ...inputStyle, flex: 1 }}
        />
        <button
          onClick={add}
          disabled={!canAdd || existing.length >= 2}
          style={{
            background: canAdd && existing.length < 2 ? HAVEN_PRIMARY : '#3a4a45',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            padding: '0 18px',
            fontFamily: 'inherit',
            fontWeight: 600,
            fontSize: 14,
            cursor: canAdd && existing.length < 2 ? 'pointer' : 'not-allowed',
            opacity: existing.length >= 2 ? 0.5 : 1,
            transition: 'background 0.2s',
          }}
        >
          Ajouter
        </button>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ProfessionalOnboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState<1 | 2>(1)
  const [selectedRole, setSelectedRole] = useState<ProfessionalRole | null>(null)
  const [otherText, setOtherText] = useState('')
  const [coRefs, setCoRefs] = useState<CoRef[]>([])

  const isDirector = selectedRole === 'director'

  const handleRoleSelect = (role: ProfessionalRole) => {
    setSelectedRole(role)
    if (role === 'director') {
      setStep(2)
    }
  }

  const handleBack = () => {
    setStep(1)
    setCoRefs([])
  }

  const handleFinish = () => {
    const roleParam = isDirector ? 'director' : 'referent'
    navigate(`/dashboard/professional?role=${roleParam}`)
  }

  const canFinishStep1 = selectedRole !== null && (selectedRole !== 'other' || otherText.trim())

  return (
    <div style={{
      minHeight: '100vh',
      background: HAVEN_DARK,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>

      {/* Logo / title */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: 'center', marginBottom: 32 }}
      >
        <div style={{
          width: 52, height: 52, borderRadius: 14,
          background: HAVEN_PRIMARY,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 12px',
        }}>
          <Shield size={28} color="#fff" />
        </div>
        <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 700, margin: 0 }}>Haven</h1>
        <p style={{ color: '#8ED4BF', fontSize: 13, marginTop: 4 }}>Portail Professionnel</p>
      </motion.div>

      {/* Step indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28 }}>
        {[1, 2].map((n) => (
          <div
            key={n}
            style={{
              width: n === 2 && !isDirector ? 28 : 28,
              height: 6,
              borderRadius: 3,
              background: step >= n ? HAVEN_PRIMARY : 'rgba(255,255,255,0.15)',
              transition: 'background 0.3s',
              opacity: n === 2 && !isDirector ? 0.3 : 1,
            }}
          />
        ))}
      </div>

      {/* Card */}
      <motion.div
        layout
        style={{
          background: '#0F2720',
          borderRadius: 20,
          padding: '28px 24px',
          width: '100%',
          maxWidth: 540,
          boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
        }}
      >
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.22 }}
            >
              <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 700, margin: '0 0 4px' }}>
                Quel est votre rôle ?
              </h2>
              <p style={{ color: '#8ED4BF', fontSize: 13, margin: '0 0 20px' }}>
                Choisissez votre poste au sein de l'établissement
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {ROLES.map(r => (
                  <button
                    key={r.key}
                    onClick={() => handleRoleSelect(r.key)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      padding: '14px 16px',
                      background: selectedRole === r.key ? 'rgba(46,171,123,0.15)' : 'rgba(255,255,255,0.04)',
                      border: `1.5px solid ${selectedRole === r.key ? HAVEN_PRIMARY : 'rgba(255,255,255,0.08)'}`,
                      borderRadius: 12,
                      cursor: 'pointer',
                      textAlign: 'left',
                      width: '100%',
                      transition: 'border-color 0.2s, background 0.2s',
                      fontFamily: 'inherit',
                    }}
                  >
                    <div style={{
                      color: selectedRole === r.key ? HAVEN_PRIMARY : '#8ED4BF',
                      flexShrink: 0,
                      transition: 'color 0.2s',
                    }}>
                      {r.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>{r.label}</div>
                      <div style={{ color: '#8a9e98', fontSize: 12, marginTop: 1 }}>{r.description}</div>
                    </div>
                    {selectedRole === r.key ? (
                      <div style={{
                        width: 22, height: 22, borderRadius: '50%',
                        background: HAVEN_PRIMARY,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <Check size={13} color="#fff" />
                      </div>
                    ) : (
                      <ChevronRight size={16} color="#3a5248" style={{ flexShrink: 0 }} />
                    )}
                  </button>
                ))}
              </div>

              {/* "Autre" text field */}
              <AnimatePresence>
                {selectedRole === 'other' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{ overflow: 'hidden', marginTop: 12 }}
                  >
                    <input
                      placeholder="Précisez votre rôle…"
                      value={otherText}
                      onChange={e => setOtherText(e.target.value)}
                      autoFocus
                      style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Continue button (non-director) */}
              <AnimatePresence>
                {selectedRole && selectedRole !== 'director' && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    onClick={handleFinish}
                    disabled={!canFinishStep1}
                    style={{
                      marginTop: 20,
                      width: '100%',
                      padding: '14px',
                      background: canFinishStep1 ? HAVEN_PRIMARY : '#2a3e38',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 12,
                      fontSize: 15,
                      fontWeight: 700,
                      cursor: canFinishStep1 ? 'pointer' : 'not-allowed',
                      fontFamily: 'inherit',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      transition: 'background 0.2s',
                    }}
                  >
                    Accéder au portail
                    <ChevronRight size={18} />
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ duration: 0.22 }}
            >
              <button
                onClick={handleBack}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  color: '#8ED4BF', background: 'none', border: 'none',
                  cursor: 'pointer', fontSize: 13, fontFamily: 'inherit',
                  marginBottom: 20, padding: 0,
                }}
              >
                <ArrowLeft size={16} />
                Retour
              </button>

              <div style={{
                display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4,
              }}>
                <div style={{
                  background: 'rgba(46,171,123,0.15)',
                  borderRadius: 10, padding: '6px 12px',
                  color: HAVEN_PRIMARY, fontSize: 13, fontWeight: 600,
                }}>
                  {ROLE_LABELS['director']}
                </div>
              </div>

              <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 700, margin: '0 0 4px' }}>
                Co-responsables Haven
              </h2>
              <p style={{ color: '#8ED4BF', fontSize: 13, margin: '0 0 20px' }}>
                Désignez jusqu'à 2 personnes co-responsables de l'outil Haven dans votre établissement (optionnel)
              </p>

              <CoRefForm onAdd={c => setCoRefs(p => [...p, c])} existing={coRefs} />

              {/* Co-ref chips */}
              <AnimatePresence>
                {coRefs.map(c => (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      background: 'rgba(46,171,123,0.1)',
                      border: '1px solid rgba(46,171,123,0.25)',
                      borderRadius: 10, padding: '10px 14px',
                      marginBottom: 8,
                    }}
                  >
                    <div style={{
                      width: 34, height: 34, borderRadius: '50%',
                      background: HAVEN_PRIMARY,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontWeight: 700, fontSize: 13, flexShrink: 0,
                    }}>
                      {c.firstName[0]}{c.lastName[0]}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>
                        {c.firstName} {c.lastName}
                      </div>
                      <div style={{ color: '#8ED4BF', fontSize: 12 }}>{c.role}</div>
                    </div>
                    <button
                      onClick={() => setCoRefs(p => p.filter(x => x.id !== c.id))}
                      style={{
                        background: 'rgba(255,255,255,0.1)', border: 'none',
                        borderRadius: 6, padding: 4, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#8a9e98',
                      }}
                    >
                      <X size={14} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>

              {coRefs.length >= 2 && (
                <p style={{ color: '#8a9e98', fontSize: 12, marginBottom: 12 }}>
                  Maximum 2 co-responsables atteint
                </p>
              )}

              <button
                onClick={handleFinish}
                style={{
                  marginTop: 20,
                  width: '100%',
                  padding: '14px',
                  background: HAVEN_PRIMARY,
                  color: '#fff',
                  border: 'none',
                  borderRadius: 12,
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                Accéder au portail directeur
                <ChevronRight size={18} />
              </button>

              <button
                onClick={handleFinish}
                style={{
                  marginTop: 8,
                  width: '100%',
                  padding: '12px',
                  background: 'transparent',
                  color: '#8ED4BF',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12,
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                Passer cette étape
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

// ─── Shared styles ─────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)',
  border: '1.5px solid rgba(255,255,255,0.1)',
  borderRadius: 10,
  padding: '11px 14px',
  color: '#fff',
  fontSize: 14,
  fontFamily: "'Inter', system-ui, sans-serif",
  outline: 'none',
}
