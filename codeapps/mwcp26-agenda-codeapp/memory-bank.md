# MWCP26 Agenda (Code App) — Memory Bank

## Projet

- Path: `codeapps/mwcp26-agenda-codeapp/`
- App name (displayName): **MWCP26 Agenda**
- Stack: React 19 + Vite 7 + TypeScript (template `microsoft/PowerAppsCodeApps/templates/vite`)
- UI: **Radix UI (headless)** + design tokens CSS (`src/theme/tokens.css`)
- Environnement: **DEV — CHINNIN.TECH** (`d6b0b2cd-588d-4cb1-b657-6a8ad7951d40`,
  https://chinnin-tech-dev.crm4.dynamics.com/)
- App ID: `eeb47756-a38f-4333-95d9-545780fba5e3`
- App URL: https://apps.powerapps.com/play/e/d6b0b2cd-588d-4cb1-b657-6a8ad7951d40/app/eeb47756-a38f-4333-95d9-545780fba5e3
- Version: **v1.0.0** (`src/version.ts`, affichée dans le footer)

## Spec / design

- Spec applicatif: `specs/100-mwcp26-agenda-codeapp/spec.md` (features 101–105 à venir)
- Design system (source de vérité): `uxui/guidelines.md`
- Preview de référence (contrat visuel, non embarqué):
  `uxui/mwcp26-agenda-codeapp/mwcp26-agenda-codeapp-standalone.html`

## Étapes réalisées

- [x] Prérequis (Node v25, git, pac 2.4.1 — appelé directement, pas de pwsh sur macOS)
- [x] Auth profil `CHINNIN.TECH - DEV` + env DEV sélectionné
- [x] Scaffold (npx degit template vite)
- [x] `pac code init` → `power.config.json` (env vérifié)
- [x] Couche design system: `src/theme/tokens.css` (+ `tokens.ts`), fonts + logos + fond Paris
      copiés dans `src/assets/`, import dans `main.tsx`
- [x] App shell placeholder: background Paris glassmorphism, header (branding MWCP, 10e Édition,
      dates), footer (logos aMP/MWCP + version), légende des 4 tracks
- [x] Radix installé (`react-dialog`, `react-tabs`, `react-toggle-group`)
- [x] Build (`npm run build`) OK → `dist/`
- [x] Baseline deploy (`pac code push`)

## Données

- Aucune source de données branchée pour l'instant (lecture seule prévue depuis Dataverse).
- Tables Dataverse cibles (read-only): Conference, Salle, Session, SessionSpeaker, Contact.

## Composants

- `src/App.tsx` — app shell (header / main placeholder / footer)
- `src/theme/tokens.css` — tokens (couleurs, typo, spacing, glass, motion)
- `src/theme/tokens.ts` — accès typé aux tokens
- `src/version.ts` — `APP_VERSION`

## Assets de marque (logos / fond)

⚠️ Dans le player Power Apps, **aucune URL relative ne se résout** une fois pushé :
- import JS classique → `new URL(asset, import.meta.url)` (base `./`) → 404 ;
- `public/` + `import.meta.env.BASE_URL` → marche en **local** mais **pas pushé**.

**Solution retenue (éprouvée) : base64 inline.** Les images sont dans `src/assets/` et importées
avec le suffixe **`?inline`** (`import mwcpLogo from './assets/mwcp-logo.png?inline'`) → data URI
embarqué dans le bundle, zéro résolution d'URL à l'exécution. Typé nativement par `vite/client`
(tsconfig a déjà `"types": ["vite/client"]`). **Ne pas modifier `vite.config.ts`** (scaffold).

⚠️ **Deux écueils supplémentaires observés sur le fond :**
1. Le player **tronque les très gros data URIs** : `paris-bg` (2,5 Mo PNG → 3,4 Mo base64) ne
   s'affichait pas alors que les logos (≤ 865 Ko) oui. → compressé en **JPEG 1280px q55 = 214 Ko**
   (`paris-bg.jpg`, image floutée donc qualité indifférente). Bundle JS : 4,5 Mo → 1,4 Mo.
2. Le fond doit être un **`<img class="app-bg">`** (même mécanisme que les logos), pas un
   `background-image: var(--paris-bg)` alimenté par un attribut `style` inline. Seul le `src`
   d'`<img>` en data URI se résout de façon fiable dans le player. CSS `.app-bg` : fixed, cover,
   blur, z-index -2 ; voile `.app-shell::after` z-index -1.

Les polices restent dans `src/assets/fonts/` (le `url(./…)` CSS se résout contre la feuille de
style — mécanisme distinct qui fonctionne).

## Périmètre restant (runs suivants)

- `/add-dataverse` : Conference / Salle / Session / SessionSpeaker / Contact (read-only)
- Features 101 (grille), 102 (liste), 103 (sélection jour), 104 (recherche), 105 (détail session)
- `lite-sdd-implement` pour documenter l'implémentation en regard des specs
- Redéploiement: `npm run build && pac code push` (depuis ce dossier), incrémenter `APP_VERSION`
