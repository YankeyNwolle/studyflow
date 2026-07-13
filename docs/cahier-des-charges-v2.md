# Cahier des charges — StudyFlow (v2 enrichie)

**Stack :** React (front) · Node.js/Express (back) · PostgreSQL (base de données)
**Auteur :** Christian
**Version :** 2.0 — enrichie pour préparer l'analyse Merise
**Dernière mise à jour :** 13/07/2026

> Cette v2 reprend intégralement le cahier des charges initial (v1 du 12/07/2026) et l'enrichit
> de 4 nouvelles fonctionnalités, ainsi que des **règles de gestion**, du **dictionnaire de
> données** et de la **liste des entités candidates** nécessaires à l'analyse Merise (MCD → MLD → MPD).

---

## 1. Contexte

StudyFlow est un outil **personnel** de gestion de la vie académique. Le besoin est réel et vécu
au quotidien : jongler entre plusieurs cours, devoirs, projets et échéances, réviser efficacement
et suivre ses moyennes, sans outil centralisé.

L'application est développée dans son intégralité, avec la stack la plus demandée sur le marché
(React + Node.js/Express + PostgreSQL), plutôt que par versions successives limitées.

## 2. Objectifs

- Livrer une version complète de StudyFlow avec l'ensemble des fonctionnalités cœur.
- Pratiquer une stack full-stack JS moderne de bout en bout : API REST (Node/Express), base
  relationnelle (PostgreSQL), front réactif (React).
- Servir de support pédagogique : le cahier des charges doit permettre de dériver directement
  un modèle conceptuel de données (Merise).

## 3. Périmètre

**Inclus :** gestion mono-utilisateur (chaque compte ne voit que ses propres données), en ligne
via une API REST authentifiée.

