import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://192.168.32.138:8080',
        changeOrigin: true,
        timeout: 120000,
        proxyTimeout: 120000
      }
    }
  }
});

