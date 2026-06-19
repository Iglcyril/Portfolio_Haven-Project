import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Phone } from 'lucide-react'
import type { EstablishmentContact } from '../../../types'
import { ACCENT } from './constants'

export function EstablishmentPanel({ contacts }: { contacts: EstablishmentContact[] }) {
  const [open, setOpen] = useState(false)
  const director  = contacts.filter(c => c.role === 'director')
  const referents = contacts.filter(c => c.role === 'referent')

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
          background: `${ACCENT}18`,
          cursor: 'pointer',
          color: ACCENT,
          fontFamily: "'Manrope', sans-serif",
          fontSize: '0.78rem',
          fontWeight: 700,
          letterSpacing: '0.06em',
          textTransform: 'uppercase' as const,
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Phone size={13} />
          Établissement
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
              {[...director, ...referents].map(c => (
                <a
                  key={c.phone}
                  href={`tel:${c.phone}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 12px',
                    borderRadius: 9,
                    textDecoration: 'none',
                    background: `${ACCENT}10`,
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = `${ACCENT}20`)}
                  onMouseLeave={e => (e.currentTarget.style.background = `${ACCENT}10`)}
                >
                  <div style={{
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    background: `${ACCENT}25`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: "'Manrope', sans-serif",
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    color: ACCENT,
                    flexShrink: 0,
                  }}>
                    {c.initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>
                      {c.name}
                    </div>
                    <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: '0.67rem', color: 'rgba(255,255,255,0.38)' }}>
                      {c.role === 'director' ? 'Chef d\'établissement' : 'Référent harcèlement'}
                    </div>
                  </div>
                  <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: '0.75rem', fontWeight: 700, color: ACCENT, flexShrink: 0 }}>
                    {c.phone}
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
