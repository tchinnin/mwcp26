# 100 — Agenda MWCP 2026 (Code App) — cadre applicatif · Implementation

## Overview

Shell React + Vite (`src/App.tsx` + `src/App.css`), **CSS-only responsive** piloté par
un **unique breakpoint `1024px`** — aucun état React ni JS de mesure de largeur.
Structure DOM unique pour toutes les largeurs ; c'est la CSS qui fait varier layout,
visibilité du fond Paris, présentation du header et conteneur de défilement.

```
.app-shell                ← surface page, min-height:100vh, fond Paris (>=1024px)
├── img.app-bg            ← photo Paris floutée, display:none par défaut
└── .app-col              ← colonne applicative (flex column)
    ├── header.app-header  ← hero (mobile/tablette) ↔ bandeau .dhead (desktop)
    └── main.app-main      ← contenu (placeholder ; zone scrollable >=1024px)
```

Les vues **grille (101)** et **liste (102)** ne sont pas encore construites : `main`
porte un placeholder (carte + légende des 4 tracks). **Aucun footer** (retiré ; la
preview de référence n'en a pas).

## Modèle responsive (breakpoint → comportement)

`.app-col` n'a **ni padding ni gap** : ses enfants (header, main) sont à ras bord. Le
**header est donc collé en haut** et **n'a pas de rayon propre**. En desktop la colonne a
`border-radius:0` (coins nets) → l'app n'est jamais arrondie. Le padding du contenu est sur
`.app-main` (`var(--space-6)`).

Un **seul breakpoint : 1024px**. Pas de palier intermédiaire « colonne flottante arrondie ».

| Largeur | Colonne (`.app-col`) | Fond Paris | Header | Défilement |
|---|---|---|---|---|
| **< 1024px** (mobile/tablette) | **pleine largeur**, `margin:0`, `padding:0`, `border-radius:0` (base) | **masqué** (`.app-bg{display:none}`, `.app-shell` opaque `--surface-page`) | **hero** flush haut du viewport : `--gradient-hero`, texte `--text-on-brand`, titre `--text-h1`, logo 64px rond sur blanc, layout colonne, **collé sans rayon ni ombre** ; **non sticky** | toute la page (scroll document) |
| **≥ 1024px** (desktop) | `max-width:--app-col-wide` (1340), `margin:0 auto`, `height:100vh`, `min-height:0`, **`border-radius:0`** (panneau coins nets), `overflow:hidden`, fond `--surface-page`, **ombre ambiante `0 0 80px rgba(11,14,20,0.24)`** (flotte sur le fond Paris) | **visible** marges latérales : `.app-bg{display:block}` + voile `.app-shell::after` (gradient `--surface-page` 35→70%), `.app-shell` transparent | **bandeau dégradé bleu `.dhead`** : `linear-gradient(108deg, --sky-deep → --brand-blue 78%)`, texte `--text-on-brand`, **collé en haut, sans rayon ni ombre**, `flex-direction:row`, logo 44px, titre `--text-h3` **au-dessus** + kicker en **sous-titre** (`column-reverse`, `text-transform:none`, opacity .86), `.app-header__titles{margin-right:auto}` pousse les pills à droite, `flex:0 0 auto` ; **figé** structurellement | seul `main.app-main` défile (`flex:1 1 auto; overflow-y:auto; min-height:0`) sous le header fixe |

**Le header n'utilise jamais `position: sticky`.** Sa fixité desktop est *structurelle* :
`.app-col` borné à `100vh` en flex-column, header `flex:0 0 auto` (ne scrolle pas),
`main` seul scrollable. En mobile, header dans le flux → défile avec la page.

**Pills d'en-tête** (sur dégradé bleu, hero comme `.dhead`) : `.badge-edition` =
translucide `rgba(255,255,255,0.18)` + texte `--text-on-brand` (cf. maquette `.hpill-d`,
pas d'aplat rouge) ; `.pill-dates` = `--brand-yellow` + `--ink-900` (lisible sur bleu).

## Event → behaviour

| Événement | Comportement |
|---|---|
| Largeur franchit **1024px** | Header passe hero (collé, pleine largeur) → bandeau dégradé bleu `.dhead` ; la colonne se borne et se centre (panneau coins nets + ombre ambiante) ; le fond Paris + voile apparaissent dans les marges ; `main` devient la zone scrollable (header figé). |
| Scroll **< 1024px** | Toute la page défile, le hero disparaît vers le haut. |
| Scroll **≥ 1024px** | Seul le corps défile, l'en-tête reste en place. |

## Notable UI behaviour

- **Fond Paris en `<img class="app-bg">` data-URI**, pas en `background-image` : seul le
  `src` d'`<img>` en base64 (`?inline`) se résout dans le player Power Apps. Le voile est
  un `::after` `position:fixed`. Gating par `display` (off < 1024 / on ≥ 1024) plutôt que par
  opacité, pour ne rien peindre sous le seuil desktop. Cf. [[ref-codeapp-assets-public]].
- **Conteneur de défilement desktop prêt pour 101/102** : les en-têtes de salle / colonne
  d'heures sticky de la grille (101) et la liste (102) devront s'ancrer dans
  `main.app-main` (le `overflow-y:auto` desktop), pas sur le `window`. C'est le point
  d'accroche des futurs `position: sticky` internes.
- **Header toujours collé, jamais arrondi** : `.app-col` n'a ni `padding` ni `gap`, donc le
  header est à ras bord. Ne JAMAIS remettre de `padding`/`gap`/`border-radius` sur `.app-col`
  (header redeviendrait une carte flottante détachée + arrondie) — c'était le bug corrigé.
  Sous 1024 = pleine largeur ; desktop = panneau `border-radius:0` (coins nets) + ombre ambiante.
- **Un seul breakpoint (1024px)** : pas de palier intermédiaire « colonne flottante arrondie »
  (volontairement retiré). Sous 1024 = pleine largeur sans fond ; ≥ 1024 = panneau borné +
  bandeau `.dhead` + fond Paris + corps scrollable. Réimplémenté en CSS, pas embarqué depuis
  la preview.
- **Pas de bascule de vue ni barre de contrôles** (jour/recherche/toggle) : périmètre des
  features 103/104 + sélection de vue, non construites. Quand elles arriveront, la barre de
  contrôles sera **non sticky en mobile** (défile avec le hero) et **dans la zone figée en
  desktop**, conformément à la spec 100.

## Key files

- `codeapps/mwcp26-agenda-codeapp/src/App.tsx` — DOM du shell (shell / bg / col / header /
  main placeholder).
- `codeapps/mwcp26-agenda-codeapp/src/App.css` — tout le responsive (unique breakpoint 1024px),
  gating fond Paris, header hero (mobile/tablette) ↔ bandeau dégradé `.dhead` (desktop), header
  collé / pleine largeur sous 1024, conteneur de défilement desktop.
- `codeapps/mwcp26-agenda-codeapp/src/theme/tokens.css` — tokens consommés :
  `--gradient-hero`, `--sky-deep`/`--brand-blue` (dégradé `.dhead`), `--surface-page`,
  `--app-col-wide` (1340), `--text-h1`/`--text-h3`, `--text-on-brand`,
  `--brand-yellow`/`--ink-900` (pill date). Valeurs hors-token assumées (contrat maquette,
  sans équivalent) : pill édition `rgba(255,255,255,0.18)`, ombre ambiante desktop
  `0 0 80px rgba(11,14,20,0.24)`.
