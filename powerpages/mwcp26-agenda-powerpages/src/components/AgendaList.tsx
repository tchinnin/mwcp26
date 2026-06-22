/*
 * Feature 102 — US-102-01 : vue liste de l'agenda.
 * Toutes les sessions du jour (y compris sans salle ou sans horaire), regroupées par
 * heure de début, ordonnées chronologiquement. Les sessions sans horaire apparaissent
 * en dernier sous "Horaire à confirmer".
 *
 * Session / Keynote → carte .al-card cliquable (feature 105 — détail — à venir).
 * Pause / Repas / Evenement → bande .al-band non interactive avec icône de service.
 */

import './AgendaList.css'
import { ICONS, serviceIconKey } from './AgendaGrid'
import { groupByStartTime } from '../data/agenda-transform'
import type { Session } from '../types/agenda'

interface AgendaListProps {
  sessions: Session[]
  /** Callback feature 105 — ouvre le panneau de détail. */
  onSessionClick?: (s: Session) => void
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

/* Icône de service en cercle (28 px) pour les bandes de la vue liste. */
function BandIcon({ sessionType, title }: { sessionType: string; title: string }) {
  const paths = ICONS[serviceIconKey(sessionType, title)]
  return (
    <span className="al-band__icon-wrap">
      <svg className="al-band__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {paths.map((d, i) => <path key={i} d={d} />)}
      </svg>
    </span>
  )
}

export default function AgendaList({ sessions, onSessionClick }: AgendaListProps) {
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
            /* Pause / Repas / Evenement → bande non interactive */
            if (s.sessionType === 'Pause' || s.sessionType === 'Repas' || s.sessionType === 'Evenement') {
              return (
                <div key={s.id} className="al-band">
                  <BandIcon sessionType={s.sessionType} title={s.title} />
                  <span className="al-band__title">{s.title}</span>
                  {s.duration && <span className="al-band__duration">{s.duration}</span>}
                </div>
              )
            }

            /* Session / Keynote → carte cliquable */
            const speakers = s.speakers.map((sp) => sp.name).filter(Boolean)
            const timeRange =
              s.startTime && s.endTime ? `${s.startTime}–${s.endTime}` : s.startTime ?? ''

            return (
              <button
                key={s.id}
                className="al-card"
                style={{ '--rc': s.roomColor || 'var(--ink-200)' } as React.CSSProperties}
                onClick={() => onSessionClick?.(s)}
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
              </button>
            )
          })}
        </section>
      ))}
    </div>
  )
}
