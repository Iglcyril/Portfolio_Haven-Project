import { motion } from 'framer-motion'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer
      id="contact"
      className="relative overflow-hidden"
      style={{ background: '#0D2622' }}
    >
      {/* Top content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 pt-20 pb-10">
        <motion.div
          className="flex flex-col md:flex-row items-start md:items-center justify-between gap-10 pb-10"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Left — logo + tagline */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <img src="/assets/logo.PNG" alt="Haven" className="w-10 h-10 object-contain" />
              <span
                style={{
                  fontFamily: 'var(--font-fraunces)',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: '#fff',
                  letterSpacing: '-0.03em',
                }}
              >
                Haven
              </span>
            </div>
            <p
              style={{
                fontFamily: 'var(--font-manrope)',
                fontSize: '0.9rem',
                color: 'rgba(255,255,255,0.45)',
                lineHeight: 1.6,
                maxWidth: 260,
              }}
            >
              Un espace sûr et confidentiel pour signaler et traiter le harcèlement.
            </p>
          </div>

          {/* Right — links */}
          <div className="flex flex-col gap-3">
            <a
              href="#"
              style={{
                fontFamily: 'var(--font-manrope)',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: 'rgba(255,255,255,0.55)',
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#2EAB7B')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}
            >
              Conditions générales d'utilisation
            </a>
            <a
              href="#"
              style={{
                fontFamily: 'var(--font-manrope)',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: 'rgba(255,255,255,0.55)',
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#2EAB7B')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}
            >
              Politique de confidentialité
            </a>
          </div>
        </motion.div>

        {/* Copyright */}
        <div className="pt-6 pb-2 text-center">
          <p
            style={{
              fontFamily: 'var(--font-manrope)',
              fontSize: '0.8rem',
              color: 'rgba(255,255,255,0.25)',
            }}
          >
            © {year} Haven — Tous droits réservés.
          </p>
        </div>
      </div>

      {/* Giant HAVEN text with anchor replacing V */}
      <motion.div
        className="relative z-10 flex items-end justify-center overflow-hidden select-none"
        style={{ height: 'clamp(80px, 18vw, 200px)', marginBottom: '-4px' }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1, ease: 'easeOut' }}
      >
        <div
          className="flex items-end leading-none"
          style={{
            fontFamily: 'var(--font-fraunces)',
            fontSize: 'clamp(80px, 18vw, 200px)',
            fontWeight: 700,
            letterSpacing: '-0.04em',
            color: 'rgba(255,255,255,0.06)',
            lineHeight: 0.85,
          }}
        >
          <span>HA</span>
          {/* V replaced by anchor */}
          <span
            className="inline-flex items-end"
            style={{
              height: 'clamp(80px, 18vw, 200px)',
              position: 'relative',
            }}
          >
            <img
              src="/assets/anchor.png"
              alt="V"
              style={{
                height: '78%',
                width: 'auto',
                objectFit: 'contain',
                opacity: 0.09,
                filter: 'brightness(10)',
                alignSelf: 'flex-end',
                marginBottom: '4%',
              }}
            />
          </span>
          <span>EN</span>
        </div>
      </motion.div>
    </footer>
  )
}
