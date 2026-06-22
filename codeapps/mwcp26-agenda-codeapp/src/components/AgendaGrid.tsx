/*
 * Feature 101 — Vue grille de l'agenda (salles × heures), desktop-only.
 *
 * Rendu selon sessionType :
 *   Session   → .tt-card dans la colonne de sa salle
 *   Keynote   → .tt-card.tt-keynote pleine largeur + badge salle
 *   Pause     → .tt-band pleine largeur, icône café
 *   Repas     → .tt-band pleine largeur, icône couverts
 *   Evenement → .tt-band pleine largeur, icône variable (mot-clé titre)
 *
 * Périmètre : cartes STATIQUES — pas de clic/détail (105). Filtrage (104) à venir.
 */

import type { CSSProperties } from 'react'
import type { Room, Session } from '../types/agenda'
import { HEADER_ROW, HOUR_COL, PXPER5, roomColumns } from './gridLayout'
import './AgendaGrid.css'

function toMin(t: string): number {
  const [h, m] = t.split(':')
  return Number(h) * 60 + Number(m)
}

/* Icône d'une session de service, choisie par mot-clé du titre (cf. maquette `breakIcon`).
   SVG inline léger (style Lucide) — pas de dépendance d'icônes ajoutée. */
const ICONS: Record<string, string[]> = {
  coffee: ['M10 2v2', 'M14 2v2', 'M6 2v2', 'M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1'],
  utensils: ['M3 2v7c0 1.1.9 2 2 2a2 2 0 0 0 2-2V2', 'M7 2v20', 'M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7'],
  'door-open': ['M13 4h3a2 2 0 0 1 2 2v14', 'M2 20h3', 'M13 20h9', 'M10 12v.01', 'M13 4.6v16.2a1 1 0 0 1-1.2 1L5 20V5.6a2 2 0 0 1 1.5-2l4-1A2 2 0 0 1 13 4.6Z'],
  flag: ['M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z', 'M4 22v-7'],
  party: ['M5.8 11.3 2 22l10.7-3.8', 'M4 3h.01', 'M22 8h.01', 'M15 2h.01', 'M22 20h.01', 'M22 2 11 13'],
  users: ['M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2', 'M22 21v-2a4 4 0 0 0-3-3.9', 'M16 3.1a4 4 0 0 1 0 7.8'],
  trophy: ['M6 9H4.5a2.5 2.5 0 0 1 0-5H6', 'M18 9h1.5a2.5 2.5 0 0 0 0-5H18', 'M4 22h16', 'M10 14.7V17c0 .6-.5 1-1 1.2C7.9 18.8 7 20.2 7 22', 'M14 14.7V17c0 .6.5 1 1 1.2 1.1.6 2 2 2 4.8', 'M18 2H6v7a6 6 0 0 0 12 0V2Z'],
  default: ['M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5', 'M16 2v4', 'M8 2v4', 'M3 10h5', 'M17.5 17.5 16 16.3V14'],
}

function bandIconKey(s: Session): keyof typeof ICONS {
  if (s.sessionType === 'Pause') return 'coffee'
  if (s.sessionType === 'Repas') return 'utensils'
  // Evenement : icône variable selon le mot-clé du titre
  const t = (s.title || '').toLowerCase()
  if (t.includes('accueil')) return 'door-open'
  if (t.includes('lancement') || t.includes('ouverture')) return 'flag'
  if (t.includes('clôture') || t.includes('cloture') || t.includes('fin') || t.includes('cocktail') || t.includes('apéro')) return 'party'
  if (t.includes('networking') || t.includes('réseau') || t.includes('reseau')) return 'users'
  if (t.includes('remise') || t.includes('prix') || t.includes('award')) return 'trophy'
  return 'default'
}

export function ServiceIcon({ session, className = 'tt-band__icon' }: { session: Session; className?: string }) {
  const paths = ICONS[bandIconKey(session)]
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths.map((d, i) => <path key={i} d={d} />)}
    </svg>
  )
}

function speakerLine(s: Session): string {
  const names = s.speakers.map((x) => x.name)
  if (names.length <= 1) return names.join(', ')
  return names[0] + ' +' + (names.length - 1)
}

export interface AgendaGridProps {
  /** Sessions positionnables du jour sélectionné. */
  sessions: Session[]
  /** Salles = colonnes de la grille. */
  rooms: Room[]
}

