# 101 — Agenda — vue Grille

## Scope

Vue **grille** de l'agenda (salles × heures), pensée pour l'**usage desktop** : voir
les sessions qui ont lieu **en même temps** sur des **colonnes** différentes.
Disponible **uniquement sur desktop** (cf. sélection de vue, feature 100). Le jour
affiché est piloté par la feature **103**, le filtrage par la feature **104**, et le
clic sur une session par la feature **105**.

---

## US-101-01 — Voir les sessions du jour en grille

**En tant que** participant·e sur desktop, **je veux** une grille salles × heures,
**afin de** comparer d'un coup d'œil les sessions en parallèle.

### Behaviour

- Grille du jour sélectionné (103) : **salles en colonnes**, **heures en lignes**.
- **En-têtes de salle** sticky (nom de la salle) ; **colonne d'heures** (police mono)
  sticky.
- **Défilement** : sous le **header sticky de l'app** (cf. 100), seule la **zone
  grille** défile verticalement ; ses en-têtes de salle restent visibles en haut de la
  grille et la colonne d'heures reste visible à gauche pendant le scroll.
- Chaque session est **positionnée** selon son **type** (`mwcp26_sessiontype`) :
  - **Session** (type par défaut) : carte dans la colonne de sa salle, sur son créneau.
  - **Plénière (Keynote)** : carte **pleine largeur** (`gridColumn: 2 / nSalles+2`) avec
    le **rail couleur de salle** et un **badge salle** (dot + libellé court) visibles pour
    lever toute ambiguïté. Même structure qu'une carte normale (heure, titre, intervenant·e(s)).
  - **Pause** : bande pleine largeur fond gris, **icône café** ☕ fixe.
  - **Repas** : bande pleine largeur fond gris, **icône couverts** 🍽 fixe.
  - **Événement** (accueil, lancement, clôture, session sponsor…) : bande pleine largeur fond
    gris, **icône confettis** 🎉 fixe.
- **Infos affichées sur chaque session (type Session/Plénière)** : **titre**,
  **intervenant·e(s)** et **heure** (début–fin). La salle est portée par l'en-tête de
  colonne (ou le badge pour les Plénières).
- La grille est filtrée par la **recherche (104)**.
- Clic / activation clavier sur une session → **détail (105)**.

### Acceptance criteria

- [ ] Salles en colonnes, heures en lignes ; en-têtes de salle et colonne d'heures sticky.
- [ ] Au scroll, le header de l'app reste fixe (100) et seule la zone grille défile.
- [ ] Chaque session (type Session) occupe la colonne de sa salle sur son créneau ; elle montre titre, intervenant·e(s) et heure.
- [ ] Une session de type **Plénière** s'affiche en pleine largeur avec le rail couleur et le badge de sa salle hôte.
- [ ] Les bandes de type **Pause / Repas / Événement** s'affichent en pleine largeur fond gris avec l'icône fixe correspondante (☕ / 🍽 / 🎉).
- [ ] La grille reflète le jour (103) et la recherche (104) en cours.
- [ ] Une session (Session ou Plénière) est activable au clic **et** au clavier et ouvre le détail (105).

### Edge cases

| Cas | Comportement attendu |
|---|---|
| Session (type Session) sans salle **ou** sans horaire | **Non positionnable** → exclue de la grille (reste visible en vue Liste 102). |
| Session de type **Plénière** | Carte pleine largeur (`.tt-keynote`) avec rail + badge de salle hôte. |
| Session de type **Pause / Repas / Événement** sans salle | Incluse dans la grille (bande pleine largeur, pas besoin de colonne). |
| Sessions qui se chevauchent dans une même salle | Affichées côte à côte (ou empilées) dans la colonne, toutes lisibles/cliquables. |
| Capacité de salle | Affichée près du nom **si** la donnée existe ; sinon nom seul (capacité = question ouverte du modèle). |
| Aucune session positionnable (jour vide ou recherche sans résultat) | État vide centré dans la zone grille. |

---

## US-101-02 — Chargement de la grille (skeleton)

**En tant que** participant·e sur desktop, **je veux** un **squelette** de la grille
pendant le chargement des données, **afin de** percevoir la structure à venir plutôt
qu'un simple message « chargement en cours ».

### Behaviour

- Quand les données sont **en cours de chargement** **et** que la vue active est la
  **grille**, la zone grille affiche un **skeleton** qui **reproduit la structure** de
  la grille : en-têtes de salle (colonnes), colonne d'heures (lignes) et **blocs de
  session** factices, rendus en **placeholders animés** (effet shimmer).
- Le skeleton **remplace** le message textuel de chargement dans la zone grille ; le
  **header de l'app reste fixe** (cf. 100).
- Comme les salles réelles ne sont pas encore connues, le skeleton utilise un
  **nombre fixe** de colonnes/lignes factices représentatif d'une grille type.
- Dès que les données sont **disponibles**, le skeleton est remplacé par la grille
  réelle (US-101-01) ou par l'**état vide** si rien n'est positionnable.
- Le skeleton ne s'applique qu'à la **vue grille** ; le chargement de la vue Liste
  est porté par la feature **102**.

### Acceptance criteria

- [ ] Pendant le chargement en vue grille, un skeleton mimant la structure (colonnes salles, lignes heures, blocs session) s'affiche à la place du message de chargement.
- [ ] Les placeholders sont animés (shimmer) et le header de l'app reste fixe (100).
- [ ] À la fin du chargement, le skeleton cède la place à la grille réelle (US-101-01) ou à l'état vide.
- [ ] Le skeleton n'apparaît que lorsque la vue active est la grille.

### Edge cases

| Cas | Comportement attendu |
|---|---|
| Chargement très rapide | Le skeleton peut n'apparaître que brièvement ; aucune exigence de durée minimale. |
| Erreur de chargement | Hors scope de cette US (le skeleton ne couvre que l'état « en cours ») — l'erreur relève de la gestion d'erreur de l'app (100). |
| Vue active = Liste pendant le chargement | Pas de skeleton grille ; le chargement Liste relève de la feature 102. |
