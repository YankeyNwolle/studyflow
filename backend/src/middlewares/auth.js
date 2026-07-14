// =============================================================================
// auth.js — Middleware de protection des routes (authentification requise)
// -----------------------------------------------------------------------------
// À placer devant toute route qui exige d'être connecté. Il :
//   1. lit le jeton dans l'en-tête "Authorization: Bearer <token>",
//   2. le vérifie (signature + expiration),
//   3. attache l'id de l'utilisateur à req.utilisateur pour les controllers,
//   4. bloque avec un 401 si le jeton est absent ou invalide.
// =============================================================================

import { verifierToken } from '../utils/jwt.js';

export const proteger = (req, res, next) => {
  const enTete = req.headers.authorization;

  // Le format attendu est : "Bearer eyJhbGciOi..."
  if (!enTete || !enTete.startsWith('Bearer ')) {
    return res.status(401).json({ erreur: 'Non authentifié : jeton manquant.' });
  }

  const token = enTete.split(' ')[1];

  try {
    const decode = verifierToken(token); // { id: ... } + infos JWT
    req.utilisateur = { id: decode.id };  // dispo dans tous les controllers protégés
    next();
  } catch (error) {
    return res.status(401).json({ erreur: 'Jeton invalide ou expiré.' });
  }
};

export default proteger;
