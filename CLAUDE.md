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

## Target environment (branch `demo/0-initapp`)

- **Environnement cible :** TCH — `https://chinnin-tech-tch.crm4.dynamics.com`
- **Environment ID :** `86021eb6-8c40-ea18-aba0-208524dc4d42`
- **PAC auth profile :** `CHINNIN.TECH - TCH`
- Toute opération `pac` (deploy, solution push, auth select) doit cibler cet environnement. Ne jamais pousser vers `chinnin-tech-dev` depuis cette branche.

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

<!-- lite-sdd:start -->
## Spec-Driven Development (lite-sdd)

This project follows the lite-sdd methodology: specifications in `specs/` are the
functional source of truth, kept in lockstep with the code.

- Load the `lite-sdd-overview` skill at the start of every session for the project
  layout, feature numbering, and global principles.
- Use `lite-sdd-specify` to write or update a spec before coding.
- Use `lite-sdd-implement` to plan the implementation and keep it in sync.
<!-- lite-sdd:end -->
