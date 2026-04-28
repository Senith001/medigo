import axios from 'axios'

const api = axios.create()

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`

  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']
  } else {
    config.headers['Content-Type'] = 'application/json'
  }

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

export const authAPI = {
  login: (data) => api.post('/api/auth/login', data),
  register: (data) => api.post('/api/auth/register/patient', data),
  registerDoctor: (data) => api.post('/api/auth/register/doctor', data),
  verifyOtp: (data) => api.post('/api/auth/verify-otp', data),
  getMe: () => api.get('/api/auth/me'),
  changePassword: (data) => api.put('/api/auth/change-password', data),
  requestDeleteOtp: () => api.post('/api/auth/me/request-delete-otp'),
  deleteMyAccount: (data) => api.delete('/api/auth/me', { data }),
  setupAdminPassword: (data) => api.post('/api/auth/setup-password', data),
  forgotPassword: (data) => api.post('/api/auth/forgot-password', data),
  resetPassword: (data) => api.post('/api/auth/reset-password', data),
  verifyResetOtp: (data) => api.post('/api/auth/verify-reset-otp', data)
}

export const adminAPI = {
  adminLogin: (data) => api.post('/api/admin/login', data),
  bootstrapSuperAdmin: (data, key) =>
    api.post('/api/admin/bootstrap-superadmin', data, {
      headers: { 'x-admin-super-key': key }
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
  deleteDoctor: (id) => api.delete(`/api/admin/doctors/${id}`)
}

export const patientAPI = {
  getMyProfile: () => api.get('/api/patients/me'),
  updateMyProfile: (data) => api.put('/api/patients/me', data)
}

export const appointmentAPI = {
  book: (data) => api.post('/api/appointments', data),
  getAll: (params) => api.get('/api/appointments', { params }),
  getAllAdmin: (params) => api.get('/api/appointments/admin/all', { params }),
  getById: (id) => api.get(`/api/appointments/${id}`),
  modify: (id, data) => api.put(`/api/appointments/${id}`, data),
  cancel: (id, reason) => api.put(`/api/appointments/${id}/cancel`, { reason }),
  updateStatus: (id, data) => api.put(`/api/appointments/${id}/status`, data),
  getAvailability: (doctorId, date) =>
    api.get(`/api/appointments/doctor/${doctorId}/availability`, {
      params: { date }
    }),
  searchDoctors: (specialty) => api.get('/api/appointments/search', { params: { specialty } })
}

export const doctorAPI = {
  register: (data) => api.post('/api/doctors', data),
  getProfiles: (params) => api.get('/api/doctors', { params }),
  getMyProfile: () => api.get('/api/doctors/me'),
  updateMyProfile: (data) => api.put('/api/doctors/me', data),
  getById: (id) => api.get(`/api/doctors/${id}`),
  getProfileByEmail: (email) => api.get(`/api/doctors/profile/${email}`),

  getAvailability: (doctorId) => api.get(`/api/availability/doctor/${doctorId}`),

  addAvailability: (doctorIdOrData, data) => {
    const payload = data ? { ...data, doctorId: doctorIdOrData } : doctorIdOrData
    return api.post('/api/availability', payload)
  },

  deleteAvailability: (id) => api.delete(`/api/availability/${id}`)
}

export const paymentAPI = {
  createSession: (data) => api.post('/api/payments', data),
  bankTransfer: (data) => api.post('/api/payments/bank-transfer', data),
  getById: (id) => api.get(`/api/payments/${id}`),
  getByPatient: (patientId) => api.get(`/api/payments/patient/${patientId}`),
  getPendingTransfers: () => api.get('/api/payments/pending-transfers'),
  getAllPayments: (params) => api.get('/api/payments/all', { params }),
  approve: (id) => api.put(`/api/payments/${id}/approve`),
  reject: (id, data) => api.put(`/api/payments/${id}/reject`, data),
  refund: (id, data) => api.put(`/api/payments/${id}/refund`, data),
  cancelSession: (sessionId) => api.get('/api/payments/cancel', { params: { session_id: sessionId } }),
}

export const telemedicineAPI = {
  create: (data) => api.post('/api/telemedicine', data),
  getByAppt: (apptId) => api.get(`/api/telemedicine/appointment/${apptId}`),
  join: (id) => api.put(`/api/telemedicine/${id}/join`),
  updateStatus: (id, status) => api.put(`/api/telemedicine/${id}/status`, { status })
}

export const reportAPI = {
  upload: (data) =>
    api.post('/api/reports', data),
  getAll: () => api.get('/api/reports'),
  getById: (id) => api.get(`/api/reports/${id}`),
  getByPatient: (patientId) => api.get(`/api/reports/patient/${patientId}`),
  getByDoctor: (doctorId) => api.get(`/api/reports/doctor/${doctorId}`),
  update: (id, data) => api.put(`/api/reports/${id}`, data),
  remove: (id) => api.delete(`/api/reports/${id}`)
}

export const prescriptionAPI = {
  create: (data) => api.post('/api/prescriptions', data),
  getAll: () => api.get('/api/prescriptions'),
  getById: (id) => api.get(`/api/prescriptions/${id}`),
  getByPatient: (patientId) => api.get(`/api/prescriptions/patient/${patientId}`),
  update: (id, data) => api.put(`/api/prescriptions/${id}`, data),
  remove: (id) => api.delete(`/api/prescriptions/${id}`)
}

export default api