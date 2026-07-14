// =============================================================================
// DashboardPage.jsx — Page d'accueil (protégée) après connexion
// -----------------------------------------------------------------------------
// Pour l'instant, elle sert surtout à VÉRIFIER que l'authentification marche :
// elle affiche l'utilisateur connecté (récupéré du contexte) et un bouton de
// déconnexion. On la remplira de vrais widgets plus tard.
// =============================================================================
import { useAuth } from '../hooks/useAuth.js';

const DashboardPage = () => {
  const { utilisateur, seDeconnecter } = useAuth();

  return (
    <div style={{ padding: 40, fontFamily: 'system-ui' }}>
      <h1>Bienvenue sur StudyFlow 🎓</h1>
      <p>
        Connecté en tant que <strong>{utilisateur?.prenom} {utilisateur?.nom}</strong>{' '}
        ({utilisateur?.email})
      </p>
      <button
        onClick={seDeconnecter}
        style={{ marginTop: 16, padding: '10px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}
      >
        Se déconnecter
      </button>
    </div>
  );
};

export default DashboardPage;
