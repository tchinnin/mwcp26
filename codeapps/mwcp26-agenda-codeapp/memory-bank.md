# MWCP26 Agenda — Memory Bank

## Project
- Path: codeapps/mwcp26-agenda-codeapp/
- App name: MWCP26 Agenda
- Environment: TCH (86021eb6-8c40-ea18-aba0-208524dc4d42) — https://chinnin-tech-tch.crm4.dynamics.com/
- Auth: theophile@chin-nin.tech (profil CHINNIN.TECH - TCH)
- App URL: https://apps.powerapps.com/play/e/86021eb6-8c40-ea18-aba0-208524dc4d42/app/5437b104-8941-447c-ad21-4abf023600b0
- App ID: 5437b104-8941-447c-ad21-4abf023600b0
- Version: v1.1.0 (déployé)

## Stack
- React 19.2 + Vite 7 + TS (template officiel microsoft/PowerAppsCodeApps/templates/vite)
- @radix-ui/react-tabs (sélecteur de jour accessible)
- lucide-react (icônes)
- Design tokens depuis uxui/mwcp-tokens.css ; polices Poppins + Cascadia (base64 dans fonts.css)

## Données
- Mockdata uniquement : data/import/mwcp-2026-sessions.json → src/data/sessions.json
- AUCUNE connexion Dataverse pour cette itération

## Completed Steps
- [x] Prérequis (Node v25, pac 2.4.1 natif macOS — pas de pwsh)
- [x] Auth TCH (profil chin-nin.tech, env select TCH)
- [x] Scaffold (npx degit) + npm install + Radix/lucide
- [x] pac code init (power.config.json → env TCH OK)
- [x] Baseline build OK (pipeline vérifié)
- [x] Couche thème (tokens, fonts base64, assets ?inline, global.css, agenda.css)
- [x] Données mock + transformations (agenda.ts)
- [x] Composants React (13 composants, Radix Tabs pour le jour, lucide pour icônes)
- [x] État & logique App.tsx (jour défaut/recherche/skeleton)
- [x] Build OK : JS 507KB (245KB gzip), CSS 187KB (fonts base64)
- [x] Déploiement TCH (pac code push) — v1.1.0 live

## Fonctionnalités déployées
- Vue liste mobile (spec 102) : groupes horaires, cartes session (couleur salle), items service
- Sélection du jour (spec 103) : Jour 1 / Jour 2, défaut = aujourd'hui si pendant l'event
- Recherche temps réel (spec 104) : titre + speakers, insensible casse/accents, état vide
- Skeleton de chargement (US-102-02) : shimmer au 1er montage (~600 ms)
- Chips de filtre salle : visuels seulement (hors-spec)

## Optimisations
- Images inlinées base64 mais downscalées (sips) : paris-bg 1.8MB→116KB jpg (flou), logos ~6-9KB.
- Polices embarquées base64 dans src/theme/fonts.css (woff2 physiques supprimés).

## Notes
- `pac` est natif sur macOS (via extension VS Code), sur le PATH — PAS de `pwsh`. Flag env = `--environment` (pas `-e`).
- Assets images inlinés en base64 (`?inline`) — URLs relatives cassent une fois pushé.
- Chips de filtre salle = visuels seulement (hors-spec).
- Périmètre : vue liste mobile (102), jour (103), recherche (104), skeleton (US-102-02).
- Redéployer : npm run build && pac code push (depuis codeapps/mwcp26-agenda-codeapp/)

## Next Steps
- Brancher Dataverse ultérieurement via la skill add-dataverse (sans éditer src/generated/).
- Vue grille desktop (101), détail session (105), favoris (106).
- Filtrage fonctionnel par salle (chips décoratives pour l'instant).
