/*
 * Helpers purs de transformation de l'agenda — indépendants de la source (Dataverse).
 * Construisent la vue-modèle (cf. types/agenda.ts) à partir de données déjà récupérées.
 * Aucune dépendance réseau ici : testable et réutilisable.
 */

import type { Day, Room, Session } from '../types/agenda'

/* Palette des salles : 5 tokens, indexés par ordre de salle (Salle 1 → Salle 5).
   Vérifié 1:1 avec la maquette (#00AEF0/#80CD28/#FABC09/#F2521B/#2F74DE). */
const ROOM_PALETTE: ReadonlyArray<{ color: string; tone: string }> = [
  { color: 'var(--brand-blue)', tone: 'blue' },
  { color: 'var(--brand-green)', tone: 'green' },
  { color: 'var(--brand-yellow)', tone: 'yellow' },
  { color: 'var(--brand-red)', tone: 'red' },
  { color: 'var(--sky-deep)', tone: 'sky' },
]

/** Numéro de salle depuis "Room 1 (35p)" → 1 (pour l'ordre stable des colonnes). */
export function roomNumber(name: string): number {
  const m = name.match(/(\d+)/)
  return m ? parseInt(m[1], 10) : Number.MAX_SAFE_INTEGER
}

/** Capacité depuis "Room 1 (35p)" → 35 (la capacité n'est pas une colonne Dataverse). */
export function roomCapacity(name: string): number {
  const m = name.match(/\((\d+)\s*p\)/i)
  return m ? parseInt(m[1], 10) : 0
}

/**
 * Construit les salles (colonnes de la grille) à partir des enregistrements Salle.
 * Ordonnées par numéro ; `key` = GUID de la salle (sert à joindre les sessions),
 * `name`/`short` dérivés de l'ordre, `cap`/couleur dérivés du nom et de la palette.
 */
export function buildRooms(salles: ReadonlyArray<{ id: string; name: string }>): Room[] {
  const ordered = [...salles].sort((a, b) => roomNumber(a.name) - roomNumber(b.name))
  return ordered.map((s, i) => {
    const palette = ROOM_PALETTE[i % ROOM_PALETTE.length]
    return {
      key: s.id,
      name: `Salle ${i + 1}`,
      short: `S${i + 1}`,
      cap: roomCapacity(s.name),
      color: palette.color,
      tone: palette.tone,
    }
  })
}

/* Formatage à l'heure de Paris : Dataverse renvoie l'UTC ("…Z"), l'événement se tient
   à Paris. Un seul Intl formatter (mémoïsé) couvre date + heure + jour de semaine. */
const PARIS_FMT = new Intl.DateTimeFormat('fr-FR', {
  timeZone: 'Europe/Paris',
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

function capitalize(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s
}

export interface ParisParts {
  /** Date calendaire Paris "YYYY-MM-DD" (regroupement par jour). */
  isoDate: string
  /** Jour de semaine capitalisé ("Mardi"). */
  weekday: string
  /** Libellé de date sans l'année dans l'onglet → ici "23 juin 2026". */
  datelabel: string
  /** Heure "HH:MM" (24h). */
  hhmm: string
}

/** Décompose un datetime ISO (UTC) en parties affichables à l'heure de Paris. */
export function parisParts(isoUtc: string): ParisParts {
  const parts = PARIS_FMT.formatToParts(new Date(isoUtc))
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? ''
  const months: Record<string, string> = {
    janvier: '01', février: '02', mars: '03', avril: '04', mai: '05', juin: '06',
    juillet: '07', août: '08', septembre: '09', octobre: '10', novembre: '11', décembre: '12',
  }
  const day = get('day').padStart(2, '0')
  const monthName = get('month')
  const monthNum = months[monthName.toLowerCase()] ?? '01'
  const year = get('year')
  return {
    isoDate: `${year}-${monthNum}-${day}`,
    weekday: capitalize(get('weekday')),
    datelabel: `${get('day')} ${monthName} ${year}`,
    hhmm: `${get('hour').padStart(2, '0')}:${get('minute').padStart(2, '0')}`,
  }
}

/** Durée lisible "N min" calculée depuis les bornes ISO. */
export function durationLabel(startIso: string, endIso: string): string {
  const mins = Math.round((new Date(endIso).getTime() - new Date(startIso).getTime()) / 60000)
  return `${mins} min`
}

/**
 * Regroupe des sessions (déjà transformées, portant un `isoStart` UTC) par jour Paris,
 * ordonné chronologiquement. Renvoie les `Day` prêts pour DayTabs / la grille.
 */
export function groupByDay(sessions: ReadonlyArray<Session & { isoStart: string }>): Day[] {
  const byDate = new Map<string, { parts: ParisParts; items: Session[] }>()
  for (const s of sessions) {
    const parts = parisParts(s.isoStart)
    let bucket = byDate.get(parts.isoDate)
    if (!bucket) {
      bucket = { parts, items: [] }
      byDate.set(parts.isoDate, bucket)
    }
    bucket.items.push(s)
  }
  return [...byDate.entries()]
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([isoDate, { parts, items }], index) => ({
      index,
      date: `${parts.weekday} ${parts.datelabel}`,
      isoDate,
      short: `Jour ${index + 1}`,
      weekday: parts.weekday,
      datelabel: parts.datelabel,
      sessions: items.sort((a, b) => (a.startTime < b.startTime ? -1 : 1)),
    }))
}

/**
 * Jour affiché par défaut (feature 103) : le jour courant s'il tombe pendant la conférence,
 * sinon le premier jour (index 0).
 */
export function defaultDayIndex(days: Day[]): number {
  const now = new Date()
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const i = days.findIndex((d) => d.isoDate === today)
  return i >= 0 ? i : 0
}

/**
 * Sessions positionnables dans la grille (feature 101) : il faut une salle ET un horaire.
 * Les autres restent visibles en vue Liste (102).
 */
export function positionableSessions(day: Day): Session[] {
  return day.sessions.filter((s) => {
    if (!s.startTime || !s.endTime) return false
    if (s.sessionType === 'Session') return !!s.room
    return true
  })
}

/** Groupe de sessions partageant la même heure de début (vue Liste, feature 102). */
export interface TimeGroup {
  /** Heure "HH:MM" ou null pour les sessions sans horaire. */
  time: string | null
  /** Libellé affiché dans l'en-tête de groupe. */
  label: string
  sessions: Session[]
}

/**
 * Regroupe toutes les sessions d'un jour par heure de début (feature 102 — vue Liste).
 * - Groupes ordonnés chronologiquement par heure.
 * - Au sein d'un groupe, sessions triées par titre.
 * - Sessions sans startTime regroupées en dernier sous "Horaire à confirmer".
 */
export function groupByStartTime(sessions: Session[]): TimeGroup[] {
  const map = new Map<string, Session[]>()
  const unscheduled: Session[] = []

  for (const s of sessions) {
    if (!s.startTime) {
      unscheduled.push(s)
    } else {
      let bucket = map.get(s.startTime)
      if (!bucket) {
        bucket = []
        map.set(s.startTime, bucket)
      }
      bucket.push(s)
    }
  }

  const sorted: TimeGroup[] = [...map.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([time, items]) => ({
      time,
      label: time,
      sessions: items.slice().sort((a, b) => a.title.localeCompare(b.title, 'fr')),
    }))

  if (unscheduled.length > 0) {
    sorted.push({
      time: null,
      label: 'Horaire à confirmer',
      sessions: unscheduled.slice().sort((a, b) => a.title.localeCompare(b.title, 'fr')),
    })
  }

  return sorted
}
