// =============================================================================
// validate.js — Validation simple des données reçues dans req.body
// -----------------------------------------------------------------------------
// Plutôt que d'installer une grosse librairie, on définit ici de petites
// fonctions de validation réutilisables. Un validateur reçoit req.body et
// renvoie un tableau de messages d'erreur (vide = tout est valide).
//
// Usage dans une route :
//   router.post('/register', validate(validerInscription), controller.register)
// =============================================================================

// Fabrique un middleware Express à partir d'une fonction de validation.
export const validate = (validateur) => (req, res, next) => {
  const erreurs = validateur(req.body || {});
  if (erreurs.length > 0) {
    // 400 = Bad Request : les données envoyées par le client sont invalides.
    return res.status(400).json({ erreur: 'Données invalides', details: erreurs });
  }
  next();
};

// --- Petites aides -----------------------------------------------------------
const estVide = (v) => v === undefined || v === null || String(v).trim() === '';
const emailValide = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

// --- Validateurs métier ------------------------------------------------------

// Règles pour l'inscription.
export const validerInscription = (body) => {
  const erreurs = [];
  if (estVide(body.nom)) erreurs.push('Le nom est obligatoire.');
  if (estVide(body.prenom)) erreurs.push('Le prénom est obligatoire.');
  if (estVide(body.email)) erreurs.push("L'email est obligatoire.");
  else if (!emailValide(body.email)) erreurs.push("L'email n'est pas valide.");
  if (estVide(body.motDePasse)) erreurs.push('Le mot de passe est obligatoire.');
  else if (String(body.motDePasse).length < 6)
    erreurs.push('Le mot de passe doit contenir au moins 6 caractères.');
  return erreurs;
};

// Règles pour la connexion.
export const validerConnexion = (body) => {
  const erreurs = [];
  if (estVide(body.email)) erreurs.push("L'email est obligatoire.");
  if (estVide(body.motDePasse)) erreurs.push('Le mot de passe est obligatoire.');
  return erreurs;
};
