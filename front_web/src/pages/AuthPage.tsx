import { useState, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { register, login } from '../services/authService'
import { useAuth } from '../contexts/AuthContext'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import {
  User, Mail, Lock, Eye, EyeOff, ArrowRight, Check, Calendar, X,
} from 'lucide-react'
import LegalModal from '../components/LegalModal'

// ─── Types & config ───────────────────────────────────────────────────────────

type Mode = 'login' | 'register'
type PortalKey = 'students' | 'parents' | 'professionals'

interface PortalConfig {
  label: string
  accent: string
  svgPrimary: string
  svgSecondary: string
  tagline: string
}

const PORTALS: Record<PortalKey, PortalConfig> = {
  students: {
    label: 'PORTAIL ÉTUDIANTS',
    accent: '#00A176',
    svgPrimary: '/assets/svg_screen_1.svg',
    svgSecondary: '/assets/svg_screen_2.svg',
    tagline: 'Un espace sûr pour signaler et être entendu.',
  },
  parents: {
    label: 'ESPACE PARENTS',
    accent: '#8ED4BF',
    svgPrimary: '/assets/svg_screen_2.svg',
    svgSecondary: '/assets/svg_screen_3.svg',
    tagline: 'Suivez la situation de votre enfant en temps réel.',
  },
  professionals: {
    label: 'ESPACE PROFESSIONNELS',
    accent: '#2EAB7B',
    svgPrimary: '/assets/svg_screen_3.svg',
    svgSecondary: '/assets/svg_screen_1.svg',
    tagline: 'Gérez et traitez les signalements de votre établissement.',
  },
}

const isValidPortal = (p?: string): p is PortalKey =>
  p === 'students' || p === 'parents' || p === 'professionals'

// Couleur fixe pour tous les éléments interactifs du formulaire
const FORM_ACCENT = '#2EAB7B'

// ─── Illustration panel ───────────────────────────────────────────────────────

function IllustrationPanel({ config }: { config: PortalConfig }) {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: '#102F2B',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {/* Ambient glow */}
      <div style={{
        position: 'absolute',
        width: 480,
        height: 480,
        borderRadius: '50%',
        background: config.accent,
        filter: 'blur(130px)',
        opacity: 0.18,
        pointerEvents: 'none',
      }} />

      {/* Anchor watermark */}
      <img
        src="/assets/anchor.png"
        alt=""
        style={{
          position: 'absolute',
          right: -220,
          bottom: -280,
          width: 780,
          opacity: 0.04,
          transform: 'rotate(0.8rad)',
          pointerEvents: 'none',
        }}
      />

      {/* Phone mockups */}
      <div style={{ position: 'relative', width: 420, height: 620 }}>
        {/* Secondary screen — behind, rotated */}
        <motion.div
          style={{
            position: 'absolute',
            right: -30,
            top: 80,
            width: 260,
            borderRadius: 32,
            overflow: 'hidden',
            border: '1.5px solid rgba(255,255,255,0.09)',
            boxShadow: '0 32px 64px rgba(0,0,0,0.50)',
            opacity: 0.75,
            zIndex: 1,
            transform: 'rotate(6deg)',
          }}
          animate={{ y: [0, 14, 0] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
        >
          <img src={config.svgSecondary} alt="" style={{ width: '100%', display: 'block' }} />
        </motion.div>

        {/* Primary screen — front */}
        <motion.div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: 310,
            borderRadius: 36,
            overflow: 'hidden',
            border: `1.5px solid ${config.accent}40`,
            boxShadow: `0 40px 80px rgba(0,0,0,0.60), 0 0 0 1px ${config.accent}25`,
            zIndex: 2,
            transform: 'rotate(-4deg)',
          }}
          animate={{ y: [0, -16, 0] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <img src={config.svgPrimary} alt="" style={{ width: '100%', display: 'block' }} />
        </motion.div>
      </div>

      {/* Bottom tagline */}
      <div style={{
        position: 'absolute',
        bottom: 48,
        left: 0,
        right: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        padding: '0 40px',
      }}>
        <img
          src="/assets/logo.PNG"
          alt="Haven"
          style={{ width: 38, height: 38, objectFit: 'contain', opacity: 0.75 }}
        />
        <p style={{
          fontFamily: "'Manrope', sans-serif",
          fontSize: '0.88rem',
          color: 'rgba(255,255,255,0.40)',
          lineHeight: 1.6,
          textAlign: 'center',
          margin: 0,
        }}>
          {config.tagline}
        </p>
      </div>
    </div>
  )
}

// ─── Date picker JJ / MM / AAAA (adapté de ParentOnboarding) ─────────────────

const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

function AuthDatePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const parts = value ? value.split('-') : ['', '', '']
  const [day,   setDay]   = useState(parts[2] ?? '')
  const [month, setMonth] = useState(parts[1] ?? '')
  const [year,  setYear]  = useState(parts[0] ?? '')

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
    setDay(v); emit(v, month, year)
    if (v.length === 2) monthRef.current?.focus()
  }
  const onMonth = (raw: string) => {
    const v = raw.replace(/\D/g, '').slice(0, 2)
    setMonth(v); emit(day, v, year)
    if (v.length === 2) yearRef.current?.focus()
  }
  const onYear = (raw: string) => {
    const v = raw.replace(/\D/g, '').slice(0, 4)
    setYear(v); emit(day, month, v)
  }

  const monthLabel = month && parseInt(month) >= 1 && parseInt(month) <= 12
    ? MONTHS_FR[parseInt(month) - 1]
    : null

  const seg: React.CSSProperties = {
    border: 'none', outline: 'none', background: 'transparent',
    fontFamily: "'Manrope', sans-serif", fontSize: '0.93rem',
    fontWeight: 500, color: '#0D2622', textAlign: 'center', padding: 0,
  }

  return (
    <div style={{
      padding: '11px 16px 13px',
      background: 'rgba(13,38,34,0.06)',
      borderRadius: 24,
      display: 'flex', flexDirection: 'column', gap: 7,
    }}>
      <span style={{
        fontFamily: "'Manrope', sans-serif", fontSize: '0.66rem', fontWeight: 700,
        letterSpacing: '0.10em', textTransform: 'uppercase', color: 'rgba(13,38,34,0.42)',
      }}>
        Date de naissance
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ color: 'rgba(13,38,34,0.40)', display: 'flex', flexShrink: 0 }}>
          <Calendar size={16} />
        </span>
        <input type="text" inputMode="numeric" maxLength={2} value={day}
          onChange={e => onDay(e.target.value)} placeholder="JJ"
          style={{ ...seg, width: 26 }} />
        <span style={{ color: 'rgba(13,38,34,0.35)', fontFamily: "'Manrope', sans-serif", fontSize: '0.93rem' }}>/</span>
        {monthLabel ? (
          <button onClick={() => { setMonth(''); setYear(''); onChange(''); setTimeout(() => monthRef.current?.focus(), 0) }}
            style={{
              border: 'none', borderRadius: 6, padding: '2px 8px',
              background: 'rgba(46,171,123,0.15)', color: '#2EAB7B',
              fontFamily: "'Manrope', sans-serif", fontSize: '0.84rem',
              fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
            }}>
            {monthLabel}
          </button>
        ) : (
          <input ref={monthRef} type="text" inputMode="numeric" maxLength={2} value={month}
            onChange={e => onMonth(e.target.value)} placeholder="MM"
            style={{ ...seg, width: 26 }} />
        )}
        <span style={{ color: 'rgba(13,38,34,0.35)', fontFamily: "'Manrope', sans-serif", fontSize: '0.93rem' }}>/</span>
        <input ref={yearRef} type="text" inputMode="numeric" maxLength={4} value={year}
          onChange={e => onYear(e.target.value)} placeholder="AAAA"
          style={{ ...seg, width: 42 }} />
        {value && (
          <button onClick={() => { setDay(''); setMonth(''); setYear(''); onChange('') }}
            style={{
              marginLeft: 'auto', width: 20, height: 20, borderRadius: '50%',
              border: 'none', background: 'rgba(13,38,34,0.08)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'rgba(13,38,34,0.42)', flexShrink: 0,
            }}>
            <X size={11} />
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Haven input ──────────────────────────────────────────────────────────────

interface InputProps {
  label: string
  placeholder: string
  type?: string
  value: string
  onChange: (v: string) => void
  icon: React.ReactNode
  suffix?: React.ReactNode
  max?: string
  min?: string
}

function HavenInput({ label, placeholder, type = 'text', value, onChange, icon, suffix, max, min }: InputProps) {
  return (
    <div style={{
      padding: '11px 16px 13px',
      background: 'rgba(13,38,34,0.06)',
      borderRadius: 24,
      display: 'flex',
      flexDirection: 'column',
      gap: 7,
    }}>
      <span style={{
        fontFamily: "'Manrope', sans-serif",
        fontSize: '0.66rem',
        fontWeight: 700,
        letterSpacing: '0.10em',
        textTransform: 'uppercase' as const,
        color: 'rgba(13,38,34,0.42)',
      }}>
        {label}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ color: 'rgba(13,38,34,0.40)', display: 'flex', flexShrink: 0 }}>
          {icon}
        </span>
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          max={max}
          min={min}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontFamily: "'Manrope', sans-serif",
            fontSize: '0.93rem',
            fontWeight: 500,
            color: '#0D2622',
            minWidth: 0,
            colorScheme: 'light',
          }}
        />
        {suffix}
      </div>
    </div>
  )
}

