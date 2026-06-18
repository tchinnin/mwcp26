import type { Day } from '../data/agenda'
import { matchesQuery, groupByStartTime, contentCount } from '../data/agenda'
import { TimeGroup } from './TimeGroup'
import { EmptyState } from './EmptyState'
import { ListSkeleton } from './ListSkeleton'
import { Footer } from './Footer'

/** Vue liste d'un jour (spec 102) : meta + groupes horaires, filtrés par la recherche (104). */
export function AgendaList({
  day,
  query,
  loading,
  onClearSearch,
}: {
  day: Day
  query: string
  loading: boolean
  onClearSearch: () => void
}) {
  if (loading) {
    return (
      <main className="list">
        <ListSkeleton />
      </main>
    )
  }

  const hasQuery = query.trim().length > 0
  const filtered = day.sessions.filter((s) => matchesQuery(s, query))
  const groups = groupByStartTime(filtered)
  const count = contentCount(filtered)

  return (
    <main className="list">
      {groups.length === 0 ? (
        <EmptyState
          variant={hasQuery ? 'no-results' : 'empty-day'}
          onClear={hasQuery ? onClearSearch : undefined}
        />
      ) : (
        <>
          <div className="list-meta">
            <span className="list-meta-count">
              {count} session{count > 1 ? 's' : ''}
            </span>
            <span className="list-meta-day">{day.date}</span>
          </div>
          {groups.map((g) => (
            <TimeGroup key={g.key} group={g} />
          ))}
        </>
      )}
      <Footer />
    </main>
  )
}
