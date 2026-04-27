import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api/auth':         { target: 'http://localhost:30001', changeOrigin: true },
      '/api/admin':        { target: 'http://localhost:30002', changeOrigin: true },
      '/api/patients':     { target: 'http://localhost:30003', changeOrigin: true },
      '/api/doctors':      { target: 'http://localhost:30004', changeOrigin: true },  
      '/api/appointments': { target: 'http://localhost:30005', changeOrigin: true },
      '/api/notifications':{ target: 'http://localhost:30009', changeOrigin: true },
    },
  },
})
