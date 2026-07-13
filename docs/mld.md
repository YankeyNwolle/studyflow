# MLD — StudyFlow (Modèle Logique de Données)

**Méthode :** Merise — passage MCD → MLD
**Source :** `mcd.md`
**Version :** 1.0 — 13/07/2026

> Le MLD est **indépendant du SGBD**. Il décrit les **tables**, leurs colonnes, la **clé primaire**
> (soulignée / notée `PK`) et les **clés étrangères** (notées `#` ou `FK`). Il ne contient pas encore
> les types SQL précis ni la syntaxe PostgreSQL — c'est le rôle du MPD (`schema.sql`).

---

## 1. Règles de transformation appliquées (MCD → MLD)

- **R1 — Entité → Table.** Chaque entité devient une table ; son identifiant devient la clé primaire.
- **R2 — Association (1,1)—(0,n) → Clé étrangère.** La clé du côté « (0,n) » (le père) migre comme
  clé étrangère dans la table du côté « (1,1) » (le fils).
- **R3 — Association N:N → Table de jonction.** Une nouvelle table est créée, dont la clé primaire
  est composée des clés étrangères des deux entités reliées.
- **R4 — Association (0,1) → Clé étrangère nullable.** Idem R2, mais la colonne peut être NULL.

---

## 2. Notation

- `PK` = clé primaire · `#` = clé étrangère · `(N)` = colonne nullable (facultative).

---

## 3. Tables (MLD)

```
UTILISATEUR (
    id_utilisateur      PK,
    email,
    mot_de_passe_hash,
    nom,
    date_creation
)

PERIODE (
    id_periode          PK,
    libelle,
    date_debut,
    date_fin,
    est_active,
    #id_utilisateur     FK → UTILISATEUR
)

TYPE_EVALUATION (
    id_type             PK,
    libelle,
    coefficient,
    #id_utilisateur     FK → UTILISATEUR
)

MATIERE (
    id_matiere          PK,
    nom,
    couleur,
    #id_periode         FK → PERIODE
)

NOTE (
    id_note             PK,
    valeur,
    date_evaluation,
    commentaire (N),
    #id_matiere         FK → MATIERE,
    #id_type            FK → TYPE_EVALUATION
)

ECHEANCE (
    id_echeance         PK,
    titre,
    description (N),
    type,               -- cours / devoir / projet
    date_limite,
    statut,             -- à faire / en cours / terminé
    #id_matiere         FK → MATIERE
)

FLASHCARD (
    id_flashcard        PK,
    question,
    reponse,
    date_creation,
    facteur_facilite,
    intervalle_jours,
    nb_repetitions,
    prochaine_revision,
    #id_matiere         FK → MATIERE
)

REVISION (
    id_revision         PK,
    date_revision,
    qualite_rappel,     -- 0..5
    #id_flashcard       FK → FLASHCARD
)

OBJECTIF (
    id_objectif         PK,
    moyenne_cible,
    #id_periode         FK → PERIODE,
    #id_matiere (N)     FK → MATIERE   -- NULL = objectif de moyenne générale
)

DOCUMENT (
    id_document         PK,
    titre,
    type_doc,           -- fichier / lien
    chemin_ou_url,
    date_ajout,
    #id_matiere         FK → MATIERE
)

ETIQUETTE (
    id_etiquette        PK,
    libelle,
    couleur,
    #id_utilisateur     FK → UTILISATEUR
)

-- Tables de jonction (associations N:N)

ECHEANCE_ETIQUETTE (
    #id_echeance        PK, FK → ECHEANCE,
    #id_etiquette       PK, FK → ETIQUETTE
)

FLASHCARD_ETIQUETTE (
    #id_flashcard       PK, FK → FLASHCARD,
    #id_etiquette       PK, FK → ETIQUETTE
)
```

---

## 4. Correspondance associations MCD → traitement MLD

| Association MCD | Cardinalités | Règle | Résultat MLD |
|-----------------|--------------|-------|--------------|
| DEFINIR     | UTILISATEUR (0,n) — (1,1) PERIODE      | R2 | `#id_utilisateur` dans PERIODE |
| PARAMETRER  | UTILISATEUR (0,n) — (1,1) TYPE_EVALUATION | R2 | `#id_utilisateur` dans TYPE_EVALUATION |
| CONTENIR    | PERIODE (0,n) — (1,1) MATIERE          | R2 | `#id_periode` dans MATIERE |
| PORTER      | MATIERE (0,n) — (1,1) NOTE             | R2 | `#id_matiere` dans NOTE |
| EVALUER     | TYPE_EVALUATION (0,n) — (1,1) NOTE     | R2 | `#id_type` dans NOTE |
| CONCERNER   | MATIERE (0,n) — (1,1) ECHEANCE         | R2 | `#id_matiere` dans ECHEANCE |
| REGROUPER   | MATIERE (0,n) — (1,1) FLASHCARD        | R2 | `#id_matiere` dans FLASHCARD |
| TRACER      | FLASHCARD (0,n) — (1,1) REVISION       | R2 | `#id_flashcard` dans REVISION |
| CADRER      | PERIODE (0,n) — (1,1) OBJECTIF         | R2 | `#id_periode` dans OBJECTIF |
| VISER       | MATIERE (0,n) — (0,1) OBJECTIF         | R4 | `#id_matiere` nullable dans OBJECTIF |
| RATTACHER   | MATIERE (0,n) — (1,1) DOCUMENT         | R2 | `#id_matiere` dans DOCUMENT |
| CREER_ETIQ  | UTILISATEUR (0,n) — (1,1) ETIQUETTE    | R2 | `#id_utilisateur` dans ETIQUETTE |
| TAGUER_ECH  | ECHEANCE (0,n) — (0,n) ETIQUETTE       | R3 | table ECHEANCE_ETIQUETTE |
| TAGUER_FLC  | FLASHCARD (0,n) — (0,n) ETIQUETTE      | R3 | table FLASHCARD_ETIQUETTE |

**Bilan :** 11 tables issues des entités + 2 tables de jonction = **13 tables**.

---

## 5. Prochaine étape — MPD (`schema.sql`)

Traduction de ce MLD en PostgreSQL :
- chaque colonne reçoit un **type** (`SERIAL`, `VARCHAR`, `NUMERIC`, `DATE`, `BOOLEAN`, `TIMESTAMP`…) ;
- ajout des contraintes : `PRIMARY KEY`, `FOREIGN KEY ... REFERENCES`, `NOT NULL`, `UNIQUE (email)`,
  `CHECK` (domaines : note 0–20, qualité 0–5, valeurs d'énumération), `ON DELETE CASCADE` (RG15) ;
- index sur les clés étrangères fréquemment filtrées.
