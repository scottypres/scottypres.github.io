import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/thermoproject/',
  build: {
    outDir: '.',
    emptyOutDir: false,
    rollupOptions: {
      input: 'index.dev.html',
    },
  },
});
