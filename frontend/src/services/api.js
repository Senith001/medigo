import axios from 'axios'

// User's standard ports
const AUTH_URL     = 'http://localhost:5002'
const PATIENT_URL  = 'http://localhost:5001'
const APPT_URL     = 'http://localhost:5003'
const NOTIF_URL    = 'http://localhost:3005'
const DOCTOR_URL   = 'http://localhost:5005'
const ADMIN_URL    = 'http://localhost:5000'
const REPORT_URL   = 'http://localhost:5006'
const PAYMENT_URL  = 'http://localhost:5007'
const TELE_URL     = 'http://localhost:5008'

const api = axios.create({ baseURL: '/api', headers: { 'Content-Type': 'application/json' } })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      const path = window.location.pathname
      if (path !== '/login' && path !== '/admin-login') {
        window.location.href = path.startsWith('/admin') ? '/admin-login' : '/login'
      }
    }
    return Promise.reject(err)
  }
)

// ── Auth ──────────────────────────────────────────────────────
export const authAPI = {
  login:     (data) => api.post(`${AUTH_URL}/api/auth/login`, data),
  register:  (data) => api.post(`${AUTH_URL}/api/auth/register/patient`, data),
  verifyOtp: (data) => api.post(`${AUTH_URL}/api/auth/verify-otp`, data),
  createInternalUser: (data) => api.post(`${AUTH_URL}/api/auth/internal/users`, data, { 
    headers: { 'x-service-secret': 'medigo_super_secret_key' } 
  }),
}

// ── Appointments ──────────────────────────────────────────────
export const appointmentAPI = {
  book:            (data)            => api.post(`${APPT_URL}/api/appointments`, data),
  getAll:          (params)          => api.get(`${APPT_URL}/api/appointments`, { params }),
  getAllAdmin:      (params)          => api.get(`${APPT_URL}/api/appointments/admin/all`, { params }),
  getById:         (id)              => api.get(`${APPT_URL}/api/appointments/${id}`),
  modify:          (id, data)        => api.put(`${APPT_URL}/api/appointments/${id}`, data),
  cancel:          (id, reason)      => api.put(`${APPT_URL}/api/appointments/${id}/cancel`, { reason }),
  updateStatus:    (id, data)        => api.put(`${APPT_URL}/api/appointments/${id}/status`, data),
  getAvailability: (doctorId, date)  => api.get(`${APPT_URL}/api/appointments/doctor/${doctorId}/availability`, { params: { date } }),
  getSchedule:     (doctorId, date)  => api.get(`${APPT_URL}/api/appointments/doctor/${doctorId}/schedule`, { params: { date } }),
  searchDoctors:   (specialty)       => api.get(`${APPT_URL}/api/appointments/search`, { params: { specialty } }),
}

// ── Doctor ───────────────────────────────────────────────────
export const doctorAPI = {
  getProfiles: (params) => api.get(`${DOCTOR_URL}/api/doctors`, { params }),
  getPending:  ()       => api.get(`${DOCTOR_URL}/api/doctors/pending`),
  getById:     (id)     => api.get(`${DOCTOR_URL}/api/doctors/${id}`),
  register:    (data)   => api.post(`${DOCTOR_URL}/api/doctors`, data),
  approve:     (id, data) => api.put(`${DOCTOR_URL}/api/doctors/${id}`, data),
}

// ── Payment ──────────────────────────────────────────────────
export const paymentAPI = {
  createSession:  (data) => api.post(`${PAYMENT_URL}/api/payments`, data),
  bankTransfer:   (data) => api.post(`${PAYMENT_URL}/api/payments/bank-transfer`, data, { 
    headers: { 'Content-Type': 'multipart/form-data' } 
  }),
  getHistory:     (patientId) => api.get(`${PAYMENT_URL}/api/payments/patient/${patientId}`),
  getPending:     () => api.get(`${PAYMENT_URL}/api/payments/admin/pending`),
  approve:        (id) => api.put(`${PAYMENT_URL}/api/payments/${id}/approve`),
  reject:         (id, data) => api.put(`${PAYMENT_URL}/api/payments/${id}/reject`, data),
}

// ── Telemedicine ──────────────────────────────────────────────
export const telemedicineAPI = {
  create:       (data) => api.post(`${TELE_URL}/api/telemedicine`, data),
  getByAppt:    (apptId) => api.get(`${TELE_URL}/api/telemedicine/appointment/${apptId}`),
  join:         (id) => api.put(`${TELE_URL}/api/telemedicine/${id}/join`),
  updateStatus: (id, status) => api.put(`${TELE_URL}/api/telemedicine/${id}/status`, { status }),
}

// ── Medical Reports ──────────────────────────────────────────
export const reportAPI = {
  upload:    (data) => api.post(`${REPORT_URL}/api/reports`, data, { 
    headers: { 'Content-Type': 'multipart/form-data' } 
  }),
  getByPatient: (patientId) => api.get(`${REPORT_URL}/api/reports/patient/${patientId}`),
  getById:      (id) => api.get(`${REPORT_URL}/api/reports/${id}`),
  delete:       (id) => api.delete(`${REPORT_URL}/api/reports/${id}`),
}

export default api