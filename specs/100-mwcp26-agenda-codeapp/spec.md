# 100 — Agenda MWCP 2026 (Code App) — cadre applicatif

## Scope

Spec **applicative** (`*00`) de `mwcp26-agenda-codeapp` : application **une seule
page**, **entièrement responsive** (desktop **et** mobile), présentant l'agenda de la
**Modern Workplace Conference 2026** (Paris, **23 et 24 juin 2026**) en lecture depuis
Dataverse.

Cette spec ne porte que le **cadre générique** : règles transverses, **sélection de
vue** responsive, **header** et **footer**. Les comportements d'affichage et de
navigation sont portés par les features du bloc :

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
| Design system | `uxui/` source de vérité ; consommer les **tokens** (`var(--…)`), jamais de littéraux. Glassmorphism, fond Paris flouté, anneau quadri, typo Poppins/Segoe UI/Cascadia. |
| Accessibilité | WCAG **AA**. Jamais d'état signalé par la **couleur seule**. Focus visible (ring 3px), éléments sémantiques, pleine opérabilité clavier, champs étiquetés. |

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
- **Barre de contrôles** (sticky, panneau glass) regroupant :
  - le **sélecteur de jour** (feature 103),
  - la **barre de recherche** (feature 104),
  - la **bascule de vue** Grille/Liste (desktop uniquement, cf. ci-dessus).

### Comportement responsive

| Contexte | Présentation |
|---|---|
| **Mobile** | **Hero** plein (dégradé ciel, logo rond sur blanc, titre Poppins 800). Barre de contrôles sticky sous le hero. |
| **Desktop** | **En-tête horizontal compact** ; branding à gauche, contrôles alignés ; barre de contrôles non-wrap. |

### Acceptance criteria

- [ ] Logo, titre, badge édition et dates sont présents.
- [ ] La barre de contrôles reste accessible (sticky) au défilement.
- [ ] Le header passe du hero plein (mobile) à l'en-tête horizontal (desktop).
- [ ] Aucune information critique n'est tronquée sur petit écran.

---

## Footer

Bande discrète en bas de page, présente dans toutes les vues.

### Contenu

- **Marque** : logos **aMP** et **MWCP**.
- **Événement** : intitulé « Modern Workplace Conference 2026 — Paris » + dates.
- **Mention** : « 10ᵉ Édition » et **copyright** de l'année.

### Comportement responsive

| Contexte | Présentation |
|---|---|
| **Mobile** | Empilé, centré, en bas de la colonne unique. |
| **Desktop** | Bande horizontale pleine largeur, marque à gauche / mention à droite. |

### Acceptance criteria

- [ ] Le footer affiche les logos, l'intitulé de l'événement et le copyright.
- [ ] Il s'adapte (empilé mobile / horizontal desktop) sans recouvrir le contenu.
- [ ] Il reste lisible sur le fond glassmorphism (contraste AA).
