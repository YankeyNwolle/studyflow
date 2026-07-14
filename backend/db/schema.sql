-- =============================================================================
-- schema.sql — Schéma de la base de données StudyFlow (PostgreSQL)
-- -----------------------------------------------------------------------------
-- Ce fichier crée TOUTES les tables de l'application ainsi que leurs relations.
-- Il est conçu pour être exécuté sur une base VIDE nommée "studyflow".
--
-- Comment l'exécuter (pgAdmin) :
--   1. Crée d'abord la base "studyflow" (clic droit sur "Databases" > Create > Database).
--   2. Sélectionne la base "studyflow", ouvre le "Query Tool" (icône éclair).
--   3. Ouvre ce fichier (icône dossier) puis clique sur "Execute/Run" (▶ ou F5).
--
-- Conventions utilisées :
--   • Noms de tables au SINGULIER (utilisateur, matiere, note...).
--   • Clé primaire : id_<table> en SERIAL (auto-incrémenté).
--   • Clés étrangères : id_<table_référencée>.
--   • ON DELETE CASCADE : si on supprime un utilisateur, tout ce qui lui
--     appartient est supprimé automatiquement (matières, notes, etc.).
-- =============================================================================

-- Pour pouvoir relancer ce script proprement pendant le développement,
-- on supprime les tables existantes AVANT de les recréer.
-- ⚠️ ATTENTION : ceci EFFACE toutes les données. À ne pas exécuter en production.
-- L'ordre de suppression respecte les dépendances (enfants avant parents).
DROP TABLE IF EXISTS document          CASCADE;
DROP TABLE IF EXISTS objectif          CASCADE;
DROP TABLE IF EXISTS revision          CASCADE;
DROP TABLE IF EXISTS flashcard         CASCADE;
DROP TABLE IF EXISTS echeance_etiquette CASCADE;
DROP TABLE IF EXISTS etiquette         CASCADE;
DROP TABLE IF EXISTS echeance          CASCADE;
DROP TABLE IF EXISTS note              CASCADE;
DROP TABLE IF EXISTS type_evaluation   CASCADE;
DROP TABLE IF EXISTS matiere           CASCADE;
DROP TABLE IF EXISTS periode           CASCADE;
DROP TABLE IF EXISTS utilisateur       CASCADE;


-- =============================================================================
-- 1. UTILISATEUR — les comptes des étudiants
-- =============================================================================
CREATE TABLE utilisateur (
  id_utilisateur   SERIAL       PRIMARY KEY,
  nom              VARCHAR(100) NOT NULL,
  prenom           VARCHAR(100) NOT NULL,
  email            VARCHAR(255) NOT NULL UNIQUE,   -- sert d'identifiant de connexion
  mot_de_passe     VARCHAR(255) NOT NULL,          -- stocké HACHÉ (bcrypt), jamais en clair
  date_creation    TIMESTAMP    NOT NULL DEFAULT NOW()
);


-- =============================================================================
-- 2. PERIODE — semestres / trimestres (permet de séparer les notes par période)
-- =============================================================================
CREATE TABLE periode (
  id_periode       SERIAL       PRIMARY KEY,
  id_utilisateur   INTEGER      NOT NULL REFERENCES utilisateur(id_utilisateur) ON DELETE CASCADE,
  nom              VARCHAR(100) NOT NULL,           -- ex : "Semestre 1 - 2025"
  date_debut       DATE,
  date_fin         DATE,
  est_active       BOOLEAN      NOT NULL DEFAULT FALSE  -- la période actuellement affichée par défaut
);


-- =============================================================================
-- 3. MATIERE — les matières/cours suivis par l'utilisateur sur une période
-- =============================================================================
CREATE TABLE matiere (
  id_matiere       SERIAL         PRIMARY KEY,
  id_utilisateur   INTEGER        NOT NULL REFERENCES utilisateur(id_utilisateur) ON DELETE CASCADE,
  id_periode       INTEGER        REFERENCES periode(id_periode) ON DELETE SET NULL,
  nom              VARCHAR(150)   NOT NULL,
  coefficient      NUMERIC(4,2)   NOT NULL DEFAULT 1.0,   -- poids dans la moyenne générale
  couleur          VARCHAR(7)     DEFAULT '#3B82F6',      -- code hexadécimal pour l'UI
  date_creation    TIMESTAMP      NOT NULL DEFAULT NOW()
);


