# mwcp26 — Agent Instructions

Project context: see [README.md](./README.md).

## Active skills

- `ppbp-overview` — project layout and skill routing
- `ppbp-init` — new project setup
- `ppbp-readme` — README maintenance
- `dataverse:dv-solution` + `ppbp-alm-overview` + `ppbp-alm-solutions` + `ppbp-alm-pipelines` — ALM / solution lifecycle
- `dataverse:dv-metadata` + `ppbp-dv-metadata-overview` + `ppbp-dv-tables` + `ppbp-dv-columns` + `ppbp-dv-global-choices` — Dataverse schema
- `code-apps-preview:create-code-app` + `ppbp-codeapps-overview` + `ppbp-codeapps-setup` + `ppbp-codeapps-connectors` — Code Apps
- `ppbp-codeapps-uxui` — UX/UI, design tokens & branding des Code Apps

## Conventions

<!-- Project-specific rules that override or supplement the best-practice skills. -->

- **Design system** : `uxui/` est la source de vérité UX/UI. `uxui/guidelines.md`
  (palette aMP/MWCP 4 couleurs, typo Poppins/Segoe UI/Cascadia, glassmorphism, tracks)
  est le spec lisible ; `uxui/assets/` porte logos, fond Paris et polices ; les previews
  par app vivent sous `uxui/<app-name>/` (ex. `uxui/mwcp26-agenda-codeapp/`). Les Code
  Apps consomment des tokens (`var(--…)`), jamais de littéraux. Les previews HTML sont
  des contrats point-dans-le-temps, à ré-implémenter en React — pas à embarquer.
- **Deux apps agenda comparées** : le repo héberge deux implémentations de l'agenda
  MWCP26 — `mwcp26-agenda-codeapp` (Code App / React+Vite) et `mwcp26-agenda-canvas`
  (Canvas App) — partageant le **même** design system `uxui/`.

## Out of scope

<!-- What this repository does NOT manage. -->
