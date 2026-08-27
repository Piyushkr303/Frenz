import { useAgentEngine, type EventKind } from '../agents'

const kindColor: Record<EventKind, string> = {
  info: 'text-text-mid',
  delegate: 'text-amber',
  result: 'text-cyan',
  attention: 'text-amber',
  decision: 'text-paper',
}

const agentTag: Record<string, string> = {
  navigator: 'NAV',
  wx: 'WX',
  currency: 'CUR',
  logkeeper: 'LOG',
  crew: 'CRW',
}

export default function ActivityTimeline({ limit = 8 }: { limit?: number }) {
  const { state } = useAgentEngine()
  const items = state.log.slice(0, limit)

  return (
    <ul className="flex flex-col">
      {items.map((e, i) => (
        <li
          key={e.id}
          className="flex items-baseline gap-3 border-t border-line-soft py-2.5 first:border-t-0"
          style={i === 0 ? { animation: 'fade-up 0.4s ease both' } : undefined}
        >
          <span className="shrink-0 font-mono text-[10px] tabular text-text-low">{e.t}</span>
          <span className="shrink-0 font-mono text-[10px] tracking-widest text-text-low">[{agentTag[e.agent]}]</span>
          <span className={`text-[13px] leading-snug ${kindColor[e.kind]}`}>{e.text}</span>
        </li>
      ))}
    </ul>
  )
}
