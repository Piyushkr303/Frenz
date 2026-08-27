import type { Agent, AgentState } from '../agents'

type Visual = {
  color: string
  ringClass: string
  dash?: string
  glyph: string
  label: string
  opacity?: number
  halo?: boolean
}

function visualFor(state: AgentState): Visual {
  switch (state) {
    case 'idle':
      return { color: 'var(--color-text-low)', ringClass: '', glyph: '·', label: 'Idle' }
    case 'planning':
      return { color: 'var(--color-cyan)', ringClass: 'ring-sweep-slow', dash: '10 8', glyph: '?', label: 'Planning' }
    case 'executing':
      return { color: 'var(--color-cyan)', ringClass: 'ring-sweep node-pulse', dash: '16 6', glyph: '▸', label: 'Executing' }
    case 'using_tool':
      return { color: 'var(--color-cyan)', ringClass: 'ring-sweep-fast', dash: '3 5', glyph: '⌁', label: 'Using tool' }
    case 'delegating':
      return { color: 'var(--color-amber)', ringClass: 'node-breathe', dash: '2 6', glyph: '↗', label: 'Delegating' }
    case 'collaborating':
      return { color: 'var(--color-amber)', ringClass: 'ring-sweep-reverse node-pulse', dash: '8 4', glyph: '⇄', label: 'Collaborating' }
    case 'waiting':
      return { color: 'var(--color-text-mid)', ringClass: 'node-breathe', dash: '4 10', glyph: '…', label: 'Waiting', opacity: 0.6 }
    case 'blocked':
      return { color: 'var(--color-danger)', ringClass: '', glyph: '▲', label: 'Blocked' }
    case 'failed':
      return { color: 'var(--color-danger)', ringClass: '', glyph: '✕', label: 'Failed' }
    case 'recovering':
      return { color: 'var(--color-amber)', ringClass: 'ring-sweep-reverse', dash: '10 6', glyph: '↺', label: 'Recovering' }
    case 'awaiting_human':
      return { color: 'var(--color-amber)', ringClass: 'beacon-strobe', glyph: '!', label: 'Awaiting you', halo: true }
    case 'completed':
      return { color: 'var(--color-cyan)', ringClass: '', glyph: '✓', label: 'Completed' }
  }
}

export default function AgentNode({
  agent,
  size = 76,
  onClick,
  selected,
}: {
  agent: Agent
  size?: number
  onClick?: () => void
  selected?: boolean
}) {
  const v = visualFor(agent.state)
  const r = size / 2 - 6

  return (
    <button
      onClick={onClick}
      className="constellation-live group flex flex-col items-center gap-2.5 outline-none"
      style={{ opacity: v.opacity ?? 1 }}
    >
      <span className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
        {v.halo && (
          <svg width={size * 1.8} height={size * 1.8} className="pointer-events-none absolute" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="30" fill="none" stroke="var(--color-amber)" strokeWidth="1.5" className="beacon-ring" />
          </svg>
        )}
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={selected ? 'drop-shadow-[0_0_10px_rgba(255,180,84,0.35)]' : ''}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="var(--color-ink-1)" stroke="var(--color-line)" strokeWidth="1" />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={v.color}
            strokeWidth="1.75"
            strokeDasharray={v.dash}
            strokeLinecap="round"
            className={v.ringClass}
          />
          {selected && (
            <circle cx={size / 2} cy={size / 2} r={r + 4} fill="none" stroke="var(--color-amber-dim)" strokeWidth="1" strokeDasharray="2 4" />
          )}
        </svg>
        <span className="absolute font-mono text-sm" style={{ color: v.color }}>
          {v.glyph}
        </span>
      </span>

      <span className="flex flex-col items-center gap-0.5">
        <span className={`font-mono text-[10px] tracking-[0.2em] transition-colors ${selected ? 'text-paper' : 'text-text-mid group-hover:text-paper'}`}>
          {agent.callsign}
        </span>
        <span className="font-mono text-[9px] uppercase tracking-widest" style={{ color: v.color }}>
          {v.label}
        </span>
      </span>
    </button>
  )
}
