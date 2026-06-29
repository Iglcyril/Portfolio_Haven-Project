import { useState } from 'react'
import { motion } from 'framer-motion'
import WaveDivider from './WaveDivider'
import { SmokeBackground } from './SmokeBackground'

const LINE1 = 'Un espace'
const LINE2 = 'sûr.'
const SUB = 'Signalez et traitez le harcèlement en toute confidentialité.'
const CTA = 'Accéder à mon espace'
const APK_URL = 'https://github.com/Iglcyril/Portfolio_Haven-Project/releases/download/v1.0.0/app-release.apk'

interface CharProps {
  char: string
  entryDelay: number
  ready: boolean
  color?: string
}

function AnimChar({ char, entryDelay, ready, color }: CharProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.span
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'inline-block',
        whiteSpace: char === ' ' ? 'pre' : 'normal',
        color: color,
        cursor: 'default',
      }}
      initial={{ opacity: 0, y: 40, filter: 'blur(6px)' }}
      animate={
        ready
          ? hovered
            ? { opacity: 1, y: -8, filter: 'blur(0px)', transition: { duration: 0.15, ease: 'easeOut' } }
            : { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.55, delay: entryDelay, ease: [0.22, 1, 0.36, 1] } }
          : { opacity: 0, y: 40, filter: 'blur(6px)' }
      }
    >
      {char}
    </motion.span>
  )
}

function AnimLine({ text, baseDelay, ready, color }: { text: string; baseDelay: number; ready: boolean; color?: string }) {
  return (
    <span style={{ display: 'block' }}>
      {text.split('').map((char, i) => (
        <AnimChar
          key={i}
          char={char}
          entryDelay={baseDelay + i * 0.045}
          ready={ready}
          color={color}
        />
      ))}
    </span>
  )
}

interface Props {
  ready: boolean
}

export default function Hero({ ready }: Props) {
  const [apkHovered, setApkHovered] = useState(false)

  // stagger global : line1 démarre à 0.1, line2 à ~0.55
  const line1Base = 0.1
  const line2Base = line1Base + LINE1.length * 0.045 + 0.08
  const subDelay = line2Base + LINE2.length * 0.045 + 0.1
  const ctaDelay = subDelay + 0.35

  return (
    <section
      id="hero"
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: '#F9F6F1',
      }}
    >
      {/* Smoke WebGL background */}
      <SmokeBackground smokeColor="#2EAB7B" opacity={0.09} />

      {/* Contenu */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          padding: '0 24px',
          maxWidth: '900px',
          width: '100%',
          margin: '0 auto',
        }}
      >
        {/* Logo */}
        <motion.img
          src="/assets/logo.PNG"
          alt="Haven"
          style={{ width: 88, height: 88, objectFit: 'contain', marginBottom: 28 }}
          initial={{ opacity: 0, scale: 0.6, filter: 'blur(8px)' }}
          animate={ready ? { opacity: 1, scale: 1, filter: 'blur(0px)' } : { opacity: 0, scale: 0.6 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        />

        {/* Titre — Fraunces, animation char par char + hover */}
        <h1
          style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontSize: 'clamp(3.5rem, 9vw, 7.5rem)',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            lineHeight: 1,
            color: '#1A2E20',
            marginBottom: 24,
            userSelect: 'none',
          }}
        >
          <AnimLine text={LINE1} baseDelay={line1Base} ready={ready} />
          <AnimLine text={LINE2} baseDelay={line2Base} ready={ready} color="#2EAB7B" />
        </h1>

        {/* Sous-titre — Manrope */}
        <motion.p
          style={{
            fontFamily: "'Manrope', system-ui, sans-serif",
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            fontWeight: 500,
            color: '#5C7A68',
            lineHeight: 1.7,
            maxWidth: 520,
            marginBottom: 40,
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: subDelay, ease: [0.22, 1, 0.36, 1] }}
        >
          {SUB}
        </motion.p>

        {/* CTAs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
          <motion.button
            onClick={() => document.getElementById('portails')?.scrollIntoView({ behavior: 'smooth' })}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '18px 38px',
              borderRadius: 9999,
              border: 'none',
              background: '#00A176',
              color: '#fff',
              fontFamily: "'Manrope', system-ui, sans-serif",
              fontSize: '1.05rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 8px 32px rgba(0,161,118,0.30)',
            }}
            initial={{ opacity: 0, y: 24 }}
            animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
            transition={{ duration: 0.55, delay: ctaDelay, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ scale: 1.05, boxShadow: '0 14px 44px rgba(0,161,118,0.42)' }}
            whileTap={{ scale: 0.97 }}
          >
            {CTA}
            <motion.span
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              →
            </motion.span>
          </motion.button>

          <motion.a
            href={APK_URL}
            download
            onMouseEnter={() => setApkHovered(true)}
            onMouseLeave={() => setApkHovered(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '15px 32px',
              borderRadius: 9999,
              border: '2px solid #00A176',
              background: apkHovered ? '#00A176' : 'transparent',
              color: apkHovered ? '#fff' : '#00A176',
              fontFamily: "'Manrope', system-ui, sans-serif",
              fontSize: '0.98rem',
              fontWeight: 700,
              cursor: 'pointer',
              textDecoration: 'none',
              transition: 'background 0.2s ease, color 0.2s ease',
            }}
            initial={{ opacity: 0, y: 24 }}
            animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
            transition={{ duration: 0.55, delay: ctaDelay + 0.15, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19.01 7.38 20 6.18 20C4.98 20 4 19.01 4 17.82a2.18 2.18 0 0 1 2.18-2.18M17.82 15.64a2.18 2.18 0 0 1 2.18 2.18C20 19.01 19.01 20 17.82 20a2.18 2.18 0 0 1-2.18-2.18a2.18 2.18 0 0 1 2.18-2.18M17.82 10.5a.5.5 0 0 1 .5.5v3.64a.5.5 0 0 1-.5.5a.5.5 0 0 1-.5-.5V11a.5.5 0 0 1 .5-.5m-11.64 0a.5.5 0 0 1 .5.5v3.64a.5.5 0 0 1-.5.5a.5.5 0 0 1-.5-.5V11a.5.5 0 0 1 .5-.5M12 2.3l1.88 3.26l1.94-.56A1 1 0 0 1 17 6H7a1 1 0 0 1 1.18-1l1.94.56L12 2.3M7 7h10v7.5H7V7z"/>
            </svg>
            Télécharger l'app Android
          </motion.a>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        style={{
          position: 'absolute',
          bottom: 40,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
        }}
        initial={{ opacity: 0 }}
        animate={ready ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: ctaDelay + 0.4 }}
      >
        <motion.div
          style={{
            width: 1,
            height: 52,
            borderRadius: 999,
            background: 'linear-gradient(to bottom, #2EAB7B, transparent)',
            transformOrigin: 'top',
          }}
          animate={{ scaleY: [0, 1, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>

      {/* Jonction ondulée vers la section Portails */}
      <WaveDivider position="bottom" nextColor="#102F2B" height={60} />
    </section>
  )
}
