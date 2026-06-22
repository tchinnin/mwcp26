/*
 * Types domaine de l'agenda — vue-modèle consommée par les composants (grille 101,
 * liste 102, sélection du jour 103). Indépendants de la source : alimentés par Dataverse
 * (cf. data/agenda.ts) ; les composants ne dépendent que de ces types.
 *
 * `color` est une **référence de token** (`"var(--brand-blue)"`…), jamais un littéral hex
 * (cf. règle « tokens, never literals » du design system).
 */

export type SessionType = 'Session' | 'Keynote' | 'Pause' | 'Repas' | 'Evenement'

export interface Speaker {
  name: string;
  tagLine: string;
  bio: string;
}

export interface Room {
  /** Clé brute issue de la donnée (GUID de salle) — sert d'identifiant de colonne. */
  key: string;
  /** Libellé affiché (ex. "Salle 1"). */
  name: string;
  /** Forme courte (ex. "S1"). */
  short: string;
  /** Capacité en nombre de places. */
  cap: number;
  /** Couleur de salle — référence token (ex. "var(--brand-blue)"). */
  color: string;
  /** Teinte symbolique (blue/green/yellow/red/sky). */
  tone: string;
}

export interface Session {
  id: string;
  title: string;
  description: string | null;
  /** Heure de début "HH:MM". */
  startTime: string;
  /** Heure de fin "HH:MM". */
  endTime: string;
  /** Durée lisible (ex. "40 min"). */
  duration: string;
  /** Clé de salle (== Room.key) ; null si non renseignée. */
  room: string | null;
  roomName: string;
  roomShort: string;
  roomCap: number;
  /** Couleur de la salle — référence token. */
  roomColor: string;
  /** Type de session — pilote le rendu dans la grille et la liste. */
  sessionType: SessionType;
  speakers: Speaker[];
}

export interface Day {
  index: number;
  /** Libellé brut complet (ex. "Mardi 23 juin 2026"). */
  date: string;
  /** Date ISO calendaire (ex. "2026-06-23") — sert au défaut du jour (103). */
  isoDate: string;
  /** Forme courte (ex. "Jour 1"). */
  short: string;
  /** Jour de la semaine (ex. "Mardi"). */
  weekday: string;
  /** Libellé de date sans l'année (ex. "23 juin 2026"). */
  datelabel: string;
  sessions: Session[];
}

export interface AgendaData {
  event: string;
  days: Day[];
  rooms: Room[];
}
