/*
 * Couche données — Phase 2 PORTAL WEB API.
 * 5 requêtes OData parallèles vers /_api/, jointures côté client par GUID.
 * App.tsx et tous les composants restent inchangés — seule cette couture change.
 */

import type { AgendaData, Day, Session, SessionType } from '../types/agenda'
import { buildRooms } from './agenda-transform'

export { defaultDayIndex, positionableSessions } from './agenda-transform'

const CONFERENCE_NAME = 'MWCP 2026'
const API_BASE = '/_api'

/* ---------- Types OData Dataverse ---------- */

interface ODataList<T> { value: T[] }

interface DvConference {
  mwcp26_conferenceid: string
  mwcp26_name: string
}

interface DvSalle {
  mwcp26_salleid: string
  mwcp26_name: string
}

interface DvSession {
  mwcp26_sessionid: string
  mwcp26_name: string
  mwcp26_description: string | null
  mwcp26_startdatetime: string   // UTC ISO
  mwcp26_enddatetime: string
  _mwcp26_salleid_value: string | null
  _mwcp26_conferenceid_value: string
  mwcp26_sessiontypecode: number | null
}

const SESSION_TYPE_MAP: Record<number, SessionType> = {
  318610000: 'Session',
  318610001: 'Keynote',
  318610002: 'Pause',
  318610003: 'Repas',
  318610004: 'Evenement',
}

interface DvSessionSpeaker {
  mwcp26_sessionspeakerid: string
  _mwcp26_sessionid_value: string
  _mwcp26_speakerid_value: string | null
}

interface DvContact {
  contactid: string
  firstname: string | null
  lastname: string | null
  jobtitle: string | null
  description: string | null
}

/* ---------- Helpers UTC → heure de Paris ---------- */

const PARIS_TZ = 'Europe/Paris'

function utcToParisTime(isoUtc: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    timeZone: PARIS_TZ, hour: '2-digit', minute: '2-digit', hour12: false,
  }).format(new Date(isoUtc))
}

