# 100 — Agenda MWCP 2026 (Code App) — cadre applicatif

## Scope

Spec **applicative** (`*00`) de `mwcp26-agenda-codeapp` : application **une seule
page**, **entièrement responsive** (desktop **et** mobile), présentant l'agenda de la
**Modern Workplace Conference 2026** (Paris, **23 et 24 juin 2026**) en lecture depuis
Dataverse.

Cette spec ne porte que le **cadre générique** : règles transverses, **arrière-plan
& layout** responsive, **sélection de vue** responsive et **header**. Les
comportements d'affichage et de navigation sont portés par les features du bloc :

| Feature | Sujet |
|---|---|
| **101** | Vue **grille** (salles × heures, desktop) |
| **102** | Vue **liste** (seule expérience mobile) |
| **103** | Sélection du jour |
| **104** | Recherche de session |
| **105** | Détail de session (dialog) |
| **106** | Favoris — *à venir* (Dataverse, par utilisateur) ; le bouton favori apparaît dans l'UI mais son comportement n'est pas spécifié ici. |

Modèle de données : `data/model/conference-agenda.md`. Design system :
`uxui/guidelines.md` + preview `uxui/mwcp26-agenda-codeapp/`.

---

## Règles transverses (s'appliquent à toutes les features du bloc)

| Domaine | Règle |
|---|---|
| Plateforme | Code App **React + Vite** déployée sur **Power Platform**. |
| Source de données | **Dataverse, lecture seule** dans ce bloc. Tables `Conference`, `Salle`, `Session`, `SessionSpeaker`, `Contact`. |
| Périmètre conférence | Démo **mono-conférence** : l'app charge la **Conférence MWCP 2026** (unique dans l'environnement). |
| Langue | Français (`lang="fr"`). |
| Design system | `uxui/` source de vérité ; consommer les **tokens** (`var(--…)`), jamais de littéraux. Glassmorphism, fond Paris flouté (**desktop large uniquement**, cf. *Arrière-plan & layout*), anneau quadri, typo Poppins/Segoe UI/Cascadia. |
| Accessibilité | WCAG **AA**. Jamais d'état signalé par la **couleur seule**. Focus visible (ring 3px), éléments sémantiques, pleine opérabilité clavier, champs étiquetés. |

---

## Arrière-plan & layout (responsive)

Le fond **Paris flouté** est un décor de **respiration** autour de l'app : il n'a de
sens que lorsqu'il reste de la place **autour** de la colonne applicative — c'est-à-dire
en **desktop** uniquement. En deçà, l'app occupe **toute la largeur** et le **header reste
collé en haut, sans coins arrondis** (pas de colonne flottante).

