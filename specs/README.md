# Specifications — mwcp26

Table of contents for every app, feature, and user story of the **MWCP 2026**
conference-agenda demo. Each feature folder holds a functional `spec.md` and, once
built, a technical `implementation.md`.

> Layout, hundreds-block numbering, naming and global principles → load the
> **`lite-sdd-overview`** skill. This file is just the index.

## 000 — Shared data foundation (Dataverse)

_No spec yet — schema lives in [`data/model/`](../data/model/)._

## 100 — Agenda Code App (React + Vite · `mwcp26-agenda-codeapp`)

- [`100-mwcp26-agenda-codeapp`](./100-mwcp26-agenda-codeapp/spec.md) — cadre applicatif (vue responsive, header, footer)
  - [`101-agenda-grille`](./101-agenda-grille/spec.md)
    - [US-101-01 — Voir les sessions du jour en grille](./101-agenda-grille/spec.md#us-101-01--voir-les-sessions-du-jour-en-grille)
    - [US-101-02 — Chargement de la grille (skeleton)](./101-agenda-grille/spec.md#us-101-02--chargement-de-la-grille-skeleton)
  - [`102-agenda-liste`](./102-agenda-liste/spec.md)
    - [US-102-01 — Parcourir les sessions du jour en liste](./102-agenda-liste/spec.md#us-102-01--parcourir-les-sessions-du-jour-en-liste)
  - [`103-selection-jour`](./103-selection-jour/spec.md)
    - [US-103-01 — Choisir le jour de l'agenda](./103-selection-jour/spec.md#us-103-01--choisir-le-jour-de-lagenda)
  - [`104-recherche-session`](./104-recherche-session/spec.md)
    - [US-104-01 — Filtrer les sessions par mot-clé](./104-recherche-session/spec.md#us-104-01--filtrer-les-sessions-par-mot-clé)
  - [`105-detail-session`](./105-detail-session/spec.md)
    - [US-105-01 — Consulter le détail d'une session](./105-detail-session/spec.md#us-105-01--consulter-le-détail-dune-session)
  - `106-favoris` — _à venir_ (Dataverse, par utilisateur)

## 200 — Agenda Canvas App (`mwcp26-agenda-canvas`)

_No spec yet — `200` will be the application-level spec._
