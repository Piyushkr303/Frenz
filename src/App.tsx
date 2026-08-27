import { useEffect, useRef, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import Hud from './components/Hud'
import AltitudeTape from './components/AltitudeTape'
import ClearanceStrip from './components/ClearanceStrip'
import PlanScreen from './screens/PlanScreen'
import HomeScreen from './screens/HomeScreen'
import LogbookScreen from './screens/LogbookScreen'
import FleetScreen from './screens/FleetScreen'
import NotFound from './pages/NotFound'
import { sections } from './sections'
import { AgentEngineContext, useAgentEngineProvider, useAgentEngine } from './agents'

function SectionEffects({ activeId }: { activeId: string }) {
  const { state, setAgent, log, requestHuman } = useAgentEngine()
  const seen = useRef<Record<string, boolean>>({})

  useEffect(() => {
    if (activeId === 'logbook' && !seen.current.logbook && state.agents.logkeeper.state === 'idle') {
      seen.current.logbook = true
      setAgent('logkeeper', 'executing', 'Reconciling the ledger against Hobbs.')
      log('logkeeper', 'Reconciling 7 legs against aircraft Hobbs time.', 'info')
      window.setTimeout(() => {
        setAgent('logkeeper', 'completed', '7 legs reconciled — 6.0 hrs confirmed.')
        log('logkeeper', 'Ledger reconciled. 6.0 hrs confirmed, no discrepancies.', 'result')
        window.setTimeout(() => setAgent('logkeeper', 'idle', '7 legs reconciled.'), 2400)
      }, 850)
    }
    if (activeId === 'fleet' && !seen.current.fleet && state.agents.crew.state === 'idle') {
      seen.current.fleet = true
      setAgent('crew', 'using_tool', 'Pulling airworthiness records & squawks.')
      log('crew', 'Pulling airworthiness records for 3 tails.', 'info')
      window.setTimeout(() => {
        setAgent('crew', 'completed', '3 of 3 airworthy, 0 open squawks.')
        log('crew', '3 of 3 aircraft airworthy. No open squawks.', 'result')
        window.setTimeout(() => setAgent('crew', 'idle', '3 aircraft on the line.'), 2400)
      }, 700)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId])

  // The Currency agent raises a real decision shortly after arrival — the
  // system's autonomy visibly pausing for a human call.
  useEffect(() => {
    const t = window.setTimeout(() => {
      setAgent('currency', 'awaiting_human', 'Needs your call on night-currency risk.')
      log('currency', 'Night landings sit at the 90-day minimum. Flagging for a decision.', 'attention')
      requestHuman({
        id: 'currency-90d',
        agent: 'currency',
        title: 'Night currency is right at the line.',
        body: '3 of 3 required night landings in the last 90 days — one missed pattern and you lose night pax privileges. Want me to hold a night-currency slot on the schedule?',
        options: [
          { id: 'schedule', label: 'SCHEDULE A NIGHT SLOT', tone: 'approve' },
          { id: 'hold', label: 'REMIND ME IN 24H', tone: 'hold' },
          { id: 'dismiss', label: 'DISMISS', tone: 'deny' },
        ],
      })
    }, 2600)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}

function ResolutionEffects() {
  const { state, setAgent, log } = useAgentEngine()
  const handled = useRef<string | null>(null)

  useEffect(() => {
    const r = state.lastResolution
    if (!r || r.requestId !== 'currency-90d' || handled.current === r.requestId) return
    handled.current = r.requestId

    if (r.optionId === 'schedule') {
      setAgent('currency', 'executing', 'Booking a night-currency block.')
      log('currency', 'Cleared: scheduling a night-currency block this week.', 'decision')
      window.setTimeout(() => {
        setAgent('currency', 'completed', 'Night slot held for Thursday.')
        log('currency', 'Night-currency slot held for Thursday, weather permitting.', 'result')
        window.setTimeout(() => setAgent('currency', 'idle', 'Night slot held for Thursday.'), 2600)
      }, 900)
    } else if (r.optionId === 'hold') {
      setAgent('currency', 'waiting', 'Holding — will re-raise in 24h.')
      log('currency', 'Held. Will re-raise the night-currency question in 24h.', 'decision')
    } else {
      setAgent('currency', 'idle', 'Tracking medical, review, landings.')
      log('currency', 'Dismissed. Continuing to monitor the 90-day window.', 'decision')
    }
  }, [state.lastResolution])

  return null
}

function Experience() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})
  const [activeIndex, setActiveIndex] = useState(1)
  const engine = useAgentEngineProvider()

  useEffect(() => {
    const root = scrollRef.current
    if (!root) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.id
            const idx = sections.findIndex((s) => s.id === id)
            if (idx !== -1) setActiveIndex(idx)
          }
        }
      },
      { root, threshold: 0.55 },
    )

    for (const s of sections) {
      const el = sectionRefs.current[s.id]
      if (el) observer.observe(el)
    }

    sectionRefs.current.home?.scrollIntoView({ block: 'start' })

    return () => observer.disconnect()
  }, [])

  function goTo(id: string) {
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <AgentEngineContext.Provider value={engine}>
      <div className={`min-h-full ${engine.state.pending ? 'holding' : ''}`}>
        <div className="grain" />
        <Hud active={sections[activeIndex]} onHome={() => goTo('home')} />
        <ClearanceStrip />
        <AltitudeTape activeIndex={activeIndex} onSelect={goTo} />
        <SectionEffects activeId={sections[activeIndex].id} />
        <ResolutionEffects />

        <div ref={scrollRef} className="flight-scroll scrollbar-none">
          <PlanScreen ref={(el) => { sectionRefs.current.plan = el }} />
          <HomeScreen ref={(el) => { sectionRefs.current.home = el }} onDescend={() => goTo('logbook')} />
          <LogbookScreen ref={(el) => { sectionRefs.current.logbook = el }} />
          <FleetScreen ref={(el) => { sectionRefs.current.fleet = el }} />
        </div>
      </div>
    </AgentEngineContext.Provider>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Experience />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
