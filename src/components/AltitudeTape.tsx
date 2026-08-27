import { sections } from '../sections'
import { useAgentEngine, type AgentId } from '../agents'

const activeStates = new Set(['planning', 'executing', 'using_tool', 'delegating', 'collaborating', 'recovering'])

// Which agent's work this leg of the experience corresponds to — the tape
// lights up on its own when that agent is working, whether or not you're
// looking at that section.
const sectionAgent: Record<string, AgentId | undefined> = {
  plan: 'navigator',
  logbook: 'logkeeper',
  fleet: 'crew',
}

export default function AltitudeTape({
  activeIndex,
  onSelect,
}: {
  activeIndex: number
  onSelect: (id: string) => void
}) {
  const { state } = useAgentEngine()

  return (
    <>
      {/* Desktop: vertical altimeter tape, the primary navigation instrument */}
      <nav className="pointer-events-none fixed right-0 top-0 z-30 hidden h-full w-16 flex-col items-center justify-between border-l border-line-soft py-20 lg:flex">
        <div className="pointer-events-none absolute inset-y-20 left-1/2 w-px -translate-x-1/2 bg-line-soft" />
        {sections.map((s, i) => {
          const isActive = i === activeIndex
          const agentId = sectionAgent[s.id]
          const agentWorking = agentId ? activeStates.has(state.agents[agentId].state) : false
          return (
            <button
              key={s.id}
              onClick={() => onSelect(s.id)}
              className="pointer-events-auto group relative flex w-full flex-1 flex-col items-center justify-center"
              aria-label={`Go to ${s.name}`}
            >
              <span
                className={`absolute h-px transition-all duration-500 ${
                  isActive ? 'w-5 bg-amber' : agentWorking ? 'w-3 bg-cyan' : 'w-2.5 bg-line group-hover:bg-text-mid'
                }`}
              />
              {agentWorking && !isActive && (
                <span className="node-breathe absolute h-1.5 w-1.5 -translate-x-4 rounded-full bg-cyan" />
              )}
              <span
                className={`vertical-label absolute -left-1 font-mono text-[9px] tracking-[0.3em] transition-all duration-500 ${
                  isActive ? 'text-amber opacity-100' : agentWorking ? 'text-cyan opacity-80' : 'text-text-low opacity-0 group-hover:opacity-60'
                }`}
              >
                {s.code}
              </span>
              {isActive && (
                <span
                  className="absolute right-full mr-3 whitespace-nowrap font-mono text-[10px] tabular text-text-mid"
                  style={{ animation: 'bug-in 0.4s ease both' }}
                >
                  {s.altitude}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Mobile / tablet: bottom dock */}
      <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center pb-4 lg:hidden">
        <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-line-soft bg-ink-0/85 px-1.5 py-1.5 backdrop-blur-md">
          {sections.map((s, i) => {
            const isActive = i === activeIndex
            const agentId = sectionAgent[s.id]
            const agentWorking = agentId ? activeStates.has(state.agents[agentId].state) : false
            return (
              <button
                key={s.id}
                onClick={() => onSelect(s.id)}
                className={`relative rounded-full px-3 py-1.5 font-mono text-[10px] tracking-widest transition-colors ${
                  isActive ? 'bg-amber/15 text-amber' : agentWorking ? 'text-cyan' : 'text-text-mid'
                }`}
              >
                {s.code}
                {agentWorking && !isActive && (
                  <span className="node-breathe absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-cyan" />
                )}
              </button>
            )
          })}
        </div>
      </nav>
    </>
  )
}
