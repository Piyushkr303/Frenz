import { createContext, useCallback, useContext, useReducer, useRef } from 'react'

export type AgentState =
  | 'idle'
  | 'planning'
  | 'executing'
  | 'using_tool'
  | 'delegating'
  | 'collaborating'
  | 'waiting'
  | 'blocked'
  | 'failed'
  | 'recovering'
  | 'awaiting_human'
  | 'completed'

export type AgentId = 'navigator' | 'wx' | 'currency' | 'logkeeper' | 'crew'

export type Agent = {
  id: AgentId
  callsign: string
  role: string
  state: AgentState
  detail: string
  delegatingTo?: AgentId
}

export type EventKind = 'info' | 'delegate' | 'result' | 'attention' | 'decision'

export type ActivityEvent = {
  id: string
  t: string
  agent: AgentId
  text: string
  kind: EventKind
}

export type ClearanceOption = {
  id: string
  label: string
  tone: 'approve' | 'hold' | 'deny'
}

export type ClearanceRequest = {
  id: string
  agent: AgentId
  title: string
  body: string
  options: ClearanceOption[]
}

export type EngineState = {
  agents: Record<AgentId, Agent>
  objective: string
  log: ActivityEvent[]
  pending: ClearanceRequest | null
  lastResolution: { requestId: string; optionId: string } | null
}

export const AGENT_ORDER: AgentId[] = ['navigator', 'wx', 'currency', 'logkeeper', 'crew']

const initialAgents: Record<AgentId, Agent> = {
  navigator: { id: 'navigator', callsign: 'NAVIGATOR', role: 'Route & briefing', state: 'idle', detail: 'Standing by for a destination.' },
  wx: { id: 'wx', callsign: 'WX WATCH', role: 'Field conditions', state: 'idle', detail: 'Monitoring KPAO.' },
  currency: { id: 'currency', callsign: 'CURRENCY', role: 'Pilot readiness', state: 'idle', detail: 'Tracking medical, review, landings.' },
  logkeeper: { id: 'logkeeper', callsign: 'LOGKEEPER', role: 'Logbook ledger', state: 'idle', detail: '7 legs reconciled.' },
  crew: { id: 'crew', callsign: 'CREW CHIEF', role: 'Fleet readiness', state: 'idle', detail: '3 aircraft on the line.' },
}

const seedLog: ActivityEvent[] = [
  { id: 'e0', t: '08:41Z', agent: 'crew', text: 'Morning sweep complete — 3 of 3 aircraft airworthy.', kind: 'result' },
  { id: 'e1', t: '08:52Z', agent: 'wx', text: 'KPAO holding VFR, wind 280 at 8.', kind: 'info' },
  { id: 'e2', t: '09:10Z', agent: 'currency', text: 'Night landings at 3 of 3 required in 90 days — right at minimums.', kind: 'attention' },
]

const initialState: EngineState = {
  agents: initialAgents,
  objective: 'Maintain currency & fleet readiness',
  log: seedLog,
  pending: null,
  lastResolution: null,
}

type Action =
  | { type: 'SET_STATE'; id: AgentId; state: AgentState; detail?: string; delegatingTo?: AgentId }
  | { type: 'LOG'; agent: AgentId; text: string; kind?: EventKind }
  | { type: 'SET_OBJECTIVE'; objective: string }
  | { type: 'REQUEST_HUMAN'; request: ClearanceRequest }
  | { type: 'RESOLVE_HUMAN'; optionId: string }

let eventSeq = 100

function reducer(state: EngineState, action: Action): EngineState {
  switch (action.type) {
    case 'SET_STATE': {
      const agent = state.agents[action.id]
      return {
        ...state,
        agents: {
          ...state.agents,
          [action.id]: {
            ...agent,
            state: action.state,
            detail: action.detail ?? agent.detail,
            delegatingTo: action.delegatingTo,
          },
        },
      }
    }
    case 'LOG': {
      const entry: ActivityEvent = {
        id: `e${eventSeq++}`,
        t: nowZ(),
        agent: action.agent,
        text: action.text,
        kind: action.kind ?? 'info',
      }
      return { ...state, log: [entry, ...state.log].slice(0, 40) }
    }
    case 'SET_OBJECTIVE':
      return { ...state, objective: action.objective }
    case 'REQUEST_HUMAN':
      return { ...state, pending: action.request }
    case 'RESOLVE_HUMAN': {
      if (!state.pending) return state
      return {
        ...state,
        lastResolution: { requestId: state.pending.id, optionId: action.optionId },
        pending: null,
      }
    }
    default:
      return state
  }
}

function nowZ() {
  const d = new Date()
  return `${d.getUTCHours().toString().padStart(2, '0')}:${d.getUTCMinutes().toString().padStart(2, '0')}Z`
}

type EngineApi = {
  state: EngineState
  dispatch: React.Dispatch<Action>
  setAgent: (id: AgentId, state: AgentState, detail?: string, delegatingTo?: AgentId) => void
  log: (agent: AgentId, text: string, kind?: EventKind) => void
  requestHuman: (request: ClearanceRequest) => void
  resolveHuman: (optionId: string) => void
}

export const AgentEngineContext = createContext<EngineApi | null>(null)

export function useAgentEngineProvider(): EngineApi {
  const [state, dispatch] = useReducer(reducer, initialState)

  const setAgent = useCallback((id: AgentId, s: AgentState, detail?: string, delegatingTo?: AgentId) => {
    dispatch({ type: 'SET_STATE', id, state: s, detail, delegatingTo })
  }, [])

  const log = useCallback((agent: AgentId, text: string, kind?: EventKind) => {
    dispatch({ type: 'LOG', agent, text, kind })
  }, [])

  const requestHuman = useCallback((request: ClearanceRequest) => {
    dispatch({ type: 'REQUEST_HUMAN', request })
  }, [])

  const resolveHuman = useCallback((optionId: string) => {
    dispatch({ type: 'RESOLVE_HUMAN', optionId })
  }, [])

  return { state, dispatch, setAgent, log, requestHuman, resolveHuman }
}

export function useAgentEngine() {
  const ctx = useContext(AgentEngineContext)
  if (!ctx) throw new Error('useAgentEngine must be used within AgentEngineContext.Provider')
  return ctx
}

/** Guards a one-shot sequence so re-triggering (e.g. re-entering a section) is a no-op mid-flight. */
export function useSequenceGuard() {
  const running = useRef(false)
  return {
    tryRun(fn: () => void) {
      if (running.current) return
      running.current = true
      fn()
    },
    release() {
      running.current = false
    },
  }
}
