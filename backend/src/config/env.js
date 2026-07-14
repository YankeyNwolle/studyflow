// =============================================================================
// env.js — Centralisation et validation des variables d'environnement
// -----------------------------------------------------------------------------
// Objectif : lire process.env UNE seule fois ici, vérifier que les variables
// critiques existent, et exporter un objet "env" propre utilisé partout ailleurs.
// Avantage : si une variable manque, l'app plante tout de suite au démarrage
// (message clair) plutôt que d'échouer plus tard de façon mystérieuse.
// =============================================================================

import "dotenv/config";

// Petite aide : récupère une variable obligatoire, ou lève une erreur.
function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `❌ Variable d'environnement manquante : ${name} (vérifie ton fichier .env)`,
    );
  }
  return value;
}

export const env = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",

  // Base de données PostgreSQL
  db: {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    name: required("DB_NAME"),
    user: required("DB_USER"),
    password: required("DB_PASSWORD"),
  },

  // Authentification
  jwtSecret: required("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",

  // CORS
  corsOrigin: process.env.CORS_ORIGIN || "*",
};
