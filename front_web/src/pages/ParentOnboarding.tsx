import { useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, ArrowRight, User, BookOpen, Calendar } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChildEntry {
  firstName: string
  lastName: string
  className: string
  dateOfBirth: string   // YYYY-MM-DD or ''
}

// ─── Field component ──────────────────────────────────────────────────────────

function Field({
  label,
  placeholder,
  value,
  onChange,
  icon,
}: {
  label: string
  placeholder: string
  value: string
  onChange: (v: string) => void
  icon: React.ReactNode
}) {
  return (
    <div style={{
      padding: '11px 16px 13px',
      background: 'var(--c-input-bg)',
      borderRadius: 16,
      border: '1px solid var(--c-input-border)',
      display: 'flex',
      flexDirection: 'column',
      gap: 5,
      transition: 'background 0.25s, border-color 0.25s',
    }}>
      <span style={{
        fontFamily: "'Manrope', sans-serif",
        fontSize: '0.64rem',
        fontWeight: 700,
        letterSpacing: '0.10em',
        textTransform: 'uppercase' as const,
        color: 'var(--c-text-muted)',
      }}>
        {label}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ color: 'var(--c-icon)', display: 'flex', flexShrink: 0 }}>{icon}</span>
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="haven-search-input"
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontFamily: "'Manrope', sans-serif",
            fontSize: '0.92rem',
            fontWeight: 500,
            color: 'var(--c-text)',
            minWidth: 0,
          }}
        />
      </div>
    </div>
  )
}

// ─── Custom date picker (JJ / MM / AAAA) ─────────────────────────────────────

const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

function DatePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  // Parse stored YYYY-MM-DD
  const parts  = value ? value.split('-') : ['', '', '']
  const initY  = parts[0] ?? ''
  const initM  = parts[1] ?? ''
  const initD  = parts[2] ?? ''

  const [day,   setDay]   = useState(initD)
  const [month, setMonth] = useState(initM)
  const [year,  setYear]  = useState(initY)

  const monthRef = useRef<HTMLInputElement>(null)
  const yearRef  = useRef<HTMLInputElement>(null)

  const emit = (d: string, m: string, y: string) => {
    if (d && m && y && y.length === 4) {
      onChange(`${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`)
    } else {
      onChange('')
    }
  }

  const onDay = (raw: string) => {
    const v = raw.replace(/\D/g, '').slice(0, 2)
    setDay(v)
    emit(v, month, year)
    if (v.length === 2) monthRef.current?.focus()
  }

  const onMonth = (raw: string) => {
    const v = raw.replace(/\D/g, '').slice(0, 2)
    setMonth(v)
    emit(day, v, year)
    if (v.length === 2) yearRef.current?.focus()
  }

  const onYear = (raw: string) => {
    const v = raw.replace(/\D/g, '').slice(0, 4)
    setYear(v)
    emit(day, month, v)
  }

  const segStyle: React.CSSProperties = {
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontFamily: "'Manrope', sans-serif",
    fontSize: '0.92rem',
    fontWeight: 500,
    color: 'var(--c-text)',
    textAlign: 'center' as const,
    padding: 0,
  }

  const sep: React.CSSProperties = {
    fontFamily: "'Manrope', sans-serif",
    fontSize: '0.92rem',
    fontWeight: 500,
    color: 'var(--c-text-muted)',
    userSelect: 'none' as const,
  }

  // Display the resolved month name when month is filled
  const monthLabel = month && parseInt(month) >= 1 && parseInt(month) <= 12
    ? MONTHS_FR[parseInt(month) - 1]
    : null

  return (
    <div style={{
      padding: '11px 16px 13px',
      background: 'var(--c-input-bg)',
      borderRadius: 16,
      border: '1px solid var(--c-input-border)',
      display: 'flex',
      flexDirection: 'column',
      gap: 5,
      transition: 'background 0.25s, border-color 0.25s',
    }}>
      <span style={{
        fontFamily: "'Manrope', sans-serif",
        fontSize: '0.64rem',
        fontWeight: 700,
        letterSpacing: '0.10em',
        textTransform: 'uppercase' as const,
        color: 'var(--c-text-muted)',
      }}>
        Date de naissance <span style={{ fontWeight: 400, opacity: 0.6 }}>(optionnel)</span>
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ color: 'var(--c-icon)', display: 'flex', flexShrink: 0 }}>
          <Calendar size={15} />
        </span>

        {/* Day */}
        <input
          type="text"
          inputMode="numeric"
          maxLength={2}
          value={day}
          onChange={e => onDay(e.target.value)}
          placeholder="JJ"
          className="haven-search-input"
          style={{ ...segStyle, width: 26 }}
        />
        <span style={sep}>/</span>

        {/* Month — shows resolved name when filled */}
        {monthLabel ? (
          <button
            onClick={() => { setMonth(''); setYear(''); onChange(''); setTimeout(() => monthRef.current?.focus(), 0) }}
            style={{
              border: 'none',
              borderRadius: 6,
              padding: '2px 8px',
              background: 'rgba(46,171,123,0.15)',
              color: '#2EAB7B',
              fontFamily: "'Manrope', sans-serif",
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap' as const,
            }}
          >
            {monthLabel}
          </button>
        ) : (
          <input
            ref={monthRef}
            type="text"
            inputMode="numeric"
            maxLength={2}
            value={month}
            onChange={e => onMonth(e.target.value)}
            placeholder="MM"
            className="haven-search-input"
            style={{ ...segStyle, width: 26 }}
          />
        )}

        <span style={sep}>/</span>

        {/* Year */}
        <input
          ref={yearRef}
          type="text"
          inputMode="numeric"
          maxLength={4}
          value={year}
          onChange={e => onYear(e.target.value)}
          placeholder="AAAA"
          className="haven-search-input"
          style={{ ...segStyle, width: 42 }}
        />

        {/* Clear button */}
        {value && (
          <button
            onClick={() => { setDay(''); setMonth(''); setYear(''); onChange('') }}
            style={{
              marginLeft: 'auto',
              width: 20,
              height: 20,
              borderRadius: '50%',
              border: 'none',
              background: 'var(--c-badge)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--c-icon)',
              flexShrink: 0,
            }}
          >
            <X size={11} />
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Child chip ───────────────────────────────────────────────────────────────

function ChildChip({ child, onRemove }: { child: ChildEntry; onRemove: () => void }) {
  const initials = `${child.firstName[0]}${child.lastName[0]}`.toUpperCase()
  const dob = child.dateOfBirth
    ? new Date(child.dateOfBirth).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
    : ''

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -12 }}
      transition={{ duration: 0.2 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 14px',
        borderRadius: 14,
        background: 'var(--c-card)',
        border: '1px solid rgba(46,171,123,0.25)',
        boxShadow: 'var(--c-card-shadow)',
        transition: 'background 0.25s',
      }}
    >
      <div style={{
        width: 36,
        height: 36,
        borderRadius: '50%',
        background: '#2EAB7B',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Manrope', sans-serif",
        fontSize: '0.78rem',
        fontWeight: 700,
        color: '#fff',
        flexShrink: 0,
      }}>
        {initials}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: "'Manrope', sans-serif",
          fontSize: '0.88rem',
          fontWeight: 700,
          color: 'var(--c-text)',
        }}>
          {child.firstName} {child.lastName}
        </div>
        <div style={{
          fontFamily: "'Manrope', sans-serif",
          fontSize: '0.72rem',
          color: 'var(--c-text-muted)',
        }}>
          {child.className}{dob ? ` · Né(e) le ${dob}` : ''}
        </div>
      </div>
      <button
        onClick={onRemove}
        style={{
          width: 26,
          height: 26,
          borderRadius: '50%',
          background: 'var(--c-badge)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--c-icon)',
          flexShrink: 0,
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,107,107,0.15)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'var(--c-badge)')}
      >
        <X size={13} />
      </button>
    </motion.div>
  )
}

