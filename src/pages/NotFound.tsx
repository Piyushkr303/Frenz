import { Link } from 'react-router-dom'
import Horizon from '../components/Horizon'

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-6 px-6 py-32 text-center">
      <Horizon size={80} tilt={22} />
      <h1 className="font-display text-4xl italic text-paper">Off course.</h1>
      <p className="max-w-[36ch] text-sm text-text-mid">
        This heading doesn't lead anywhere on the chart. Let's turn back to the Ready Room.
      </p>
      <Link
        to="/"
        className="mt-2 flex items-center gap-2 rounded-full border border-amber-dim/60 bg-amber/10 px-5 py-2.5 text-sm text-amber transition-colors hover:bg-amber/20"
      >
        &larr; Return home
      </Link>
    </div>
  )
}
