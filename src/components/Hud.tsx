import Horizon from './Horizon'
import ZuluClock from './ZuluClock'
import type { SectionMeta } from '../sections'
import { AGENT_ORDER, useAgentEngine } from '../agents'

const activeStates = new Set(['planning', 'executing', 'using_tool', 'delegating', 'collaborating', 'recovering'])

function dotClass(state: string) {
  if (state === 'awaiting_human') return 'bg-amber beacon-strobe'
  if (state === 'blocked' || state === 'failed') return 'bg-danger'
  if (activeStates.has(state)) return 'bg-cyan'
  return 'bg-line'
}

export default function Hud({
  active,
  onHome,
}: {
  active: SectionMeta
  onHome: () => void
}) {
  const { state } = useAgentEngine()
  const needsAttention = state.pending != null

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40">
      <div className="pointer-events-auto flex items-center gap-6 border-b border-line-soft bg-ink-0/70 px-5 py-2.5 backdrop-blur-md md:px-8">
        <button onClick={onHome} className="flex shrink-0 items-center gap-2.5">
          <Horizon size={24} tilt={active.tilt} live />
          <span className="font-display text-lg italic tracking-tight text-paper">Vector</span>
        </button>

        <div className="mx-auto hidden items-baseline gap-2.5 md:flex">
          <span key={active.code} className="font-mono text-[11px] tracking-[0.25em] text-amber" style={{ animation: 'fade-up 0.4s ease both' }}>
            {active.code}
          </span>
          <span className="text-xs text-text-mid">{active.name}</span>
          <span className="h-3 w-px bg-line" />
          <span className="font-mono text-xs tabular text-text-mid">{active.altitude}</span>
          <span className="font-mono text-[10px] tracking-widest text-text-low">{active.phase}</span>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-4">
          {/* Ambient agent-activity readout — the nav bar doubles as a status instrument */}
          <div className="hidden items-center gap-1.5 sm:flex" title="Agent activity">
            {AGENT_ORDER.map((id) => (
              <span key={id} className={`h-1.5 w-1.5 rounded-full transition-colors ${dotClass(state.agents[id].state)}`} />
            ))}
          </div>
          <div className="hidden h-6 w-px bg-line sm:block" />
          <ZuluClock />
          <div className="hidden h-6 w-px bg-line sm:block" />
          <div className={`hidden h-8 w-8 items-center justify-center rounded-full border font-mono text-[11px] sm:flex ${needsAttention ? 'border-amber text-amber' : 'border-line text-text-mid'}`}>
            AR
          </div>
        </div>
      </div>
    </header>
  )
}
