# 101 — Agenda vue Grille · Implementation

## Overview

Vue grille **salles × heures** (desktop-only), portée par le composant React
`AgendaGrid` (`src/components/AgendaGrid.tsx` + `AgendaGrid.css`). Port fidèle du
`Timetable` de la maquette de référence
(`uxui/mwcp26-agenda-codeapp/mwcp26-agenda-codeapp-standalone.html`).

La grille est une **CSS Grid** : colonne 1 = heures, colonnes 2..N+1 = salles ; lignes =
créneaux de 5 minutes. Les sessions sont positionnées par `gridColumn`/`gridRow`.

```
gridTemplateColumns: 58px repeat(nRooms, minmax(150px, 1fr))
gridTemplateRows:    42px repeat(rows, 13px)   // 42px = en-têtes ; 13px = PXPER5
```

Les constantes de gabarit (`PXPER5`, `HOUR_COL`, `HEADER_ROW`, `roomColumns(n)`) sont
isolées dans `src/components/gridLayout.ts` et **partagées** entre `AgendaGrid` et le
squelette de chargement `GridSkeleton` — une seule source pour la métrique, pas de drift.

## Périmètre de cette itération

- **Données Dataverse** (`src/data/agenda.ts` + `src/data/agenda-transform.ts`) : services
  générés (`src/generated/services/*`), requêtes plates par table + **jointure client** par
  GUID (le SDK n'expose pas `$expand`), datetime formatés à l'heure de Paris. La vue-modèle
  (`types/agenda.ts`) est inchangée → le composant ne bouge pas.
- **`isService = false` partout** : la colonne `isServiceSession` n'existe pas en Dataverse →
  les pauses/accueils s'affichent comme des **cartes normales** (traitement « bande » reporté).
- **Cartes statiques** : pas de bouton favori (→ 106), pas de clic/détail (→ 105), pas de
  hover. Pas de filtrage recherche (→ 104) : la grille affiche toutes les sessions
  positionnables du jour.
- Vue **liste (102)** non construite.

## Math de positionnement (verbatim maquette)

- `toMin("HH:MM") = h*60+m`.
- `dayStart = min(startTime)`, `dayEnd = max(endTime)` (minutes), `rows = round((dayEnd-dayStart)/5)`.
- `rowFor(m) = 2 + round((m-dayStart)/5)` (ligne 1 = en-têtes). Session → `gridRow: rowFor(start) / rowFor(end)`.
- `marks` = `startTime` distincts triés → un label d'heure (`.tt-time`) + une ligne (`.tt-line`) chacun.
- Salle → colonne `roomIndex[room] + 2`.

## Comportement

- **Sticky** : `.tt-roomhead` (`top:0`) et `.tt-time` (`left:0`) s'ancrent dans
  `main.app-main` (le conteneur `overflow-y:auto` desktop, cf. 100). `main` a `padding:0`
  en desktop pour que les en-têtes collent au bord. Le header `.dhead` et la barre de
  contrôles (jour, 103) restent figés au-dessus.
- **Sessions de service** (`isService`) → bande pleine largeur `.tt-band`
  (`gridColumn: 2 / nRooms+2`) avec icône SVG inline (mappée par mot-clé du titre) + titre.
- **Talks** → `.tt-card` : rail couleur de salle (`border-left: 4px solid var(--rc)`),
  heure (`start–end`), titre (clamp 3 lignes), premier intervenant (`+N`).
- **Exclusion** : sessions sans salle **ou** sans horaire écartées en amont
  (`positionableSessions`, `src/data/agenda-transform.ts`).
- **État vide** : `.tt-empty` centré si aucune session positionnable (jour vide).
- **Couleurs de salle** : 5 salles → tokens `--brand-blue/green/yellow/red` + `--sky-deep`
  (mapping dans `ROOM_PALETTE`, `src/data/agenda-transform.ts`), assignées par ordre de salle.
  Capacité parsée du nom (`"Room 1 (35p)"`), faute de colonne Dataverse. Aucune couleur
  seule : dot + libellé.

## État de chargement (skeleton) — US-101-02

Pendant le chargement (`agenda === null` dans `App.tsx`), la branche de chargement rend
**la même charpente que l'état chargé** (barre de contrôles + `main` avec
`.agenda-grid-wrap` et `.agenda-mobile-note`) et laisse le **gating responsive existant**
trier l'affichage :