function utcToIsoDate(isoUtc: string): string {
  // Renvoie YYYY-MM-DD en heure de Paris via fr-CA (format ISO natif)
  return new Intl.DateTimeFormat('fr-CA', {
    timeZone: PARIS_TZ, year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date(isoUtc))
}

function durationLabel(start: string, end: string): string {
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  const mins = (eh * 60 + em) - (sh * 60 + sm)
  if (mins <= 0) return ''
  const h = Math.floor(mins / 60), m = mins % 60
  return m === 0 ? `${h}h` : h === 0 ? `${m} min` : `${h}h${m.toString().padStart(2, '0')}`
}

/* ---------- Fetch OData helper ---------- */

async function odata<T>(entitySet: string, qs: string): Promise<T[]> {
  const res = await fetch(`${API_BASE}/${entitySet}?${qs}`, {
    headers: { Accept: 'application/json', 'OData-MaxVersion': '4.0', 'OData-Version': '4.0' },
  })
  if (!res.ok) throw new Error(`Portal Web API /${entitySet}: HTTP ${res.status}`)
  return ((await res.json()) as ODataList<T>).value
}

/* ---------- Construction des labels de date en français ---------- */

const WEEKDAYS_FR = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi']
const MONTHS_FR   = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre']

function isoDateToFrLabels(isoDate: string) {
  // Midi UTC pour éviter les décalages de jour lors du parsing
  const dt = new Date(isoDate + 'T12:00:00Z')
  const weekday = WEEKDAYS_FR[dt.getUTCDay()] ?? ''
  const day     = dt.getUTCDate()
  const month   = MONTHS_FR[dt.getUTCMonth()] ?? ''
  const year    = dt.getUTCFullYear()
  return { weekday, datelabel: `${day} ${month} ${year}`, date: `${weekday} ${day} ${month} ${year}` }
}

/* ---------- getAgenda — API publique (même signature que la couche mock) ---------- */

export async function getAgenda(): Promise<AgendaData> {
  // 1. Conférence — nécessaire pour filtrer sessions et salles
  const conferences = await odata<DvConference>(
    'mwcp26_conferences',
    `$select=mwcp26_conferenceid,mwcp26_name&$filter=mwcp26_name eq '${CONFERENCE_NAME}'`,
  )
  if (!conferences.length) throw new Error(`Conférence "${CONFERENCE_NAME}" introuvable dans Dataverse`)
  const confId = conferences[0].mwcp26_conferenceid

  // 2–5. Requêtes parallèles
  const [dvSalles, dvSessions, dvLinks, dvContacts] = await Promise.all([
    odata<DvSalle>('mwcp26_salles', '$select=mwcp26_salleid,mwcp26_name'),
    odata<DvSession>(
      'mwcp26_sessions',
      `$select=mwcp26_sessionid,mwcp26_name,mwcp26_description,mwcp26_startdatetime,mwcp26_enddatetime,_mwcp26_salleid_value,_mwcp26_conferenceid_value,mwcp26_sessiontypecode` +
      `&$filter=_mwcp26_conferenceid_value eq ${confId}` +
      `&$orderby=mwcp26_startdatetime asc`,
    ),
    odata<DvSessionSpeaker>(
      'mwcp26_sessionspeakers',
      '$select=mwcp26_sessionspeakerid,_mwcp26_sessionid_value,_mwcp26_speakerid_value',
    ),
    odata<DvContact>(
      'contacts',
      '$select=contactid,firstname,lastname,jobtitle,description',
    ),
  ])

  // Index des contacts
  const contactById = new Map(dvContacts.map(c => [c.contactid, c]))

  // Intervenants par session
  const speakersBySession = new Map<string, DvContact[]>()
  for (const link of dvLinks) {
    if (!link._mwcp26_speakerid_value) continue
    const contact = contactById.get(link._mwcp26_speakerid_value)
    if (!contact) continue
    const list = speakersBySession.get(link._mwcp26_sessionid_value) ?? []
    list.push(contact)
    speakersBySession.set(link._mwcp26_sessionid_value, list)
  }

  // Salles dans l'ordre d'apparition dans les sessions
  const salleById = new Map(dvSalles.map(s => [s.mwcp26_salleid, s]))
  const salleOrder = new Map<string, number>()
  for (const s of dvSessions) {
    if (s._mwcp26_salleid_value && !salleOrder.has(s._mwcp26_salleid_value))
      salleOrder.set(s._mwcp26_salleid_value, salleOrder.size)
  }
  const sortedSalles = [...dvSalles].sort((a, b) =>
    (salleOrder.get(a.mwcp26_salleid) ?? 999) - (salleOrder.get(b.mwcp26_salleid) ?? 999),
  )
  const rooms = buildRooms(sortedSalles.map(s => ({ id: s.mwcp26_salleid, name: s.mwcp26_name })))
  const roomById = new Map(rooms.map(r => [r.key, r]))  // key = mwcp26_salleid GUID

  // Regroupement des sessions par jour (heure de Paris)
  const dayMap = new Map<string, Session[]>()
  for (const ds of dvSessions) {
    const startTime = utcToParisTime(ds.mwcp26_startdatetime)
    const endTime   = utcToParisTime(ds.mwcp26_enddatetime)
    const isoDate   = utcToIsoDate(ds.mwcp26_startdatetime)

    const salleName = ds._mwcp26_salleid_value ? (salleById.get(ds._mwcp26_salleid_value)?.mwcp26_name ?? '') : ''
    const room    = ds._mwcp26_salleid_value ? roomById.get(ds._mwcp26_salleid_value) : undefined
    const spkList = speakersBySession.get(ds.mwcp26_sessionid) ?? []

    const sessionType: SessionType = SESSION_TYPE_MAP[ds.mwcp26_sessiontypecode ?? -1] ?? 'Session'
    const session: Session = {
      id:         ds.mwcp26_sessionid,
      title:      ds.mwcp26_name,
      description: ds.mwcp26_description,
      startTime,
      endTime,
      duration:   durationLabel(startTime, endTime),
      room:       ds._mwcp26_salleid_value ?? null,
      roomName:   salleName,
      roomShort:  room?.short ?? '',
      roomCap:    room?.cap ?? 0,
      roomColor:  room?.color ?? 'var(--brand-blue)',
      sessionType,
      isService:  sessionType !== 'Session' && sessionType !== 'Keynote',
      speakers:   spkList.map(c => ({
        name:    [c.firstname, c.lastname].filter(Boolean).join(' '),
        tagLine: c.jobtitle ?? '',
        bio:     c.description ?? '',
      })),
    }

    const existing = dayMap.get(isoDate) ?? []
    existing.push(session)
    dayMap.set(isoDate, existing)
  }

  // Tri chronologique des jours + construction du modèle Day
  const days: Day[] = [...dayMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([isoDate, sessions], index) => {
      const { weekday, datelabel, date } = isoDateToFrLabels(isoDate)
      return { index, date, isoDate, short: `Jour ${index + 1}`, weekday, datelabel, sessions }
    })

  return { event: CONFERENCE_NAME, days, rooms }
}
