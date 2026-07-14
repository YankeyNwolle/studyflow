// =============================================================================
// AppRoutes.jsx — Déclaration des routes (URLs) de l'application
// -----------------------------------------------------------------------------
// On utilise react-router-dom. Le composant "RoutePrivee" protège les pages
// qui exigent d'être connecté : si l'utilisateur ne l'est pas, il est renvoyé
// vers /login.
// =============================================================================

import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import LoginPage from '../pages/LoginPage.jsx';
import RegisterPage from '../pages/RegisterPage.jsx';
import DashboardPage from '../pages/DashboardPage.jsx';

// Garde d'accès : n'affiche "children" que si l'utilisateur est connecté.
const RoutePrivee = ({ children }) => {
  const { estConnecte, chargement } = useAuth();

  // Tant qu'on vérifie le jeton au démarrage, on n'affiche rien (évite un
  // clignotement vers /login puis retour).
  if (chargement) return <p style={{ padding: 20 }}>Chargement…</p>;

  return estConnecte ? children : <Navigate to="/login" replace />;
};

const AppRoutes = () => {
  const { estConnecte } = useAuth();

  return (
    <Routes>
      {/* Pages publiques. Si déjà connecté, on saute vers le dashboard. */}
      <Route
        path="/login"
        element={estConnecte ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={estConnecte ? <Navigate to="/" replace /> : <RegisterPage />}
      />

      {/* Page protégée : accueil / dashboard. */}
      <Route
        path="/"
        element={
          <RoutePrivee>
            <DashboardPage />
          </RoutePrivee>
        }
      />

      {/* Toute autre URL renvoie vers l'accueil. */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
