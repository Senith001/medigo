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
}

export const adminAPI = {
  adminLogin: (data) => api.post('/api/admin/login', data),
  bootstrapSuperAdmin: (data, key) => api.post('/api/admin/bootstrap-superadmin', data, {
    headers: { 'x-admin-super-key': key },
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
  getById: (id) => api.get(`/api/appointments/${id}`),
  modify: (id, data) => api.put(`/api/appointments/${id}`, data),
  cancel: (id, reason) => api.put(`/api/appointments/${id}/cancel`, { reason }),
  updateStatus: (id, data) => api.put(`/api/appointments/${id}/status`, data),
  getAvailability: (doctorId, date) => api.get(
    `/api/appointments/doctor/${doctorId}/availability`,
    { params: { date } }
  ),
  searchDoctors: (specialty) => api.get('/api/appointments/search', { params: { specialty } }),
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
  approve: (id) => api.put(`/api/payments/${id}/approve`),
  reject: (id, data) => api.put(`/api/payments/${id}/reject`, data),
  refund: (id, data) => api.put(`/api/payments/${id}/refund`, data),
}

export const telemedicineAPI = {
  create: (data) => api.post('/api/telemedicine', data),
  getByAppt: (apptId) => api.get(`/api/telemedicine/appointment/${apptId}`),
  join: (id) => api.put(`/api/telemedicine/${id}/join`),
  updateStatus: (id, status) => api.put(`/api/telemedicine/${id}/status`, { status }),
}

export const reportAPI = {
  upload: (data) => api.post('/api/reports', data),
  getByPatient: (patientId) => api.get(`/api/reports/patient/${patientId}`),
  getByDoctor: (doctorId) => api.get(`/api/reports/doctor/${doctorId}`),
}

export default api