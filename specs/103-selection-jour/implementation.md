# 103 — Sélection du jour · Implementation

## Overview

Sélecteur de jour (segmented control) porté par `DayTabs`
(`src/components/DayTabs.tsx` + `DayTabs.css`), rendu dans la barre de contrôles
(`.app-controls`) entre le header et le `main`. Fournit le « jour courant » que la vue
grille (101) consomme via l'état React de `App.tsx`.

## Dérivation des jours

- Les jours viennent de `getAgenda()` (`src/data/agenda.ts`, **Dataverse**), regroupés par
  date à l'heure de Paris depuis `mwcp26_startdatetime` (`groupByDay` /  `parisParts`,
  `src/data/agenda-transform.ts`). Chaque `Day` porte `short` (« Jour 1 »), `weekday`,
  `datelabel` (sans l'année dans l'onglet) et `isoDate` (ex. `2026-06-23`).
- `DayTabs` est indépendant de la source : la vue-modèle `Day` ne change pas.

## Comportement

- **Onglets** : un `<button role="tab">` par jour, `.dt-main` = `short`, `.dt-sub` =
  jour abrégé + date. Actif (`is-active`) = carte blanche + ombre
  (`var(--surface-card)` + `var(--shadow-sm)`), `aria-selected`.
- **Défaut** (`defaultDayIndex`, `src/data/agenda.ts`) : jour courant si `isoDate` ==
  aujourd'hui, sinon premier jour (index 0). Au 2026-06-16 (avant l'événement) → Jour 1.
- **Persistance** : état `day` dans `App.tsx` (`useState`) — conservé tant que l'app reste
  ouverte ; changer de jour re-rend la grille (101).
- **Un seul jour** : `DayTabs` ne rend rien (`days.length < 2`) — sélecteur masqué, le jour
  unique est affiché d'office.
- **Clavier** : `<button>` natifs (Tab + Entrée/Espace).

## Acceptance criteria — état

- [x] Un onglet par jour de conférence, commutable.
- [x] Défaut = jour courant pendant l'événement, sinon premier jour.
- [x] La sélection persiste tant que l'app reste ouverte.
- [x] Changer de jour met à jour la vue active (grille). *(Recherche 104 : hors périmètre.)*
- [x] Conférence à un seul jour → sélecteur masqué.

## Responsive

- Barre `.app-controls` : dans le flux en mobile (défile avec le hero), figée sous le
  header en desktop (cf. spec 100).
- `.daytabs` : pleine largeur (colonnes égales) en mobile, largeur du contenu (alignée à
  gauche) en desktop.

## Key files

- `src/components/DayTabs.tsx` — segmented control.
- `src/components/DayTabs.css` — styles `.daytabs` / `.daytab` (tokens).
- `src/data/agenda-transform.ts` — `defaultDayIndex`, `groupByDay`/`parisParts` (dérivation
  des jours : `isoDate`, `weekday`, `datelabel`, `short`).
- `src/App.tsx` / `src/App.css` — état `day` (init après chargement Dataverse), barre de contrôles.
