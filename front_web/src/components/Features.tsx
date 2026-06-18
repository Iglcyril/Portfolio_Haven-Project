import { motion } from 'framer-motion'
import WaveDivider from './WaveDivider'
import { SmokeBackground } from './SmokeBackground'

const FEATURES = [
  {
    number: '01',
    title: 'Signalez en toute sécurité',
    description:
      "Ouvrez l'app, choisissez votre portail et connectez-vous. Votre signalement est chiffré de bout en bout dès la première lettre.",
    svg: '/assets/svg_screen_1.svg',
    accent: '#2EAB7B',
  },
  {
    number: '02',
    title: 'Vous choisissez votre anonymat',
    description:
      "Témoin ou victime, vous décidez de votre niveau d'exposition. L'anonymat est l'option par défaut — personne ne peut vous identifier sans votre accord.",
    svg: '/assets/svg_screen_2.svg',
    accent: '#8ED4BF',
  },
  {
    number: '03',
    title: 'Une équipe prend le relais',
    description:
      "Votre signalement est transmis à une équipe de référents. Suivez l'avancement en temps réel depuis votre espace personnel.",
    svg: '/assets/svg_screen_3.svg',
    accent: '#00A176',
  },
]

export default function Features() {
  return (
    <section
      id="fonctionnalites"
      style={{ background: '#F9F6F1', padding: '120px 24px', overflow: 'hidden', position: 'relative' }}
    >
      <SmokeBackground smokeColor="#2EAB7B" opacity={0.09} />

      {/* Jonction ondulée depuis Portails */}
      <WaveDivider position="top" nextColor="#102F2B" height={60} />
      {/* Jonction ondulée vers Footer */}
      <WaveDivider position="bottom" nextColor="#0D2622" height={60} />

      <div style={{ maxWidth: 860, margin: '0 auto' }}>

        {/* Header — centré, "Comment ça marche" plus grand */}
        <motion.div
          style={{ textAlign: 'center', marginBottom: 96 }}
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <p
            style={{
              fontFamily: "'Manrope', system-ui, sans-serif",
              fontSize: '1rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#2EAB7B',
              marginBottom: 16,
            }}
          >
            Comment ça marche
          </p>
          <h2
            style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: 'clamp(2.8rem, 6vw, 4.5rem)',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              lineHeight: 1.05,
              color: '#1A2E20',
            }}
          >
            Simple, rapide,{' '}
            <span style={{ color: '#2EAB7B' }}>confidentiel.</span>
          </h2>
        </motion.div>

        {/* Feature blocks — centrés */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 80 }}>
          {FEATURES.map((feat, i) => (
            <motion.div
              key={feat.number}
              style={{
                display: 'flex',
                flexDirection: i % 2 === 0 ? 'row' : 'row-reverse',
                alignItems: 'center',
                gap: 64,
              }}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Illustration */}
              <motion.div
                style={{ flex: 1, display: 'flex', justifyContent: 'center' }}
                initial={{ opacity: 0, scale: 0.88 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.75, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              >
                <div
                  style={{
                    width: 300,
                    height: 300,
                    borderRadius: 36,
                    overflow: 'hidden',
                    position: 'relative',
                    background: `${feat.accent}15`,
                    border: `1px solid ${feat.accent}28`,
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: `radial-gradient(circle at 50% 50%, ${feat.accent}20, transparent 70%)`,
                    }}
                  />
                  <img
                    src={feat.svg}
                    alt={feat.title}
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              </motion.div>

              {/* Texte — centré */}
              <motion.div
                style={{ flex: 1, textAlign: 'center' }}
                initial={{ opacity: 0, x: i % 2 === 0 ? 40 : -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.75, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              >
                <span
                  style={{
                    display: 'block',
                    fontFamily: "'Fraunces', Georgia, serif",
                    fontSize: '4rem',
                    fontWeight: 700,
                    letterSpacing: '-0.04em',
                    lineHeight: 1,
                    color: `${feat.accent}35`,
                    marginBottom: 12,
                  }}
                >
                  {feat.number}
                </span>
                <h3
                  style={{
                    fontFamily: "'Fraunces', Georgia, serif",
                    fontSize: 'clamp(1.5rem, 2.8vw, 2rem)',
                    fontWeight: 700,
                    color: '#1A2E20',
                    letterSpacing: '-0.025em',
                    lineHeight: 1.2,
                    marginBottom: 16,
                  }}
                >
                  {feat.title}
                </h3>
                <p
                  style={{
                    fontFamily: "'Manrope', system-ui, sans-serif",
                    fontSize: '1rem',
                    fontWeight: 500,
                    color: '#5C7A68',
                    lineHeight: 1.75,
                    marginBottom: 20,
                  }}
                >
                  {feat.description}
                </p>
                <div
                  style={{
                    width: 40,
                    height: 3,
                    borderRadius: 999,
                    background: feat.accent,
                    margin: '0 auto',
                  }}
                />
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