| Contexte | Layout | Arrière-plan |
|---|---|---|
| **Mobile / tablette** (sous le seuil desktop) | L'app **prend toute la largeur** du viewport (`surface-page`), **header collé en haut, sans rayon** ni marge. | **Aucun fond Paris** — l'app remplit l'écran. |
| **Desktop** (au-delà du **seuil**, où l'app cesse de remplir le viewport) | Colonne applicative **bornée et centrée** (panneau plein hauteur, **coins nets** + ombre ambiante), marges autour. | **Fond Paris flouté** affiché dans les marges latérales, derrière le panneau — comme dans la preview `uxui/mwcp26-agenda-codeapp/`. |

### Règles

- Le fond Paris **et** la colonne bornée/centrée n'apparaissent **qu'au-delà du seuil
  desktop** ; en deçà (mobile/tablette), l'app occupe **100 % de la largeur**, **sans
  fond**, **sans coins arrondis**, et le **header est collé au bord supérieur**.
- Il n'y a **pas** de palier intermédiaire « colonne flottante arrondie » : l'app est soit
  pleine largeur (sous le seuil), soit panneau desktop borné (au-delà).
- Le seuil et la largeur max de la colonne suivent le design system (`uxui/guidelines.md`)
  et la preview standalone, qui font foi.

### Acceptance criteria

- [ ] Sous le seuil desktop, l'app remplit la largeur, **sans fond Paris**, et le header est
      **collé en haut sans coins arrondis**.
- [ ] Au-delà du seuil desktop, le fond Paris apparaît dans les marges autour de la colonne
      bornée et centrée (panneau à coins nets).
- [ ] Aucun état intermédiaire où le header serait détaché du haut **et** arrondi.

---

## Sélection de vue (responsive)

| Contexte | Vues disponibles | Défaut |
|---|---|---|
| **Desktop** (large) | Choix entre **Grille** (101) **et** **Liste** (102), via une bascule dans le header | **Liste** |
| **Mobile** (colonne étroite) | **Liste** (102) **uniquement** — pas assez de place pour la grille | Liste |

### Règles

- La bascule Grille/Liste n'apparaît **que** sur desktop ; sur mobile elle est masquée
  et la vue est figée sur Liste.
- Changer de vue ne recharge pas les données ni ne réinitialise le jour (103) ou la
  recherche (104) en cours.
- Au passage desktop → mobile alors que la Grille est active, l'app **bascule
  automatiquement** sur Liste.

### Acceptance criteria

- [ ] Sur desktop, l'utilisateur peut basculer entre Grille et Liste.
- [ ] Sur mobile, seule la vue Liste est disponible et la bascule est masquée.
- [ ] Le rétrécissement de la fenêtre depuis la Grille bascule automatiquement en Liste.
- [ ] La bascule conserve jour sélectionné, recherche et défilement.

---

## Header

Région haute, présente dans toutes les vues.

### Contenu

- **Branding** : logo MWCP (anneau quadri + Tour Eiffel), titre de l'événement,
  kicker en overline, badge **« 10ᵉ Édition »**, **dates** « 23–24 juin 2026 » (pill
  `brand-yellow` + encre `ink-900`).
- **Barre de contrôles** (panneau glass) regroupant :
  - le **sélecteur de jour** (feature 103),
  - la **barre de recherche** (feature 104),
  - la **bascule de vue** Grille/Liste (desktop uniquement, cf. ci-dessus).

### Comportement responsive

Le **défilement** diffère selon le contexte — c'est la différence clé entre les deux
présentations :

| Contexte | Présentation | Défilement |
|---|---|---|
| **Mobile** | **Hero** ample (dégradé ciel, logo rond sur blanc, titre Poppins 800), suivi de la barre de contrôles. | **Toute la page défile** : le header (hero + contrôles) **n'est pas sticky** et **disparaît** au scroll, laissant l'écran du téléphone au **maximum de contenu utile** (liste des sessions). |
| **Desktop** (large) | **En-tête horizontal compact** ; branding à gauche, contrôles alignés ; barre de contrôles non-wrap. | **Header sticky** : l'en-tête + la barre de contrôles **restent fixes** ; seul le **corps** (grille 101 ou liste 102) **défile** sous l'en-tête. La grille a en plus ses propres en-têtes sticky (cf. 101). |

> Sur desktop, le header sticky s'applique aux **deux vues** : Grille (101) **et**
> Liste (102).

### Acceptance criteria

- [ ] Logo, titre, badge édition et dates sont présents.
- [ ] **Mobile** : le header (hero + contrôles) **défile avec la page** (non sticky)
      pour maximiser le contenu visible.
- [ ] **Desktop** : l'en-tête et la barre de contrôles **restent fixes** (sticky) ;
      seul le corps de l'app défile — en vue Grille **comme** en vue Liste.
- [ ] Le header passe du hero plein (mobile) à l'en-tête horizontal compact (desktop).
- [ ] Aucune information critique n'est tronquée sur petit écran.

> **Pas de footer.** La preview de référence n'en comporte pas ; l'app n'affiche
> aucune bande de pied de page.
