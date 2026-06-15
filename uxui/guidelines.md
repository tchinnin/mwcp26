# aMP / MWCP 2026 — UX-UI Guidelines

Design system de l'app **Agenda MWCP 2026** (Modern Workplace Conference, Paris).
Ce document est la **source de vérité lisible** ; sa traduction machine est la couche
de design tokens (voir [Mise en œuvre](#mise-en-œuvre-couche-de-tokens)). Quand le
design évolue, on modifie ce fichier **et** les tokens — jamais les composants un par un.

> Preview de référence : [`mwcp26-agenda-codeapp/mwcp26-agenda-codeapp-standalone.html`](./mwcp26-agenda-codeapp/mwcp26-agenda-codeapp-standalone.html)
> — contrat visuel point-dans-le-temps, à ré-implémenter en React (pas à embarquer tel quel).
>
> Cette preview cible la version **Code App** de l'agenda. Le repo hébergera deux apps
> MWCP26 pour comparer les approches : `mwcp26-agenda-codeapp` (Code App / React+Vite)
> et `mwcp26-agenda-canvas` (Canvas App). Le design system `uxui/` est **partagé** par
> les deux.

---

## Identité de marque

La marque repose sur l'**anneau quadrichromie** « swoosh » de Microsoft, échantillonné
sur le logo aMP / MWCP. Ordre autour de l'anneau : **rouge** (haut-gauche) · **vert**
(haut-droite) · **jaune** (bas-droite) · **bleu** (bas-gauche). Le bleu est la couleur
d'action primaire.

| Asset | Fichier | Usage |
|-------|---------|-------|
| Logo MWCP (anneau + Tour Eiffel) | `assets/mwcp-logo.png` | Hero, en-tête, favicon |
| Logo aMP (anneau + wordmark gris) | `assets/amp-logo.png` | Marque de l'éditeur / variante |
| Fond Paris aérien (flouté) | `assets/paris-bg.png` | Arrière-plan glassmorphism |

Ton : **énergique et moderne** (Poppins, anneau coloré) posé sur une base **Microsoft
native** (Segoe UI, neutres froids, easing Fluent). Le motif signature est le
**glassmorphism** : panneaux blancs givrés flottant sur la photo aérienne de Paris.

---

## Couleurs

### Anneau de marque (4 couleurs)
| Rôle | Hex | Usage |
|------|-----|-------|
| `--brand-blue` | `#00AEF0` | **Action primaire**, état actif, liens, focus |
| `--brand-green` | `#80CD28` | Accent / succès |
| `--brand-yellow` | `#FABC09` | Accent / favoris / warning |
| `--brand-red` | `#F2521B` | Accent |

Teintes/ombres : `--brand-blue-700 #0086C9` (active) · `--brand-blue-600 #009BDA` (hover)
· `--brand-blue-100 #D6F1FC` · `--brand-blue-050 #ECF8FE` (washes) · `--brand-red-700
#C73D0E` · `--brand-green-700 #5E9D14` · `--brand-yellow-700 #D99A00`.

### Accent événement
| Rôle | Hex | Usage |
|------|-----|-------|
| `--accent-event` | `#E90B0B` | Badge « 10e Édition », compteur favoris |
| `--accent-event-700` | `#C20808` | Hover/pressed de l'accent |

### Encre (textes) — bleu-noir du bandeau MWCP
| Rôle | Hex | Usage |
|------|-----|-------|
| `--ink-900` | `#0B0E14` | Titres |
| `--ink-700` | `#283446` | Corps fort |
| `--ink-500` | `#5E6470` | Texte secondaire |
| `--ink-400` | `#8A909B` | Muet / placeholder |
| `--amp-gray` | `#737373` | Wordmark aMP |

### Neutres & surfaces
`--neutral-050 #F6F8FB` (canvas page) · `--neutral-100 #EDF1F6` (surface creusée) ·
`--neutral-200 #E0E6EF` (bordure subtile) · `--neutral-300 #CDD5E0` (bordure défaut) ·
`--neutral-400 #AEB7C4` · `--white #FFFFFF` (cartes).

### Ciel de Paris (dégradé bandeau)
`--sky-deep #2F74DE` · `--sky-mid #4992F1` · `--sky-light #8FBEF6` · `--sky-haze #C8E8FC`.
Le hero utilise `linear-gradient(158deg, sky-deep 0%, brand-blue 62%, #59c4f3 128%)`.

### Aliases sémantiques (à référencer dans les composants)
`--text-heading` = ink-900 · `--text-body` = ink-700 · `--text-secondary` = ink-500 ·
`--text-muted` = ink-400 · `--text-on-brand` = white · `--text-link` = brand-blue-700.
`--surface-page` = neutral-050 · `--surface-card` = white · `--surface-sunken` =
neutral-100 · `--surface-inverse` = ink-900. `--action-primary` = brand-blue
(hover → blue-600, active → blue-700). Feedback : `--success #80CD28` · `--warning
#FABC09` · `--danger #E90B0B` · `--info #00AEF0`.

### Couleurs de track (les 4 couleurs de marque → thèmes)
| Track | Token | Couleur |
|-------|-------|---------|
| IA / Copilot | `--track-ia` | brand-blue `#00AEF0` |
| Modern Work | `--track-modernwork` | brand-green `#80CD28` |
| Cybersécurité | `--track-security` | brand-red `#F2521B` |
| Power Platform | `--track-power` | brand-yellow `#FABC09` |

Chaque carte de session porte une **barre latérale gauche** (`border-left: 4px`) à la
couleur de son track ; les chips de filtre affichent un point (`chip-dot`) de la même
couleur.

> ⚠️ **Accessibilité couleur** : jaune (`#FABC09`) et vert (`#80CD28`) sur fond blanc
> n'atteignent pas 4,5:1 — ne **jamais** poser de texte coloté dessus, les réserver à
> des aplats/points/bordures. Sur fond jaune (favori actif, pill date), n'utiliser que
> de l'encre `--ink-900`. Ne jamais transmettre un état par la **couleur seule** :
> toujours doubler d'un libellé, d'une icône ou d'un texte (track = couleur **+** nom).

---

## Typographie

| Famille | Token | Usage |
|---------|-------|-------|
| Poppins (woff2 livré, 400→800) | `--font-display` | Titres, hero, branding événement |
| Segoe UI (stack système) | `--font-ui` | UI & corps — typeface Microsoft native |
| Cascadia Code (woff2 livré) | `--font-mono` | Horaires, heures, données tabulaires |

```
--font-display: "Poppins", "Segoe UI", system-ui, sans-serif;
--font-ui:      "Segoe UI", system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif;
--font-mono:    "Cascadia Code", "Consolas", ui-monospace, "SF Mono", Menlo, monospace;
```

Segoe UI est propriétaire → non embarquée, rendu natif sur Windows, fallback
`system-ui` ailleurs. Poppins et Cascadia Code sont livrées (`assets/fonts/`).

**Poids** : 400 regular · 500 medium · 600 semibold · 700 bold · 800 extrabold.

**Échelle de type** (base 16px) :
`display-xl 4.5rem` · `display-lg 3.5rem` · `display-md 2.75rem` · `h1 2.25rem` ·
`h2 1.75rem` · `h3 1.375rem` · `h4 1.125rem` · `body-lg 1.125rem` · `body 1rem` ·
`body-sm 0.875rem` · `caption 0.8125rem` · `overline 0.6875rem` (majuscules).

**Interlignages** : tight 1.08 (display) · snug 1.25 (titres) · normal 1.5 (corps) ·
relaxed 1.65. **Interlettrages** : tight -0.02em (gros display) · snug -0.01em ·
wide 0.04em · overline 0.12em (majuscules).

---

## Espacement & disposition

Grille de base **4px**. Échelle (`--space-*`) :
`0 · 1 (4px) · 2 (8) · 3 (12) · 4 (16) · 5 (20) · 6 (24) · 8 (32) · 10 (40) · 12 (48)
· 16 (64) · 20 (80) · 24 (96)`.

**Conteneurs** : sm 640 · md 880 · lg 1140 · xl 1320. Gouttière = space-6 (24px).

**Layout de l'app** (responsive, mobile-first) :
- **Mobile / portrait** : colonne unique `--app-col` **max 468px** centrée, ombre
  portée, fond `surface-page`. ≥520px : marges 24px + coins arrondis.
- **Desktop large** (`.app-col.wide`, **max 1340px**, `height: 100vh`) : en-tête
  horizontal `dhead`, barre de contrôles non-wrap, corps scrollable, vue **timetable
  grid** (salles en colonnes × heures en lignes, en-têtes sticky).
- Deux vues commutables : **Liste** (par créneau horaire) et **Timetable** (grille
  salles × heures).

---

## Formes, ombres, glassmorphism, motion

**Rayons** : xs 6 · sm 10 · md 14 (cartes/inputs/boutons par défaut) · lg 20 ·
xl 28 (panneaux glass) · 2xl 36 · pill 999 (pills date, tags, badges).

**Élévation** (douce, teintée froid) : xs `0 1px 2px` → xl `0 28px 70px` rgba(11,14,20).
`--shadow-brand: 0 10px 30px rgba(0,174,240,0.30)` pour l'emphase primaire/focus.

**Glassmorphism** (motif signature) : `--glass-bg rgba(255,255,255,0.55)` (strong .72,
soft .30) · `--glass-border rgba(255,255,255,0.65)` · `--glass-blur 18px` (strong 28px)
· `--glass-shadow 0 16px 50px rgba(15,42,74,0.22)` · highlight `inset 0 1px 0
rgba(255,255,255,0.65)`. Toujours fournir `backdrop-filter` **et**
`-webkit-backdrop-filter`. La barre de contrôles sticky est un panneau glass
(`rgba(255,255,255,0.86)` + blur 12px).

**Motion** (easing Fluent) : `--ease-standard cubic-bezier(0.2,0,0,1)` ·
`--ease-decelerate (0.1,0.9,0.2,1)` · `--ease-accelerate (0.7,0,1,0.5)`. Durées :
fast 120ms · normal 200ms · slow 320ms. Le panneau détail glisse depuis le bas
(`@keyframes sheetup`), centré en modale ≥1024px.

**Focus** : `--ring-width 3px`, `--ring-color rgba(0,174,240,0.45)`. Anneau visible
sur tout élément interactif (cf. `.search:focus-within`).

---

## Conventions de composants

- **Action primaire** = `brand-blue` ; une seule action primaire par vue.
- **Hero (mobile)** : dégradé ciel, logo MWCP rond sur blanc, kicker en overline,
  titre Poppins 800 ~42px, pills d'info (date en pill `brand-yellow` + ink-900).
- **Barre de contrôles** (sticky, glass) : onglets de **jour** (segmented control,
  actif = carte blanche + ombre), **recherche** (focus = bordure bleue + ring),
  **toggle favoris** (actif = aplat jaune + ink-900, badge compteur en accent-event),
  **chips de track** (scroll horizontal, actif = aplat bleu, point coloré par track).
- **Carte de session** : barre gauche 4px à la couleur du track, titre Poppins 600,
  intervenant·e en secondaire, heure en mono ; bouton favori en haut à droite (étoile,
  active = `#D99A00`). Hover : élévation md + `translateY(-1px)`.
- **Groupe horaire (vue liste)** : pastille d'heure mono + filet, cartes empilées.
- **Timetable** : en-têtes de salle sticky (point coloré + nom Poppins + capacité),
  colonne d'heures mono sticky, cartes positionnées dans la grille ; pauses/plénières
  en bande pointillée pleine largeur (`tt-band`).
- **État vide** : icône + message centré, max 250px.
- **Formulaires** : libellé au-dessus du champ ; validation en ligne sous le champ ;
  jamais d'état signalé par la couleur seule.

---

## Accessibilité (WCAG AA, base de référence)

- Préférer une **bibliothèque de composants accessible** (Fluent UI v9 ou Radix UI)
  pour clavier/ARIA/focus/dialogues gérés nativement — surtout pour le panneau détail
  (dialog modal), les onglets de jour (tablist) et les chips (toggle buttons).
- **Contraste** : corps ≥4,5:1, gros texte / bordures UI ≥3:1. Encre sur surfaces
  claires OK ; **jamais** de texte sur jaune/vert de marque (voir avertissement couleur).
- **Jamais la couleur seule** pour un état (track, favori, erreur) → coupler
  texte/icône/libellé.
- Éléments sémantiques réels (`<button>`, `<a>`, titres), focus visible (ring 3px),
  pleine opérabilité clavier, champs étiquetés. `lang="fr"`.

---

## Inventaire des assets

```
uxui/assets/
├── mwcp-logo.png        # anneau quadri + Tour Eiffel
├── amp-logo.png         # anneau quadri + wordmark « aMP »
├── paris-bg.png         # photo aérienne Paris (fond glass, floutée à l'usage)
└── fonts/
    ├── poppins-400…800.woff2      # display (5 graisses livrées)
    └── cascadia-code-400/600/700.woff2   # mono
```

> Copier les assets réellement utilisés dans le `src/assets` de l'app au moment de la
> construire (ne pas hot-linker `uxui/` au build). Segoe UI n'est **pas** fournie
> (système). Les sous-ensembles Google Fonts du bundle d'origine ne sont pas conservés.

---

## Correspondance avec le modèle de données

L'agenda s'appuie sur le data model Dataverse existant (cf. mémoire projet) :
**Conference** → en-tête / édition · **Salle** → colonnes de la timetable (nom +
capacité) · **Session** → cartes (titre, horaires, track, favori) · **SessionSpeaker**
→ intervenant·e affiché sur la carte. Le **track** d'une session pilote sa couleur
(barre, point, chip) via les tokens `--track-*`.

---

## Mise en œuvre (couche de tokens)

Le bundle de la preview porte déjà l'intégralité des tokens ci-dessus sous forme de
variables CSS `:root` (blocs FONTS / COLORS / TYPOGRAPHY / SPACING / EFFECTS). À la
construction du Code App :

1. Reporter ces blocs dans `src/theme/tokens.css`, importé une fois dans `src/main.tsx`.
2. Optionnellement, exposer un module typé `src/theme/tokens.ts` (`var(--…)`) pour
   l'autocomplétion.
3. Si une bibliothèque de composants est utilisée, alimenter **son thème** avec ces
   tokens (ramp de marque depuis `--brand-blue` pour Fluent UI v9, ou mapping dans
   `tailwind.config`) — ne pas surcharger les composants au cas par cas.
4. Construire les écrans en React en consommant les tokens (jamais de littéraux), en
   honorant l'**intention** de la preview (hiérarchie, glassmorphism, layout, tracks)
   — diverger sur les détails est normal.

Squelette de tokens et exemples d'intégration : voir la référence de la skill
`ppbp-codeapps-uxui` (`references/guidelines-and-theming.md`).
