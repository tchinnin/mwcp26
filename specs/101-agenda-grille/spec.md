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
