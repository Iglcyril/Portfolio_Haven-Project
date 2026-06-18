import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

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
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('#hero')

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

  const handleClick = (href: string) => {
    document.getElementById(href.slice(1))?.scrollIntoView({ behavior: 'smooth' })
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
        </motion.nav>
      )}
    </AnimatePresence>
    </div>
  )
}
