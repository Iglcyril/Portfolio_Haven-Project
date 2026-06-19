import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  onComplete: () => void
}

const GRID = 4

const CELLS = Array.from({ length: GRID * GRID }, (_, i) => i)

const CELL_OFFSETS = CELLS.map((i) => {
  const row = Math.floor(i / GRID)
  const col = i % GRID
  const cx = col - (GRID - 1) / 2
  const cy = row - (GRID - 1) / 2
  return {
    initial: { x: cx * 220, y: cy * 220, rotate: (Math.random() - 0.5) * 60 },
    shatter: { x: cx * 300, y: cy * 300, rotate: (Math.random() - 0.5) * 90 },
  }
})

export default function IntroAnimation({ onComplete }: Props) {
  const [phase, setPhase] = useState<'assemble' | 'hold' | 'shatter' | 'done'>('assemble')

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('hold'), 1200)
    const t2 = setTimeout(() => setPhase('shatter'), 2000)
    const t3 = setTimeout(() => {
      setPhase('done')
      onComplete()
    }, 3000)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [onComplete])

  return (
    <AnimatePresence>
      {phase !== 'done' && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: '#102F2B' }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative" style={{ width: 160, height: 160 }}>
            {CELLS.map((i) => {
              const row = Math.floor(i / GRID)
              const col = i % GRID
              const { initial, shatter } = CELL_OFFSETS[i]

              return (
                <motion.div
                  key={i}
                  className="absolute overflow-hidden"
                  style={{
                    width: `${100 / GRID}%`,
                    height: `${100 / GRID}%`,
                    top: `${(row / GRID) * 100}%`,
                    left: `${(col / GRID) * 100}%`,
                  }}
                  initial={{ x: initial.x, y: initial.y, opacity: 0, rotate: initial.rotate }}
                  animate={
                    phase === 'assemble' || phase === 'hold'
                      ? { x: 0, y: 0, opacity: 1, rotate: 0 }
                      : { x: shatter.x, y: shatter.y, opacity: 0, rotate: shatter.rotate }
                  }
                  transition={
                    phase === 'shatter'
                      ? {
                          duration: 0.55,
                          delay: i * 0.015,
                          ease: [0.55, 0, 1, 0.45],
                        }
                      : {
                          duration: 0.7,
                          delay: i * 0.018,
                          ease: [0.22, 1, 0.36, 1],
                        }
                  }
                >
                  <img
                    src="/assets/logo.PNG"
                    alt=""
                    draggable={false}
                    style={{
                      width: `${GRID * 100}%`,
                      height: `${GRID * 100}%`,
                      objectFit: 'contain',
                      transform: `translate(-${col * 100}%, -${row * 100}%)`,
                      display: 'block',
                    }}
                  />
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
