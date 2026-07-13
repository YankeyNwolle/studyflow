# MCD — StudyFlow (Modèle Conceptuel de Données)

**Méthode :** Merise
**Source :** `cahier-des-charges-v2.md` (règles de gestion RG1 → RG15)
**Version :** 1.0 — 13/07/2026

> Rappel de lecture des cardinalités Merise : on lit **de l'entité vers l'association**.
> `(min, max)` = combien de fois **une occurrence de l'entité** participe à l'association.
> Ex : `MATIERE (0,n) —— CONCERNER —— (1,1) ECHEANCE` se lit :
> « une matière est concernée par 0 à n échéances » **et** « une échéance concerne 1 et 1 seule matière ».

---

## 1. Choix de conception

- **Rattachement à l'utilisateur.** `MATIERE` n'est pas reliée *directement* à `UTILISATEUR` :
  elle passe par `PERIODE` (chaîne `UTILISATEUR → PERIODE → MATIERE`). L'utilisateur d'une matière
  est donc **déduit** de sa période. Cela évite une redondance (double clé étrangère) tout en
  respectant RG1. En revanche `TYPE_EVALUATION` et `ETIQUETTE` sont reliées **directement** à
  `UTILISATEUR` car elles ne dépendent pas d'une période.
- **État SM-2 dans la flashcard.** Les attributs SM-2 (facteur de facilité, intervalle, nb de
  répétitions, prochaine révision) sont des **attributs de `FLASHCARD`** (état courant, 1 seul jeu
  de valeurs), tandis que chaque révision passée est historisée dans `REVISION` (RG10 + RG11).
- **Objectif général vs par matière.** Un `OBJECTIF` est toujours rattaché à 1 `PERIODE` ; le lien
  vers `MATIERE` est **optionnel** — s'il est absent, l'objectif porte sur la moyenne générale (RG12).
- **Coefficient.** Il est porté par `TYPE_EVALUATION`, pas par `NOTE` (RG7).

---

## 2. Entités et attributs

> L'identifiant est souligné par `_PK` (souligné en Merise).

| Entité | Attributs |
|--------|-----------|
| **UTILISATEUR** | <u>id_utilisateur</u>, email, mot_de_passe_hash, nom, date_creation |
| **PERIODE** | <u>id_periode</u>, libelle, date_debut, date_fin, est_active |
| **MATIERE** | <u>id_matiere</u>, nom, couleur |
| **TYPE_EVALUATION** | <u>id_type</u>, libelle, coefficient |
| **NOTE** | <u>id_note</u>, valeur, date_evaluation, commentaire |
| **ECHEANCE** | <u>id_echeance</u>, titre, description, type, date_limite, statut |
| **FLASHCARD** | <u>id_flashcard</u>, question, reponse, date_creation, facteur_facilite, intervalle_jours, nb_repetitions, prochaine_revision |
| **REVISION** | <u>id_revision</u>, date_revision, qualite_rappel |
| **OBJECTIF** | <u>id_objectif</u>, moyenne_cible |
| **DOCUMENT** | <u>id_document</u>, titre, type_doc, chemin_ou_url, date_ajout |
| **ETIQUETTE** | <u>id_etiquette</u>, libelle, couleur |

---

## 3. Associations et cardinalités

| # | Association | Entité A | Card. A | Card. B | Entité B | RG |
|---|-------------|----------|---------|---------|----------|----|
| 1 | **DEFINIR**      | UTILISATEUR    | (0,n) | (1,1) | PERIODE         | RG2 |
| 2 | **CONTENIR**     | PERIODE        | (0,n) | (1,1) | MATIERE         | RG3 |
| 3 | **PARAMETRER**   | UTILISATEUR    | (0,n) | (1,1) | TYPE_EVALUATION | RG8 |
| 4 | **CONCERNER**    | MATIERE        | (0,n) | (1,1) | ECHEANCE        | RG4 |
| 5 | **PORTER**       | MATIERE        | (0,n) | (1,1) | NOTE            | RG6 |
| 6 | **EVALUER**      | TYPE_EVALUATION| (0,n) | (1,1) | NOTE            | RG6/RG7 |
| 7 | **REGROUPER**    | MATIERE        | (0,n) | (1,1) | FLASHCARD       | RG9 |
| 8 | **TRACER**       | FLASHCARD      | (0,n) | (1,1) | REVISION        | RG11 |
| 9 | **CADRER**       | PERIODE        | (0,n) | (1,1) | OBJECTIF        | RG12 |
| 10| **VISER**        | MATIERE        | (0,n) | (0,1) | OBJECTIF        | RG12 |
| 11| **RATTACHER**    | MATIERE        | (0,n) | (1,1) | DOCUMENT        | RG13 |
| 12| **CREER_ETIQ**   | UTILISATEUR    | (0,n) | (1,1) | ETIQUETTE       | RG14 |
| 13| **TAGUER_ECH**   | ECHEANCE       | (0,n) | (0,n) | ETIQUETTE       | RG14 |
| 14| **TAGUER_FLC**   | FLASHCARD      | (0,n) | (0,n) | ETIQUETTE       | RG14 |

