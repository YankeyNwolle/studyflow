// =============================================================================
// index.js — Point d'entrée qui regroupe toutes les routes de l'API
// -----------------------------------------------------------------------------
// app.js monte ce routeur sous "/api". Chaque module (auth, matiere, note...)
// est branché ici au fur et à mesure de leur développement.
// =============================================================================

import { Router } from 'express';
import authRoutes from './authRoutes.js';

const router = Router();

router.use('/auth', authRoutes); // -> /api/auth/...

// Les prochains modules viendront ici :
// router.use('/matieres', matiereRoutes);
// router.use('/notes', noteRoutes);
// ...

export default router;
