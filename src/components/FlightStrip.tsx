import type { Flight } from '../data'
import { airports } from '../data'

function fmtDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase()
}

export default function FlightStrip({ flight, index }: { flight: Flight; index: number }) {
  const from = airports[flight.from]
  const to = airports[flight.to]

  return (
    <article
      className="group relative flex flex-col gap-3 border-l-4 border-amber-dim bg-paper px-5 py-4 text-ink-0 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.6)] transition-all duration-300 hover:-translate-y-0.5 hover:border-amber hover:shadow-[0_16px_36px_-16px_rgba(0,0,0,0.7)] sm:flex-row sm:items-center sm:gap-6 sm:px-7"
      style={{ animation: `strip-in 0.5s cubic-bezier(0.2,0.8,0.2,1) both`, animationDelay: `${index * 45}ms` }}
    >
      <div className="flex shrink-0 flex-col gap-0.5 sm:w-24">
        <span className="font-mono text-[10px] tracking-widest text-ink-0/50">{fmtDate(flight.date)}</span>
        <span className="font-mono text-[11px] font-medium text-amber-dim">{flight.aircraft}</span>
      </div>

      <div className="flex flex-1 items-center gap-3 sm:gap-5">
        <div className="flex flex-col leading-none">
          <span className="font-mono text-2xl font-semibold sm:text-3xl">{from.icao}</span>
          <span className="mt-1 text-[11px] text-ink-0/50">{from.city.split(',')[0]}</span>
        </div>
        <div className="flex flex-1 flex-col items-center px-1">
          <span className="font-mono text-[10px] text-ink-0/40">{flight.total.toFixed(1)} HR</span>
          <div className="relative h-px w-full min-w-8 bg-ink-0/25 sm:min-w-16">
            <div className="absolute -right-1 -top-[3px] h-2 w-2 rotate-45 border-r border-t border-ink-0/40" />
          </div>
        </div>
        <div className="flex flex-col leading-none">
          <span className="font-mono text-2xl font-semibold sm:text-3xl">{to.icao}</span>
          <span className="mt-1 text-[11px] text-ink-0/50">{to.city.split(',')[0]}</span>
        </div>
      </div>

      <div className="hidden shrink-0 items-center gap-1.5 lg:flex">
        {flight.night > 0 && <Tag label="NIGHT" />}
        {flight.instrument > 0 && <Tag label="IFR" />}
        {flight.landingsNight > 0 && <Tag label={`${flight.landingsNight} NLDG`} />}
      </div>

      <p className="hidden max-w-[26ch] shrink-0 font-display text-[13px] italic leading-snug text-ink-0/60 xl:block">
        {flight.remarks}
      </p>
    </article>
  )
}

function Tag({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-ink-0/20 px-2 py-0.5 font-mono text-[9px] tracking-widest text-ink-0/60">
      {label}
    </span>
  )
}
