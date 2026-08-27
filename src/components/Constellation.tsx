import { useMemo, useState } from 'react'
import { AGENT_ORDER, useAgentEngine, type AgentId } from '../agents'
import AgentNode from './AgentNode'

const ACTIVE_STATES = new Set(['planning', 'executing', 'using_tool', 'delegating', 'collaborating', 'recovering'])

export default function Constellation() {
  const { state } = useAgentEngine()
  const [selected, setSelected] = useState<AgentId>('navigator')

  const positions = useMemo(() => {
    const n = AGENT_ORDER.length
    return AGENT_ORDER.map((id, i) => {
      const angle = (-90 + (360 / n) * i) * (Math.PI / 180)
      const cx = 50 + 38 * Math.cos(angle)
      const cy = 50 + 38 * Math.sin(angle)
      return { id, x: cx, y: cy }
    })
  }, [])

  const posById = Object.fromEntries(positions.map((p) => [p.id, p])) as unknown as Record<AgentId, { x: number; y: number }>
  const activeCount = AGENT_ORDER.filter((id) => ACTIVE_STATES.has(state.agents[id].state)).length
  const selectedAgent = state.agents[selected]

  return (
    <div className={state.pending ? 'holding' : ''}>
      <div className="relative mx-auto aspect-square w-full max-w-[440px]">
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full overflow-visible">
          {positions.map((p) => {
            const agent = state.agents[p.id]
            const isDelegating = agent.delegatingTo != null
            const target = agent.delegatingTo ? posById[agent.delegatingTo] : null
            return (
              <g key={p.id}>
                <line
                  x1="50" y1="50" x2={p.x} y2={p.y}
                  stroke="var(--color-line)"
                  strokeWidth="0.4"
                  opacity={ACTIVE_STATES.has(agent.state) ? 0.7 : 0.35}
                />
                {isDelegating && target && (
                  <circle r="1.1" fill="var(--color-amber)">
                    <animateMotion
                      dur="0.9s"
                      repeatCount="indefinite"
                      path={`M ${p.x} ${p.y} L ${target.x} ${target.y}`}
                    />
                  </circle>
                )}
              </g>
            )
          })}
        </svg>

        {/* Objective, center — a flight-strip tag pinned at the hub */}
        <div className="absolute left-1/2 top-1/2 flex w-[54%] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 border border-amber-dim/50 bg-ink-0/90 px-3 py-2.5 text-center">
          <span className="font-mono text-[8px] tracking-[0.25em] text-text-low">OBJECTIVE</span>
          <span className="text-[11px] leading-tight text-paper sm:text-xs">{state.objective}</span>
          {activeCount > 0 && (
            <span className="font-mono text-[9px] tracking-widest text-cyan">{activeCount} active</span>
          )}
        </div>

        {positions.map((p) => {
          const agent = state.agents[p.id]
          return (
            <div
              key={p.id}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
            >
              <AgentNode agent={agent} size={72} selected={selected === p.id} onClick={() => setSelected(p.id)} />
            </div>
          )
        })}
      </div>

      {/* Detail rail for the selected agent */}
      <div className="mx-auto mt-10 flex max-w-xl items-start gap-4 border-t border-line-soft pt-6">
        <span className="mt-0.5 font-mono text-[10px] tracking-[0.25em] text-amber-dim">{selectedAgent.callsign}</span>
        <p className="flex-1 text-sm leading-relaxed text-text-mid">{selectedAgent.detail}</p>
        <span className="shrink-0 font-mono text-[10px] uppercase tracking-widest text-text-low">{selectedAgent.role}</span>
      </div>
    </div>
  )
}
