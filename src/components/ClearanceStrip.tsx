import { useAgentEngine } from '../agents'

const toneClass: Record<string, string> = {
  approve: 'border-amber-dim/60 bg-amber/10 text-amber hover:bg-amber/20',
  hold: 'border-line text-text-mid hover:text-text-hi',
  deny: 'border-danger-dim/60 bg-danger/10 text-danger hover:bg-danger/20',
}

export default function ClearanceStrip() {
  const { state, resolveHuman } = useAgentEngine()
  const req = state.pending
  if (!req) return null

  return (
    <div className="clearance-enter pointer-events-auto fixed inset-x-0 top-[45px] z-50 border-b border-amber-dim/50 bg-ink-0/97 backdrop-blur-md">
      <div className="mx-auto flex max-w-4xl flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:px-10">
        <div className="flex shrink-0 items-center gap-3">
          <span className="relative flex h-2.5 w-2.5">
            <span className="beacon-strobe absolute inline-flex h-full w-full rounded-full bg-amber" />
          </span>
          <div className="flex flex-col leading-tight">
            <span className="font-mono text-[10px] tracking-[0.25em] text-amber">AWAITING CLEARANCE</span>
            <span className="font-mono text-[9px] tracking-widest text-text-low">{req.agent.toUpperCase()}</span>
          </div>
        </div>

        <div className="flex-1">
          <div className="font-display text-base italic text-paper">{req.title}</div>
          <p className="mt-1 text-[13px] leading-relaxed text-text-mid">{req.body}</p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          {req.options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => resolveHuman(opt.id)}
              className={`rounded-full border px-4 py-2 font-mono text-[11px] tracking-wide transition-colors ${toneClass[opt.tone]}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
