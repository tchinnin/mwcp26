import { Search, X } from 'lucide-react'

/** Barre de recherche (spec 104) — filtrage temps réel titre + speaker. */
export function SearchBar({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="search">
      <Search size={16} style={{ color: 'var(--text-muted)', flex: 'none' }} aria-hidden />
      <input
        className="search-input"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Rechercher une session, un speaker…"
        aria-label="Rechercher une session ou un speaker"
      />
      {value && (
        <button
          className="search-clear"
          type="button"
          onClick={() => onChange('')}
          aria-label="Effacer la recherche"
        >
          <X size={16} />
        </button>
      )}
    </div>
  )
}
