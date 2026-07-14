// =============================================================================
// vite.config.js — Configuration de Vite (serveur de dev + build React)
// =============================================================================
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // doit correspondre à CORS_ORIGIN côté backend
  },
});
