// =============================================================================
// LoginPage.jsx — Formulaire de connexion (mise en page 2 colonnes)
// -----------------------------------------------------------------------------
// À GAUCHE : une image d'illustration.
// À DROITE : le formulaire de connexion.
//
// 👉 POUR METTRE TON IMAGE :
//    Dépose ton fichier dans  frontend/public/images/  et nomme-le
//    "login.jpg" (ou change le nom dans la variable IMAGE_LOGIN ci-dessous).
//    Ex de chemin final : frontend/public/images/login.jpg
//    Comme il est dans /public, on y accède par l'URL  /images/login.jpg
// =============================================================================
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

// Chemin de l'image (fichier placé dans public/images/). Change juste le nom
// si ton fichier s'appelle autrement.
const IMAGE_LOGIN = "/images/studyflow.jpg";

const LoginPage = () => {
  const { seConnecter } = useAuth();

  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
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
    <div style={styles.page}>
      {/* ---- Colonne GAUCHE : image ---- */}
      <div style={styles.colonneImage}>
        {/* Le dégradé sert de fond de secours si l'image n'est pas encore là. */}
        <img
          src={IMAGE_LOGIN}
          alt="Illustration StudyFlow"
          style={styles.image}
          // Si l'image est absente, on la masque (le dégradé reste visible).
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
        <div style={styles.overlay}>
          <h2 style={styles.slogan}>StudyFlow</h2>
          <p style={styles.sousSlogan}>
            Organise tes études, suis ta progression.
          </p>
        </div>
      </div>

      {/* ---- Colonne DROITE : formulaire ---- */}
      <div style={styles.colonneForm}>
        <form onSubmit={soumettre} style={styles.carte}>
          <h1 style={styles.titre}>Connexion</h1>

          {erreur && <p style={styles.erreur}>{erreur}</p>}

          <label style={styles.label}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />

          <label style={styles.label}>Mot de passe</label>
          <input
            type="password"
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            required
            style={styles.input}
          />

          <button type="submit" disabled={envoi} style={styles.bouton}>
            {envoi ? "Connexion…" : "Se connecter"}
          </button>

          <p style={styles.lien}>
            Pas encore de compte ? <Link to="/register">S'inscrire</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

const styles = {
  // La page occupe EXACTEMENT la hauteur de l'écran (pas plus) : pas de scroll.
  page: { height: "100vh", display: "flex", overflow: "hidden" },

  // Colonne image : moitié gauche. En dessous de 768px, on la cachera (voir note).
  colonneImage: {
    flex: 1,
    position: "relative",
    background: "linear-gradient(135deg, #3B82F6 0%, #1e3a8a 100%)",
    display: "flex",
    alignItems: "flex-end",
    overflow: "hidden",
  },
  image: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  overlay: {
    position: "relative",
    padding: 40,
    color: "#fff",
    textShadow: "0 1px 4px rgba(0,0,0,.4)",
  },
  slogan: { margin: 0, fontSize: 40 },
  sousSlogan: { margin: "8px 0 0", fontSize: 18, opacity: 0.95 },

  // Colonne formulaire : moitié droite, fond blanc, contenu centré.
  colonneForm: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#fff",
    padding: 24,
  },
  // Le formulaire est posé directement sur la page (plus de box ni d'ombre).
  carte: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    maxWidth: 360,
  },
  titre: { margin: "0 0 24px", fontSize: 28 },
  label: { fontSize: 14, marginBottom: 4, color: "#374151" },
  input: {
    padding: 10,
    marginBottom: 16,
    border: "1px solid #d1d5db",
    borderRadius: 8,
  },
  bouton: {
    padding: 12,
    background: "#3B82F6",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 600,
  },
  erreur: {
    background: "#fee2e2",
    color: "#b91c1c",
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 14,
  },
  lien: { textAlign: "center", fontSize: 14, marginTop: 16 },
};

export default LoginPage;
