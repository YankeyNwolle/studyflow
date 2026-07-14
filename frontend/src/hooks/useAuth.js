// =============================================================================
// useAuth.js — Raccourci pour consommer le contexte d'authentification
// -----------------------------------------------------------------------------
// Au lieu d'écrire useContext(AuthContext) partout, on appelle simplement
// useAuth() dans n'importe quel composant.
// =============================================================================

import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';

export const useAuth = () => {
  const contexte = useContext(AuthContext);
  if (!contexte) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un <AuthProvider>.');
  }
  return contexte;
};

export default useAuth;
