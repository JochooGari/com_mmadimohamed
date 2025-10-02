import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      // Proxy des fonctions serverless locales (vercel dev) pour l'UI Vite
      '/api': {
        // Utilise VITE_API_BASE si défini, sinon localhost:3000 (vercel dev)
        target: process.env.VITE_API_BASE || 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