// ─── Routes per portal and mode ──────────────────────────────────────────────

const LOGIN_ROUTES: Record<PortalKey, string> = {
  students:      '/dashboard/student',
  parents:       '/dashboard/parent',
  professionals: '/dashboard/professional?role=director',
}

const REGISTER_ROUTES: Record<PortalKey, string> = {
  students:      '/dashboard/student',
  parents:       '/onboarding/parent',
  professionals: '/onboarding/professional',
}

// ─── Success screen ───────────────────────────────────────────────────────────

import { useEffect } from 'react'

function SuccessScreen({ mode, portalKey, loggedInRole }: { mode: Mode; portalKey: PortalKey; loggedInRole?: string | null }) {
  const navigate = useNavigate()
  const isRegister = mode === 'register'
  const destination = isRegister
    ? REGISTER_ROUTES[portalKey]
    : portalKey === 'professionals'
      ? `/dashboard/professional?role=${loggedInRole === 'ADMIN' ? 'director' : 'referent'}`
      : LOGIN_ROUTES[portalKey]

  useEffect(() => {
    const timer = setTimeout(() => navigate(destination), 1600)
    return () => clearTimeout(timer)
  }, [destination, navigate])

  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: '#F9F6F1',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 48,
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        style={{ textAlign: 'center', maxWidth: 360 }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 22 }}
          style={{
            width: 68,
            height: 68,
            borderRadius: '50%',
            background: FORM_ACCENT,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: `0 12px 32px ${FORM_ACCENT}45`,
          }}
        >
          <Check size={28} color="#fff" strokeWidth={2.5} />
        </motion.div>

        <h2 style={{
          fontFamily: "'Fraunces', Georgia, serif",
          fontSize: '2rem',
          fontWeight: 700,
          color: '#0D2622',
          letterSpacing: '-0.03em',
          marginBottom: 12,
          lineHeight: 1.1,
        }}>
          {isRegister ? 'Compte créé !' : 'Connexion réussie !'}
        </h2>
        <p style={{
          fontFamily: "'Manrope', sans-serif",
          fontSize: '0.93rem',
          color: 'rgba(13,38,34,0.55)',
          lineHeight: 1.75,
          marginBottom: 32,
        }}>
          {isRegister
            ? 'Votre espace vous attend. Redirection en cours…'
            : 'Vous êtes connecté. Redirection vers votre espace…'}
        </p>

        <motion.button
          onClick={() => navigate(destination)}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          style={{
            padding: '14px 32px',
            borderRadius: 9999,
            border: 'none',
            background: FORM_ACCENT,
            color: '#fff',
            fontFamily: "'Manrope', sans-serif",
            fontSize: '0.93rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: `0 8px 24px ${FORM_ACCENT}40`,
          }}
        >
          Accéder à mon espace →
        </motion.button>
      </motion.div>
    </div>
  )
}

