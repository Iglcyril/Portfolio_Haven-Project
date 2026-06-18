import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const PORTALS = [
  {
    label: 'Portail Étudiants',
    subtitle: 'Pour les collèges & lycées',
    bg: '#00A176',
    border: 'transparent',
    textColor: '#fff',
    subtitleColor: 'rgba(255,255,255,0.7)',
    shadow: '0 16px 48px rgba(0,161,118,0.35)',
    route: '/auth/students',
  },
  {
    label: 'Espace Parents',
    subtitle: 'Pour les parents & tuteurs',
    bg: 'rgba(142,212,191,0.18)',
    border: 'rgba(142,212,191,0.35)',
    textColor: '#fff',
    subtitleColor: 'rgba(255,255,255,0.6)',
    shadow: 'none',
    route: '/auth/parents',
  },
  {
    label: 'Espace Professionnels',
    subtitle: 'Pour les référents & le rectorat',
    bg: 'rgba(255,255,255,0.07)',
    border: 'rgba(255,255,255,0.15)',
    textColor: '#fff',
    subtitleColor: 'rgba(255,255,255,0.55)',
    shadow: 'none',
    route: '/auth/professionals',
  },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.14 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 48 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: 'easeOut' as const } },
}

export default function Portals() {
  const navigate = useNavigate()

  return (
    <section
      id="portails"
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: '#102F2B',
        overflow: 'hidden',
        padding: '80px 24px',
      }}
    >
      {/* Ancre en fond — plus grande */}
      <div
        style={{
          pointerEvents: 'none',
          position: 'absolute',
          right: -380,
          bottom: -500,
          opacity: 0.07,
          transform: 'rotate(0.8rad)',
        }}
      >
        <img src="/assets/anchor.png" alt="" style={{ width: 1200 }} />
      </div>

      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 680, margin: '0 auto' }}>

        {/* Header — aligné à gauche, sans label "Accès" */}
        <motion.div
          style={{ marginBottom: 48 }}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2
            style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              color: '#fff',
              lineHeight: 1.1,
              textAlign: 'left',
            }}
          >
            Choisissez votre portail
          </h2>
        </motion.div>

        {/* Cards */}
        <motion.div
          style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
        >
          {PORTALS.map((portal) => (
            <motion.div
              key={portal.label}
              variants={cardVariants}
              whileHover={{ scale: 1.02, x: 8 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            >
              <button
                onClick={() => navigate(portal.route)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '28px 36px',
                  borderRadius: 28,
                  border: `1px solid ${portal.border}`,
                  background: portal.bg,
                  boxShadow: portal.shadow === 'none' ? undefined : portal.shadow,
                  backdropFilter: portal.shadow === 'none' ? 'blur(12px)' : undefined,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: "'Fraunces', Georgia, serif",
                      fontSize: '1.5rem',
                      fontWeight: 700,
                      color: portal.textColor,
                      letterSpacing: '-0.02em',
                      marginBottom: 6,
                    }}
                  >
                    {portal.label}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Manrope', system-ui, sans-serif",
                      fontSize: '0.95rem',
                      fontWeight: 500,
                      color: portal.subtitleColor,
                    }}
                  >
                    {portal.subtitle}
                  </div>
                </div>

                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.4rem', flexShrink: 0, marginLeft: 24 }}>›</span>
              </button>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
