// =============================================================================
// authRoutes.js — Définition des routes d'authentification
// -----------------------------------------------------------------------------
// Toutes ces routes seront préfixées par "/api/auth" (voir routes/index.js).
// =============================================================================

import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { proteger } from '../middlewares/auth.js';
import { validate, validerInscription, validerConnexion } from '../middlewares/validate.js';

const router = Router();

// Inscription : valide les données puis crée le compte.
router.post('/register', validate(validerInscription), authController.register);

// Connexion : valide les données puis renvoie un jeton.
router.post('/login', validate(validerConnexion), authController.login);

// Profil de l'utilisateur connecté : protégée par le middleware "proteger".
router.get('/me', proteger, authController.me);

export default router;
