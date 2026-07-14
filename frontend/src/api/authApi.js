// =============================================================================
// authApi.js — Appels réseau liés à l'authentification
// -----------------------------------------------------------------------------
// Chaque fonction renvoie directement les données (response.data) pour
// simplifier l'usage dans les composants / le contexte.
// =============================================================================

import axiosClient from './axiosClient.js';

// POST /api/auth/register -> { utilisateur, token }
export const register = async (donnees) => {
  const { data } = await axiosClient.post('/auth/register', donnees);
  return data;
};

// POST /api/auth/login -> { utilisateur, token }
export const login = async (donnees) => {
  const { data } = await axiosClient.post('/auth/login', donnees);
  return data;
};

// GET /api/auth/me -> { utilisateur }  (nécessite un jeton valide)
export const getProfil = async () => {
  const { data } = await axiosClient.get('/auth/me');
  return data.utilisateur;
};
