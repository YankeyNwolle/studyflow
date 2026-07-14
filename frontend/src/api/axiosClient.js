// =============================================================================
// axiosClient.js — Instance axios centralisée pour parler au backend
// -----------------------------------------------------------------------------
// On configure UNE fois l'URL de base et un "intercepteur" qui ajoute
// automatiquement le jeton JWT (s'il existe) à chaque requête. Ainsi, les
// fichiers api/*.js n'ont pas à se soucier de l'authentification.
// =============================================================================

import axios from 'axios';

const axiosClient = axios.create({
  // On lit l'URL depuis .env, avec une valeur de repli si la variable manque
  // (évite une "Connexion impossible" si le .env n'a pas été chargé).
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Avant chaque requête : si un jeton est stocké, on l'ajoute dans l'en-tête.
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosClient;
