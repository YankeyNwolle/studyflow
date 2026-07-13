-- =============================================================================
-- StudyFlow — MPD (Modèle Physique de Données) — PostgreSQL
-- Source : docs/mld.md (13 tables : 11 entités + 2 tables de jonction)
-- Version : 1.0 — 13/07/2026
-- =============================================================================
-- Ordre de création : les tables « parents » avant les tables « enfants »
-- (une clé étrangère ne peut référencer qu'une table déjà créée).
-- =============================================================================

-- Repartir de zéro proprement (utile en développement).
DROP TABLE IF EXISTS flashcard_etiquette CASCADE;
DROP TABLE IF EXISTS echeance_etiquette  CASCADE;
DROP TABLE IF EXISTS revision            CASCADE;
DROP TABLE IF EXISTS document            CASCADE;
DROP TABLE IF EXISTS objectif            CASCADE;
DROP TABLE IF EXISTS flashcard           CASCADE;
DROP TABLE IF EXISTS echeance            CASCADE;
DROP TABLE IF EXISTS note                CASCADE;
DROP TABLE IF EXISTS etiquette           CASCADE;
DROP TABLE IF EXISTS matiere             CASCADE;
DROP TABLE IF EXISTS type_evaluation     CASCADE;
DROP TABLE IF EXISTS periode             CASCADE;
DROP TABLE IF EXISTS utilisateur         CASCADE;


-- =============================================================================
-- 1. UTILISATEUR
-- =============================================================================
CREATE TABLE utilisateur (
    id_utilisateur    SERIAL       PRIMARY KEY,
    email             VARCHAR(255) NOT NULL UNIQUE,
    mot_de_passe_hash VARCHAR(255) NOT NULL,
    nom               VARCHAR(100) NOT NULL,
    date_creation     TIMESTAMP    NOT NULL DEFAULT NOW()
);


-- =============================================================================
-- 2. PERIODE   (RG2 : appartient à 1 utilisateur)
-- =============================================================================
CREATE TABLE periode (
    id_periode     SERIAL       PRIMARY KEY,
    libelle        VARCHAR(100) NOT NULL,
    date_debut     DATE         NOT NULL,
    date_fin       DATE         NOT NULL,
    est_active     BOOLEAN      NOT NULL DEFAULT FALSE,
    id_utilisateur INTEGER      NOT NULL
        REFERENCES utilisateur (id_utilisateur) ON DELETE CASCADE,
    CONSTRAINT chk_periode_dates CHECK (date_fin >= date_debut)
);


-- =============================================================================
-- 3. TYPE_EVALUATION   (RG7/RG8 : le type porte le coefficient)
-- =============================================================================
CREATE TABLE type_evaluation (
    id_type        SERIAL        PRIMARY KEY,
    libelle        VARCHAR(50)   NOT NULL,
    coefficient    NUMERIC(4,2)  NOT NULL DEFAULT 1,
    id_utilisateur INTEGER       NOT NULL
        REFERENCES utilisateur (id_utilisateur) ON DELETE CASCADE,
    CONSTRAINT chk_coefficient CHECK (coefficient > 0)
);


-- =============================================================================
-- 4. MATIERE   (RG3 : rattachée à 1 période)
-- =============================================================================
CREATE TABLE matiere (
    id_matiere SERIAL       PRIMARY KEY,
    nom        VARCHAR(100) NOT NULL,
    couleur    VARCHAR(7)   NOT NULL DEFAULT '#3498db',  -- code hex #RRGGBB
    id_periode INTEGER      NOT NULL
        REFERENCES periode (id_periode) ON DELETE CASCADE
);


-- =============================================================================
-- 5. NOTE   (RG6 : rattachée à 1 matière et 1 type d'évaluation)
-- =============================================================================
CREATE TABLE note (
    id_note         SERIAL        PRIMARY KEY,
    valeur          NUMERIC(4,2)  NOT NULL,
    date_evaluation DATE          NOT NULL DEFAULT CURRENT_DATE,
    commentaire     TEXT,
    id_matiere      INTEGER       NOT NULL
        REFERENCES matiere (id_matiere) ON DELETE CASCADE,
    id_type         INTEGER       NOT NULL
        REFERENCES type_evaluation (id_type) ON DELETE RESTRICT,
    CONSTRAINT chk_note_valeur CHECK (valeur >= 0 AND valeur <= 20)
);


-- =============================================================================
-- 6. ECHEANCE   (RG4/RG5 : 1 matière, 1 type, 1 statut)
-- =============================================================================
CREATE TABLE echeance (
    id_echeance SERIAL       PRIMARY KEY,
    titre       VARCHAR(150) NOT NULL,
    description TEXT,
    type        VARCHAR(20)  NOT NULL,
    date_limite TIMESTAMP    NOT NULL,
    statut      VARCHAR(20)  NOT NULL DEFAULT 'à faire',
    id_matiere  INTEGER      NOT NULL
        REFERENCES matiere (id_matiere) ON DELETE CASCADE,
    CONSTRAINT chk_echeance_type   CHECK (type   IN ('cours', 'devoir', 'projet')),
    CONSTRAINT chk_echeance_statut CHECK (statut IN ('à faire', 'en cours', 'terminé'))
);


-- =============================================================================
-- 7. FLASHCARD   (RG9/RG10 : 1 matière + état SM-2 courant)
-- =============================================================================
CREATE TABLE flashcard (
    id_flashcard       SERIAL        PRIMARY KEY,
    question           TEXT          NOT NULL,
    reponse            TEXT          NOT NULL,
    date_creation      TIMESTAMP     NOT NULL DEFAULT NOW(),
    facteur_facilite   NUMERIC(4,2)  NOT NULL DEFAULT 2.5,   -- "easiness factor" SM-2
    intervalle_jours   INTEGER       NOT NULL DEFAULT 0,
    nb_repetitions     INTEGER       NOT NULL DEFAULT 0,
    prochaine_revision DATE          NOT NULL DEFAULT CURRENT_DATE,
    id_matiere         INTEGER       NOT NULL
        REFERENCES matiere (id_matiere) ON DELETE CASCADE,
    CONSTRAINT chk_facteur_facilite CHECK (facteur_facilite >= 1.3)
);


-- =============================================================================
-- 8. REVISION   (RG11 : journal des révisions d'une flashcard)
-- =============================================================================
CREATE TABLE revision (
    id_revision   SERIAL    PRIMARY KEY,
    date_revision TIMESTAMP NOT NULL DEFAULT NOW(),
    qualite_rappel SMALLINT NOT NULL,
    id_flashcard  INTEGER   NOT NULL
        REFERENCES flashcard (id_flashcard) ON DELETE CASCADE,
    CONSTRAINT chk_qualite CHECK (qualite_rappel BETWEEN 0 AND 5)
);


-- =============================================================================
-- 9. OBJECTIF   (RG12 : 1 période, matière optionnelle)
-- =============================================================================
CREATE TABLE objectif (
    id_objectif   SERIAL       PRIMARY KEY,
    moyenne_cible NUMERIC(4,2) NOT NULL,
    id_periode    INTEGER      NOT NULL
        REFERENCES periode (id_periode) ON DELETE CASCADE,
    id_matiere    INTEGER                          -- NULL = objectif de moyenne générale
        REFERENCES matiere (id_matiere) ON DELETE CASCADE,
    CONSTRAINT chk_objectif_cible CHECK (moyenne_cible >= 0 AND moyenne_cible <= 20)
);


-- =============================================================================
-- 10. DOCUMENT   (RG13 : rattaché à 1 matière)
-- =============================================================================
CREATE TABLE document (
    id_document   SERIAL       PRIMARY KEY,
    titre         VARCHAR(150) NOT NULL,
    type_doc      VARCHAR(10)  NOT NULL,
    chemin_ou_url TEXT         NOT NULL,
    date_ajout    TIMESTAMP    NOT NULL DEFAULT NOW(),
    id_matiere    INTEGER      NOT NULL
        REFERENCES matiere (id_matiere) ON DELETE CASCADE,
    CONSTRAINT chk_type_doc CHECK (type_doc IN ('fichier', 'lien'))
);


-- =============================================================================
-- 11. ETIQUETTE   (RG14 : appartient à 1 utilisateur)
-- =============================================================================
CREATE TABLE etiquette (
    id_etiquette   SERIAL      PRIMARY KEY,
    libelle        VARCHAR(50) NOT NULL,
    couleur        VARCHAR(7)  NOT NULL DEFAULT '#95a5a6',
    id_utilisateur INTEGER     NOT NULL
        REFERENCES utilisateur (id_utilisateur) ON DELETE CASCADE
);


-- =============================================================================
-- 12. ECHEANCE_ETIQUETTE   (N:N — jonction)
-- =============================================================================
CREATE TABLE echeance_etiquette (
    id_echeance  INTEGER NOT NULL
        REFERENCES echeance (id_echeance) ON DELETE CASCADE,
    id_etiquette INTEGER NOT NULL
        REFERENCES etiquette (id_etiquette) ON DELETE CASCADE,
    PRIMARY KEY (id_echeance, id_etiquette)
);


-- =============================================================================
-- 13. FLASHCARD_ETIQUETTE   (N:N — jonction)
-- =============================================================================
CREATE TABLE flashcard_etiquette (
    id_flashcard INTEGER NOT NULL
        REFERENCES flashcard (id_flashcard) ON DELETE CASCADE,
    id_etiquette INTEGER NOT NULL
        REFERENCES etiquette (id_etiquette) ON DELETE CASCADE,
    PRIMARY KEY (id_flashcard, id_etiquette)
);


-- =============================================================================
-- INDEX sur les clés étrangères fréquemment filtrées (performances)
-- =============================================================================
CREATE INDEX idx_periode_utilisateur    ON periode          (id_utilisateur);
CREATE INDEX idx_type_eval_utilisateur  ON type_evaluation  (id_utilisateur);
CREATE INDEX idx_matiere_periode        ON matiere          (id_periode);
CREATE INDEX idx_note_matiere           ON note             (id_matiere);
CREATE INDEX idx_note_type              ON note             (id_type);
CREATE INDEX idx_echeance_matiere       ON echeance         (id_matiere);
CREATE INDEX idx_flashcard_matiere      ON flashcard        (id_matiere);
CREATE INDEX idx_flashcard_prochaine    ON flashcard        (prochaine_revision);
CREATE INDEX idx_revision_flashcard     ON revision         (id_flashcard);
CREATE INDEX idx_objectif_periode       ON objectif         (id_periode);
CREATE INDEX idx_document_matiere       ON document         (id_matiere);
CREATE INDEX idx_etiquette_utilisateur  ON etiquette        (id_utilisateur);

-- =============================================================================
-- Fin du schéma StudyFlow
-- =============================================================================