-- =============================================================================
-- 4. TYPE_EVALUATION — catégories d'évaluations (Examen, TP, Devoir, Oral...)
-- Chaque utilisateur peut définir ses propres types.
-- =============================================================================
CREATE TABLE type_evaluation (
  id_type_evaluation SERIAL       PRIMARY KEY,
  id_utilisateur     INTEGER      NOT NULL REFERENCES utilisateur(id_utilisateur) ON DELETE CASCADE,
  nom                VARCHAR(100) NOT NULL       -- ex : "Examen", "TP", "Contrôle continu"
);


-- =============================================================================
-- 5. NOTE — les notes/résultats obtenus dans une matière
-- La moyenne (moyenneService) est calculée à partir de cette table.
-- =============================================================================
CREATE TABLE note (
  id_note            SERIAL        PRIMARY KEY,
  id_matiere         INTEGER       NOT NULL REFERENCES matiere(id_matiere) ON DELETE CASCADE,
  id_type_evaluation INTEGER       REFERENCES type_evaluation(id_type_evaluation) ON DELETE SET NULL,
  titre              VARCHAR(150),                        -- ex : "Partiel chapitre 3"
  valeur             NUMERIC(5,2)  NOT NULL,              -- la note obtenue, ex : 14.50
  bareme             NUMERIC(5,2)  NOT NULL DEFAULT 20,   -- note maximale possible (souvent /20)
  coefficient        NUMERIC(4,2)  NOT NULL DEFAULT 1.0,  -- poids de cette note dans la matière
  date_evaluation    DATE          NOT NULL DEFAULT CURRENT_DATE,
  date_creation      TIMESTAMP     NOT NULL DEFAULT NOW()
);


-- =============================================================================
-- 6. ECHEANCE — les tâches / devoirs à rendre / examens à venir (calendrier)
-- =============================================================================
CREATE TABLE echeance (
  id_echeance      SERIAL        PRIMARY KEY,
  id_utilisateur   INTEGER       NOT NULL REFERENCES utilisateur(id_utilisateur) ON DELETE CASCADE,
  id_matiere       INTEGER       REFERENCES matiere(id_matiere) ON DELETE SET NULL,  -- optionnelle
  titre            VARCHAR(200)  NOT NULL,
  description      TEXT,
  date_echeance    TIMESTAMP     NOT NULL,
  priorite         VARCHAR(10)   NOT NULL DEFAULT 'moyenne'
                     CHECK (priorite IN ('basse', 'moyenne', 'haute')),
  statut           VARCHAR(15)   NOT NULL DEFAULT 'a_faire'
                     CHECK (statut IN ('a_faire', 'en_cours', 'termine')),
  date_creation    TIMESTAMP     NOT NULL DEFAULT NOW()
);


-- =============================================================================
-- 7. ETIQUETTE — tags personnalisables (ex : "Urgent", "Révisions", "Groupe")
-- =============================================================================
CREATE TABLE etiquette (
  id_etiquette     SERIAL       PRIMARY KEY,
  id_utilisateur   INTEGER      NOT NULL REFERENCES utilisateur(id_utilisateur) ON DELETE CASCADE,
  nom              VARCHAR(50)  NOT NULL,
  couleur          VARCHAR(7)   DEFAULT '#6B7280'
);


-- =============================================================================
-- 8. ECHEANCE_ETIQUETTE — table de liaison (une échéance a plusieurs étiquettes,
-- et une étiquette peut être posée sur plusieurs échéances) : relation N-N.
-- =============================================================================
CREATE TABLE echeance_etiquette (
  id_echeance      INTEGER NOT NULL REFERENCES echeance(id_echeance)   ON DELETE CASCADE,
  id_etiquette     INTEGER NOT NULL REFERENCES etiquette(id_etiquette) ON DELETE CASCADE,
  PRIMARY KEY (id_echeance, id_etiquette)   -- empêche les doublons
);


-- =============================================================================
-- 9. FLASHCARD — cartes de révision (recto question / verso réponse)
-- =============================================================================
CREATE TABLE flashcard (
  id_flashcard     SERIAL     PRIMARY KEY,
  id_utilisateur   INTEGER    NOT NULL REFERENCES utilisateur(id_utilisateur) ON DELETE CASCADE,
  id_matiere       INTEGER    REFERENCES matiere(id_matiere) ON DELETE SET NULL,
  recto            TEXT       NOT NULL,   -- la question / le terme à retenir
  verso            TEXT       NOT NULL,   -- la réponse / définition
  date_creation    TIMESTAMP  NOT NULL DEFAULT NOW()
);


