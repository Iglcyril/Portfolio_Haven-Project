import { useState } from 'react'
import { motion } from 'framer-motion'
import LegalModal from './LegalModal'
import { useWindowWidth } from '../hooks/useWindowWidth'

export default function Footer() {
  const year    = new Date().getFullYear()
  const [modal, setModal] = useState<'cgu' | 'privacy' | null>(null)
  const width   = useWindowWidth()
  const isMobile = width < 768

  return (
    <footer
      style={{ position: 'relative', background: '#0D2622', overflowY: 'hidden' }}
    >
      {/* Contenu principal */}
      <motion.div
        style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: 1100,
          margin: '0 auto',
          padding: isMobile ? '48px 24px 32px' : '80px 48px 40px',
        }}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: isMobile ? 16 : 20,
            paddingBottom: isMobile ? 28 : 40,
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {/* Logo — en flux sur mobile, absolu à droite sur desktop */}
          {isMobile && (
            <img
              src="/assets/logo.PNG"
              alt="Haven"
              style={{
                width: 52,
                height: 52,
                objectFit: 'contain',
                opacity: 0.85,
              }}
            />
          )}

          <p
            style={{
              fontFamily: "'Manrope', system-ui, sans-serif",
              fontSize: isMobile ? '0.88rem' : '0.95rem',
              color: 'rgba(255,255,255,0.45)',
              lineHeight: 1.65,
              textAlign: 'center',
              maxWidth: 300,
            }}
          >
            Un espace sûr et confidentiel pour signaler et traiter le harcèlement.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            {[
              { label: "Conditions générales d'utilisation", key: 'cgu' as const },
              { label: 'Politique de confidentialité', key: 'privacy' as const },
            ].map((link) => (
              <button
                key={link.key}
                onClick={() => setModal(link.key)}
                style={{
                  fontFamily: "'Manrope', system-ui, sans-serif",
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.45)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#2EAB7B')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Logo desktop — absolu à droite (inchangé) */}
          {!isMobile && (
            <img
              src="/assets/logo.PNG"
              alt="Haven"
              style={{
                position: 'absolute',
                right: 0,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 64,
                height: 64,
                objectFit: 'contain',
                opacity: 0.85,
              }}
            />
          )}
        </div>

        {/* Copyright */}
        <div style={{ paddingTop: isMobile ? 18 : 24, textAlign: 'center' }}>
          <p
            style={{
              fontFamily: "'Manrope', system-ui, sans-serif",
              fontSize: '0.78rem',
              color: 'rgba(255,255,255,0.2)',
            }}
          >
            © {year} Haven — Tous droits réservés.
          </p>
        </div>
      </motion.div>

      {/* Modales légales */}
      {modal && <LegalModal type={modal} onClose={() => setModal(null)} />}

      {/* HAVEN pleine largeur */}
      <motion.div
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          overflowX: 'clip',
        }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 1.1, ease: 'easeOut' }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            fontFamily: "'Fraunces', Georgia, serif",
            fontSize: 'calc(100vw / 3.1)',
            transform: 'translateY(0.20em)',
            fontWeight: 700,
            letterSpacing: '-0.04em',
            color: 'rgba(255,255,255,0.055)',
            lineHeight: 1,
            whiteSpace: 'nowrap',
            userSelect: 'none',
          }}
        >
          <span>HA</span>
          <img
            src="/assets/anchor.png"
            alt="V"
            style={{
              height: '1em',
              width: 'auto',
              objectFit: 'contain',
              opacity: 0.07,
              filter: 'brightness(10)',
              display: 'block',
              alignSelf: 'flex-end',
              margin: '0 -0.18em',
            }}
          />
          <span>EN</span>
        </div>
      </motion.div>
    </footer>
  )
}