// ─── Form panel ───────────────────────────────────────────────────────────────

interface FormPanelProps {
  mode: Mode
  config: PortalConfig
  portalKey: PortalKey
  onModeChange: (m: Mode) => void
}

function FormPanel({ mode, config, portalKey, onModeChange }: FormPanelProps) {
  const [name, setName]           = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName]   = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe]     = useState(false)
  const [submitted, setSubmitted]       = useState(false)
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState<string | null>(null)
  const [loggedInRole, setLoggedInRole] = useState<string | null>(null)
  const [legalModal, setLegalModal] = useState<'cgu' | 'privacy' | null>(null)

  const { setUser } = useAuth()
  const isRegister   = mode === 'register'
  const isStudent    = portalKey === 'students'

  async function handleSubmit() {
    setError(null)

    if (isRegister && isStudent && (!firstName.trim() || !lastName.trim() || !email.trim())) {
      setError('Prénom, nom et email sont obligatoires.')
      return
    }

    setLoading(true)
    try {
      let user
      if (isRegister) {
        let profile: { firstName: string; lastName: string; birthDate?: string }
        if (isStudent) {
          profile = { firstName: firstName.trim(), lastName: lastName.trim(), birthDate }
        } else {
          const parts = name.trim().split(/\s+/)
          profile = { firstName: parts[0] ?? '', lastName: (parts.slice(1).join(' ') || parts[0]) ?? '' }
        }
        user = await register(portalKey, email, password, rememberMe, profile)
      } else {
        user = await login(email, password, rememberMe)
      }
      setUser(user)
      setLoggedInRole(user.role)
      setSubmitted(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return <SuccessScreen mode={mode} portalKey={portalKey} loggedInRole={loggedInRole} />
  }

  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: '#F9F6F1',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'auto',
      position: 'relative',
    }}>
      {/* Anchor watermark */}
      <img
        src="/assets/anchorwhitemode.png"
        alt=""
        style={{
          position: 'absolute',
          right: -160,
          bottom: -200,
          width: 560,
          opacity: 0.055,
          transform: 'rotate(0.8rad)',
          pointerEvents: 'none',
        }}
      />

      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '40px 52px',
        maxWidth: 480,
        margin: '0 auto',
        width: '100%',
        position: 'relative',
        zIndex: 1,
        boxSizing: 'border-box',
      }}>
        {/* Top bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 44,
        }}>
          <Link
            to="/"
            style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}
          >
            <img
              src="/assets/logo.PNG"
              alt="Haven"
              style={{ width: 34, height: 34, objectFit: 'contain' }}
            />
            <span style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: '1.05rem',
              fontWeight: 700,
              color: '#0D2622',
              letterSpacing: '-0.02em',
            }}>
              Haven
            </span>
          </Link>

          {/* Portal badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '5px 12px',
            borderRadius: 9999,
            background: `${config.accent}14`,
          }}>
            <span style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: config.accent,
              display: 'inline-block',
              flexShrink: 0,
            }} />
            <span style={{
              fontFamily: "'Manrope', sans-serif",
              fontSize: '0.68rem',
              fontWeight: 700,
              letterSpacing: '0.09em',
              color: config.accent,
              whiteSpace: 'nowrap' as const,
            }}>
              {config.label}
            </span>
          </div>
        </div>

        {/* Header — animates on mode change */}
        <AnimatePresence mode="wait">
          <motion.div
            key={mode + '-header'}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            style={{ marginBottom: 32 }}
          >
            <h1 style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: 'clamp(1.9rem, 2.8vw, 2.6rem)',
              fontWeight: 700,
              color: '#0D2622',
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              marginBottom: 10,
            }}>
              {isRegister ? 'Créez votre compte.' : 'Bon retour.'}
            </h1>
            <p style={{
              fontFamily: "'Manrope', sans-serif",
              fontSize: '0.93rem',
              color: 'rgba(13,38,34,0.52)',
              lineHeight: 1.6,
              margin: 0,
            }}>
              {isRegister
                ? "C'est rapide, moins d'une minute."
                : 'Connectez-vous à votre espace Haven.'}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Tab toggle */}
        <div style={{
          display: 'flex',
          padding: 4,
          borderRadius: 9999,
          background: 'rgba(13,38,34,0.07)',
          marginBottom: 24,
        }}>
          {(['login', 'register'] as Mode[]).map(m => (
            <button
              key={m}
              onClick={() => onModeChange(m)}
              style={{
                flex: 1,
                padding: '10px 0',
                borderRadius: 9999,
                border: 'none',
                background: mode === m ? '#fff' : 'transparent',
                boxShadow: mode === m ? '0 2px 8px rgba(0,0,0,0.09)' : 'none',
                fontFamily: "'Manrope', sans-serif",
                fontSize: '0.87rem',
                fontWeight: mode === m ? 700 : 500,
                color: mode === m ? '#0D2622' : 'rgba(13,38,34,0.42)',
                cursor: 'pointer',
                transition: 'all 0.18s',
              }}
            >
              {m === 'login' ? 'Se connecter' : "S'inscrire"}
            </button>
          ))}
        </div>

        {/* Fields */}
        <AnimatePresence mode="wait">
          <motion.div
            key={mode + '-fields'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
          >
            {isRegister && isStudent && (
              <>
                <div style={{ display: 'flex', gap: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <HavenInput label="Prénom" placeholder="Prénom"
                      value={firstName} onChange={setFirstName} icon={<User size={16} />} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <HavenInput label="Nom" placeholder="Nom de famille"
                      value={lastName} onChange={setLastName} icon={<User size={16} />} />
                  </div>
                </div>
                <AuthDatePicker value={birthDate} onChange={setBirthDate} />
                <HavenInput label="Email" placeholder="votre@email.com"
                  type="email" value={email} onChange={setEmail} icon={<Mail size={16} />} />
              </>
            )}

            {isRegister && !isStudent && (
              <HavenInput
                label="Nom complet"
                placeholder="Votre nom"
                value={name}
                onChange={setName}
                icon={<User size={16} />}
              />
            )}

            {!(isRegister && isStudent) && (
              <HavenInput
                label="Email"
                placeholder="votre@email.com"
                type="email"
                value={email}
                onChange={setEmail}
                icon={<Mail size={16} />}
              />
            )}

            <HavenInput
              label="Mot de passe"
              placeholder="••••••••••"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={setPassword}
              icon={<Lock size={16} />}
              suffix={
                <button
                  onClick={() => setShowPassword(v => !v)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    color: 'rgba(13,38,34,0.38)',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {showPassword
                    ? <EyeOff size={16} />
                    : <Eye size={16} />}
                </button>
              }
            />

            {!isRegister && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: 4,
              }}>
                <button
                  onClick={() => setRememberMe(v => !v)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  <div style={{
                    width: 18,
                    height: 18,
                    borderRadius: 4,
                    border: `1.5px solid ${rememberMe ? FORM_ACCENT : 'rgba(13,38,34,0.22)'}`,
                    background: rememberMe ? FORM_ACCENT : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s',
                    flexShrink: 0,
                  }}>
                    {rememberMe && <Check size={11} color="#fff" strokeWidth={3} />}
                  </div>
                  <span style={{
                    fontFamily: "'Manrope', sans-serif",
                    fontSize: '0.83rem',
                    color: 'rgba(13,38,34,0.58)',
                    fontWeight: 500,
                  }}>
                    Se souvenir de moi
                  </span>
                </button>

                <button style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  fontFamily: "'Manrope', sans-serif",
                  fontSize: '0.83rem',
                  fontWeight: 600,
                  color: FORM_ACCENT,
                }}>
                  Mot de passe oublié ?
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Erreur */}
        {error && (
          <p style={{
            marginTop: 16,
            fontFamily: "'Manrope', sans-serif",
            fontSize: '0.83rem',
            color: '#E53935',
            textAlign: 'center',
            fontWeight: 600,
          }}>
            {error}
          </p>
        )}

        {/* CTA */}
        <motion.button
          onClick={handleSubmit}
          disabled={loading}
          whileHover={loading ? {} : { scale: 1.02, boxShadow: `0 14px 36px ${FORM_ACCENT}50` }}
          whileTap={loading ? {} : { scale: 0.98 }}
          style={{
            marginTop: 16,
            padding: '15px',
            borderRadius: 9999,
            border: 'none',
            background: loading ? `${FORM_ACCENT}80` : FORM_ACCENT,
            color: '#fff',
            fontFamily: "'Manrope', sans-serif",
            fontSize: '0.97rem',
            fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            boxShadow: `0 8px 24px ${FORM_ACCENT}38`,
          }}
        >
          {loading
            ? 'Chargement…'
            : isRegister ? 'Créer mon compte' : 'Se connecter'}
          {!loading && <ArrowRight size={16} strokeWidth={2.5} />}
        </motion.button>

        {/* Legal note */}
        <p style={{
          marginTop: 20,
          fontFamily: "'Manrope', sans-serif",
          fontSize: '0.76rem',
          color: 'rgba(13,38,34,0.35)',
          textAlign: 'center',
          lineHeight: 1.65,
        }}>
          En continuant, vous acceptez les{' '}
          <button
            onClick={() => setLegalModal('cgu')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              fontFamily: "'Manrope', sans-serif",
              fontSize: '0.76rem',
              fontWeight: 700,
              color: 'rgba(13,38,34,0.60)',
              textDecoration: 'underline',
            }}
          >
            CGU
          </button>
          {' '}et la{' '}
          <button
            onClick={() => setLegalModal('privacy')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              fontFamily: "'Manrope', sans-serif",
              fontSize: '0.76rem',
              fontWeight: 700,
              color: 'rgba(13,38,34,0.60)',
              textDecoration: 'underline',
            }}
          >
            Politique de confidentialité
          </button>
          {' '}de Haven.
        </p>
      </div>

      {legalModal && (
        <LegalModal type={legalModal} onClose={() => setLegalModal(null)} />
      )}
    </div>
  )
}

