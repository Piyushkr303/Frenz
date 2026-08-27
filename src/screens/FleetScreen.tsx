import { forwardRef } from 'react'
import { fleet, flights } from '../data'

function hoursFor(tail: string) {
  return flights.filter((f) => f.aircraft === tail).reduce((s, f) => s + f.total, 0)
}

const FleetScreen = forwardRef<HTMLElement>((_, ref) => {
  return (
    <section id="fleet" ref={ref} className="flight-section scene-fleet flex flex-col justify-center py-28">
      <div className="px-6 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-3 font-mono text-xs tracking-[0.3em] text-amber-dim">HANGAR &middot; GROUND</div>
          <h1 className="max-w-2xl font-display text-5xl leading-[0.95] tracking-tight text-paper md:text-6xl">
            Aircraft on <em className="text-amber not-italic">file</em>.
          </h1>
        </div>
      </div>

      <div className="mt-14 flex snap-x snap-mandatory gap-6 overflow-x-auto px-6 pb-8 scrollbar-none sm:px-10 lg:px-16">
        {fleet.map((a, i) => (
          <div
            key={a.tail}
            className="relative w-[320px] shrink-0 snap-start border border-line bg-ink-1 p-7"
            style={{ animation: 'reveal-up 0.6s cubic-bezier(0.16,1,0.3,1) both', animationDelay: `${i * 90}ms` }}
          >
            <Rivet corner="top-left" /><Rivet corner="top-right" /><Rivet corner="bottom-left" /><Rivet corner="bottom-right" />

            <div className="mb-8 flex items-start justify-between">
              <div>
                <div className="font-mono text-2xl tracking-wide text-paper">{a.tail}</div>
                <div className="mt-1 text-sm text-text-mid">{a.type}</div>
              </div>
              <div className="h-2.5 w-2.5 rounded-full bg-cyan shadow-[0_0_10px_var(--color-cyan)]" title="Airworthy" />
            </div>

            <div className="grid grid-cols-2 gap-5 border-t border-line-soft pt-5 text-xs">
              <div>
                <div className="text-text-low">Livery</div>
                <div className="mt-1 text-text-hi">{a.color}</div>
              </div>
              <div>
                <div className="text-text-low">Hobbs</div>
                <div className="mt-1 font-mono text-text-hi tabular">{a.hobbs.toFixed(1)}</div>
              </div>
              <div className="col-span-2">
                <div className="text-text-low">Logged with you</div>
                <div className="mt-1 font-mono text-amber tabular">{hoursFor(a.tail).toFixed(1)} hrs</div>
              </div>
            </div>
          </div>
        ))}
        <div className="w-2 shrink-0 sm:w-6" aria-hidden />
      </div>

      <div className="tarmac-line mx-6 sm:mx-10 lg:mx-16" />
    </section>
  )
})

FleetScreen.displayName = 'FleetScreen'
export default FleetScreen

function Rivet({ corner }: { corner: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' }) {
  const pos: Record<string, string> = {
    'top-left': 'top-2 left-2',
    'top-right': 'top-2 right-2',
    'bottom-left': 'bottom-2 left-2',
    'bottom-right': 'bottom-2 right-2',
  }
  return <span className={`absolute ${pos[corner]} h-1 w-1 rounded-full bg-line`} />
}
