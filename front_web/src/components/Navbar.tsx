import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const NAV_LINKS = [
  { label: 'Haven', href: '#hero' },
  { label: 'Portails', href: '#portails' },
  { label: 'Fonctionnalités', href: '#fonctionnalites' },
  { label: 'Contact', href: '#contact' },
]

interface Props {
  visible: boolean
}

export default function Navbar({ visible }: Props) {
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('#hero')

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
      { threshold: 0.4 }
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
              padding: '8px 10px',
              borderRadius: '9999px',
              background: scrolled
                ? 'rgba(16, 47, 43, 0.70)'
                : 'rgba(16, 47, 43, 0.50)',
              backdropFilter: 'blur(24px) saturate(200%)',
              WebkitBackdropFilter: 'blur(24px) saturate(200%)',
              border: '1px solid rgba(46, 171, 123, 0.25)',
              boxShadow: '0 8px 40px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.08)',
              transition: 'background 0.3s',
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
                    padding: '12px 28px',
                    borderRadius: '9999px',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    fontFamily: "'Manrope', system-ui, sans-serif",
                    fontSize: '1.05rem',
                    fontWeight: 600,
                    letterSpacing: '0.01em',
                    color: isActive ? '#ffffff' : 'rgba(255,255,255,0.6)',
                    transition: 'color 0.2s',
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
                        background: 'rgba(46, 171, 123, 0.40)',
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
