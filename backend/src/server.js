import "dotenv/config"; // charge les variables du fichier .env dans process.env
import app from "./app.js";
import { testConnection } from "./config/db.js";

// Port : pris depuis .env, sinon 5000 par défaut.
const PORT = process.env.PORT || 5000;

// On teste la connexion à PostgreSQL, PUIS on démarre le serveur.
testConnection().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Serveur StudyFlow démarré sur http://localhost:${PORT}`);
    console.log(`   Test : http://localhost:${PORT}/api/health`);
  });
});
