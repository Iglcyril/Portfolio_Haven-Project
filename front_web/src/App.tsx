import { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Portals from './components/Portals'
import Features from './components/Features'
import Footer from './components/Footer'

export default function App() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 120)
    return () => clearTimeout(t)
  }, [])

  return (
    <>
      <Navbar visible={ready} />

      {/* Footer fixé en bas — z-index 0, révélé par le scroll */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 0 }}>
        <Footer />
      </div>

      {/* Contenu principal — z-index 1, glisse par-dessus le footer */}
      <main style={{ position: 'relative', zIndex: 1, boxShadow: '0 20px 60px rgba(0,0,0,0.35)' }}>
        <Hero ready={ready} />
        <Portals />
        <Features />
      </main>

      {/*
        Spacer transparent — crée la plage de scroll pour révéler le footer.
        id="contact" ici pour que l'ancre nav fonctionne.
      */}
      <div
        id="contact"
        style={{ height: '100vh', position: 'relative', zIndex: 0, pointerEvents: 'none' }}
      />
    </>
  )
}
