import { useEffect, useState } from 'react'

export default function ZuluClock() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const hh = now.getUTCHours().toString().padStart(2, '0')
  const mm = now.getUTCMinutes().toString().padStart(2, '0')
  const ss = now.getUTCSeconds().toString().padStart(2, '0')

  return (
    <div className="flex items-baseline gap-1.5 font-mono text-xs text-text-mid tabular">
      <span className="text-amber">{hh}:{mm}</span>
      <span className="opacity-50">:{ss}</span>
      <span className="text-text-low">Z</span>
    </div>
  )
}
