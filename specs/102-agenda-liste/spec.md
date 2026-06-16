# 102 — Agenda — vue Liste

## Scope

Vue **liste** de l'agenda : les sessions les unes après les autres. C'est la **seule
expérience disponible sur mobile** et une vue au choix sur desktop (cf. sélection de
vue, feature 100). Le jour affiché est piloté par la feature **103**, le filtrage par
la feature **104**, et le clic sur une session par la feature **105**.

---

## US-102-01 — Parcourir les sessions du jour en liste

**En tant que** participant·e (notamment sur mobile), **je veux** voir les sessions du
jour à la suite, **afin de** suivre le déroulé chronologique.

### Behaviour

- Sessions du jour sélectionné (103) **groupées par heure de début**, groupes triés
  **chronologiquement**, sessions ordonnées par heure puis titre.
- **Groupe horaire** : pastille d'heure (police mono) + filet ; cartes empilées.
- **Infos affichées sur chaque carte** : **titre** (Poppins 600), **intervenant·e(s)**
  en secondaire, **heure** (début–fin, mono), **salle**, et **bouton favori** (présent ;
  comportement → feature 106).
- La liste est filtrée par la **recherche (104)**.
- Clic / activation clavier sur une carte → **détail (105)**.
- **Défilement** (cf. header, 100) :
  - **Mobile** : **toute la page défile** ; le header n'est pas sticky et disparaît au
    scroll pour laisser un maximum de place à la liste.
  - **Desktop** : le **header reste fixe** (sticky) ; seule la liste défile sous
    l'en-tête.

### Acceptance criteria

- [ ] Les sessions sont groupées par créneau et les groupes ordonnés dans le temps.
- [ ] Chaque carte montre titre, intervenant·e(s), heure et salle quand l'info existe.
- [ ] La liste reflète le jour (103) et la recherche (104) en cours.
- [ ] Une carte est activable au clic **et** au clavier et ouvre le détail (105).
- [ ] Mobile : la page entière défile (header non sticky) ; desktop : seule la liste défile sous le header sticky.

### Edge cases

| Cas | Comportement attendu |
|---|---|
| Session sans horaire (`startdatetime` vide) | Regroupée en fin de liste sous « Horaire à confirmer ». |
| Session sans salle | Carte sans mention de salle (pas de placeholder « — »). |
| Session sans intervenant·e | Ligne intervenant·e masquée. |
| Plusieurs intervenant·e·s | Tous listés, séparés par des virgules. |
| Aucune session (jour vide ou recherche sans résultat) | État vide centré (icône + message, max ~250px). |
