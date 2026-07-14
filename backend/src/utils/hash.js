// =============================================================================
// hash.js — Hachage et vérification des mots de passe (bcrypt)
// -----------------------------------------------------------------------------
// On ne stocke JAMAIS un mot de passe en clair. bcrypt le transforme en un
// "hash" irréversible. À la connexion, on compare le mot de passe saisi au hash
// stocké : bcrypt refait le calcul et vérifie que ça correspond.
// =============================================================================

import bcrypt from 'bcrypt';

// Nombre de "tours" de salage. Plus c'est élevé, plus c'est sûr mais lent.
// 10 est un bon compromis pour une application classique.
const SALT_ROUNDS = 10;

// Transforme un mot de passe en clair en hash sécurisé.
export const hasherMotDePasse = (motDePasse) => bcrypt.hash(motDePasse, SALT_ROUNDS);

// Compare un mot de passe en clair au hash stocké. Renvoie true / false.
export const verifierMotDePasse = (motDePasse, hash) => bcrypt.compare(motDePasse, hash);
