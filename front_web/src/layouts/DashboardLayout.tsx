import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Phone, Sun, Moon, LogOut } from 'lucide-react'
import { useIsMobile, useIsTablet } from '../hooks/useMediaQuery'
import { useTheme } from '../contexts/ThemeContext'
import type { User, EmergencyContact } from '../types'

// ─── Theme CSS variables ───────────────────────────────────────────────────────

function themeVars(isDark: boolean): React.CSSProperties {
  return (isDark ? {
    '--c-bg':             '#0F1E1B',
    '--c-card':           'rgba(255,255,255,0.035)',
    '--c-card-hover':     'rgba(255,255,255,0.06)',
    '--c-card-selected':  'rgba(0,161,118,0.10)',
    '--c-card-shadow':    'none',
    '--c-border':         'rgba(255,255,255,0.07)',
    '--c-panel':          '#0D2622',
    '--c-text':           '#ffffff',
    '--c-text-sub':       'rgba(255,255,255,0.55)',
    '--c-text-muted':     'rgba(255,255,255,0.30)',
    '--c-icon':           'rgba(255,255,255,0.38)',
    '--c-input-bg':       'rgba(255,255,255,0.05)',
    '--c-input-border':   'rgba(255,255,255,0.09)',
    '--c-progress-track': 'rgba(255,255,255,0.08)',
    '--c-badge':          'rgba(255,255,255,0.10)',
    '--c-divider':        'rgba(255,255,255,0.07)',
    '--c-archived':       'rgba(255,255,255,0.38)',
    '--c-topbar':         '#0D2622',
    '--c-topbar-border':  'rgba(255,255,255,0.07)',
  } : {
    '--c-bg':             '#F3EFE8',
    '--c-card':           '#FFFFFF',
    '--c-card-hover':     'rgba(13,38,34,0.03)',
    '--c-card-selected':  'rgba(0,161,118,0.06)',
    '--c-card-shadow':    '0 1px 3px rgba(13,38,34,0.06), 0 2px 8px rgba(13,38,34,0.03)',
    '--c-border':         'rgba(13,38,34,0.09)',
    '--c-panel':          '#FFFFFF',
    '--c-text':           '#102F2B',
    '--c-text-sub':       'rgba(13,38,34,0.60)',
    '--c-text-muted':     'rgba(13,38,34,0.38)',
    '--c-icon':           'rgba(13,38,34,0.42)',
    '--c-input-bg':       'rgba(13,38,34,0.05)',
    '--c-input-border':   'rgba(13,38,34,0.10)',
    '--c-progress-track': 'rgba(13,38,34,0.09)',
    '--c-badge':          'rgba(13,38,34,0.08)',
    '--c-divider':        'rgba(13,38,34,0.08)',
    '--c-archived':       'rgba(13,38,34,0.42)',
    '--c-topbar':         '#EBE6DF',
    '--c-topbar-border':  'rgba(13,38,34,0.09)',
  }) as React.CSSProperties
}

// ─── Nav item type ─────────────────────────────────────────────────────────────

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  badge?: number
}

interface Props {
  user: User
  navItems: NavItem[]
  emergencyContacts: EmergencyContact[]
  children: React.ReactNode
  accentColor?: string
}

// ─── Theme toggle pill ────────────────────────────────────────────────────────

function ThemeToggle({ isDark, onToggle }: { isDark: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '9px 12px',
        borderRadius: 11,
        border: 'none',
        background: 'rgba(255,255,255,0.05)',
        cursor: 'pointer',
        transition: 'background 0.15s',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.09)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
    >
      <span style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontFamily: "'Manrope', sans-serif",
        fontSize: '0.82rem',
        fontWeight: 600,
        color: 'rgba(255,255,255,0.55)',
      }}>
        {isDark ? <Moon size={14} /> : <Sun size={14} />}
        {isDark ? 'Mode sombre' : 'Mode clair'}
      </span>

      {/* Toggle pill */}
      <div style={{
        width: 46,
        height: 26,
        borderRadius: 9999,
        background: isDark ? 'rgba(255,255,255,0.12)' : '#2EAB7B',
        position: 'relative',
        flexShrink: 0,
        transition: 'background 0.25s ease',
      }}>
        <motion.div
          animate={{ x: isDark ? 2 : 22 }}
          transition={{ type: 'spring', stiffness: 500, damping: 36 }}
          style={{
            position: 'absolute',
            top: 4,
            width: 18,
            height: 18,
            borderRadius: '50%',
            background: '#fff',
            boxShadow: '0 1px 4px rgba(0,0,0,0.28)',
          }}
        />
      </div>
    </button>
  )
}

// ─── Logout button ────────────────────────────────────────────────────────────