-- =============================================================================
-- 10. REVISION — état de répétition espacée d'une flashcard (algorithme SM-2)
-- Chaque flashcard a UNE ligne de révision qui évolue à chaque passage.
-- Les champs correspondent aux variables de l'algorithme SM-2 (sm2Service).
-- =============================================================================
CREATE TABLE revision (
  id_revision            SERIAL       PRIMARY KEY,
  id_flashcard           INTEGER      NOT NULL UNIQUE REFERENCES flashcard(id_flashcard) ON DELETE CASCADE,
  repetitions            INTEGER      NOT NULL DEFAULT 0,     -- nb de révisions réussies d'affilée
  facilite               NUMERIC(4,2) NOT NULL DEFAULT 2.5,   -- "easiness factor" (E-Factor), min 1.3
  intervalle             INTEGER      NOT NULL DEFAULT 0,     -- jours avant la prochaine révision
  derniere_qualite       INTEGER,                            -- dernière note de rappel (0 à 5)
  date_derniere_revision DATE,
  date_prochaine_revision DATE        NOT NULL DEFAULT CURRENT_DATE
);


-- =============================================================================
-- 11. OBJECTIF — objectifs personnels (ex : "atteindre 14 de moyenne en Maths")
-- =============================================================================
CREATE TABLE objectif (
  id_objectif      SERIAL        PRIMARY KEY,
  id_utilisateur   INTEGER       NOT NULL REFERENCES utilisateur(id_utilisateur) ON DELETE CASCADE,
  id_matiere       INTEGER       REFERENCES matiere(id_matiere) ON DELETE SET NULL,  -- optionnel
  titre            VARCHAR(200)  NOT NULL,
  description      TEXT,
  note_cible       NUMERIC(5,2),                       -- moyenne visée (optionnel)
  date_limite      DATE,
  statut           VARCHAR(15)   NOT NULL DEFAULT 'en_cours'
                     CHECK (statut IN ('en_cours', 'atteint', 'abandonne')),
  date_creation    TIMESTAMP     NOT NULL DEFAULT NOW()
);


-- =============================================================================
-- 12. DOCUMENT — fichiers uploadés (cours, PDF...) rattachés à une matière
-- Le fichier physique est stocké sur disque (dossier uploads/), on ne garde
-- ici que ses métadonnées et son chemin.
-- =============================================================================
CREATE TABLE document (
  id_document      SERIAL        PRIMARY KEY,
  id_utilisateur   INTEGER       NOT NULL REFERENCES utilisateur(id_utilisateur) ON DELETE CASCADE,
  id_matiere       INTEGER       REFERENCES matiere(id_matiere) ON DELETE SET NULL,
  nom_fichier      VARCHAR(255)  NOT NULL,   -- nom original du fichier
  chemin           VARCHAR(500)  NOT NULL,   -- chemin de stockage sur le serveur
  type_mime        VARCHAR(100),             -- ex : "application/pdf"
  taille           INTEGER,                  -- taille en octets
  date_upload      TIMESTAMP     NOT NULL DEFAULT NOW()
);


-- =============================================================================
-- INDEX — accélèrent les recherches fréquentes par clé étrangère.
-- (PostgreSQL indexe automatiquement les clés primaires et les UNIQUE, mais PAS
--  les clés étrangères : on les ajoute manuellement pour les requêtes courantes.)
-- =============================================================================
CREATE INDEX idx_matiere_utilisateur   ON matiere(id_utilisateur);
CREATE INDEX idx_matiere_periode       ON matiere(id_periode);
CREATE INDEX idx_note_matiere          ON note(id_matiere);
CREATE INDEX idx_echeance_utilisateur  ON echeance(id_utilisateur);
CREATE INDEX idx_echeance_date         ON echeance(date_echeance);
CREATE INDEX idx_flashcard_utilisateur ON flashcard(id_utilisateur);
CREATE INDEX idx_flashcard_matiere     ON flashcard(id_matiere);
CREATE INDEX idx_revision_prochaine    ON revision(date_prochaine_revision);
CREATE INDEX idx_objectif_utilisateur  ON objectif(id_utilisateur);
CREATE INDEX idx_document_utilisateur  ON document(id_utilisateur);

-- =============================================================================
-- Fin du schéma. Si tout s'est bien exécuté, tu as 12 tables dans "studyflow".
-- =============================================================================