- **≥ 1024px** : `<GridSkeleton />` dans `.agenda-grid-wrap` → squelette de grille.
- **< 1024px** : `.agenda-mobile-note` affiche `« Chargement de l'agenda… »` (la vue grille
  n'a pas de sens en mobile ; skeleton réservé à la grille). Le chargement de la vue liste
  relèvera de la feature 102.
- La barre de contrôles porte un placeholder pill `.sk-daytabs` (dimensions du segmented
  control 103) pour éviter le saut de layout.
- La branche **erreur** (`.agenda-status--error`) est inchangée.

`GridSkeleton` (`src/components/GridSkeleton.tsx` + `GridSkeleton.css`) reproduit la
structure de la grille avec un **gabarit fixe** (les salles réelles ne sont pas encore
connues) : `SK_ROOMS = 5` colonnes, `SK_ROWS = 54` lignes, un label d'heure toutes les
~12 lignes. Il **réutilise** les coquilles `.tt-corner` / `.tt-roomhead` / `.tt-time` /
`.tt-line` (import d'`AgendaGrid.css`) et les constantes de `gridLayout.ts`, et n'ajoute
que les formes shimmer `.sk-dot` / `.sk-bar` / `.sk-card`. Les blocs session factices
(`SK_CARDS`) suivent un **motif statique déterministe** (pas de `Math.random`).

- **Shimmer** : classe `.sk-shimmer` = dégradé `--skeleton-base → --skeleton-sheen →
  --skeleton-base` (tokens, `tokens.css`) balayé via `background-position`, animation
  `sk-shimmer` sur `--skeleton-duration` (1.4s).
- **Accessibilité** : conteneur `role="status" aria-busy aria-label="Chargement de
  l'agenda"` ; toutes les formes décoratives en `aria-hidden`.
- **`prefers-reduced-motion: reduce`** : l'animation est coupée, le placeholder reste
  affiché en aplat (`--skeleton-base`).

## Responsive (cf. 100)

- `< 1024px` : `.agenda-grid-wrap { display:none }` ; un message placeholder
  (`.agenda-mobile-note`) s'affiche (la vue liste 102 viendra plus tard).
- `≥ 1024px` : grille affichée, `main` scrollable, en-têtes sticky.

## Acceptance criteria — état

- [x] Salles en colonnes, heures en lignes ; en-têtes de salle et colonne d'heures sticky.
- [x] Au scroll, header + contrôles figés (100), seul `main` défile.
- [x] Chaque session occupe la colonne de sa salle sur son créneau.
- [x] Chaque session montre titre, intervenant·e(s) et heure.
- [x] La grille reflète le jour (103). *(Recherche 104 : hors périmètre.)*
- [ ] Activation au clic/clavier → détail (105). *(Hors périmètre : cartes statiques.)*

US-101-02 — Chargement (skeleton) :

- [x] Skeleton mimant la structure (colonnes salles, lignes heures, blocs session) à la place du message, en vue grille.
- [x] Placeholders animés (shimmer) ; header de l'app figé (100).
- [x] Fin du chargement → grille réelle (US-101-01) ou état vide.
- [x] Skeleton uniquement en vue grille (desktop) ; message court sous 1024px.

## Key files

- `src/components/AgendaGrid.tsx` — composant grille + math + icônes de service (SVG inline).
- `src/components/AgendaGrid.css` — styles `.tt-*` (tokens uniquement).
- `src/data/agenda.ts` — `getAgenda` (Dataverse, async) + jointure client.
- `src/data/agenda-transform.ts` — helpers purs : `buildRooms`/`ROOM_PALETTE`,
  `positionableSessions`, formatage Paris (`parisParts`, `durationLabel`, `groupByDay`).
- `src/generated/services/*` — services Dataverse générés (ne pas éditer).
- `src/App.tsx` / `src/App.css` — chargement async, gating responsive, ancrage sticky.
