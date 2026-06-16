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
- Chaque session est **positionnée** dans la colonne de sa salle, sur son créneau
  (début → fin).
- **Infos affichées sur chaque session** : **titre**, **intervenant·e(s)**, **heure**
  (début–fin), et le **bouton favori** (présent ; comportement → feature 106). La salle
  est portée par l'en-tête de colonne.
- La grille est filtrée par la **recherche (104)**.
- Clic / activation clavier sur une session → **détail (105)**.

### Acceptance criteria

- [ ] Salles en colonnes, heures en lignes ; en-têtes de salle et colonne d'heures sticky.
- [ ] Au scroll, le header de l'app reste fixe (100) et seule la zone grille défile.
- [ ] Chaque session occupe la colonne de sa salle sur son créneau.
- [ ] Chaque session montre titre, intervenant·e(s) et heure.
- [ ] La grille reflète le jour (103) et la recherche (104) en cours.
- [ ] Une session est activable au clic **et** au clavier et ouvre le détail (105).

### Edge cases

| Cas | Comportement attendu |
|---|---|
| Session sans salle **ou** sans horaire | **Non positionnable** → exclue de la grille (reste visible en vue Liste 102). |
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
