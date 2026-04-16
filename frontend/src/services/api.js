import axios from 'axios'

// Service URLs (Local Dev Environment)
const AUTH_URL     = 'http://localhost:5001'
const PATIENT_URL  = 'http://localhost:5002'
const ADMIN_URL    = 'http://localhost:5003'
const DOCTOR_URL   = 'http://localhost:5004'
const APPT_URL     = 'http://localhost:5005'
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
      localStorage.removeItem('token'); 
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/admin-login') {
        window.location.href = currentPath.startsWith('/admin') ? '/admin-login' : '/login';
      }
    }
    return Promise.reject(err);
  }
);

// ── Auth Service ──────────────────────────────────────────────
export const authAPI = {
  login:            (data) => api.post(`${AUTH_URL}/api/auth/login`, data),
  register:         (data) => api.post(`${AUTH_URL}/api/auth/register/patient`, data),
  verifyOtp:        (data) => api.post(`${AUTH_URL}/api/auth/verify-otp`, data),
  getMe:            () => api.get(`${AUTH_URL}/api/auth/me`),
  changePassword:   (data) => api.put(`${AUTH_URL}/api/auth/change-password`, data),
  requestDeleteOtp: () => api.post(`${AUTH_URL}/api/auth/me/request-delete-otp`),
  deleteMyAccount:  (data) => api.delete(`${AUTH_URL}/api/auth/me`, { data }),
  setupAdminPassword: (data) => api.post(`${AUTH_URL}/api/auth/setup-password`, data),
}

// ── Admin Service ─────────────────────────────────────────────
export const adminAPI = {
  getPatients: () => api.get(`${ADMIN_URL}/api/admin/patients`),
  getPatientById: (id) => api.get(`${ADMIN_URL}/api/admin/patients/${id}`),
  deletePatient: (id) => api.delete(`${ADMIN_URL}/api/admin/patients/${id}`),
  getDoctors: () => api.get(`${ADMIN_URL}/api/admin/doctors`),
  updateDoctorStatus: (id, status) => api.patch(`${ADMIN_URL}/api/admin/doctors/${id}/status`, { status }),
  deleteDoctor: (id) => api.delete(`${ADMIN_URL}/api/admin/doctors/${id}`),
  getAdminsList: () => api.get(`${ADMIN_URL}/api/admin/list`),
  createAdmin: (data) => api.post(`${ADMIN_URL}/api/admin/create`, data),
  toggleAdminStatus: (id) => api.patch(`${ADMIN_URL}/api/admin/admins/${id}/status`),
  resendInvitation: (id) => api.post(`${ADMIN_URL}/api/admin/admins/${id}/resend-invitation`),
  adminLogin: (data) => api.post(`${ADMIN_URL}/api/admin/login`, data),
  bootstrapSuperAdmin: (data, superKey) => api.post(`${ADMIN_URL}/api/admin/bootstrap-superadmin`, data, {
    headers: { 'x-admin-super-key': superKey }
  }),
}

// ── Patient Service ───────────────────────────────────────────
export const patientAPI = {
  getMyProfile: () => api.get(`${PATIENT_URL}/api/patients/me`),
  updateMyProfile: (data) => api.put(`${PATIENT_URL}/api/patients/me`, data),
}

// ── Appointment Service ───────────────────────────────────────
export const appointmentAPI = {
  book:            (data)       => api.post(`${APPT_URL}/api/appointments`, data),
  getAll:          (params)     => api.get(`${APPT_URL}/api/appointments`, { params }),
  getById:         (id)         => api.get(`${APPT_URL}/api/appointments/${id}`),
  modify:          (id, data)   => api.put(`${APPT_URL}/api/appointments/${id}`, data),
  cancel:          (id, reason) => api.put(`${APPT_URL}/api/appointments/${id}/cancel`, { reason }),
  updateStatus:    (id, data)   => api.put(`${APPT_URL}/api/appointments/${id}/status`, data),
  getAvailability: (doctorId, date) => api.get(`${APPT_URL}/api/appointments/doctor/${doctorId}/availability`, { params: { date } }),
  searchDoctors:   (specialty)  => api.get(`${APPT_URL}/api/appointments/search`, { params: { specialty } }),
}

// ── Doctor Service ──────────────────────────────────────────── (Re-Integrated)
export const doctorAPI = {
  register:    (data) => api.post(`${DOCTOR_URL}/api/doctors`, data),
  getProfiles: (params) => api.get(`${DOCTOR_URL}/api/doctors`, { params }),
  getById:     (id)     => api.get(`${DOCTOR_URL}/api/doctors/${id}`),
  getProfileByEmail: (email) => api.get(`${DOCTOR_URL}/api/doctors/profile/${email}`),
  getAvailability: (doctorId) => api.get(`${DOCTOR_URL}/api/doctors/${doctorId}/availability`),
  addAvailability: (doctorId, data) => api.post(`${DOCTOR_URL}/api/doctors/${doctorId}/availability`, data),
  deleteAvailability: (id) => api.delete(`${DOCTOR_URL}/api/doctors/availability/${id}`),
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

// ── Report Service ──────────────────────────────────────────── (Re-Integrated)
export const reportAPI = {
  upload:       (data) => api.post(`${REPORT_URL}/api/reports`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getByPatient: (patientId) => api.get(`${REPORT_URL}/api/reports/patient/${patientId}`),
}

export default api