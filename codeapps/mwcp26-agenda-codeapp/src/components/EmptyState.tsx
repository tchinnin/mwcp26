import { CalendarX2, SearchX } from 'lucide-react'

/** État vide centré (spec 102/104) : jour sans session ou recherche sans résultat. */
export function EmptyState({
  variant,
  onClear,
}: {
  variant: 'no-results' | 'empty-day'
  onClear?: () => void
}) {
  if (variant === 'no-results') {
    return (
      <div className="empty">
        <SearchX size={40} strokeWidth={1.5} aria-hidden />
        <p>Aucune session ne correspond à votre recherche.</p>
        {onClear && (
          <button className="empty-clear" type="button" onClick={onClear}>
            Effacer la recherche
          </button>
        )}
      </div>
    )
  }
  return (
    <div className="empty">
      <CalendarX2 size={40} strokeWidth={1.5} aria-hidden />
      <p>Aucune session programmée pour cette journée.</p>
    </div>
  )
}