**Explicitement exclu (hors périmètre de cette version) :**
- Pas de collaboration ni de partage entre utilisateurs.
- Pas d'application mobile native (le front web sera responsive).
- Pas d'intégration externe (Google Calendar, ENT, etc.).
- Pas de notifications push/e-mail (les rappels sont affichés dans l'application uniquement).

---

## 4. Fonctionnalités attendues

### 4.1 — Emploi du temps / échéances *(v1)*
- Ajouter / modifier / supprimer un **cours**, un **devoir** ou un **projet** avec une date limite.
- Compte à rebours par échéance, mise en avant visuelle selon l'urgence (code couleur).
- Statut d'avancement d'une échéance : `à faire`, `en cours`, `terminé`.

### 4.2 — Suivi des notes et moyenne pondérée *(v1)*
- Saisie de notes avec **coefficients réels** (devoir ×2, TP noté ×1, interrogation ×0,5).
- Le coefficient est porté par le **type d'évaluation** (paramétrable), pas par la note individuelle.
- Calcul automatique de la **moyenne par matière** et de la **moyenne générale**.
- Historique des évaluations par matière.
- Les moyennes sont calculées **par semestre** (voir 4.8).

### 4.3 — Révision par répétition espacée (flashcards) *(v1)*
- Création de cartes de révision (question / réponse) par matière.
- Algorithme **SM-2** pour planifier les prochaines révisions selon la qualité du rappel (note 0–5).
- Vue « cartes à réviser aujourd'hui ».

### 4.4 — Tableau de bord *(v1)*
- Vue d'ensemble : échéances proches, moyennes par matière, cartes à réviser du jour,
  progression vers les objectifs de moyenne (voir 4.9).

### 4.5 — Compte utilisateur *(v1)*
- Authentification simple (inscription / connexion) pour sécuriser les données via l'API.
- Mot de passe stocké **haché** (bcrypt/argon2), jamais en clair.

### 4.6 — Calendrier *(v1)*
- Vue mensuelle / hebdomadaire regroupant échéances (cours, devoirs, projets) et jours de
  révision programmés (SM-2), avec code couleur par matière ou par type.
- Navigation mois / semaine, bouton « aujourd'hui ».
- Clic sur un jour : détail des événements et ajout direct d'une échéance.

### 4.7 — Analytics (statistiques) *(v1)*
- Évolution de la moyenne générale et par matière dans le temps (graphique, par semestre).
- Répartition des notes par type d'évaluation.
- Statistiques de révision : cartes maîtrisées vs à revoir, taux de rétention SM-2.
- Charge de travail à venir (échéances par semaine, par matière).

### 4.8 — Semestre / année académique *(NOUVEAU — E)*
- Organiser cours, notes et moyennes par **période** (ex : « Semestre 1 — 2025/2026 »).
- Une période possède une date de début et une date de fin, et peut être marquée « active ».
- Toutes les moyennes et statistiques sont contextualisées par la période sélectionnée.

### 4.9 — Objectifs de moyenne *(NOUVEAU — A)*
- Définir un objectif de moyenne (ex : 14/20) par matière et/ou une moyenne générale cible.
- Le tableau de bord affiche la progression et **alerte** quand la moyenne passe sous l'objectif.

### 4.10 — Notes de cours / documents *(NOUVEAU — C)*
- Rattacher à une matière des **documents** : fichiers uploadés ou liens externes (URL).
- Chaque document a un titre, un type (fichier / lien), une date d'ajout.

### 4.11 — Tags / étiquettes *(NOUVEAU — F)*
- Créer des étiquettes libres (ex : « urgent », « à revoir », « examen »).
- Une étiquette peut être appliquée à plusieurs échéances **et** à plusieurs flashcards
  (relation N:N), et filtrable dans les vues liste et calendrier.

---

## 5. Règles de gestion (RG)

> Base directe pour établir les **cardinalités** du MCD.

| Code | Règle de gestion |
|------|------------------|
| RG1  | Un utilisateur possède 0..N matières ; une matière appartient à exactement 1 utilisateur. |
| RG2  | Une période académique appartient à 1 utilisateur ; un utilisateur a 0..N périodes. |
| RG3  | Une matière est rattachée à exactement 1 période ; une période contient 0..N matières. |
| RG4  | Une échéance (cours/devoir/projet) concerne exactement 1 matière ; une matière a 0..N échéances. |
| RG5  | Une échéance a exactement 1 statut (`à faire`, `en cours`, `terminé`) et 1 type (`cours`, `devoir`, `projet`). |
| RG6  | Une note appartient à exactement 1 matière et à exactement 1 type d'évaluation. |
| RG7  | Le coefficient d'une note provient de son type d'évaluation (le type porte le coefficient). |
| RG8  | Un type d'évaluation appartient à 1 utilisateur (types personnalisables) ; il s'applique à 0..N notes. |
| RG9  | Une flashcard appartient à exactement 1 matière ; une matière a 0..N flashcards. |
| RG10 | Chaque flashcard possède 1 état de révision SM-2 (facteur de facilité, intervalle, prochaine date, nb de répétitions). |
| RG11 | Une révision (log) porte sur 1 flashcard, à 1 date, avec 1 qualité de rappel (0..5). Une flashcard a 0..N révisions. |
| RG12 | Un objectif de moyenne vise 1 matière (ou la moyenne générale) sur 1 période. |
| RG13 | Un document est rattaché à exactement 1 matière ; une matière a 0..N documents. |
| RG14 | Une étiquette appartient à 1 utilisateur ; elle peut taguer 0..N échéances et 0..N flashcards (associations N:N). |
| RG15 | La suppression d'un utilisateur supprime en cascade toutes ses données. |

---

## 6. Dictionnaire de données (extrait)

> Attributs candidats par entité — à affiner pendant le MCD.

**Utilisateur** : id, email (unique), mot_de_passe_hash, nom, date_creation.

**Periode** : id, libelle, date_debut, date_fin, est_active, #utilisateur.

**Matiere** : id, nom, couleur (code hex, pour le calendrier), #periode, #utilisateur.

**TypeEvaluation** : id, libelle (ex : « Devoir »), coefficient (décimal), #utilisateur.

**Note** : id, valeur (décimal, sur 20), date_evaluation, commentaire (facultatif), #matiere, #type_evaluation.

**Echeance** : id, titre, description, type (cours/devoir/projet), date_limite, statut (à faire/en cours/terminé), #matiere.

**Flashcard** : id, question, reponse, date_creation, #matiere ; état SM-2 : facteur_facilite, intervalle_jours, nb_repetitions, prochaine_revision.

**RevisionLog** : id, date_revision, qualite_rappel (0..5), #flashcard.

**Objectif** : id, moyenne_cible (décimal), #matiere (nullable si objectif général), #periode.

**Document** : id, titre, type (fichier/lien), chemin_ou_url, date_ajout, #matiere.

**Etiquette** : id, libelle, couleur, #utilisateur.

**EcheanceEtiquette** (association N:N) : #echeance, #etiquette.

**FlashcardEtiquette** (association N:N) : #flashcard, #etiquette.

---

## 7. Entités candidates pour le MCD (récapitulatif)

1. Utilisateur
2. Periode
3. Matiere
4. TypeEvaluation
5. Note
6. Echeance
7. Flashcard
8. RevisionLog
9. Objectif
10. Document
11. Etiquette
12. *(associations N:N)* EcheanceEtiquette, FlashcardEtiquette

**Associations remarquables à modéliser en Merise :**
- Hiérarchie temporelle : Utilisateur → Periode → Matiere (chaînes de 1:N).
- N:N via étiquettes (Etiquette ↔ Echeance, Etiquette ↔ Flashcard).
- Historisation : Flashcard → RevisionLog (1:N) pour tracer les révisions SM-2.

---

## 8. Contraintes non-fonctionnelles

- **Sécurité** : authentification par token (JWT), mots de passe hachés, isolation stricte des
  données par utilisateur sur chaque endpoint.
- **Validation** : toute saisie est validée côté API (types, bornes, champs obligatoires).
- **Performance** : réponses API < 300 ms sur les volumes personnels attendus.
- **Ergonomie** : interface responsive (desktop et mobile web), code couleur cohérent par matière.
- **Fiabilité** : les calculs de moyenne et l'algorithme SM-2 sont testés unitairement.

---

## 9. Prochaine étape

Analyse **Merise** :
1. **MCD** (Modèle Conceptuel de Données) à partir des entités et règles de gestion ci-dessus.
2. **MLD** (Modèle Logique) — passage aux tables relationnelles.
3. **MPD** (Modèle Physique) — script SQL PostgreSQL de création des tables.
