import axios from 'axios'


const makeInstance = () => {
  const instance = axios.create()

  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`

    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    } else {
      config.headers['Content-Type'] = 'application/json'
    }

    return config
  })

  instance.interceptors.response.use(
    (res) => res,
    (err) => {
      if (err.response?.status === 401) {
        localStorage.removeItem('token')
        const path = window.location.pathname
        if (path !== '/login' && path !== '/admin-login') {
          window.location.href = path.startsWith('/admin') ? '/admin-login' : '/login'
        }

// Service URLs (Pulled from Vite Environment Variables)
const AUTH_URL     = import.meta.env.VITE_AUTH_API_URL     || 'http://localhost:5001'
const PATIENT_URL  = import.meta.env.VITE_PATIENT_API_URL  || 'http://localhost:5002'
const ADMIN_URL    = import.meta.env.VITE_ADMIN_API_URL    || 'http://localhost:5003'
const DOCTOR_URL   = import.meta.env.VITE_DOCTOR_API_URL   || 'http://localhost:5004'
const APPT_URL     = import.meta.env.VITE_APPT_API_URL     || 'http://localhost:5005'
const REPORT_URL   = import.meta.env.VITE_REPORT_API_URL   || 'http://localhost:5006'
const PAYMENT_URL  = import.meta.env.VITE_PAYMENT_API_URL  || 'http://localhost:5007'
const TELE_URL     = import.meta.env.VITE_TELE_API_URL     || 'http://localhost:5008'

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
      localStorage.removeItem('token'); 
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/admin-login') {
        window.location.href = currentPath.startsWith('/admin') ? '/admin-login' : '/login';

      }
      return Promise.reject(err)
    }
  )

  return instance
}

const api = makeInstance()

export const authAPI = {

  login: (data) => api.post('/api/auth/login', data),
  register: (data) => api.post('/api/auth/register/patient', data),
  verifyOtp: (data) => api.post('/api/auth/verify-otp', data),
  getMe: () => api.get('/api/auth/me'),
  changePassword: (data) => api.put('/api/auth/change-password', data),
  requestDeleteOtp: () => api.post('/api/auth/me/request-delete-otp'),
  deleteMyAccount: (data) => api.delete('/api/auth/me', { data }),
  setupAdminPassword: (data) => api.post('/api/auth/setup-password', data),

  login:            (data) => api.post(`${AUTH_URL}/api/auth/login`, data),
  register:         (data) => api.post(`${AUTH_URL}/api/auth/register/patient`, data),
  verifyOtp:        (data) => api.post(`${AUTH_URL}/api/auth/verify-otp`, data),
  getMe:            () => api.get(`${AUTH_URL}/api/auth/me`),
  changePassword:   (data) => api.put(`${AUTH_URL}/api/auth/change-password`, data),
  requestDeleteOtp: () => api.post(`${AUTH_URL}/api/auth/me/request-delete-otp`),
  deleteMyAccount:  (data) => api.delete(`${AUTH_URL}/api/auth/me`, { data }),
  setupAdminPassword: (data) => api.post(`${AUTH_URL}/api/auth/setup-password`, data),

}

export const adminAPI = {

  adminLogin: (data) => api.post('/api/admin/login', data),
  bootstrapSuperAdmin: (data, key) => api.post('/api/admin/bootstrap-superadmin', data, {
    headers: { 'x-admin-super-key': key },

  getPatients: () => api.get(`${ADMIN_URL}/api/admin/patients`),
  getPatientById: (id) => api.get(`${ADMIN_URL}/api/admin/patients/${id}`),
  deletePatient: (id) => api.delete(`${ADMIN_URL}/api/admin/patients/${id}`),
  getDoctors: () => api.get(`${ADMIN_URL}/api/admin/doctors`),
  updateDoctorStatus: (id, status) => api.patch(`${ADMIN_URL}/api/admin/doctors/${id}/status`, { status }),
  getAdminsList: () => api.get(`${ADMIN_URL}/api/admin/list`),
  createAdmin: (data) => api.post(`${ADMIN_URL}/api/admin/create`, data),
  toggleAdminStatus: (id) => api.patch(`${ADMIN_URL}/api/admin/admins/${id}/status`),
  resendInvitation: (id) => api.post(`${ADMIN_URL}/api/admin/admins/${id}/resend-invitation`),
  adminLogin: (data) => api.post(`${ADMIN_URL}/api/admin/login`, data),
  bootstrapSuperAdmin: (data, superKey) => api.post(`${ADMIN_URL}/api/admin/bootstrap-superadmin`, data, {
    headers: { 'x-admin-super-key': superKey }

  }),
  createAdmin: (data) => api.post('/api/admin/create', data),
  getAdminsList: () => api.get('/api/admin/list'),
  toggleAdminStatus: (id) => api.patch(`/api/admin/admins/${id}/status`),
  resendInvitation: (id) => api.post(`/api/admin/admins/${id}/resend-invitation`),
  getPatients: () => api.get('/api/admin/patients'),
  getPatientById: (id) => api.get(`/api/admin/patients/${id}`),
  deletePatient: (id) => api.delete(`/api/admin/patients/${id}`),
  getDoctors: () => api.get('/api/admin/doctors'),
  updateDoctorStatus: (id, status) => api.patch(`/api/admin/doctors/${id}/status`, { status }),
  deleteDoctor: (id) => api.delete(`/api/admin/doctors/${id}`),
}

export const patientAPI = {
  getMyProfile: () => api.get('/api/patients/me'),
  updateMyProfile: (data) => api.put('/api/patients/me', data),
}

export const appointmentAPI = {

  book: (data) => api.post('/api/appointments', data),
  getAll: (params) => api.get('/api/appointments', { params }),
  getAllAdmin: (params) => api.get('/api/appointments/admin/all', { params }),
  getById: (id) => api.get(`/api/appointments/${id}`),
  modify: (id, data) => api.put(`/api/appointments/${id}`, data),
  cancel: (id, reason) => api.put(`/api/appointments/${id}/cancel`, { reason }),
  updateStatus: (id, data) => api.put(`/api/appointments/${id}/status`, data),
  getAvailability: (doctorId, date) => api.get(
    `/api/appointments/doctor/${doctorId}/availability`,
    { params: { date } }
  ),
  searchDoctors: (specialty) => api.get('/api/appointments/search', { params: { specialty } }),

  book:            (data)       => api.post(`${APPT_URL}/api/appointments`, data),
  getAll:          (params)     => api.get(`${APPT_URL}/api/appointments`, { params }),
  getById:         (id)         => api.get(`${APPT_URL}/api/appointments/${id}`),
  modify:          (id, data)   => api.put(`${APPT_URL}/api/appointments/${id}`, data),
  cancel:          (id, reason) => api.put(`${APPT_URL}/api/appointments/${id}/cancel`, { reason }),
  updateStatus:    (id, data)   => api.put(`${APPT_URL}/api/appointments/${id}/status`, data),
  getAvailability: (doctorId, date) => api.get(`${APPT_URL}/api/appointments/doctor/${doctorId}/availability`, { params: { date } }),
  searchDoctors:   (specialty)  => api.get(`${APPT_URL}/api/appointments/search`, { params: { specialty } }),

}

export const doctorAPI = {

  register: (data) => api.post('/api/doctors', data),
  getProfiles: (params) => api.get('/api/doctors', { params }),
  getMyProfile: () => api.get('/api/doctors/me'),
  getById: (id) => api.get(`/api/doctors/${id}`),
  getProfileByEmail: (email) => api.get(`/api/doctors/profile/${email}`),
  getAvailability: (doctorId) => api.get(`/api/doctors/${doctorId}/availability`),
  addAvailability: (doctorId, data) => api.post(`/api/doctors/${doctorId}/availability`, data),
  deleteAvailability: (id) => api.delete(`/api/doctors/availability/${id}`),
}

export const paymentAPI = {
  createSession: (data) => api.post('/api/payments', data),
  bankTransfer: (data) => api.post('/api/payments/bank-transfer', data),
  getById: (id) => api.get(`/api/payments/${id}`),
  getByPatient: (patientId) => api.get(`/api/payments/patient/${patientId}`),
  // ✅ FIXED: /admin/pending → /pending-transfers (proxy conflict fix)
  getPendingTransfers: () => api.get('/api/payments/pending-transfers'),
  getAllPayments: (params) => api.get('/api/payments/all', { params }),
  approve: (id) => api.put(`/api/payments/${id}/approve`),
  reject: (id, data) => api.put(`/api/payments/${id}/reject`, data),
  refund: (id, data) => api.put(`/api/payments/${id}/refund`, data),
}

export const telemedicineAPI = {
  create: (data) => api.post('/api/telemedicine', data),
  getByAppt: (apptId) => api.get(`/api/telemedicine/appointment/${apptId}`),
  join: (id) => api.put(`/api/telemedicine/${id}/join`),
  updateStatus: (id, status) => api.put(`/api/telemedicine/${id}/status`, { status }),

  register:    (data) => api.post(`${DOCTOR_URL}/api/doctors`, data),
  getProfiles: (params) => api.get(`${DOCTOR_URL}/api/doctors`, { params }),
  getMyProfile: ()       => api.get(`${DOCTOR_URL}/api/doctors/me`),
  getById:     (id)     => api.get(`${DOCTOR_URL}/api/doctors/${id}`),
}

// ── Payment Service ─────────────────────────────────────────── (Re-Integrated)
export const paymentAPI = {
  createSession: (data) => api.post(`${PAYMENT_URL}/api/payments`, data),
  bankTransfer:  (data) => api.post(`${PAYMENT_URL}/api/payments/bank-transfer`, data, { 
    headers: { 'Content-Type': 'multipart/form-data' } 
  }),
}

// ── Telemedicine Service ────────────────────────────────────── (Re-Integrated)
export const telemedicineAPI = {
  create:       (data) => api.post(`${TELE_URL}/api/telemedicine`, data),
  getByAppt:    (apptId) => api.get(`${TELE_URL}/api/telemedicine/appointment/${apptId}`),
  join:         (id) => api.put(`${TELE_URL}/api/telemedicine/${id}/join`),
  updateStatus: (id, status) => api.put(`${TELE_URL}/api/telemedicine/${id}/status`, { status }),

}

export const reportAPI = {

  upload: (data) => api.post('/api/reports', data),
  getByPatient: (patientId) => api.get(`/api/reports/patient/${patientId}`),
  getByDoctor: (doctorId) => api.get(`/api/reports/doctor/${doctorId}`),
}

export const prescriptionAPI = {
  create: (data) => api.post('/api/prescriptions', data),
  getAll: () => api.get('/api/prescriptions'),
  getById: (id) => api.get(`/api/prescriptions/${id}`),
  getByPatient: (patientId) => api.get(`/api/prescriptions/patient/${patientId}`),
  update: (id, data) => api.put(`/api/prescriptions/${id}`, data),
  remove: (id) => api.delete(`/api/prescriptions/${id}`),

  upload:       (data) => api.post(`${REPORT_URL}/api/reports`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getByPatient: (patientId) => api.get(`${REPORT_URL}/api/reports/patient/${patientId}`),

}

export default api