import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Proxy API calls to FastAPI during local development
    proxy: {
      '/upload': 'http://127.0.0.1:8000',
      '/demo': 'http://127.0.0.1:8000',
      '/analyze': 'http://127.0.0.1:8000',
      '/datasets': 'http://127.0.0.1:8000',
    }
  }
})
