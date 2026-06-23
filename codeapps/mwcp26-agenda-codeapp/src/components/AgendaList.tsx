/*
 * Feature 102 — US-102-01 : vue liste de l'agenda.
 * Toutes les sessions du jour regroupées par heure de début, ordonnées chronologiquement.
 * Rendu selon sessionType :
 *   Session / Keynote   → .al-card (rail couleur, pill salle, titre, speakers)
 *   Pause / Repas / Evenement → .al-band (icône cercle + titre + durée)
 * Chaque carte Session/Keynote est activable au clic et au clavier (feature 105).
 */

import './AgendaList.css'
import { groupByStartTime } from '../data/agenda-transform'
import { ServiceIcon } from './AgendaGrid'
import type { Session } from '../types/agenda'

interface AgendaListProps {
  sessions: Session[]
  onSessionClick: (s: Session) => void
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

function SessionCard({ s, onClick }: { s: Session; onClick: () => void }) {
  const speakers = s.speakers.map((sp) => sp.name).filter(Boolean)
  const timeRange = s.startTime && s.endTime ? `${s.startTime}–${s.endTime}` : s.startTime ?? ''

  return (
    <button
      className="al-card"
      style={{ '--rc': s.roomColor || 'var(--ink-200)' } as React.CSSProperties}
      onClick={onClick}
      aria-label={s.title}
    >
      <div className="al-card-body">
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
}

function BandRow({ s }: { s: Session }) {
  return (
    <div className="al-band">
      <span className="al-band__icon">
        <ServiceIcon session={s} className="al-band__svg" />
      </span>
      <span className="al-band__title">{s.title}</span>
      {s.duration && <span className="al-band__duration">{s.duration}</span>}
    </div>
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

          {group.sessions.map((s) =>
            s.sessionType === 'Pause' || s.sessionType === 'Repas' || s.sessionType === 'Evenement'
              ? <BandRow key={s.id} s={s} />
              : <SessionCard key={s.id} s={s} onClick={() => onSessionClick(s)} />
          )}
        </section>
      ))}
    </div>
  )
}
