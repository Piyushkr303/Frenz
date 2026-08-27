import { forwardRef, useMemo, useState } from 'react'
import { airports } from '../data'
import Horizon from '../components/Horizon'
import { useAgentEngine } from '../agents'

const codes = Object.keys(airports)

function haversineNm(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const R = 3440.065
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLon = toRad(b.lon - a.lon)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

type Status = 'idle' | 'computing' | 'ready' | 'error'

const PlanScreen = forwardRef<HTMLElement>((_, ref) => {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [speed, setSpeed] = useState(115)
  const [burn, setBurn] = useState(9.5)
  const [status, setStatus] = useState<Status>('idle')
  const [result, setResult] = useState<{ dist: number; ete: number; fuel: number } | null>(null)
  const { setAgent, log, dispatch } = useAgentEngine()

  const canPlan = from && to
  const sameAirport = from && to && from === to

  function runBriefing() {
    if (!canPlan) return
    if (sameAirport) {
      setStatus('error')
      setAgent('navigator', 'failed', `${from} and ${to} can't match.`)
      log('navigator', `Rejected: departure and destination both ${from}.`, 'attention')
      return
    }
    setStatus('computing')
    setResult(null)

    setAgent('navigator', 'planning', `Plotting ${from} → ${to}.`)
    log('navigator', `Plotting a route from ${from} to ${to}.`, 'info')

    window.setTimeout(() => {
      setAgent('navigator', 'delegating', `Confirming field conditions at ${to}.`, 'wx')
      setAgent('wx', 'using_tool', `Pulling conditions for ${to}.`)
      log('navigator', `Delegating to WX WATCH — checking ${to} conditions.`, 'delegate')
    }, 260)

    window.setTimeout(() => {
      setAgent('wx', 'collaborating', `${to} reporting VFR.`)
      log('wx', `${to} reporting VFR, winds workable.`, 'result')
      setAgent('navigator', 'executing', 'Computing distance, time, and fuel.')
    }, 560)

    window.setTimeout(() => {
      const a = airports[from]
      const b = airports[to]
      const dist = haversineNm(a, b)
      const ete = dist / speed
      const fuel = ete * burn
      setResult({ dist, ete, fuel })
      setStatus('ready')

      setAgent('navigator', 'completed', `Briefing ready: ${dist.toFixed(0)}nm, ${fmtHours(ete)}.`)
      setAgent('wx', 'idle', 'Monitoring KPAO.')
      dispatch({ type: 'SET_OBJECTIVE', objective: `${from} → ${to} · briefing ready` })
      log('navigator', `Briefing ready — ${dist.toFixed(0)}nm, ${fmtHours(ete)}, ${fuel.toFixed(1)}gal.`, 'result')
      window.setTimeout(() => setAgent('navigator', 'idle', 'Standing by for a destination.'), 2600)
    }, 900)
  }

  const routePath = useMemo(() => {
    if (!canPlan || sameAirport) return null
    return 'M 30 130 Q 320 10 620 130'
  }, [canPlan, sameAirport])

  return (
    <section id="plan" ref={ref} className="flight-section scene-plan flex flex-col lg:flex-row">
      {/* Instrument column */}
      <div className="flex shrink-0 flex-col justify-center gap-7 border-b border-line-soft px-6 pb-14 pt-28 sm:px-10 lg:w-[420px] lg:border-b-0 lg:border-r lg:pb-0 lg:pt-28">
        <div className="mb-1 font-mono text-[11px] tracking-[0.3em] text-cyan-dim">FLIGHT BRIEFING</div>

        <Field label="Departure">
          <select
            value={from}
            onChange={(e) => {
              setFrom(e.target.value)
              setStatus('idle')
            }}
            className="w-full appearance-none border-b border-line bg-transparent py-3 font-mono text-2xl text-paper outline-none transition-colors focus:border-cyan"
          >
            <option value="" className="bg-ink-1">— select —</option>
            {codes.map((c) => (
              <option key={c} value={c} className="bg-ink-1">{c} &middot; {airports[c].city}</option>
            ))}
          </select>
        </Field>

        <Field label="Destination">
          <select
            value={to}
            onChange={(e) => {
              setTo(e.target.value)
              setStatus('idle')
            }}
            className="w-full appearance-none border-b border-line bg-transparent py-3 font-mono text-2xl text-paper outline-none transition-colors focus:border-cyan"
          >
            <option value="" className="bg-ink-1">— select —</option>
            {codes.map((c) => (
              <option key={c} value={c} className="bg-ink-1">{c} &middot; {airports[c].city}</option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-6">
          <Field label="Cruise (kt)">
            <input
              type="number"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-full border-b border-line bg-transparent py-3 font-mono text-2xl text-paper outline-none transition-colors focus:border-cyan"
            />
          </Field>
          <Field label="Burn (gph)">
            <input
              type="number"
              step="0.1"
              value={burn}
              onChange={(e) => setBurn(Number(e.target.value))}
              className="w-full border-b border-line bg-transparent py-3 font-mono text-2xl text-paper outline-none transition-colors focus:border-cyan"
            />
          </Field>
        </div>

        {status === 'error' && (
          <p className="border-l-2 border-danger bg-danger/10 px-4 py-3 text-sm text-danger">
            Departure and destination can't match. Pick a different destination.
          </p>
        )}

        <button
          onClick={runBriefing}
          disabled={!canPlan || status === 'computing'}
          className="mt-1 flex items-center justify-center gap-3 rounded-full border border-cyan-dim/60 bg-cyan/10 py-3.5 text-sm text-cyan transition-colors hover:bg-cyan/20 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-cyan/10"
        >
          {status === 'computing' ? 'Computing briefing…' : 'Compute briefing'}
        </button>
      </div>

      {/* Canvas */}
      <div className="relative flex flex-1 flex-col justify-center px-6 py-16 sm:px-10 lg:px-16">
        <h1 className="max-w-xl font-display text-4xl leading-[0.95] tracking-tight text-paper sm:text-5xl lg:text-6xl">
          Where are you <em className="text-cyan not-italic">headed</em>?
        </h1>

        <div className="mt-14 flex min-h-[280px] flex-col justify-center">
          {status === 'idle' && !canPlan && <EmptyState />}

          {status === 'idle' && canPlan && !sameAirport && (
            <div className="flex flex-col gap-6">
              <RouteViz path={routePath} from={from} to={to} animated={false} />
              <p className="text-sm text-text-mid">Route staged &mdash; run the briefing to compute distance, time, and fuel.</p>
            </div>
          )}

          {status === 'computing' && (
            <div className="flex flex-col items-center gap-5 py-6 text-center">
              <Horizon size={72} spinning />
              <p className="font-mono text-xs tracking-widest text-text-mid">CALCULATING GREAT-CIRCLE ROUTE…</p>
            </div>
          )}

          {status === 'ready' && result && (
            <div className="flex flex-col gap-12">
              <RouteViz path={routePath} from={from} to={to} animated />
              <div className="grid grid-cols-3 gap-6 border-t border-line pt-8 sm:gap-10">
                <Stat label="Distance" value={result.dist.toFixed(0)} unit="nm" />
                <Stat label="Est. time" value={fmtHours(result.ete)} unit="" />
                <Stat label="Fuel req." value={result.fuel.toFixed(1)} unit="gal" />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
})

PlanScreen.displayName = 'PlanScreen'
export default PlanScreen

function fmtHours(h: number) {
  const hh = Math.floor(h)
  const mm = Math.round((h - hh) * 60)
  return `${hh}h ${mm.toString().padStart(2, '0')}m`
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block font-mono text-[11px] uppercase tracking-[0.25em] text-text-low">{label}</span>
      {children}
    </label>
  )
}

function Stat({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div>
      <div className="font-mono text-4xl text-paper tabular sm:text-5xl">
        {value}
        <span className="ml-1 text-lg text-text-mid">{unit}</span>
      </div>
      <div className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-text-low">{label}</div>
    </div>
  )
}

function RouteViz({ path, from, to, animated }: { path: string | null; from: string; to: string; animated: boolean }) {
  if (!path) return null
  return (
    <svg viewBox="0 0 650 150" className="w-full max-w-2xl">
      <path d={path} fill="none" stroke="var(--color-line)" strokeWidth="1.5" strokeDasharray="4 7" />
      <path
        d={path}
        fill="none"
        stroke="var(--color-cyan)"
        strokeWidth="2"
        pathLength={100}
        strokeDasharray={100}
        strokeDashoffset={animated ? 0 : 100}
        style={{ transition: animated ? 'stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)' : undefined }}
      />
      <circle cx="30" cy="130" r="5" fill="var(--color-paper)" />
      <circle cx="620" cy="130" r="5" fill="var(--color-paper)" />
      <text x="30" y="148" textAnchor="middle" fontFamily="IBM Plex Mono" fontSize="15" fill="var(--color-text-mid)">{from}</text>
      <text x="620" y="148" textAnchor="middle" fontFamily="IBM Plex Mono" fontSize="15" fill="var(--color-text-mid)">{to}</text>
    </svg>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-start gap-4 opacity-70">
      <svg width="52" height="52" viewBox="0 0 56 56" fill="none">
        <circle cx="28" cy="28" r="26" stroke="var(--color-line)" strokeWidth="1.5" />
        <path d="M16 32 L28 20 L40 32" stroke="var(--color-text-low)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="28" y1="20" x2="28" y2="38" stroke="var(--color-text-low)" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <p className="max-w-[32ch] text-sm text-text-mid">Select a departure and destination to stage a route.</p>
    </div>
  )
}
