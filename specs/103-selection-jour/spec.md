# 103 — Sélection du jour

## Scope

Sélection du jour affiché dans l'agenda, quand la conférence s'étale sur **plusieurs
jours**. Pour MWCP 2026 : **23 et 24 juin 2026**. La feature fournit le jour courant
aux vues Grille (101) et Liste (102) et à la recherche (104).

---

## US-103-01 — Choisir le jour de l'agenda

**En tant que** participant·e, **je veux** choisir le jour consulté, **afin de** ne
voir que les sessions de ce jour.

### Behaviour

- **Sélecteur de jour** (segmented control) en haut, dans le header (100), un onglet
  par jour de la conférence — ici **23 juin** et **24 juin 2026**. Onglet actif = carte
  blanche + ombre.
- Les jours proposés sont **dérivés des dates des sessions** (partie date de
  `mwcp26_startdatetime`), ordonnés chronologiquement.
- **Valeur par défaut** : le **jour courant** s'il tombe pendant la conférence ; sinon
  le **premier jour** (23 juin).
- Le jour sélectionné est **persistant** pendant la session de navigation et
  s'applique à la vue active (101/102) **et** à la recherche (104).

### Acceptance criteria

- [ ] Un onglet par jour de conférence est affiché et commutable.
- [ ] Le défaut suit la règle (jour courant pendant l'événement, sinon premier jour).
- [ ] La sélection persiste tant que l'app reste ouverte.
- [ ] Changer de jour met à jour la vue active et conserve la recherche en cours.

### Edge cases

| Cas | Comportement attendu |
|---|---|
| Conférence sur **un seul jour** | Le sélecteur est **masqué** ; ce jour unique est affiché d'office. |
| Jour sans aucune session | L'onglet reste présent ; le corps affiche l'état vide de la vue active. |
| Recherche active au changement de jour | Le filtre (104) reste appliqué au nouveau jour. |
