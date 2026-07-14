// =============================================================================
// db.js — Connexion à PostgreSQL via un "pool" de connexions
// -----------------------------------------------------------------------------
// Un POOL est un réservoir de connexions réutilisables. Plutôt que d'ouvrir et
// fermer une connexion à chaque requête (coûteux), le pool en garde plusieurs
// prêtes à l'emploi. La librairie "pg" gère tout ça pour nous.
// =============================================================================

import pkg from 'pg';
import { env } from './env.js';

const { Pool } = pkg;

// Création du pool avec les identifiants venant de env.js.
const pool = new Pool({
  host: env.db.host,
  port: env.db.port,
  database: env.db.name,
  user: env.db.user,
  password: env.db.password,
});

// Fonction utilitaire : exécuter une requête SQL depuis n'importe quel model.
// Exemple d'usage : query('SELECT * FROM matiere WHERE id_matiere = $1', [id])
export const query = (text, params) => pool.query(text, params);

// Fonction de test : vérifie que la connexion à la base fonctionne.
export const testConnection = async () => {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log(`✅ PostgreSQL connecté — heure serveur : ${result.rows[0].now}`);
  } catch (error) {
    console.error('❌ Échec de connexion à PostgreSQL :', error.message);
    throw error;
  }
};

// On exporte aussi le pool brut au cas où (transactions avancées plus tard).
export default pool;
