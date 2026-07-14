// =============================================================================
// AuthContext.jsx — État global d'authentification (utilisateur connecté)
// -----------------------------------------------------------------------------
// Le "contexte" React permet de partager l'utilisateur connecté et les
// fonctions login/register/logout dans TOUTE l'application, sans passer les
// props manuellement de composant en composant.
//
// Le jeton est conservé dans localStorage pour rester connecté après un
// rafraîchissement de la page. Au démarrage, si un jeton existe, on récupère
// le profil via /auth/me pour re-remplir l'utilisateur.
// =============================================================================

import { createContext, useState, useEffect } from 'react';
import * as authApi from '../api/authApi.js';

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [utilisateur, setUtilisateur] = useState(null);
  const [chargement, setChargement] = useState(true); // true tant qu'on vérifie le jeton au démarrage

  // Au premier rendu : si un jeton est stocké, on tente de récupérer le profil.
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setChargement(false);
      return;
    }
    authApi
      .getProfil()
      .then((u) => setUtilisateur(u))
      .catch(() => localStorage.removeItem('token')) // jeton invalide/expiré
      .finally(() => setChargement(false));
  }, []);

  // Connexion : appelle l'API, stocke le jeton, met à jour l'utilisateur.
  const seConnecter = async (identifiants) => {
    const { utilisateur, token } = await authApi.login(identifiants);
    localStorage.setItem('token', token);
    setUtilisateur(utilisateur);
  };

  // Inscription : même principe (le backend renvoie déjà un jeton).
  const sInscrire = async (donnees) => {
    const { utilisateur, token } = await authApi.register(donnees);
    localStorage.setItem('token', token);
    setUtilisateur(utilisateur);
  };

  // Déconnexion : on efface tout.
  const seDeconnecter = () => {
    localStorage.removeItem('token');
    setUtilisateur(null);
  };

  const valeur = {
    utilisateur,
    chargement,
    estConnecte: !!utilisateur,
    seConnecter,
    sInscrire,
    seDeconnecter,
  };

  return <AuthContext.Provider value={valeur}>{children}</AuthContext.Provider>;
};
