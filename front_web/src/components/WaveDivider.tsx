import { useRef } from 'react'
import { useAnimationFrame } from 'framer-motion'

interface Props {
  nextColor: string
  position: 'top' | 'bottom'
  height?: number
}

export default function WaveDivider({ nextColor, position, height = 50 }: Props) {
  const isBottom = position === 'bottom'
  const div1Ref = useRef<HTMLDivElement>(null)
  const div2Ref = useRef<HTMLDivElement>(null)

  useAnimationFrame((t) => {
    const p1 = (t % 8000) / 8000
    const p2 = (t % 12000) / 12000
    if (div1Ref.current) div1Ref.current.style.transform = `translateX(${-p1 * 50}%)`
    if (div2Ref.current) div2Ref.current.style.transform = `translateX(${-p2 * 50}%)`
  })

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        [isBottom ? 'bottom' : 'top']: 0,
        height,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 3,
        lineHeight: 0,
        transform: isBottom ? 'none' : 'scaleY(-1)',
      }}
    >
      <div
        ref={div1Ref}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '200%',
          height: '100%',
          willChange: 'transform',
        }}
      >
        <svg
          viewBox="0 0 1440 50"
          preserveAspectRatio="none"
          style={{ display: 'block', width: '100%', height: '100%' }}
        >
          <path
            d="M0,25 C180,5 540,45 720,25 C900,5 1260,45 1440,25 L1440,50 L0,50 Z"
            fill={nextColor}
          />
        </svg>
      </div>

      <div
        ref={div2Ref}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '200%',
          height: '100%',
          willChange: 'transform',
          opacity: 0.4,
        }}
      >
        <svg
          viewBox="0 0 1440 50"
          preserveAspectRatio="none"
          style={{ display: 'block', width: '100%', height: '100%' }}
        >
          <path
            d="M0,32 C220,8 500,50 720,32 C940,8 1220,50 1440,32 L1440,50 L0,50 Z"
            fill={nextColor}
          />
        </svg>
      </div>
    </div>
  )
}
