import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Phone } from 'lucide-react'
import type { TeamMember } from '../../../types'
import { PRIMARY } from './constants'

export function TeamSidebarFooter({ team }: { team: TeamMember[] }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 12px', borderRadius: 10, border: 'none',
          background: 'rgba(46,171,123,0.10)', cursor: 'pointer', color: PRIMARY,
          fontFamily: "'Manrope', sans-serif", fontSize: '0.78rem',
          fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' as const,
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Phone size={13} />
          Équipe
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} style={{ fontSize: '0.7rem' }}>
          ▾
        </motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ paddingTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {team.map(m => (
                <a
                  key={m.id} href={`tel:${m.phone}`}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '7px 12px', borderRadius: 9, textDecoration: 'none',
                    background: `${PRIMARY}12`, transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = `${PRIMARY}22`)}
                  onMouseLeave={e => (e.currentTarget.style.background = `${PRIMARY}12`)}
                >
                  <div>
                    <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>
                      {m.firstName} {m.lastName}
                    </div>
                    <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: '0.68rem', color: 'rgba(255,255,255,0.38)' }}>
                      {m.roleLabel}
                    </div>
                  </div>
                  <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: '0.72rem', fontWeight: 700, color: PRIMARY }}>
                    {m.phone}
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
