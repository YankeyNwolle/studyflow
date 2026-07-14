// =============================================================================
// userModel.js — Accès aux données de la table "utilisateur"
// -----------------------------------------------------------------------------
// Un "model" regroupe TOUTES les requêtes SQL liées à une table. Les
// controllers appellent ces fonctions sans jamais écrire de SQL eux-mêmes :
// la logique base de données reste isolée ici.
// =============================================================================

import { query } from '../config/db.js';

// Recherche un utilisateur par son email (sert à la connexion et à vérifier
// qu'un email n'est pas déjà pris à l'inscription). Renvoie l'utilisateur
// COMPLET (avec le mot de passe haché) ou undefined si aucun trouvé.
export const trouverParEmail = async (email) => {
  const result = await query(
    'SELECT * FROM utilisateur WHERE email = $1',
    [email]
  );
  return result.rows[0];
};

// Recherche un utilisateur par son id, SANS le mot de passe (pour renvoyer
// des infos de profil sans jamais exposer le hash).
export const trouverParId = async (id) => {
  const result = await query(
    `SELECT id_utilisateur, nom, prenom, email, date_creation
     FROM utilisateur WHERE id_utilisateur = $1`,
    [id]
  );
  return result.rows[0];
};

// Crée un nouvel utilisateur. Le mot de passe reçu est DÉJÀ haché par le
// controller. RETURNING renvoie la ligne créée (sans le mot de passe).
export const creer = async ({ nom, prenom, email, motDePasseHache }) => {
  const result = await query(
    `INSERT INTO utilisateur (nom, prenom, email, mot_de_passe)
     VALUES ($1, $2, $3, $4)
     RETURNING id_utilisateur, nom, prenom, email, date_creation`,
    [nom, prenom, email, motDePasseHache]
  );
  return result.rows[0];
};
