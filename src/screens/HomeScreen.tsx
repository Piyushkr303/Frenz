import { forwardRef } from 'react'
import FlightStrip from '../components/FlightStrip'
import Constellation from '../components/Constellation'
import ActivityTimeline from '../components/ActivityTimeline'
import {
  flights,
  last90DaysLandings,
  weather,
  medicalExpiry,
  flightReviewExpiry,
} from '../data'

const TODAY = new Date('2026-08-27')

function daysUntil(iso: string) {
  return Math.round((new Date(iso).getTime() - TODAY.getTime()) / 86400000)
}

const HomeScreen = forwardRef<HTMLElement, { onDescend: () => void }>(({ onDescend }, ref) => {
  const landings = last90DaysLandings()
  const medicalDays = daysUntil(medicalExpiry)
  const reviewDays = daysUntil(flightReviewExpiry)
  const recent = flights.slice(0, 3)

  return (
    <section id="home" ref={ref} className="flight-section scene-home flex flex-col justify-center px-6 py-24 sm:px-10 lg:px-16">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-3 font-mono text-xs tracking-[0.3em] text-amber-dim">
          {TODAY.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()}
        </div>
        <h1 className="max-w-3xl font-display text-4xl leading-[0.95] tracking-tight text-paper md:text-6xl">
          Good afternoon, <em className="text-amber not-italic">Alex</em>. Five agents are on watch.
        </h1>

        {/* The constellation — this is the operations center, not a KPI dashboard */}
        <div className="mt-16">
          <Constellation />
        </div>

        {/* What's happening */}
        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-10 lg:grid-cols-[1fr_280px]">
          <div>
            <h2 className="mb-1 font-mono text-[11px] uppercase tracking-[0.25em] text-text-low">Activity</h2>
            <ActivityTimeline limit={6} />
          </div>

          <div className="flex flex-col gap-5 border-t border-line-soft pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
            <div className="flex items-center gap-2.5">
              <span className={`flex h-5 w-5 items-center justify-center rounded-full border ${weather.flightRules === 'VFR' ? 'border-cyan text-cyan' : 'border-danger text-danger'} font-mono text-[8px]`}>
                {weather.flightRules}
              </span>
              <span className="font-mono text-xs tabular text-paper">{weather.temp}&deg;/{weather.dew}&deg; &middot; {weather.windDir}&deg;@{weather.windKt}kt</span>
            </div>
            <Glance label="Medical" value={medicalDays > 0 ? `${medicalDays}d left` : 'Expired'} />
            <Glance label="Flight review" value={reviewDays > 0 ? `${reviewDays}d left` : 'Expired'} />
            <Glance label="Night landings" value={`${landings.night} of 3 / 90d`} warn={landings.night < 3} />
            <Glance label="Total time" value={`${flights.reduce((s, f) => s + f.total, 0).toFixed(1)} hrs`} />
          </div>
        </div>

        <div className="mt-16 flex items-baseline justify-between">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.25em] text-text-low">Recent legs</h2>
          <button onClick={onDescend} className="group flex items-center gap-2 text-xs text-text-mid transition-colors hover:text-amber">
            Descend to logbook
            <span className="transition-transform group-hover:translate-y-0.5">&darr;</span>
          </button>
        </div>
        <div className="mt-5 flex flex-col gap-3">
          {recent.map((f, i) => (
            <FlightStrip key={f.id} flight={f} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
})

HomeScreen.displayName = 'HomeScreen'
export default HomeScreen

function Glance({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-xs text-text-mid">{label}</span>
      <span className={`font-mono text-xs tabular ${warn ? 'text-danger' : 'text-paper'}`}>{value}</span>
    </div>
  )
}
