import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {

      // API routes — most specific first
      '/api/appointments':     { target: 'http://localhost:5005', changeOrigin: true },
      '/api/payments':         { target: 'http://localhost:5007', changeOrigin: true },
      '/api/patients':         { target: 'http://localhost:5002', changeOrigin: true },
      '/api/doctors':          { target: 'http://localhost:5004', changeOrigin: true },
      '/api/admin':            { target: 'http://localhost:5003', changeOrigin: true },
      '/api/auth':             { target: 'http://localhost:5001', changeOrigin: true },
      '/api/reports':          { target: 'http://localhost:5006', changeOrigin: true },
      '/api/telemedicine':     { target: 'http://localhost:5008', changeOrigin: true },
      '/api/notifications':    { target: 'http://localhost:5009', changeOrigin: true },
      '/api/prescriptions':    { target: 'http://localhost:5004', changeOrigin: true },

      // Static file routes
      '/uploads/payment-slips': { target: 'http://localhost:5007', changeOrigin: true },
      '/uploads':               { target: 'http://localhost:5006', changeOrigin: true },

      // ⚠️ moved inside proxy (your 3000 ports)
      '/api/auth-old':         { target: 'http://localhost:30001', changeOrigin: true },
      '/api/admin-old':        { target: 'http://localhost:30002', changeOrigin: true },
      '/api/patients-old':     { target: 'http://localhost:30003', changeOrigin: true },
      '/api/doctors-old':      { target: 'http://localhost:30004', changeOrigin: true },
      '/api/appointments-old': { target: 'http://localhost:30005', changeOrigin: true },
      '/api/notifications-old':{ target: 'http://localhost:30009', changeOrigin: true }
    }
  }
})