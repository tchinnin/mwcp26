# 105 — Détail de session

## Scope

Panneau de **détail** d'une session, ouvert depuis une session des vues Grille (101)
ou Liste (102). Présenté sous forme de **dialog**.

---

## US-105-01 — Consulter le détail d'une session

**En tant que** participant·e, **je veux** ouvrir le détail d'une session, **afin de**
voir toutes ses informations.

### Behaviour

- **Ouverture** au clic / activation clavier d'une session (101 ou 102).
- **Présentation** (dialog modal accessible) :
  - **Desktop** : **dialog centré** (modale), overlay assombrissant le fond.
  - **Mobile** : **dialog plein écran** (prend tout l'écran).
- **Contenu** : **titre**, **description** (memo), **horaire** (début–fin), **salle**
  et **intervenant·e(s)**.
- **Fermeture** : bouton de fermeture, clic sur l'overlay (desktop), touche `Esc`. Le
  focus revient à la session d'origine.

### Acceptance criteria

- [ ] Le détail affiche titre, description, horaire, salle et intervenant·e(s) quand
      l'info existe.
- [ ] Desktop = dialog centré ; mobile = dialog plein écran.
- [ ] Dialog modal accessible : piège de focus, fermeture au bouton / overlay / `Esc`,
      focus rendu à l'élément d'origine.
### Edge cases

| Cas | Comportement attendu |
|---|---|
| Description vide | Section description masquée. |
| Salle / horaire / intervenant·e absent | La ligne correspondante est masquée (pas de « — »). |
| Plusieurs intervenant·e·s | Tous listés. |
