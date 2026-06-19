import type { Day } from '../data/agenda'
import { DayTabs } from './DayTabs'
import { SearchBar } from './SearchBar'
import { RoomChips } from './RoomChips'

/** Barre de contrôles sticky glassmorphique : jour (103) + recherche (104) + chips salle (visuel). */
export function Controls({
  days,
  query,
  onQueryChange,
}: {
  days: Day[]
  query: string
  onQueryChange: (v: string) => void
}) {
  return (
    <div className="controls">
      <div className="controls-row">
        <DayTabs days={days} />
        <SearchBar value={query} onChange={onQueryChange} />
      </div>
      <RoomChips />
    </div>
  )
}
