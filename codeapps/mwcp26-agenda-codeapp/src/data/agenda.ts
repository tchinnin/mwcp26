import raw from './sessions.json'

/* ---------- Types ---------- */
export interface Speaker {
  name: string
  tagLine?: string
  bio?: string
}

export interface Session {
  id: string
  title: string
  description: string | null
  day: string
  startTime: string
  endTime: string
  duration: string
  room: string
  isServiceSession: boolean
  speakers: Speaker[]
  liveUrl: string | null
  recordingUrl: string | null
}

interface RawData {
  event: string
  days: { date: string; sessions: Session[] }[]
}

const data = raw as RawData

export interface Day {
  index: number
  date: string // "Mardi 23 juin 2026"
  tabMain: string // "Jour 1"
  tabSub: string // "Mar. 23 juin"
  sessions: Session[]
}

export interface TimeGroup {
  key: string
  start: string // "11:15" or "" (horaire à confirmer)
  end: string // "12:00"
  label: string | null // "Horaire à confirmer" pour les sessions sans heure
  items: Session[]
}

/* ---------- Salles ---------- */
// Couleur de salle = token de la palette quadri (jamais de littéral hex).
const ROOM_COLORS: Record<number, string> = {
  1: 'var(--brand-blue)',
  2: 'var(--brand-green)',
  3: 'var(--brand-yellow)',
  4: 'var(--brand-red)',
  5: 'var(--sky-deep)',
}

export interface RoomInfo {
  num: number | null
  label: string // "Salle 3"
  capacity: string // "14p"
  color: string // var(--…)
}

export function parseRoom(room: string): RoomInfo {
  const m = /Room\s*(\d+)\s*\(([^)]+)\)/i.exec(room ?? '')
  if (!m) return { num: null, label: room ?? '', capacity: '', color: 'var(--sky-deep)' }
  const num = parseInt(m[1], 10)
  return {
    num,
    label: `Salle ${num}`,
    capacity: m[2],
    color: ROOM_COLORS[num] ?? 'var(--sky-deep)',
  }
}

/* ---------- Recherche (insensible casse + accents, spec 104) ---------- */
export function normalize(str: string): string {
  return str.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

export function matchesQuery(session: Session, query: string): boolean {
  const q = normalize(query.trim())
  if (!q) return true
  if (normalize(session.title).includes(q)) return true
  return session.speakers.some((s) => normalize(s.name).includes(q))
}

/* ---------- Speakers : libellé condensé (cf. maquette) ---------- */
export function speakerLabel(speakers: Speaker[]): string {
  if (speakers.length === 0) return ''
  if (speakers.length <= 2) return speakers.map((s) => s.name).join(', ')
  return `${speakers[0].name} +${speakers.length - 1}`
}

/* ---------- Jours ---------- */
const WEEKDAY_ABBR: Record<string, string> = {
  lundi: 'Lun', mardi: 'Mar', mercredi: 'Mer', jeudi: 'Jeu',
  vendredi: 'Ven', samedi: 'Sam', dimanche: 'Dim',
}
const MONTHS: Record<string, number> = {
  janvier: 0, février: 1, fevrier: 1, mars: 2, avril: 3, mai: 4, juin: 5,
  juillet: 6, août: 7, aout: 7, septembre: 8, octobre: 9, novembre: 10, décembre: 11, decembre: 11,
}

function frenchDateParts(date: string): { weekday: string; day: string; month: string; year: string } {
  const [weekday = '', day = '', month = '', year = ''] = date.split(/\s+/)
  return { weekday, day, month, year }
}

export function buildDays(): Day[] {
  return data.days.map((d, i) => {
    const { weekday, day, month } = frenchDateParts(d.date)
    const abbr = WEEKDAY_ABBR[normalize(weekday)] ?? weekday.slice(0, 3)
    return {
      index: i,
      date: d.date,
      tabMain: `Jour ${i + 1}`,
      tabSub: `${abbr}. ${day} ${month}`,
      sessions: d.sessions,
    }
  })
}

/** Index du jour par défaut : aujourd'hui si pendant la conférence, sinon le 1er jour (règle 103). */
export function defaultDayIndex(days: Day[], today = new Date()): number {
  const ty = today.getFullYear()
  const tm = today.getMonth()
  const td = today.getDate()
  const found = days.findIndex((d) => {
    const { day, month, year } = frenchDateParts(d.date)
    return parseInt(year, 10) === ty && (MONTHS[normalize(month)] ?? -1) === tm && parseInt(day, 10) === td
  })
  return found >= 0 ? found : 0
}

/* ---------- Compteur de sessions (sessions de contenu, hors service) ---------- */
export function contentCount(sessions: Session[]): number {
  return sessions.filter((s) => !s.isServiceSession).length
}

/* ---------- Regroupement par heure de début (spec 102) ---------- */
export function groupByStartTime(sessions: Session[]): TimeGroup[] {
  const map = new Map<string, Session[]>()
  for (const s of sessions) {
    const key = s.startTime || '__none__'
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(s)
  }

  const groups: TimeGroup[] = []
  for (const [key, items] of map) {
    items.sort((a, b) => a.title.localeCompare(b.title, 'fr'))
    if (key === '__none__') {
      groups.push({ key, start: '', end: '', label: 'Horaire à confirmer', items })
    } else {
      // fin du groupe = fin la plus tardive parmi les sessions du créneau
      const end = items.reduce((acc, s) => (s.endTime > acc ? s.endTime : acc), items[0].endTime)
      groups.push({ key, start: key, end, label: null, items })
    }
  }

  // tri chronologique ; "Horaire à confirmer" en dernier
  groups.sort((a, b) => {
    if (a.start === '' ) return 1
    if (b.start === '') return -1
    return a.start.localeCompare(b.start)
  })
  return groups
}

/* ---------- Catégorie d'icône pour les sessions de service ---------- */
export type ServiceIconKey = 'coffee' | 'utensils' | 'megaphone' | 'sparkles' | 'mic' | 'calendar'

export function serviceIconKey(title: string): ServiceIconKey {
  const t = normalize(title)
  if (t.includes('repas') || t.includes('dejeuner') || t.includes('lunch')) return 'utensils'
  if (t.includes('lancement') || t.includes('ouverture')) return 'megaphone'
  if (t.includes('cloture') || t.includes('fin ')) return 'sparkles'
  if (t.includes('accueil') || t.includes('cafe') || t.includes('pause')) return 'coffee'
  if (t.includes('session ')) return 'mic'
  return 'calendar'
}

/* ---------- Salles distinctes (pour les chips visuels) ---------- */
export function allRooms(): RoomInfo[] {
  const seen = new Map<number, RoomInfo>()
  for (const d of data.days) {
    for (const s of d.sessions) {
      const r = parseRoom(s.room)
      if (r.num != null && !seen.has(r.num)) seen.set(r.num, r)
    }
  }
  return [...seen.values()].sort((a, b) => (a.num ?? 0) - (b.num ?? 0))
}

export const EVENT = data.event
