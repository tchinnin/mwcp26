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

**Structure de rendu** :
```
.al-list
  section.al-group   (un par TimeGroup)
    header.al-group-head
      span.al-time       ← label du groupe (heure ou "Horaire à confirmer")
      div.al-divider     ← filet horizontal flex:1
    button.al-card[style="--rc: <couleur>"]   (un par session)
      div.al-card-body
        div.al-card-top
          span.al-room-pill > span.al-room-dot + nom de salle   (si s.roomName)
          span.al-hours   ← "HH:MM–HH:MM" (si startTime et endTime)
        p.al-title
        p.al-speakers     (si speakers.length > 0)
      span.al-fav > <StarIcon>
```

**Couleur de salle** : chaque `.al-card` reçoit `style={{ '--rc': s.roomColor || 'var(--ink-200)' }}`.
`--rc` est consommé par `.al-card` (bordure gauche), `.al-room-pill` (texte + fond teinté), `.al-room-dot` (pastille).
Le fond teinté de la pill : `color-mix(in srgb, var(--rc) 10%, transparent)` — seul mécanisme compatible
avec une variable CSS (pas de `hexA()` possible).

**État vide** : si `groups.length === 0`, retourne un `.al-list > .al-empty` avec `<CalendarIcon>` + message.

**Omissions conditionnelles** :
- Pas de mention de salle si `!s.roomName`.
- Pas de plage horaire si ni `startTime` ni `endTime`.
- Pas de ligne speakers si `speakers.length === 0`.

**Carte interactive** : `<button>` (accessibilité clavier), `onClick` vide (feature 105, à venir).

---

## Composant `ListSkeleton` (US-102-02)

`src/components/ListSkeleton.tsx` + `ListSkeleton.css`

**Gabarit déterministe** : `const GROUPS = [3, 2, 3]` → 3 groupes de 3 / 2 / 3 cartes (8 cartes total).

**Structure de rendu** (miroir d'AgendaList) :
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
      div.lsk-fav.sk-shimmer
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
pas seulement les positionnables (contrairement à `gridSessions` qui appelle `positionableSessions()`).

---

## Toggle Grille / Liste (desktop uniquement)

`src/App.tsx` — état `const [view, setView] = useState<View>('grid')`.

Rendu dans `.app-controls`, après `<DayTabs>` :
- `<div class="view-toggle" role="group">` — masqué mobile, `display:flex` desktop (CSS gate).
- Deux `<button class="vt-btn [is-active]">` : **Grille** en premier (index 0), **Liste** en second.
- Chaque bouton : icône SVG inline 15×15 + texte. `.vt-btn` : `display:inline-flex; align-items:center; gap:var(--space-2)`.
- `.is-active` : `background:var(--surface-card); color:var(--brand-blue-700); box-shadow:var(--shadow-xs)`.
- Icône Grille : `layout-grid` (4 rectangles 7×7). Icône Liste : `list` (3 lignes + 3 points).

---

## Notable UI behaviour

- **`--rc` sur `<button>`** : CSS custom properties en inline style sur un `<button>` fonctionnent
  dans Chrome/Edge/Safari modernes — pas besoin d'un `<div>` wrapper.
- **Fond teinté pill** : `color-mix(in srgb, var(--rc) 10%, transparent)` est la seule façon
  d'obtenir une transparence depuis une CSS variable (pas de rgba / hexA disponible ici).
- **Skeleton dans `index.css`** : `.sk-shimmer` + `@keyframes sk-shimmer` sont globaux pour être
  partagés entre `GridSkeleton` et `ListSkeleton` sans duplication. `GridSkeleton.css` ne les
  redéfinit plus.
- **Données liste vs grille** : la grille filtre via `positionableSessions()` (salle ET horaire obligatoires) ;
  la liste passe `day.sessions` brut pour afficher aussi les sessions sans salle ni horaire.

---

## Key files

| Rôle | Chemin |
|---|---|
| Regroupement horaire | `src/data/agenda-transform.ts` → `groupByStartTime`, `TimeGroup` |
| Liste réelle | `src/components/AgendaList.tsx` + `AgendaList.css` |
| Skeleton mobile | `src/components/ListSkeleton.tsx` + `ListSkeleton.css` |
| Shimmer global | `src/index.css` (`.sk-shimmer`, `@keyframes sk-shimmer`) |
| Gating + toggle + state | `src/App.tsx` (`view`, `allSessions`, rendu conditionnel) |
| CSS gate mobile/desktop | `src/App.css` (`.agenda-mobile-wrap`, `.agenda-grid-wrap`, `.view-toggle`) |
