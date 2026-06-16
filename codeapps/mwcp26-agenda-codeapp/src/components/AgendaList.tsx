/*
 * Feature 102 — US-102-01 : vue liste de l'agenda.
 * Toutes les sessions du jour (y compris sans salle ou sans horaire), regroupées par
 * heure de début, ordonnées chronologiquement. Les sessions sans horaire apparaissent
 * en dernier sous "Horaire à confirmer". Chaque carte est activable au clic et au
 * clavier (feature 105 — détail — non encore implémentée).
 */

import './AgendaList.css'
import { groupByStartTime } from '../data/agenda-transform'
import type { Session } from '../types/agenda'

interface AgendaListProps {
  sessions: Session[]
}

/* SVG étoile inline : placeholder favori (feature 106 non encore implémentée). */
function StarIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

/* SVG calendrier : état vide de la liste. */
function CalendarIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

export default function AgendaList({ sessions }: AgendaListProps) {
  const groups = groupByStartTime(sessions)

  if (groups.length === 0) {
    return (
      <div className="al-list">
        <div className="al-empty">
          <CalendarIcon />
          <p>Aucune session pour ce jour.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="al-list">
      {groups.map((group) => (
        <section key={group.time ?? '__unscheduled'} className="al-group">
          <header className="al-group-head">
            <span className="al-time">{group.label}</span>
            <div className="al-divider" aria-hidden="true" />
          </header>

          {group.sessions.map((s) => {
            const speakers = s.speakers.map((sp) => sp.name).filter(Boolean)
            const timeRange =
              s.startTime && s.endTime ? `${s.startTime}–${s.endTime}` : s.startTime ?? ''

            return (
              <button
                key={s.id}
                className="al-card"
                style={{ '--rc': s.roomColor || 'var(--ink-200)' } as React.CSSProperties}
                onClick={() => {
                  /* Feature 105 — détail session (à venir). */
                }}
              >
                <div className="al-card-body">
                  {/* Ligne supérieure : pill de salle + plage horaire */}
                  <div className="al-card-top">
                    {s.roomName && (
                      <span className="al-room-pill">
                        <span className="al-room-dot" aria-hidden="true" />
                        {s.roomName}
                      </span>
                    )}
                    {timeRange && <span className="al-hours">{timeRange}</span>}
                  </div>
                  <p className="al-title">{s.title}</p>
                  {speakers.length > 0 && (
                    <p className="al-speakers">{speakers.join(', ')}</p>
                  )}
                </div>
                <span className="al-fav" aria-label="Ajouter aux favoris">
                  <StarIcon />
                </span>
              </button>
            )
          })}
        </section>
      ))}
    </div>
  )
}
