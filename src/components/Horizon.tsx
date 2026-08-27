type Props = {
  size?: number
  tilt?: number
  spinning?: boolean
  /** When true, tilt changes animate via CSS transition (for a live instrument) instead of the one-shot settle keyframe. */
  live?: boolean
  className?: string
}

// The recurring visual motif for Vector: the artificial-horizon / attitude
// indicator. Used literally in the flight briefing, abstracted into the
// loading state (a settling horizon), and as the live orientation instrument
// in the HUD, whose tilt reflects which leg of the experience you're in.
export default function Horizon({ size = 64, tilt = -4, spinning = false, live = false, className = '' }: Props) {
  const id = 'h' + Math.round(Math.random() * 1e6)
  const groupTransform = spinning ? undefined : `rotate(${tilt} 50 50)`
  const groupStyle = live ? { transition: 'transform 0.9s cubic-bezier(0.16,1,0.3,1)' } : undefined

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      style={
        spinning
          ? { animation: 'needle-spin 1.4s cubic-bezier(0.6,0,0.4,1) infinite' }
          : live
            ? undefined
            : ({ ['--tilt' as string]: `${tilt}deg`, animation: 'horizon-settle 0.7s cubic-bezier(0.2,0.8,0.2,1) both' } as React.CSSProperties)
      }
    >
      <defs>
        <clipPath id={id}>
          <circle cx="50" cy="50" r="46" />
        </clipPath>
      </defs>
      <circle cx="50" cy="50" r="47" fill="none" stroke="var(--color-line)" strokeWidth="1.5" />
      <g clipPath={`url(#${id})`}>
        <g transform={groupTransform} style={groupStyle}>
          <rect x="-20" y="-40" width="140" height="90" fill="var(--color-cyan-dim)" />
          <rect x="-20" y="50" width="140" height="90" fill="var(--color-amber-dim)" />
          <rect x="-20" y="48" width="140" height="4" fill="var(--color-paper)" />
        </g>
      </g>
      <line x1="20" y1="50" x2="80" y2="50" stroke="var(--color-paper)" strokeWidth="2" />
      <circle cx="50" cy="50" r="2.5" fill="var(--color-paper)" />
    </svg>
  )
}
