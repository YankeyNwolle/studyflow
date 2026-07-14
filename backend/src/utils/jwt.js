// =============================================================================
// jwt.js — Génération et vérification des jetons JWT
// -----------------------------------------------------------------------------
// Un JWT (JSON Web Token) est un jeton signé remis à l'utilisateur après une
// connexion réussie. Le client le renvoie ensuite à chaque requête protégée
// (dans l'en-tête Authorization). Comme il est signé avec notre JWT_SECRET,
// personne ne peut le falsifier sans connaître ce secret.
// =============================================================================

import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

// Crée un jeton contenant le "payload" (ici l'id de l'utilisateur).
// Le jeton expire automatiquement après JWT_EXPIRES_IN (ex : 7 jours).
export const genererToken = (payload) =>
  jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn });

// Vérifie qu'un jeton est valide (signature + non expiré) et renvoie son
// contenu décodé. Lève une erreur si le jeton est invalide ou expiré.
export const verifierToken = (token) => jwt.verify(token, env.jwtSecret);
