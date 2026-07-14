// =============================================================================
// RegisterPage.jsx — Formulaire d'inscription
// =============================================================================
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

const RegisterPage = () => {
  const { sInscrire } = useAuth();

  const [form, setForm] = useState({ nom: '', prenom: '', email: '', motDePasse: '' });
  const [erreur, setErreur] = useState('');
  const [envoi, setEnvoi] = useState(false);

  // Un seul gestionnaire pour tous les champs (grâce à l'attribut name).
  const changer = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const soumettre = async (e) => {
    e.preventDefault();
    setErreur('');
    setEnvoi(true);
    try {
      await sInscrire(form);
      // Succès -> AppRoutes redirige vers le dashboard.
    } catch (err) {
      const data = err.response?.data;
      // Le backend peut renvoyer soit un message, soit une liste de détails.
      setErreur(data?.details?.join(' ') || data?.erreur || 'Inscription impossible.');
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <div style={styles.conteneur}>
      <form onSubmit={soumettre} style={styles.carte}>
        <h1 style={styles.titre}>Créer un compte</h1>

        {erreur && <p style={styles.erreur}>{erreur}</p>}

        <label style={styles.label}>Prénom</label>
        <input name="prenom" value={form.prenom} onChange={changer} required style={styles.input} />

        <label style={styles.label}>Nom</label>
        <input name="nom" value={form.nom} onChange={changer} required style={styles.input} />

        <label style={styles.label}>Email</label>
        <input name="email" type="email" value={form.email} onChange={changer} required style={styles.input} />

        <label style={styles.label}>Mot de passe (min. 6 caractères)</label>
        <input name="motDePasse" type="password" value={form.motDePasse} onChange={changer} required style={styles.input} />

        <button type="submit" disabled={envoi} style={styles.bouton}>
          {envoi ? 'Création…' : "S'inscrire"}
        </button>

        <p style={styles.lien}>
          Déjà un compte ? <Link to="/login">Se connecter</Link>
        </p>
      </form>
    </div>
  );
};

const styles = {
  conteneur: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6' },
  carte: { display: 'flex', flexDirection: 'column', width: 320, padding: 32, background: '#fff', borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,.08)' },
  titre: { margin: '0 0 20px', textAlign: 'center' },
  label: { fontSize: 14, marginBottom: 4, color: '#374151' },
  input: { padding: 10, marginBottom: 16, border: '1px solid #d1d5db', borderRadius: 8 },
  bouton: { padding: 12, background: '#3B82F6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 },
  erreur: { background: '#fee2e2', color: '#b91c1c', padding: 10, borderRadius: 8, marginBottom: 12, fontSize: 14 },
  lien: { textAlign: 'center', fontSize: 14, marginTop: 16 },
};

export default RegisterPage;
