# 105 — Détail de session

## Scope

Panneau de **détail** d'une session, ouvert depuis une session des vues Grille (101)
ou Liste (102). Présenté sous forme de **dialog** (desktop) ou de **drawer** (mobile).

---

## US-105-01 — Consulter le détail d'une session

**En tant que** participant·e, **je veux** ouvrir le détail d'une session, **afin de**
voir toutes ses informations.

### Behaviour

- **Ouverture** au clic / activation clavier d'une session (101 ou 102).
- **Présentation** :
  - **Desktop** : dialog modal centré, overlay assombrissant le fond.
  - **Mobile** : **bottom-sheet drawer** qui glisse depuis le bas de l'écran.
    - Une **poignée** (pill handle) est visible en haut du drawer.
    - Hauteur **automatique selon le contenu**, plafonnée à **90 % de la hauteur
      de l'écran** ; le contenu devient scrollable au-delà du plafond.
    - L'overlay derrière le drawer assombrit le fond.
- **Contenu** : **titre**, **description** (memo), **horaire** (début–fin), **salle**
  et **intervenant·e(s)**.
- **Fermeture** :
  - **Desktop** : bouton de fermeture, clic sur l'overlay, touche `Esc`.
  - **Mobile** : glissement vers le bas (voir seuil ci-dessous), tap sur l'overlay,
    touche `Esc`. **Pas de bouton de fermeture** — l'expérience drawer suffit.
  - **Seuil de fermeture mobile** : le drawer se ferme si le glissement dépasse
    **30 % de sa hauteur ouverte** OU si la vitesse de glissement est rapide (flick) ;
    sinon il revient à sa position ouverte (**snap-back**).
  - Dans tous les cas, le focus revient à la session d'origine.

### Acceptance criteria

- [ ] Le détail affiche titre, description, horaire, salle et intervenant·e(s) quand
      l'info existe.
- [ ] Desktop : dialog centré avec overlay.
- [ ] Desktop : fermeture au bouton de fermeture, clic sur l'overlay ou touche `Esc`.
- [ ] Mobile : drawer remontant depuis le bas, poignée visible, hauteur auto ≤ 90 %.
- [ ] Mobile : le contenu est scrollable lorsqu'il dépasse 90 % de la hauteur d'écran.
- [ ] Mobile : glissement > 30 % de hauteur OU flick → fermeture ; glissement relâché
      avant le seuil → snap-back vers la position ouverte.
- [ ] Desktop accessible : piège de focus, fermeture au bouton de fermeture / overlay /
      `Esc`, focus rendu à l'élément d'origine.
- [ ] Mobile accessible : piège de focus, fermeture au glissement / overlay / `Esc`
      (pas de bouton), focus rendu à l'élément d'origine.

### Edge cases

| Cas | Comportement attendu |
|---|---|
| Description vide | Section description masquée. |
| Salle / horaire / intervenant·e absent | La ligne correspondante est masquée (pas de « — »). |
| Plusieurs intervenant·e·s | Tous listés. |
| Contenu dépassant 90 % de la hauteur d'écran (mobile) | Le drawer se plafonne à 90 % ; le contenu interne devient scrollable. |
| Glissement vers le bas initié sur la zone scrollable (mobile) | Le scroll du contenu a priorité jusqu'en haut ; une fois en haut de scroll, le glissement contrôle le drawer. |
