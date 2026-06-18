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
      <main>
        <Hero ready={ready} />
        <Portals />
        <Features />
        <Footer />
      </main>
    </>
  )
}
