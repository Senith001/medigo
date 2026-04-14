import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api/auth':         { target: 'http://localhost:5002', changeOrigin: true },
      '/api/appointments': { target: 'http://localhost:5003', changeOrigin: true },
      '/api/notifications':{ target: 'http://localhost:5004', changeOrigin: true },
    },
  },
})
