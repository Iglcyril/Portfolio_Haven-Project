import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWindowWidth } from '../hooks/useWindowWidth'

const NAV_LINKS = [
  { label: 'Haven', href: '#hero' },
  { label: 'Portails', href: '#portails' },
  { label: 'Fonctionnalités', href: '#fonctionnalites' },
  { label: 'Conditions', href: '#contact' },
]

interface Props {
  visible: boolean
}

export default function Navbar({ visible }: Props) {
  const [scrolled, setScrolled]   = useState(false)
  const [active, setActive]       = useState('#hero')
  const [menuOpen, setMenuOpen]   = useState(false)
  const width                     = useWindowWidth()
  const isMobile                  = width < 768

  const darkSection = active === '#portails' || active === '#contact'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const sections = NAV_LINKS.map((l) => l.href.slice(1))
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(`#${e.target.id}`)
        })
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    )
    sections.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  // Fermer le menu si on passe en desktop
  useEffect(() => {
    if (!isMobile) setMenuOpen(false)
  }, [isMobile])

  const handleClick = (href: string) => {
    document.getElementById(href.slice(1))?.scrollIntoView({ behavior: 'smooth' })
    setMenuOpen(false)
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        zIndex: 40,
        pointerEvents: 'none',
      }}
    >
      <AnimatePresence>
        {visible && (
          <motion.nav
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            style={{ pointerEvents: 'auto' }}
          >
            {/* ── Desktop : pill nav (inchangé) ── */}
            {!isMobile && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 8px',
                  borderRadius: '9999px',
                  background: scrolled
                    ? 'linear-gradient(170deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.08) 100%)'
                    : 'linear-gradient(170deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)',
                  backdropFilter: 'blur(40px) saturate(180%) brightness(108%)',
                  WebkitBackdropFilter: 'blur(40px) saturate(180%) brightness(108%)',
                  border: 'none',
                  boxShadow: [
                    '0 4px 32px rgba(0,0,0,0.07)',
                    'inset 0 1px 0 rgba(255,255,255,0.70)',
                  ].join(', '),
                  transition: 'background 0.35s, box-shadow 0.35s',
                }}
              >
                {NAV_LINKS.map((link) => {
                  const isActive = active === link.href
                  return (
                    <button
                      key={link.href}
                      onClick={() => handleClick(link.href)}
                      style={{
                        position: 'relative',
                        padding: '10px 22px',
                        borderRadius: '9999px',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        fontFamily: "'Manrope', system-ui, sans-serif",
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        letterSpacing: '0.01em',
                        color: darkSection
                          ? (isActive ? '#ffffff' : 'rgba(255,255,255,0.60)')
                          : (isActive ? '#0D2622' : 'rgba(13,38,34,0.52)'),
                        transition: 'color 0.35s',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="nav-pill"
                          style={{
                            position: 'absolute',
                            inset: 0,
                            borderRadius: '9999px',
                            background: 'rgba(46,171,123,0.20)',
                            boxShadow: '0 0 0 1px rgba(46,171,123,0.35), inset 0 1px 0 rgba(255,255,255,0.50)',
                          }}
                          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                        />
                      )}
                      <span style={{ position: 'relative', zIndex: 1 }}>{link.label}</span>
                    </button>
                  )
                })}
              </div>
            )}

            {/* ── Mobile : bouton hamburger + menu déroulant ── */}
            {isMobile && (
              <div style={{ position: 'relative' }}>
                {/* Bouton burger */}
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 5,
                    width: 44,
                    height: 44,
                    borderRadius: '9999px',
                    border: 'none',
                    cursor: 'pointer',
                    background: scrolled
                      ? 'rgba(255,255,255,0.22)'
                      : 'rgba(255,255,255,0.14)',
                    backdropFilter: 'blur(40px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.70)',
                    transition: 'background 0.25s',
                  }}
                >
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      animate={
                        menuOpen
                          ? i === 0 ? { rotate: 45, y: 10 }
                          : i === 1 ? { opacity: 0 }
                          : { rotate: -45, y: -10 }
                          : { rotate: 0, y: 0, opacity: 1 }
                      }
                      transition={{ duration: 0.22 }}
                      style={{
                        display: 'block',
                        width: 18,
                        height: 2,
                        borderRadius: 2,
                        background: darkSection ? 'rgba(255,255,255,0.85)' : '#0D2622',
                      }}
                    />
                  ))}
                </button>

                {/* Menu déroulant */}
                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                      style={{
                        position: 'absolute',
                        top: 52,
                        right: 0,
                        minWidth: 200,
                        borderRadius: 18,
                        background: 'rgba(255,255,255,0.92)',
                        backdropFilter: 'blur(40px) saturate(180%)',
                        WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                        boxShadow: '0 8px 40px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.90)',
                        overflow: 'hidden',
                        padding: '8px',
                      }}
                    >
                      {NAV_LINKS.map((link, idx) => {
                        const isActive = active === link.href
                        return (
                          <motion.button
                            key={link.href}
                            onClick={() => handleClick(link.href)}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            style={{
                              display: 'block',
                              width: '100%',
                              padding: '12px 16px',
                              borderRadius: 12,
                              border: 'none',
                              background: isActive ? 'rgba(46,171,123,0.12)' : 'transparent',
                              cursor: 'pointer',
                              fontFamily: "'Manrope', system-ui, sans-serif",
                              fontSize: '0.95rem',
                              fontWeight: isActive ? 700 : 500,
                              color: isActive ? '#2EAB7B' : '#0D2622',
                              textAlign: 'left',
                              transition: 'background 0.15s',
                            }}
                          >
                            {link.label}
                          </motion.button>
                        )
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  )
}
