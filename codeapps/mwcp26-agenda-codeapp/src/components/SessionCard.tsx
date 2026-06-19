import type { CSSProperties } from 'react'
import { User } from 'lucide-react'
import type { Session } from '../data/agenda'
import { parseRoom, speakerLabel } from '../data/agenda'

export function SessionCard({ session }: { session: Session }) {
  const room = parseRoom(session.room)
  const speakers = speakerLabel(session.speakers)

  return (
    <article className="scard" style={{ '--rc': room.color } as CSSProperties}>
      <span className="scard-bar" />
      <div className="scard-body">
        <div className="scard-top">
          <span className="sroom">
            <span className="sroom-dot" />
            {room.label}
            {room.capacity && <span className="sroom-cap"> · {room.capacity}</span>}
          </span>
          <span className="sdur">{session.duration}</span>
        </div>
        <div className="stitle">{session.title}</div>
        {speakers && (
          <div className="sspk">
            <User size={13} className="sspk-icon" aria-hidden />
            <span>{speakers}</span>
          </div>
        )}
      </div>
    </article>
  )
}