export default function AgendaGrid({ sessions, rooms }: AgendaGridProps) {
  if (!sessions.length) {
    return (
      <div className="tt-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" width={30} height={30}>
          <path d="M8 2v4" /><path d="M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" />
          <path d="M3 10h18" /><path d="m14 14-4 4" /><path d="m10 14 4 4" />
        </svg>
        <p>Aucune session positionnable pour ce jour.</p>
      </div>
    )
  }

  const dayStart = Math.min(...sessions.map((s) => toMin(s.startTime)))
  const dayEnd = Math.max(...sessions.map((s) => toMin(s.endTime)))
  const rows = Math.round((dayEnd - dayStart) / 5)
  const rowFor = (m: number) => 2 + Math.round((m - dayStart) / 5)
  const marks = [...new Set(sessions.map((s) => s.startTime))].sort()

  const roomIndex: Record<string, number> = {}
  rooms.forEach((r, i) => { roomIndex[r.key] = i })

  const gridStyle: CSSProperties = {
    gridTemplateColumns: `${HOUR_COL} ${roomColumns(rooms.length)}`,
    gridTemplateRows: `${HEADER_ROW} repeat(${rows}, ${PXPER5}px)`,
  }

  return (
    <div className="ttgrid" style={gridStyle}>
      {/* coin */}
      <div className="tt-corner" style={{ gridColumn: 1, gridRow: 1 }} />

      {/* en-têtes de salle */}
      {rooms.map((r, i) => (
        <div key={'h' + r.key} className="tt-roomhead" style={{ gridColumn: i + 2, gridRow: 1 }}>
          <span className="tt-roomdot" style={{ background: r.color }} />
          <span className="tt-roomname">{r.name}</span>
          <span className="tt-roomcap">{r.cap}p</span>
        </div>
      ))}

      {/* labels d'heures + lignes de grille */}
      {marks.map((t) => {
        const rr = rowFor(toMin(t))
        return [
          <div key={'t' + t} className="tt-time" style={{ gridColumn: 1, gridRow: rr }}>{t}</div>,
          <div key={'l' + t} className="tt-line" style={{ gridColumn: '1 / -1', gridRow: `${rr} / span 1` }} />,
        ]
      })}

      {/* sessions */}
      {sessions.map((s) => {
        const r1 = rowFor(toMin(s.startTime))
        const r2 = rowFor(toMin(s.endTime))

        // Pause / Repas / Evenement → bande pleine largeur
        if (s.sessionType === 'Pause' || s.sessionType === 'Repas' || s.sessionType === 'Evenement') {
          return (
            <div key={s.id} className="tt-band" style={{ gridColumn: `2 / ${rooms.length + 2}`, gridRow: `${r1} / ${r2}` }}>
              <ServiceIcon session={s} />
              <span>{s.title}</span>
            </div>
          )
        }

        // Keynote → carte pleine largeur avec badge de salle hôte
        if (s.sessionType === 'Keynote') {
          const hostRoom = s.room ? rooms.find((r) => r.key === s.room) : undefined
          const line = speakerLine(s)
          return (
            <div
              key={s.id}
              className="tt-card tt-keynote"
              style={{ gridColumn: `2 / ${rooms.length + 2}`, gridRow: `${r1} / ${r2}`, ['--rc' as string]: hostRoom?.color ?? 'var(--brand-blue)' } as CSSProperties}
            >
              <div className="tt-ctime">{s.startTime}–{s.endTime}</div>
              {hostRoom && (
                <div className="tt-keynote__badge">
                  <span className="tt-roomdot" style={{ background: hostRoom.color }} />
                  {hostRoom.name}
                </div>
              )}
              <div className="tt-ctitle">{s.title}</div>
              {line ? <div className="tt-cspk">{line}</div> : null}
            </div>
          )
        }

        // Session → carte dans la colonne de sa salle
        const col = (roomIndex[s.room ?? ''] ?? 0) + 2
        const line = speakerLine(s)
        return (
          <div
            key={s.id}
            className="tt-card"
            style={{ gridColumn: col, gridRow: `${r1} / ${r2}`, ['--rc' as string]: s.roomColor } as CSSProperties}
          >
            <div className="tt-ctime">{s.startTime}–{s.endTime}</div>
            <div className="tt-ctitle">{s.title}</div>
            {line ? <div className="tt-cspk">{line}</div> : null}
          </div>
        )
      })}
    </div>
  )
}
