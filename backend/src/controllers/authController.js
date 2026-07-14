// =============================================================================
// authController.js — Logique métier de l'authentification
// -----------------------------------------------------------------------------
// Trois actions :
//   • register : créer un compte
//   • login    : se connecter et recevoir un jeton JWT
//   • me       : récupérer le profil de l'utilisateur connecté
//
// Note (Express 5) : les fonctions async qui lèvent une erreur sont
// automatiquement transmises au errorHandler, pas besoin de try/catch partout.
// =============================================================================

import * as userModel from '../models/userModel.js';
import { hasherMotDePasse, verifierMotDePasse } from '../utils/hash.js';
import { genererToken } from '../utils/jwt.js';

// --- POST /api/auth/register -------------------------------------------------
export const register = async (req, res) => {
  const { nom, prenom, email, motDePasse } = req.body;

  // Vérifie que l'email n'est pas déjà utilisé.
  const existant = await userModel.trouverParEmail(email);
  if (existant) {
    const err = new Error('Un compte existe déjà avec cet email.');
    err.statusCode = 409; // 409 Conflict
    throw err;
  }

  // Hache le mot de passe puis crée l'utilisateur.
  const motDePasseHache = await hasherMotDePasse(motDePasse);
  const utilisateur = await userModel.creer({ nom, prenom, email, motDePasseHache });

  // On connecte directement l'utilisateur en lui renvoyant un jeton.
  const token = genererToken({ id: utilisateur.id_utilisateur });

  res.status(201).json({ utilisateur, token });
};

// --- POST /api/auth/login ----------------------------------------------------
export const login = async (req, res) => {
  const { email, motDePasse } = req.body;

  const utilisateur = await userModel.trouverParEmail(email);

  // Message volontairement identique si l'email n'existe pas OU si le mot de
  // passe est faux : on ne révèle pas quels emails sont enregistrés.
  const identifiantsInvalides = () => {
    const err = new Error('Email ou mot de passe incorrect.');
    err.statusCode = 401;
    return err;
  };

  if (!utilisateur) throw identifiantsInvalides();

  const motDePasseOk = await verifierMotDePasse(motDePasse, utilisateur.mot_de_passe);
  if (!motDePasseOk) throw identifiantsInvalides();

  const token = genererToken({ id: utilisateur.id_utilisateur });

  // On retire le mot de passe haché avant de renvoyer l'utilisateur.
  const { mot_de_passe, ...utilisateurSansMdp } = utilisateur;

  res.json({ utilisateur: utilisateurSansMdp, token });
};

// --- GET /api/auth/me (route protégée) ---------------------------------------
export const me = async (req, res) => {
  // req.utilisateur.id est fourni par le middleware "proteger".
  const utilisateur = await userModel.trouverParId(req.utilisateur.id);
  if (!utilisateur) {
    const err = new Error('Utilisateur introuvable.');
    err.statusCode = 404;
    throw err;
  }
  res.json({ utilisateur });
};
