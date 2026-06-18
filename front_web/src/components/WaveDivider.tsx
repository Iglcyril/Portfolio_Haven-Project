interface Props {
  /** Couleur de la section qui SUIT (remplit la forme de vague) */
  nextColor: string
  position: 'top' | 'bottom'
  height?: number
}

export default function WaveDivider({ nextColor, position, height = 50 }: Props) {
  const isBottom = position === 'bottom'

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
      {/* Couche principale */}
      <svg
        viewBox="0 0 1440 50"
        preserveAspectRatio="none"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '200%',
          height: '100%',
          animation: 'wavePrimary 8s linear infinite',
        }}
      >
        <path
          d="M0,25 C180,5 360,45 540,25 C720,5 900,45 1080,25 C1260,5 1440,45 1620,25 C1800,5 1980,45 2160,25 C2340,5 2520,45 2700,25 C2880,5 3060,45 3240,25 L3240,50 L0,50 Z"
          fill={nextColor}
        />
      </svg>

      {/* Couche secondaire — déphasée */}
      <svg
        viewBox="0 0 1440 50"
        preserveAspectRatio="none"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '200%',
          height: '100%',
          animation: 'waveSecondary 6s linear infinite',
          opacity: 0.5,
        }}
      >
        <path
          d="M0,30 C120,50 240,10 360,30 C480,50 600,10 720,30 C840,50 960,10 1080,30 C1200,50 1320,10 1440,30 C1560,50 1680,10 1800,30 C1920,50 2040,10 2160,30 C2280,50 2400,10 2520,30 C2640,50 2760,10 2880,30 L2880,50 L0,50 Z"
          fill={nextColor}
        />
      </svg>

      <style>{`
        @keyframes wavePrimary {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes waveSecondary {
          from { transform: translateX(-15%); }
          to   { transform: translateX(-65%); }
        }
      `}</style>
    </div>
  )
}
