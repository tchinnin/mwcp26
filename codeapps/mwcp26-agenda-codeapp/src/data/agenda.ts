/*
 * Couche données de l'agenda — branchée sur DATAVERSE (la couture source).
 *
 * `getAgenda` interroge Dataverse via les services générés (src/generated/services/*),
 * puis joint et transforme les enregistrements en vue-modèle (cf. types/agenda.ts) — les
 * composants AgendaGrid (101), AgendaList (102) et DayTabs (103) restent inchangés.
 *
 * Le SDK généré n'expose pas `$expand` : on fait des requêtes plates par table et on joint
 * côté client par GUID (cf. ppbp-codeapps-connectors : services générés, pas de fetch/axios).
 * Les datetime Dataverse sont en UTC ; le formatage Paris est fait par agenda-transform.
 */

import type { AgendaData, Session, SessionType, Speaker } from '../types/agenda'
import type { IOperationResult } from '@microsoft/power-apps/data'
import { ContactsService } from '../generated/services/ContactsService'
import { Mwcp26_conferencesService } from '../generated/services/Mwcp26_conferencesService'
import { Mwcp26_sallesService } from '../generated/services/Mwcp26_sallesService'
import { Mwcp26_sessionsService } from '../generated/services/Mwcp26_sessionsService'
import { Mwcp26_sessionspeakersService } from '../generated/services/Mwcp26_sessionspeakersService'
import { buildRooms, durationLabel, groupByDay, parisParts } from './agenda-transform'

export { defaultDayIndex, positionableSessions } from './agenda-transform'

const CONFERENCE_NAME = 'MWCP 2026'
const PAGE = 5000 // un seul page suffit (volumes faibles) ; garde-fou explicite

/** Mapping valeur entière Dataverse → SessionType (valeurs créées par setup_datamodel.py). */
const SESSION_TYPE_MAP: Record<number, SessionType> = {
  318610000: 'Session',
  318610001: 'Keynote',
  318610002: 'Pause',
  318610003: 'Repas',
  318610004: 'Evenement',
}

/** Déballe un résultat d'opération : lève si échec, sinon renvoie les lignes. */
function rows<T>(result: IOperationResult<T[]>, label: string): T[] {
  if (!result.success) {
    throw new Error(`Dataverse: échec de la requête ${label} — ${String(result.error ?? '')}`)
  }
  return result.data ?? []
}

export async function getAgenda(): Promise<AgendaData> {
  // 1) Conférence : repère l'enregistrement "MWCP 2026" (sinon le premier).
  const confs = rows(
    await Mwcp26_conferencesService.getAll({ select: ['mwcp26_conferenceid', 'mwcp26_name'], top: PAGE }),
    'conférences',
  )
  const conf = confs.find((c) => c.mwcp26_name === CONFERENCE_NAME) ?? confs[0]
  if (!conf) throw new Error('Dataverse: aucune conférence trouvée.')
  const confId = conf.mwcp26_conferenceid
  const confFilter = `_mwcp26_conferenceid_value eq ${confId} and statecode eq 0`

  // 2..5) Requêtes plates, en parallèle.
  const [salles, sessions, links, contacts] = await Promise.all([
    Mwcp26_sallesService.getAll({ select: ['mwcp26_salleid', 'mwcp26_name'], filter: confFilter, top: PAGE }),
    Mwcp26_sessionsService.getAll({
      select: [
        'mwcp26_sessionid', 'mwcp26_name', 'mwcp26_description',
        'mwcp26_startdatetime', 'mwcp26_enddatetime', '_mwcp26_salleid_value',
        'mwcp26_sessiontypecode',
      ],
      filter: confFilter,
      orderBy: ['mwcp26_startdatetime asc'],
      top: PAGE,
    }),
    Mwcp26_sessionspeakersService.getAll({
      select: ['_mwcp26_sessionid_value', '_mwcp26_speakerid_value'],
      filter: 'statecode eq 0',
      top: PAGE,
    }),
    ContactsService.getAll({
      select: ['contactid', 'firstname', 'lastname', 'jobtitle', 'description'],
      filter: 'statecode eq 0',
      top: PAGE,
    }),
  ]).then(([sa, se, li, co]) => [
    rows(sa, 'salles'),
    rows(se, 'sessions'),
    rows(li, 'intervenants de session'),
    rows(co, 'contacts'),
  ] as const)

  // ---- jointures côté client ----
  const rooms = buildRooms(salles.map((s) => ({ id: s.mwcp26_salleid, name: s.mwcp26_name ?? '' })))
  const roomByKey = new Map(rooms.map((r) => [r.key, r]))

  const speakerById = new Map<string, Speaker>()
  for (const c of contacts) {
    speakerById.set(c.contactid, {
      name: `${c.firstname ?? ''} ${c.lastname ?? ''}`.trim(),
      tagLine: c.jobtitle ?? '',
      bio: c.description ?? '',
    })
  }

  const speakersBySession = new Map<string, Speaker[]>()
  for (const l of links) {
    const sid = l._mwcp26_sessionid_value
    const spk = l._mwcp26_speakerid_value ? speakerById.get(l._mwcp26_speakerid_value) : undefined
    if (!sid || !spk) continue
    const arr = speakersBySession.get(sid)
    if (arr) arr.push(spk)
    else speakersBySession.set(sid, [spk])
  }

  // ---- sessions → vue-modèle (avec isoStart pour le regroupement par jour) ----
  const sessionViews = sessions
    .filter((s) => s.mwcp26_startdatetime && s.mwcp26_enddatetime)
    .map((s): Session & { isoStart: string } => {
      const start = s.mwcp26_startdatetime as string
      const end = s.mwcp26_enddatetime as string
      const roomKey = s._mwcp26_salleid_value ?? null
      const room = roomKey ? roomByKey.get(roomKey) : undefined
      return {
        id: s.mwcp26_sessionid,
        title: s.mwcp26_name ?? '',
        description: s.mwcp26_description ?? null,
        startTime: parisParts(start).hhmm,
        endTime: parisParts(end).hhmm,
        duration: durationLabel(start, end),
        room: roomKey,
        roomName: room?.name ?? '',
        roomShort: room?.short ?? '',
        roomCap: room?.cap ?? 0,
        roomColor: room?.color ?? 'var(--brand-blue)',
        sessionType: SESSION_TYPE_MAP[s.mwcp26_sessiontypecode as number] ?? 'Session',
        speakers: speakersBySession.get(s.mwcp26_sessionid) ?? [],
        isoStart: start,
      }
    })

  const days = groupByDay(sessionViews)
  return { event: conf.mwcp26_name ?? CONFERENCE_NAME, days, rooms }
}
