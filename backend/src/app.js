// =============================================================================
// app.js — Configuration de l'application Express
// -----------------------------------------------------------------------------
// Ce fichier CONSTRUIT l'application (middlewares, routes) mais ne la DÉMARRE pas.
// Le démarrage (écoute d'un port) est fait dans server.js.
// Séparer les deux permet, plus tard, de tester l'app sans ouvrir de port réseau.
// =============================================================================

import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';

// On crée l'instance de l'application.
const app = express();

// --- Middlewares globaux -----------------------------------------------------
// CORS : autorise le frontend (autre origine/port) à appeler cette API.
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));

// Parse automatiquement le corps JSON des requêtes -> disponible dans req.body.
app.use(express.json());

// Parse les données de formulaire (urlencoded).
app.use(express.urlencoded({ extended: true }));

// --- Route de test (health check) --------------------------------------------
// Permet de vérifier rapidement que l'API répond.
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'StudyFlow API en ligne 🚀' });
});

// --- Routes de l'application --------------------------------------------------
// Toutes les routes de l'API sont préfixées par "/api".
app.use('/api', routes);

// --- Gestion des erreurs -----------------------------------------------------
// EN DERNIER : capture toutes les erreurs remontées par les routes ci-dessus.
app.use(errorHandler);

// On exporte l'app pour que server.js (et les tests) puissent l'utiliser.
export default app;
