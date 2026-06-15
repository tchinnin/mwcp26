# 104 — Recherche de session

## Scope

Barre de recherche permettant de filtrer les sessions affichées. S'applique à la vue
active (Grille 101 ou Liste 102) et au jour sélectionné (103).

---

## US-104-01 — Filtrer les sessions par mot-clé

**En tant que** participant·e, **je veux** filtrer les sessions par mot-clé, **afin
de** retrouver vite une session ou un·e intervenant·e.

### Behaviour

- **Barre de recherche** dans le header (100). Focus = bordure bleue + ring.
- **Critères de correspondance** : **titre de session** **et** **nom
  d'intervenant·e**, **insensible à la casse et aux accents**.
- Filtrage **en temps réel** pendant la saisie.
- **Portée** : les sessions du **jour sélectionné (103)**, dans la **vue active**
  (101/102).
- **Vider** le champ restaure la liste complète du jour.

### Acceptance criteria

- [ ] La saisie filtre les sessions en temps réel.
- [ ] La correspondance porte sur le titre **et** le nom d'intervenant·e, sans tenir
      compte de la casse ni des accents.
- [ ] Le filtre respecte le jour sélectionné (103) et la vue active (101/102).
- [ ] Vider la recherche réaffiche toutes les sessions du jour.

### Edge cases

| Cas | Comportement attendu |
|---|---|
| Aucun résultat | État vide « Aucune session ne correspond » + action pour effacer la recherche. |
| Changement de jour avec recherche active | Le filtre reste appliqué au nouveau jour. |
| Bascule de vue avec recherche active | Le filtre reste appliqué dans la nouvelle vue. |