function LogoutButton() {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => navigate('/')}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        padding: '9px 12px',
        borderRadius: 11,
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        fontFamily: "'Manrope', sans-serif",
        fontSize: '0.85rem',
        fontWeight: 500,
        color: 'rgba(255,255,255,0.35)',
        transition: 'color 0.15s, background 0.15s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.color = '#FF6B6B'
        e.currentTarget.style.background = 'rgba(255,107,107,0.08)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.color = 'rgba(255,255,255,0.35)'
        e.currentTarget.style.background = 'transparent'
      }}
    >
      <LogOut size={15} />
      Déconnexion
    </button>
  )
}

// ─── Emergency contacts panel ─────────────────────────────────────────────────

function EmergencyPanel({ contacts }: { contacts: EmergencyContact[] }) {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          borderRadius: 10,
          border: 'none',
          background: 'rgba(255,82,82,0.10)',
          cursor: 'pointer',
          color: '#FF6B6B',
          fontFamily: "'Manrope', sans-serif",
          fontSize: '0.78rem',
          fontWeight: 700,
          letterSpacing: '0.06em',
          textTransform: 'uppercase' as const,
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Phone size={13} />
          Urgences
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ fontSize: '0.7rem' }}
        >
          ▾
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ paddingTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {contacts.map(c => (
                <a
                  key={c.number}
                  href={`tel:${c.number}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '7px 12px',
                    borderRadius: 9,
                    textDecoration: 'none',
                    background: `${c.color}12`,
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = `${c.color}22`)}
                  onMouseLeave={e => (e.currentTarget.style.background = `${c.color}12`)}
                >
                  <div>
                    <div style={{
                      fontFamily: "'Manrope', sans-serif",
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: 'rgba(255,255,255,0.85)',
                    }}>
                      {c.label}
                    </div>
                    <div style={{
                      fontFamily: "'Manrope', sans-serif",
                      fontSize: '0.68rem',
                      color: 'rgba(255,255,255,0.38)',
                    }}>
                      {c.description}
                    </div>
                  </div>
                  <span style={{
                    fontFamily: "'Fraunces', Georgia, serif",
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: c.color,
                  }}>
                    {c.number}
                  </span>
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({
  user,
  navItems,
  emergencyContacts,
  accentColor,
  onClose,
}: Props & { onClose?: () => void }) {
  const location = useLocation()
  const { isDark, toggle } = useTheme()

  return (
    <div style={{
      width: 240,
      height: '100%',
      background: '#0D2622',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 16px',
      flexShrink: 0,
      overflowY: 'auto',
    }}>
      {/* Logo + close (mobile) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <img src="/assets/logo.PNG" alt="Haven" style={{ width: 30, height: 30, objectFit: 'contain' }} />
          <span style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontSize: '1.05rem',
            fontWeight: 700,
            color: '#fff',
            letterSpacing: '-0.02em',
          }}>
            Haven
          </span>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', padding: 4 }}
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* User card */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '12px 12px',
        borderRadius: 14,
        background: 'rgba(255,255,255,0.05)',
        marginBottom: 24,
      }}>
        <div style={{
          width: 38,
          height: 38,
          borderRadius: '50%',
          background: accentColor ?? '#2EAB7B',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'Manrope', sans-serif",
          fontSize: '0.82rem',
          fontWeight: 700,
          color: '#fff',
          flexShrink: 0,
        }}>
          {user.avatarInitials}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontFamily: "'Manrope', sans-serif",
            fontSize: '0.85rem',
            fontWeight: 700,
            color: '#fff',
            whiteSpace: 'nowrap' as const,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {user.fullName}
          </div>
          <div style={{
            fontFamily: "'Manrope', sans-serif",
            fontSize: '0.72rem',
            color: 'rgba(255,255,255,0.40)',
            whiteSpace: 'nowrap' as const,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {user.className ?? user.establishmentName}
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
        <div style={{
          fontFamily: "'Manrope', sans-serif",
          fontSize: '0.66rem',
          fontWeight: 700,
          letterSpacing: '0.10em',
          textTransform: 'uppercase' as const,
          color: 'rgba(255,255,255,0.28)',
          padding: '0 12px',
          marginBottom: 4,
        }}>
          Navigation
        </div>
        {navItems.map(item => {
          const isActive = location.pathname + location.search === item.href ||
            location.pathname === item.href
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={onClose}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: 11,
                textDecoration: 'none',
                background: isActive ? `${accentColor ?? '#2EAB7B'}20` : 'transparent',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => {
                if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
              }}
              onMouseLeave={e => {
                if (!isActive) e.currentTarget.style.background = 'transparent'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <span style={{ color: isActive ? (accentColor ?? '#2EAB7B') : 'rgba(255,255,255,0.40)', display: 'flex' }}>
                  {item.icon}
                </span>
                <span style={{
                  fontFamily: "'Manrope', sans-serif",
                  fontSize: '0.87rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.55)',
                }}>
                  {item.label}
                </span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span style={{
                  minWidth: 20,
                  height: 20,
                  borderRadius: 9999,
                  background: isActive ? (accentColor ?? '#2EAB7B') : 'rgba(255,255,255,0.12)',
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.55)',
                  fontFamily: "'Manrope', sans-serif",
                  fontSize: '0.70rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 5px',
                }}>
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Controls: theme + logout */}
      <div style={{ paddingTop: 12, paddingBottom: 12, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <ThemeToggle isDark={isDark} onToggle={toggle} />
        <LogoutButton />
      </div>

      {/* Emergency */}
      <EmergencyPanel contacts={emergencyContacts} />
    </div>
  )
}

// ─── Bottom nav (mobile) ──────────────────────────────────────────────────────

function BottomNav({ navItems, accentColor }: { navItems: NavItem[]; accentColor?: string }) {
  const location = useLocation()

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: 64,
      background: '#0D2622',
      borderTop: '1px solid rgba(255,255,255,0.07)',
      display: 'flex',
      alignItems: 'center',
      zIndex: 50,
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {navItems.slice(0, 4).map(item => {
        const isActive = location.pathname === item.href || location.pathname + location.search === item.href
        return (
          <Link
            key={item.href}
            to={item.href}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              textDecoration: 'none',
              padding: '8px 0',
              position: 'relative',
            }}
          >
            {item.badge !== undefined && item.badge > 0 && (
              <span style={{
                position: 'absolute',
                top: 4,
                right: 'calc(50% - 14px)',
                minWidth: 16,
                height: 16,
                borderRadius: 9999,
                background: accentColor ?? '#2EAB7B',
                color: '#fff',
                fontFamily: "'Manrope', sans-serif",
                fontSize: '0.60rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 4px',
              }}>
                {item.badge}
              </span>
            )}
            <span style={{ color: isActive ? (accentColor ?? '#2EAB7B') : 'rgba(255,255,255,0.35)', display: 'flex' }}>
              {item.icon}
            </span>
            <span style={{
              fontFamily: "'Manrope', sans-serif",
              fontSize: '0.62rem',
              fontWeight: isActive ? 700 : 500,
              color: isActive ? '#fff' : 'rgba(255,255,255,0.35)',
            }}>
              {item.label}
            </span>
          </Link>
        )
      })}
    </div>
  )
}

// ─── Dashboard layout ─────────────────────────────────────────────────────────

export default function DashboardLayout({ user, navItems, emergencyContacts, children, accentColor }: Props) {
  const isMobile = useIsMobile()
  const isTablet = useIsTablet()
  const { isDark } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const vars = themeVars(isDark)

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      overflow: 'hidden',
      background: isDark ? '#0F1E1B' : '#F3EFE8',
      fontFamily: "'Manrope', sans-serif",
    }}>
      {/* Desktop/tablet sidebar — always dark */}
      {!isMobile && (
        <>
          {isTablet ? (
            <AnimatePresence>
              {sidebarOpen && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setSidebarOpen(false)}
                    style={{
                      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
                      zIndex: 40, backdropFilter: 'blur(4px)',
                    }}
                  />
                  <motion.div
                    initial={{ x: -240 }}
                    animate={{ x: 0 }}
                    exit={{ x: -240 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 34 }}
                    style={{ position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50 }}
                  >
                    <Sidebar
                      user={user}
                      navItems={navItems}
                      emergencyContacts={emergencyContacts}
                      accentColor={accentColor}
                      onClose={() => setSidebarOpen(false)}
                    />
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          ) : (
            <Sidebar
              user={user}
              navItems={navItems}
              emergencyContacts={emergencyContacts}
              accentColor={accentColor}
            />
          )}
        </>
      )}

      {/* Main content — carries theme CSS vars */}
      <div
        style={{
          ...vars,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          minWidth: 0,
          background: 'var(--c-bg)',
          transition: 'background 0.28s ease',
        }}
      >
        {/* Top bar (tablet + mobile) */}
        {(isMobile || isTablet) && (
          <div style={{
            height: 56,
            background: 'var(--c-topbar)',
            borderBottom: '1px solid var(--c-topbar-border)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
            gap: 12,
            flexShrink: 0,
            transition: 'background 0.28s ease',
          }}>
            <button
              onClick={() => setSidebarOpen(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-icon)', display: 'flex', padding: 4 }}
            >
              <Menu size={20} />
            </button>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
              <img src="/assets/logo.PNG" alt="Haven" style={{ width: 26, height: 26, objectFit: 'contain' }} />
              <span style={{
                fontFamily: "'Fraunces', Georgia, serif",
                fontSize: '1rem',
                fontWeight: 700,
                color: 'var(--c-text)',
              }}>
                Haven
              </span>
            </Link>
            <div style={{ marginLeft: 'auto' }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: accentColor ?? '#2EAB7B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: "'Manrope', sans-serif",
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#fff',
              }}>
                {user.avatarInitials}
              </div>
            </div>
          </div>
        )}

        {/* Page content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          paddingBottom: isMobile ? 72 : 0,
        }}>
          {children}
        </div>
      </div>

      {/* Mobile bottom nav — always dark */}
      {isMobile && <BottomNav navItems={navItems} accentColor={accentColor} />}
    </div>
  )
}
