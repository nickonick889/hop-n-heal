import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // During dev, forward /api calls to the Express server so we avoid CORS issues
      '/api': 'http://localhost:5001',
    },
  },
})