// ─── Onboarding page ──────────────────────────────────────────────────────────

const EMPTY: ChildEntry = { firstName: '', lastName: '', className: '', dateOfBirth: '' }

export default function ParentOnboarding() {
  const navigate = useNavigate()
  const { isDark } = useTheme()

  const [form, setForm]       = useState<ChildEntry>(EMPTY)
  const [children, setChildren] = useState<ChildEntry[]>([])

  // Date is optional — only firstName + lastName + className are required
  const canAdd  = !!(form.firstName.trim() && form.lastName.trim() && form.className.trim())
  const canStart = children.length > 0

  const addChild = () => {
    if (!canAdd) return
    setChildren(prev => [...prev, form])
    setForm(EMPTY)
  }

  const removeChild = (i: number) =>
    setChildren(prev => prev.filter((_, idx) => idx !== i))

  const vars = (isDark ? {
    '--c-bg':           '#0F1E1B',
    '--c-card':         'rgba(255,255,255,0.04)',
    '--c-card-shadow':  'none',
    '--c-border':       'rgba(255,255,255,0.07)',
    '--c-text':         '#ffffff',
    '--c-text-muted':   'rgba(255,255,255,0.35)',
    '--c-icon':         'rgba(255,255,255,0.38)',
    '--c-input-bg':     'rgba(255,255,255,0.06)',
    '--c-input-border': 'rgba(255,255,255,0.09)',
    '--c-badge':        'rgba(255,255,255,0.10)',
  } : {
    '--c-bg':           '#F3EFE8',
    '--c-card':         '#FFFFFF',
    '--c-card-shadow':  '0 1px 3px rgba(13,38,34,0.06), 0 2px 8px rgba(13,38,34,0.03)',
    '--c-border':       'rgba(13,38,34,0.09)',
    '--c-text':         '#102F2B',
    '--c-text-muted':   'rgba(13,38,34,0.40)',
    '--c-icon':         'rgba(13,38,34,0.42)',
    '--c-input-bg':     'rgba(13,38,34,0.05)',
    '--c-input-border': 'rgba(13,38,34,0.10)',
    '--c-badge':        'rgba(13,38,34,0.08)',
  }) as React.CSSProperties

  return (
    <div style={{
      ...vars,
      minHeight: '100vh',
      background: 'var(--c-bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '32px 16px 48px',
      transition: 'background 0.28s ease',
    }}>
      {/* Logo */}
      <div style={{ width: '100%', maxWidth: 520, marginBottom: 40 }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <img src="/assets/logo.PNG" alt="Haven" style={{ width: 32, height: 32, objectFit: 'contain' }} />
          <span style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontSize: '1.05rem',
            fontWeight: 700,
            color: 'var(--c-text)',
          }}>
            Haven
          </span>
        </Link>
      </div>

      <div style={{ width: '100%', maxWidth: 520 }}>
        <h1 style={{
          fontFamily: "'Fraunces', Georgia, serif",
          fontSize: 'clamp(2rem, 5vw, 2.8rem)',
          fontWeight: 800,
          color: 'var(--c-text)',
          letterSpacing: '-0.04em',
          lineHeight: 1.1,
          marginBottom: 8,
        }}>
          Bienvenue sur Haven !
        </h1>
        <p style={{
          fontFamily: "'Fraunces', Georgia, serif",
          fontSize: '1.05rem',
          fontWeight: 700,
          color: '#2EAB7B',
          letterSpacing: '-0.01em',
          marginBottom: 36,
        }}>
          Application de lutte contre le harcèlement.
        </p>

        <p style={{
          fontFamily: "'Manrope', sans-serif",
          fontSize: '0.95rem',
          fontWeight: 700,
          color: 'var(--c-text)',
          marginBottom: 16,
        }}>
          Veuillez nommer votre ou vos enfant(s) :
        </p>

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <Field
              label="Prénom"
              placeholder="Prénom"
              value={form.firstName}
              onChange={v => setForm(f => ({ ...f, firstName: v }))}
              icon={<User size={15} />}
            />
            <Field
              label="Nom"
              placeholder="Nom de famille"
              value={form.lastName}
              onChange={v => setForm(f => ({ ...f, lastName: v }))}
              icon={<User size={15} />}
            />
          </div>
          <Field
            label="Classe"
            placeholder="ex : 3ème B, Terminale A…"
            value={form.className}
            onChange={v => setForm(f => ({ ...f, className: v }))}
            icon={<BookOpen size={15} />}
          />
          <DatePicker
            value={form.dateOfBirth}
            onChange={v => setForm(f => ({ ...f, dateOfBirth: v }))}
          />
        </div>

        {/* Add button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 28 }}>
          <motion.button
            onClick={addChild}
            whileHover={canAdd ? { scale: 1.03 } : {}}
            whileTap={canAdd ? { scale: 0.97 } : {}}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 20px',
              borderRadius: 9999,
              border: 'none',
              background: canAdd ? '#2EAB7B' : 'var(--c-badge)',
              color: canAdd ? '#fff' : 'var(--c-text-muted)',
              fontFamily: "'Manrope', sans-serif",
              fontSize: '0.88rem',
              fontWeight: 700,
              cursor: canAdd ? 'pointer' : 'not-allowed',
              boxShadow: canAdd ? '0 6px 18px rgba(46,171,123,0.35)' : 'none',
              transition: 'background 0.2s, box-shadow 0.2s, color 0.2s',
            }}
          >
            <Plus size={16} />
            Ajouter
          </motion.button>
        </div>

        {/* Children list */}
        <AnimatePresence>
          {children.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 40 }}
            >
              {children.map((child, i) => (
                <ChildChip key={i} child={child} onRemove={() => removeChild(i)} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <motion.button
            onClick={() => canStart && navigate('/dashboard/parent')}
            whileHover={canStart ? { scale: 1.02 } : {}}
            whileTap={canStart ? { scale: 0.98 } : {}}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '15px 32px',
              borderRadius: 9999,
              border: 'none',
              background: canStart ? '#2EAB7B' : 'var(--c-badge)',
              color: canStart ? '#fff' : 'var(--c-text-muted)',
              fontFamily: "'Manrope', sans-serif",
              fontSize: '0.97rem',
              fontWeight: 700,
              cursor: canStart ? 'pointer' : 'not-allowed',
              boxShadow: canStart ? '0 8px 24px rgba(46,171,123,0.38)' : 'none',
              transition: 'background 0.2s, box-shadow 0.2s, color 0.2s',
            }}
          >
            Commencer
            <ArrowRight size={16} strokeWidth={2.5} />
          </motion.button>
        </div>
      </div>
    </div>
  )
}
