import { forwardRef, useMemo, useState } from 'react'
import FlightStrip from '../components/FlightStrip'
import { flights, fleet, hoursByCategory } from '../data'

const LogbookScreen = forwardRef<HTMLElement>((_, ref) => {
  const [tailFilter, setTailFilter] = useState<string>('ALL')
  const totals = hoursByCategory()

  const filtered = useMemo(() => {
    if (tailFilter === 'ALL') return flights
    return flights.filter((f) => f.aircraft === tailFilter)
  }, [tailFilter])

  return (
    <section id="logbook" ref={ref} className="flight-section scene-logbook px-6 py-28 sm:px-10 lg:px-16">
      <div className="mx-auto w-full max-w-6xl">
        <div className="flex flex-col gap-6 pb-10 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 font-mono text-xs tracking-[0.3em] text-amber-dim">PILOT LOGBOOK</div>
            <h1 className="max-w-2xl font-display text-5xl leading-[0.95] tracking-tight text-paper md:text-6xl">
              {totals.total.toFixed(1)} <em className="text-amber not-italic">hours</em>, logged.
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <FilterChip active={tailFilter === 'ALL'} onClick={() => setTailFilter('ALL')}>All aircraft</FilterChip>
            {fleet.map((a) => (
              <FilterChip key={a.tail} active={tailFilter === a.tail} onClick={() => setTailFilter(a.tail)}>{a.tail}</FilterChip>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-4 border border-dashed border-line py-20 text-center">
            <p className="font-display text-2xl italic text-text-mid">No legs on that tail number yet.</p>
            <button onClick={() => setTailFilter('ALL')} className="font-mono text-xs tracking-widest text-amber hover:underline">
              CLEAR FILTER
            </button>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute bottom-3 left-[3px] top-3 hidden w-px bg-line-soft sm:block" />
            <div className="flex flex-col gap-3">
              {filtered.map((f, i) => (
                <div key={f.id} className="relative flex items-center gap-4">
                  <span className="relative z-10 hidden h-[7px] w-[7px] shrink-0 rounded-full bg-amber-dim sm:block" />
                  <div className="min-w-0 flex-1">
                    <FlightStrip flight={f} index={i} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
})

LogbookScreen.displayName = 'LogbookScreen'
export default LogbookScreen

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3.5 py-1.5 font-mono text-[11px] tracking-wide transition-colors ${
        active ? 'border-amber-dim bg-amber/10 text-amber' : 'border-line text-text-mid hover:text-text-hi'
      }`}
    >
      {children}
    </button>
  )
}
