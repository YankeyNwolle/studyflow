// =============================================================================
// main.jsx — Point d'entrée de l'application React
// -----------------------------------------------------------------------------
// C'est le tout premier fichier JS exécuté. Il "monte" le composant <App />
// dans la div #root de index.html, en l'enveloppant des fournisseurs globaux.
// =============================================================================

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import App from './App.jsx';
import './styles/global.css'; // reset + styles de base

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* BrowserRouter : active le système de routes (URLs). */}
    <BrowserRouter>
      {/* AuthProvider : rend l'utilisateur connecté disponible partout. */}
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
