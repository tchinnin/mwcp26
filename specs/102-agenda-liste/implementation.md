# 102 — Agenda — vue Liste · Implementation

## Overview

La vue liste est implémentée via deux composants React : **`AgendaList`** (liste réelle, US-102-01)
et **`ListSkeleton`** (placeholder de chargement mobile, US-102-02). La logique de regroupement
est extraite dans un helper pur **`groupByStartTime`** dans `agenda-transform.ts`. Le routage
grille/liste est dans `App.tsx` via un état `view: 'grid' | 'list'` et deux zones CSS
`agenda-grid-wrap` / `agenda-mobile-wrap` dont la visibilité est contrôlée par un `@media (min-width: 1024px)`.

---

## Regroupement — `groupByStartTime`

`src/data/agenda-transform.ts` — `groupByStartTime(sessions: Session[]): TimeGroup[]`

- Reçoit **toutes** les sessions d'un jour (pas seulement les positionnables de la grille).
- Groupe par `s.startTime` (chaîne `"HH:MM"` ou `null`).
- Groupes triés lexicographiquement (`localeCompare`) — fonctionnel pour `"HH:MM"`.
- Au sein d'un groupe, sessions triées par `title.localeCompare(…, 'fr')`.
- Sessions avec `startTime === null` → groupe unique `{ time: null, label: 'Horaire à confirmer' }` en dernière position.

Interface exportée :
```ts
export interface TimeGroup {
  time: string | null  // "HH:MM" ou null
  label: string        // identique à time pour les horaires ; "Horaire à confirmer" sinon
  sessions: Session[]
}
```

---

## Composant `AgendaList` (US-102-01)

`src/components/AgendaList.tsx` + `AgendaList.css`

**Props** : `{ sessions: Session[] }` — toutes les sessions du jour sélectionné.

**Rendu par type de session** dans le map de chaque session :

| `sessionType`              | Rendu liste |
|----------------------------|-------------|
| `Session` / `Keynote`      | `<SessionCard>` → `button.al-card` |
| `Pause` / `Repas` / `Evenement` | `<BandRow>` → `div.al-band` |

**Structure `SessionCard`** :
```
button.al-card[style="--rc: <couleur>"]
  div.al-card-body
    div.al-card-top
      span.al-room-pill > span.al-room-dot + nom   (si s.roomName)
      span.al-hours   ← "HH:MM–HH:MM"             (si startTime + endTime)
    p.al-title
    p.al-speakers                                   (si speakers.length > 0)
```

**Structure `BandRow`** (miroir du HTML preview) :
```
div.al-band
  span.al-band__icon   ← cercle 28px blanc avec SVG (ServiceIcon de AgendaGrid.tsx)
  span.al-band__title  ← titre
  span.al-band__duration ← s.duration ("N min")
```

`ServiceIcon` est importé depuis `AgendaGrid.tsx` (export nommé) pour éviter la
duplication du SVG et de la logique `bandIconKey`.

**Couleur de salle** : `--rc` sur `.al-card` → rail gauche + fond pill teinté via
`color-mix(in srgb, var(--rc) 10%, transparent)`.

**État vide** : `.al-list > .al-empty` avec `<CalendarIcon>` si `groups.length === 0`.

**Omissions conditionnelles** :
- Pas de pill salle si `!s.roomName`.
- Pas de plage horaire si ni `startTime` ni `endTime`.
- Pas de ligne speakers si `speakers.length === 0`.
- Pas de durée dans `.al-band` si `!s.duration`.

**Carte interactive** : `<button>` (accessibilité clavier), `onClick` vide (feature 105, à venir).

---

## Composant `ListSkeleton` (US-102-02)

`src/components/ListSkeleton.tsx` + `ListSkeleton.css`

**Gabarit déterministe** : `const GROUPS = [3, 2, 3]` → 3 groupes de 3 / 2 / 3 cartes (8 cartes total).

