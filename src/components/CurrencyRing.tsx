type Props = {
  label: string
  sub: string
  fraction: number // 0..1, 1 = fully current
  tone?: 'amber' | 'cyan' | 'danger'
}

const toneMap = {
  amber: { stroke: 'var(--color-amber)', text: 'text-amber' },
  cyan: { stroke: 'var(--color-cyan)', text: 'text-cyan' },
  danger: { stroke: 'var(--color-danger)', text: 'text-danger' },
}

export default function CurrencyRing({ label, sub, fraction, tone = 'amber' }: Props) {
  const r = 26
  const c = 2 * Math.PI * r
  const clamped = Math.max(0, Math.min(1, fraction))
  const t = toneMap[fraction < 0.15 ? 'danger' : tone]

  return (
    <div className="flex items-center gap-4">
      <svg width="64" height="64" viewBox="0 0 64 64" className="shrink-0 -rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" stroke="var(--color-line)" strokeWidth="4" />
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke={t.stroke}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - clamped)}
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.2,0.8,0.2,1)' }}
        />
      </svg>
      <div className="min-w-0">
        <div className="font-mono text-sm text-text-hi">{label}</div>
        <div className={`mt-0.5 text-xs ${t.text}`}>{sub}</div>
      </div>
    </div>
  )
}
