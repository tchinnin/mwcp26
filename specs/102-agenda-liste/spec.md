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

---

## US-102-02 — Chargement de la liste (skeleton, mobile)

**En tant que** participant·e sur **mobile**, **je veux** un **squelette** de la liste
pendant le chargement initial des données, **afin de** percevoir la structure à venir
plutôt qu'un simple message « chargement en cours ».

### Behaviour

- Le skeleton s'applique **uniquement sur mobile** et uniquement lorsque la liste est
  la **première expérience à charger les données** (chargement initial de l'app —
  aucune donnée n'a encore été affichée).
- Quand ces conditions sont réunies, la zone liste affiche un **skeleton** reproduisant
  la structure d'une liste : **pastilles d'heure** factices (largeur fixe, police mono)
  et **cartes de session** factices (titre, secondaire, heure/salle), rendus en
  **placeholders animés** (effet shimmer).
- Le skeleton **remplace** le message textuel de chargement ; le header de l'app se
  comporte conformément à la règle mobile de US-102-01 (la page entière défile, le
  header n'est pas sticky).
- Comme les données réelles ne sont pas encore connues, le skeleton utilise un
  **nombre fixe** de groupes horaires et de cartes factices représentatif d'une journée
  type.
- Dès que les données sont **disponibles**, le skeleton est remplacé par la liste
  réelle (US-102-01) ou par l'**état vide** si aucune session n'est disponible.
- Sur **desktop**, quel que soit le vue active, ce skeleton ne s'applique pas ; le
  chargement de la vue Grille relève de la feature **101**.

### Acceptance criteria

- [ ] Sur mobile, lors du chargement initial, un skeleton mimant la structure (pastilles d'heure, cartes de session) s'affiche à la place du message de chargement.
- [ ] Les placeholders sont animés (shimmer).
- [ ] À la fin du chargement, le skeleton cède la place à la liste réelle (US-102-01) ou à l'état vide.
- [ ] Le skeleton n'apparaît pas sur desktop, ni lors de recharges ultérieures (changement de jour, filtrage) où des données sont déjà affichées.

### Edge cases

| Cas | Comportement attendu |
|---|---|
| Chargement très rapide | Le skeleton peut n'apparaître que brièvement ; aucune exigence de durée minimale. |
| Erreur de chargement | Hors scope de cette US (le skeleton ne couvre que l'état « en cours ») — l'erreur relève de la gestion d'erreur de l'app (100). |
| Changement de jour après chargement initial | Des données sont déjà affichées → pas de skeleton (rechargement en place ou indicateur léger selon l'app, hors scope ici). |