> Les associations **13** et **14** sont **N:N** (many-to-many) → elles deviendront des tables
> de jonction au MLD.

---

## 4. Schéma du MCD (représentation textuelle)

```
                          ┌──────────────┐
                          │ UTILISATEUR  │
                          └──────┬───────┘
              ┌──────────(0,n)───┼───(0,n)──────────┐
              │(DEFINIR)         │(PARAMETRER)       │(CREER_ETIQ)
          (1,1)│              (1,1)│               (1,1)│
        ┌───────┴──────┐   ┌───────┴────────┐   ┌──────┴──────┐
        │   PERIODE    │   │ TYPE_EVALUATION│   │  ETIQUETTE  │
        └───┬──────┬───┘   └───────┬────────┘   └──┬───────┬──┘
    (0,n)   │      │(0,n)          │(0,n)        (0,n)│    (0,n)│
  (CONTENIR)│      │(CADRER)  (EVALUER)│      (TAGUER_ECH) (TAGUER_FLC)
        (1,1)│      │(1,1)          (1,1)│         (0,n)│    (0,n)│
        ┌────┴─────┐│           ┌────────┴──┐         │        │
        │ MATIERE  ├┼─(0,n)─────┤   NOTE    │         │        │
        └─┬──┬──┬──┘│(PORTER)(1,1)          │         │        │
    (0,n) │  │  │(0,n)         └───────────┘          │        │
(CONCERNER)│  │  │(REGROUPER)                          │        │
      (1,1)│  │  │(1,1)                                 │        │
    ┌──────┴┐ │ ┌┴──────────┐                           │        │
    │ECHEANCE├─┘ │ FLASHCARD ├──(0,n)─TRACER─(1,1)─┐    │        │
    └────┬───┘   └─────┬─────┘                     │    │        │
         └─(0,n)───────┘                      ┌─────┴───┐│        │
             (TAGUER_ECH / TAGUER_FLC)        │ REVISION││        │
                                              └─────────┘│        │
    MATIERE ─(0,n)─ RATTACHER ─(1,1)─ DOCUMENT           │        │
    MATIERE ─(0,n)─ VISER ─(0,1)─ OBJECTIF ─(1,1)─ CADRER ─(0,n)─ PERIODE
```

*(Le schéma ASCII est indicatif ; le tableau de la section 3 fait foi pour les cardinalités.)*

---

## 5. Contraintes d'intégrité (CIF / à vérifier au MLD)

- **Unicité** : `UTILISATEUR.email` est unique.
- **CIF objectif** : un `OBJECTIF` référence une `MATIERE` et une `PERIODE` qui doivent appartenir
  au **même utilisateur** (à contrôler applicativement ou par déclencheur).
- **Cohérence temporelle** : `NOTE.date_evaluation` et `ECHEANCE.date_limite` devraient tomber
  dans l'intervalle `[PERIODE.date_debut, PERIODE.date_fin]` de la matière (règle métier).
- **Domaine** : `NOTE.valeur ∈ [0,20]`, `REVISION.qualite_rappel ∈ [0,5]`,
  `ECHEANCE.type ∈ {cours, devoir, projet}`, `ECHEANCE.statut ∈ {à faire, en cours, terminé}`,
  `DOCUMENT.type_doc ∈ {fichier, lien}`.
- **Une seule période active** par utilisateur (`est_active`) — contrainte applicative.

---

## 6. Prochaine étape — MLD

Passage aux règles Merise MCD → MLD :
1. Chaque **entité** devient une **table** ; l'identifiant devient la **clé primaire**.
2. Chaque association **(1,1)—(0,n)** (dimension père-fils) : la clé du côté « (1,1) » reçoit une
   **clé étrangère** vers le côté « (0,n) ». → cas des associations 1 à 12.
3. Chaque association **N:N** (13, 14) devient une **table de jonction** avec clé primaire composée
   des deux clés étrangères. → `echeance_etiquette`, `flashcard_etiquette`.

Dis-moi quand tu veux qu'on écrive le **MLD** puis le **script SQL PostgreSQL (MPD)**.
