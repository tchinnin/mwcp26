import { LayoutGrid } from 'lucide-react'
import { allRooms } from '../data/agenda'

/**
 * Chips de filtre par salle — VISUELS SEULEMENT pour cette itération
 * (hors périmètre des specs 103/104, aucune logique de filtrage).
 */
export function RoomChips() {
  const rooms = allRooms()
  return (
    <div className="chips" aria-hidden>
      <button className="chip is-active" type="button" tabIndex={-1}>
        <LayoutGrid size={13} />
        Toutes les salles
      </button>
      {rooms.map((r) => (
        <button className="chip" type="button" tabIndex={-1} key={r.num}>
          <span className="chip-dot" style={{ background: r.color }} />
          {r.label}
          <span className="chip-cap">{r.capacity}</span>
        </button>
      ))}
    </div>
  )
}
