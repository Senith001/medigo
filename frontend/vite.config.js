import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// User's ports
const AUTH_URL     = 'http://localhost:5002'
const PATIENT_URL  = 'http://localhost:5001'
const APPT_URL     = 'http://localhost:5003'
const NOTIF_URL    = 'http://localhost:3005'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api/auth':          { target: AUTH_URL, changeOrigin: true },
      '/api/appointments':  { target: APPT_URL, changeOrigin: true },
      '/api/notifications': { target: NOTIF_URL, changeOrigin: true },
      '/api/patients':      { target: PATIENT_URL, changeOrigin: true },
    },
  },
})
