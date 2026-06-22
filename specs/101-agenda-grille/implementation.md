# 101 — Agenda vue Grille · Implementation

## Overview

Vue grille **salles × heures** (desktop-only), portée par le composant React
`AgendaGrid` (`src/components/AgendaGrid.tsx` + `AgendaGrid.css`).

La grille est une **CSS Grid** : colonne 1 = heures, colonnes 2..N+1 = salles ; lignes =
créneaux de 5 minutes. Les sessions sont positionnées par `gridColumn`/`gridRow`.

```
gridTemplateColumns: 58px repeat(nRooms, minmax(150px, 1fr))
gridTemplateRows:    42px repeat(rows, 13px)   // 42px = en-têtes ; 13px = PXPER5
```

Les constantes de gabarit (`PXPER5`, `HOUR_COL`, `HEADER_ROW`, `roomColumns(n)`) sont
isolées dans `src/components/gridLayout.ts` et **partagées** entre `AgendaGrid` et
`GridSkeleton`.

## Rendu par type de session

Le champ `mwcp26_sessiontypecode` (global Choice Dataverse) pilote le rendu via
`s.sessionType: SessionType` dans la vue-modèle.

| `sessionType`          | Rendu grille |
|------------------------|--------------|
| `Session` (défaut)     | `.tt-card` dans la colonne de sa salle |
| `Keynote`              | `.tt-card.tt-keynote` pleine largeur (`gridColumn: 2 / nRooms+2`) avec badge salle (dot + nom) |
| `Pause`                | `.tt-band` pleine largeur, icône café fixe |
| `Repas`                | `.tt-band` pleine largeur, icône couverts fixe |
| `Evenement`            | `.tt-band` pleine largeur, icône variable (mot-clé titre) |

**Mapping entier → SessionType** dans `agenda.ts` (`SESSION_TYPE_MAP`) :
```
318610000 → 'Session'  |  318610001 → 'Keynote'  |  318610002 → 'Pause'
318610003 → 'Repas'    |  318610004 → 'Evenement'
```
Valeurs créées par `data/scripts/setup_datamodel.py`, stables par environnement.

**`positionableSessions`** (`agenda-transform.ts`) : Session → salle + horaire requis ;
Keynote/Pause/Repas/Evenement → horaire seul suffit (pas de colonne de salle requise).

**`ServiceIcon`** (exporté depuis `AgendaGrid.tsx`, réutilisé par `AgendaList.tsx`) :
SVG inline Lucide ; `bandIconKey(s)` utilise `s.sessionType` pour Pause/Repas (icône fixe)
et les mots-clés du titre pour les sous-types d'Evenement.

## Math de positionnement

- `toMin("HH:MM") = h*60+m`.
- `dayStart = min(startTime)`, `dayEnd = max(endTime)`, `rows = round((dayEnd-dayStart)/5)`.
- `rowFor(m) = 2 + round((m-dayStart)/5)`. Session → `gridRow: rowFor(start) / rowFor(end)`.
- `marks` = `startTime` distincts triés → un `.tt-time` + un `.tt-line` par marque.
- Salle → colonne `roomIndex[room] + 2`.

## Comportement

- **Sticky** : `.tt-roomhead` (`top:0`) et `.tt-time` (`left:0`) s'ancrent dans
  `main.app-main` (`overflow-y:auto` desktop).
- **Session** → `.tt-card` : rail `border-left: 4px solid var(--rc)`, heure, titre
  (3 lignes clamp), speaker(s).
- **Keynote** → `.tt-card.tt-keynote` : même structure + `.tt-keynote__badge` (dot + nom
  de la salle hôte). `--rc` = couleur de la salle hôte.
- **Pause/Repas/Evenement** → `.tt-band` : fond `surface-sunken`, border dashed, icône
  SVG 14px + titre centré.
- **Exclusion** : sessions `Session` sans salle **ou** sans horaire écartées par
  `positionableSessions`. Keynote/Pause/Repas/Evenement inclus si horaire présent.
- **État vide** : `.tt-empty` centré si aucune session positionnable.
- **Couleurs de salle** : `ROOM_PALETTE` dans `agenda-transform.ts` (5 tokens).
  Capacité dérivée du nom Dataverse (`"Room 1 (35p)"`).

## État de chargement (skeleton) — US-101-02

Pendant le chargement (`agenda === null`), `<GridSkeleton />` remplace la grille.
`GridSkeleton` réutilise les coquilles `.tt-corner / .tt-roomhead / .tt-time / .tt-line`
d'`AgendaGrid.css` et les constantes de `gridLayout.ts`. Blocs session factices en
shimmer déterministe. Animation `sk-shimmer` coupée avec `prefers-reduced-motion`.

## Responsive

- `< 1024px` : `.agenda-grid-wrap { display:none }` ; la liste (102) s'affiche à la place.
- `≥ 1024px` : grille affichée, `main` scrollable, en-têtes sticky.

## Acceptance criteria — état

- [x] Salles en colonnes, heures en lignes ; en-têtes de salle et colonne d'heures sticky.
- [x] Au scroll, header + contrôles figés (100), seul `main` défile.
- [x] Session : carte dans la colonne de sa salle, titre + intervenant·e(s) + heure.
- [x] Keynote : carte pleine largeur avec rail couleur et badge de la salle hôte.
- [x] Pause/Repas/Evenement : bande pleine largeur fond gris avec icône fixe/variable.
- [x] La grille reflète le jour (103). *(Recherche 104 : hors périmètre.)*
- [ ] Activation au clic/clavier → détail (105). *(À venir.)*

US-101-02 — Chargement (skeleton) :

- [x] Skeleton mimant la structure en vue grille lors du chargement.
- [x] Placeholders animés (shimmer) ; header de l'app figé.
- [x] Fin du chargement → grille réelle ou état vide.
- [x] Skeleton uniquement en vue grille (desktop).

## Key files

- `src/components/AgendaGrid.tsx` — composant grille + math + `ServiceIcon` (exporté).
- `src/components/AgendaGrid.css` — styles `.tt-*` + `.tt-keynote` / `.tt-keynote__badge`.
- `src/data/agenda.ts` — `getAgenda` (Dataverse) + `SESSION_TYPE_MAP`.
- `src/data/agenda-transform.ts` — `buildRooms`, `positionableSessions`, formatage Paris.
- `src/types/agenda.ts` — `SessionType` union + interface `Session`.
- `src/generated/services/*` — services Dataverse générés (ne pas éditer).
- `src/App.tsx` / `src/App.css` — chargement async, gating responsive, ancrage sticky.