// ─── Auth Page ────────────────────────────────────────────────────────────────

export default function AuthPage() {
  const { portal } = useParams<{ portal: string }>()
  const [mode, setMode] = useState<Mode>('login')

  const portalKey: PortalKey = isValidPortal(portal) ? portal : 'students'
  const config = PORTALS[portalKey]
  const isRegister = mode === 'register'

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      overflow: 'hidden',
      fontFamily: "'Manrope', sans-serif",
    }}>
      <LayoutGroup id="auth-layout">
        {/* Form panel */}
        <motion.div
          layout
          style={{
            flex: isRegister ? '0 0 45%' : '0 0 55%',
            order: isRegister ? 0 : 1,
            minWidth: 0,
          }}
          transition={{ type: 'spring', stiffness: 280, damping: 34 }}
        >
          <FormPanel mode={mode} config={config} portalKey={portalKey} onModeChange={setMode} />
        </motion.div>

        {/* Illustration panel */}
        <motion.div
          layout
          style={{
            flex: isRegister ? '0 0 55%' : '0 0 45%',
            order: isRegister ? 1 : 0,
            minWidth: 0,
          }}
          transition={{ type: 'spring', stiffness: 280, damping: 34 }}
        >
          <IllustrationPanel config={config} />
        </motion.div>
      </LayoutGroup>
    </div>
  )
}
