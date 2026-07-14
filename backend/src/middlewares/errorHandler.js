// =============================================================================
// errorHandler.js — Gestion centralisée des erreurs
// -----------------------------------------------------------------------------
// Placé EN DERNIER dans app.js (après toutes les routes). Dès qu'un controller
// appelle next(erreur) ou lève une exception (Express 5 les capture aussi pour
// les fonctions async), Express saute directement ici.
//
// Convention : une erreur "attendue" (ex : email déjà pris) porte une propriété
// .statusCode (ex : 409). Sinon, on renvoie 500 (erreur serveur inattendue).
// =============================================================================

export const errorHandler = (err, req, res, next) => {
  // Statut HTTP : celui porté par l'erreur, sinon 500 par défaut.
  const statusCode = err.statusCode || 500;

  // En développement, on log l'erreur complète dans la console pour déboguer.
  if (statusCode === 500) {
    console.error('💥 Erreur serveur :', err);
  }

  res.status(statusCode).json({
    erreur: err.message || 'Une erreur inattendue est survenue.',
  });
};

export default errorHandler;
