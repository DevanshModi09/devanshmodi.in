import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Forwards to `vercel dev --listen 3001` running the api/ functions,
      // so the local Vite server keeps serving its own dev module graph
      // instead of routing through vercel dev's production-style rewrites.
      '/api': 'http://localhost:3001',
    },
  },
});