**Structure de rendu** (miroir d'AgendaList — cartes Session uniquement) :
```
div.lsk-list[role=status][aria-busy=true]
  div.lsk-group[aria-hidden=true]   (× 3)
    div.lsk-group-head
      div.lsk-time.sk-shimmer
      div.lsk-divider
    div.lsk-card   (× count)
      div.lsk-card-body
        div.lsk-bar.lsk-bar--title.sk-shimmer.lsk-w-{0|1|2}
        div.lsk-bar.lsk-bar--speakers.sk-shimmer
        div.lsk-bar.lsk-bar--meta.sk-shimmer
```

**Largeurs variables du titre** : `lsk-w-{(gi+ci) % 3}` → 85% / 70% / 78% en alternance
déterministe (pas de `Math.random`).

**Shimmer** : classe `.sk-shimmer` définie dans `src/index.css` (global, partagée avec `GridSkeleton`).
`ListSkeleton.css` ne redéfinit pas l'animation.

---

## Gating mobile / desktop (App.tsx + App.css)

| Zone CSS | Mobile < 1024px | Desktop ≥ 1024px |
|---|---|---|
| `.agenda-mobile-wrap` | `display: flex` | `display: none` |
| `.agenda-grid-wrap` | `display: none` | `display: block` |

**État chargement** (`!agenda`) :
- `.agenda-mobile-wrap` → `<ListSkeleton />` (US-102-02)
- `.agenda-grid-wrap` → `<GridSkeleton />` (US-101-02, inchangé)

**État chargé** :
- `.agenda-mobile-wrap` → `<AgendaList sessions={allSessions}>` (toujours)
- `.agenda-grid-wrap` → `<AgendaGrid>` ou `<AgendaList>` selon `view`

**`allSessions`** : `(agenda.days[day] ?? agenda.days[0]).sessions` — toutes les sessions,
y compris Pause/Repas/Evenement (contrairement à `gridSessions` qui appelle `positionableSessions()`).

---

## Toggle Grille / Liste (desktop uniquement)

`src/App.tsx` — état `const [view, setView] = useState<View>('grid')`.

Rendu dans `.app-controls`, après `<DayTabs>` :
- `<div class="view-toggle" role="group">` — masqué mobile, `display:flex` desktop.
- Deux `<button class="vt-btn [is-active]">` : **Grille** en premier, **Liste** en second.
- `.is-active` : `background:var(--surface-card); color:var(--brand-blue-700); box-shadow:var(--shadow-xs)`.

---

## Notable UI behaviour

- **`--rc` sur `<button>`** : CSS custom properties en inline style sur un `<button>` fonctionnent
  dans Chrome/Edge/Safari modernes.
- **Fond teinté pill** : `color-mix(in srgb, var(--rc) 10%, transparent)` est la seule façon
  d'obtenir une transparence depuis une CSS variable.
- **`ServiceIcon` partagé** : exporté nommé depuis `AgendaGrid.tsx` pour éviter la duplication
  de la logique d'icône. Reçoit `session: Session` (utilise `s.sessionType` + mots-clés titre).
- **Skeleton dans `index.css`** : `.sk-shimmer` + `@keyframes sk-shimmer` globaux, partagés
  entre `GridSkeleton` et `ListSkeleton`.
- **Données liste vs grille** : la grille filtre via `positionableSessions()` ; la liste reçoit
  `day.sessions` brut — les Pause/Repas/Evenement apparaissent dans les deux vues.

---

## Key files

| Rôle | Chemin |
|---|---|
| Regroupement horaire | `src/data/agenda-transform.ts` → `groupByStartTime`, `TimeGroup` |
| Liste réelle | `src/components/AgendaList.tsx` + `AgendaList.css` |
| Icône de service partagée | `src/components/AgendaGrid.tsx` → `ServiceIcon` (export nommé) |
| Skeleton mobile | `src/components/ListSkeleton.tsx` + `ListSkeleton.css` |
| Shimmer global | `src/index.css` (`.sk-shimmer`, `@keyframes sk-shimmer`) |
| Gating + toggle + state | `src/App.tsx` (`view`, `allSessions`, rendu conditionnel) |
| CSS gate mobile/desktop | `src/App.css` (`.agenda-mobile-wrap`, `.agenda-grid-wrap`, `.view-toggle`) |

---

## Power Pages — Spécificités

Différences d'implémentation par rapport à la Code App :

- **Import d'icône** : la Code App importe le composant `ServiceIcon` depuis `AgendaGrid.tsx`
  et l'utilise directement dans `.al-band`. Le Power Pages importe `ICONS` +
  `serviceIconKey` (exports nommés) et définit un composant local `BandIcon`
  (cercle blanc 28px, classe `.al-band__icon-wrap`) qui construit son propre SVG.

- **Données liste vs grille** : identique — `allSessions = day.sessions` complet pour
  la liste ; `positionableSessions(day)` pour la grille. La logique `positionableSessions`
  utilise `s.sessionType === 'Session'` pour l'exigence de salle (Power Pages et Code App
  partagent cette implémentation dans `agenda-transform.ts`).
