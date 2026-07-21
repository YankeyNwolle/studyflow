import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import "./AuthPages.css";

const IMAGE_LOGIN = "/images/studyflow.jpg";

const IconeOeil = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const IconeOeilBarre = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10.7 5.1A9.9 9.9 0 0 1 12 5c6.5 0 10 7 10 7a13.2 13.2 0 0 1-2.2 3" />
    <path d="M6.6 6.6A13.3 13.3 0 0 0 2 12s3.5 7 10 7a9.8 9.8 0 0 0 5.4-1.6" />
    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    <line x1="2" y1="2" x2="22" y2="22" />
  </svg>
);

const LoginPage = () => {
  const { seConnecter } = useAuth();

  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [voirMdp, setVoirMdp] = useState(false);
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);

  const soumettre = async (e) => {
    e.preventDefault();
    setErreur("");
    setEnvoi(true);
    try {
      await seConnecter({ email, motDePasse });
    } catch (err) {
      setErreur(err.response?.data?.erreur || "Connexion impossible.");
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <div className="auth-page">
      {/* ================= Colonne GAUCHE : visuel ================= */}
      <aside className="auth-visuel">
        <img
          src={IMAGE_LOGIN}
          alt=""
          className="auth-visuel__image"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />

        <div className="auth-visuel__marque">
          <span className="auth-visuel__logo">S</span>
          StudyFlow
        </div>

        <div className="auth-visuel__contenu">
          <h2 className="auth-visuel__titre">
            Reprends le contrôle de tes études.
          </h2>
          <p className="auth-visuel__slogan">
            Notes, échéances, révisions et objectifs — tout au même endroit,
            clair et organisé.
          </p>
        </div>

        <div className="auth-visuel__carte">
          <span className="auth-visuel__carte-icone">📈</span>
          <span className="auth-visuel__carte-texte">
            <strong>Suis ta moyenne en temps réel</strong> et vise tes objectifs
            sans stress.
          </span>
        </div>
      </aside>

      {/* ================= Colonne DROITE : formulaire ================= */}
      <main className="auth-panneau">
        <form onSubmit={soumettre} className="auth-form">
          <h1 className="auth-titre">Bon retour 👋</h1>
          <p className="auth-sous-titre">
            Connecte-toi pour accéder à ton espace.
          </p>

          {erreur && <p className="auth-erreur">⚠️ {erreur}</p>}

          {/* Email */}
          <div className="auth-champ">
            <label htmlFor="email" className="auth-label">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="auth-input"
              placeholder="ton@email.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Mot de passe + bouton afficher/masquer (icône SVG) */}
          <div className="auth-champ">
            <label htmlFor="motDePasse" className="auth-label">
              Mot de passe
            </label>
            <div className="auth-mdp">
              <input
                id="motDePasse"
                type={voirMdp ? "text" : "password"}
                className="auth-input"
                placeholder="••••••••"
                autoComplete="current-password"
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                required
              />
              <button
                type="button"
                className="auth-mdp__toggle"
                onClick={() => setVoirMdp((v) => !v)}
                aria-label={
                  voirMdp
                    ? "Masquer le mot de passe"
                    : "Afficher le mot de passe"
                }
              >
                {voirMdp ? <IconeOeilBarre /> : <IconeOeil />}
              </button>
            </div>
          </div>

          <div className="auth-oublie">
            <Link to="/mot-de-passe-oublie">Mot de passe oublié ?</Link>
          </div>

          <button type="submit" className="auth-bouton" disabled={envoi}>
            {envoi && <span className="auth-spinner" />}
            {envoi ? "Connexion…" : "Se connecter"}
          </button>

          <p className="auth-bas">
            Pas encore de compte ? <Link to="/register">Créer un compte</Link>
          </p>
        </form>
      </main>
    </div>
  );
};

export default LoginPage;
