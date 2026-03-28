import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use(config => {
  const token = localStorage.getItem('medigo_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('medigo_token')
      localStorage.removeItem('medigo_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const authAPI = {
  register: (data) => api.post('/auth/register/patient', data),
  verifyOtp: (data) => api.post('/auth/verify-otp', data),
  login: (data) => api.post('/auth/login', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  getMe: () => api.get('/auth/me'),
}

export const patientAPI = {
  getProfile: () => api.get('/patients/me'),
  updateProfile: (data) => api.put('/patients/me', data),
  uploadPicture: (formData) => api.post('/patients/me/profile-picture', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deletePicture: () => api.delete('/patients/me/profile-picture'),
  getAllPatients: () => api.get('/patients'),
  getPatientById: (id) => api.get(`/patients/${id}`),
  deletePatient: (id) => api.delete(`/patients/${id}`),
}

export const doctorAPI = {
  login: (data) => api.post('/doctors/login', data),
  getAll: (params) => api.get('/doctors', { params }),
  search: (params) => api.get('/doctors/search', { params }),
  getById: (id) => api.get(`/doctors/${id}`),
  register: (data) => api.post('/doctors/register', data),
  getMyProfile: () => api.get('/doctors/me/profile'),
  updateMyProfile: (data) => api.put('/doctors/me/profile', data),
  getMyAppointments: () => api.get('/doctors/me/appointments'),
  updateAppointmentStatus: (id, data) => api.put(`/doctors/appointments/${id}/status`, data),
  getAvailability: (doctorId) => api.get(`/availability/${doctorId}`),
  getMyAvailability: () => api.get('/availability/me'),
  updateMyAvailability: (data) => api.put('/availability/me', data),
  adminGetAll: (params) => api.get('/doctors/admin/all', { params }),
  verify: (id) => api.put(`/doctors/admin/${id}/verify`),
  toggle: (id) => api.put(`/doctors/admin/${id}/toggle`),
}

export const appointmentAPI = {
  book: (data) => api.post('/appointments', data),
  getMy: (params) => api.get('/appointments', { params }),
  getById: (id) => api.get(`/appointments/${id}`),
  modify: (id, data) => api.put(`/appointments/${id}`, data),
  cancel: (id, data) => api.put(`/appointments/${id}/cancel`, data),
  updateStatus: (id, data) => api.put(`/appointments/${id}/status`, data),
  getAvailability: (doctorId, date) => api.get(`/appointments/doctor/${doctorId}/availability`, { params: { date } }),
  getAll: (params) => api.get('/appointments/admin/all', { params }),
}

export const paymentAPI = {
  create: (data) => api.post('/payments', data),
  getById: (id) => api.get(`/payments/${id}`),
  getByPatient: (patientId) => api.get(`/payments/patient/${patientId}`),
  handleSuccess: (sessionId) => api.get(`/payments/success?session_id=${sessionId}`),
  handleCancel: (sessionId) => api.get(`/payments/cancel?session_id=${sessionId}`),
}

export const reportAPI = {
  upload: (formData) => api.post('/reports/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getMy: (params) => api.get('/reports/my', { params }),
  getById: (id) => api.get(`/reports/${id}`),
  download: (id) => api.get(`/reports/${id}/download`, { responseType: 'blob' }),
  share: (id, data) => api.put(`/reports/${id}/share`, data),
  addNotes: (id, data) => api.put(`/reports/${id}/notes`, data),
  delete: (id) => api.delete(`/reports/${id}`),
  getByPatient: (patientId) => api.get(`/reports/patient/${patientId}`),
}

export const adminAPI = {
  login: (data) => api.post('/admin/login', data),
  bootstrapSuperAdmin: (data) => api.post('/admin/bootstrap-superadmin', data),
  createAdmin: (data) => api.post('/admin/create', data),
  getAdmins: () => api.get('/admin/list'),
  getPatients: () => api.get('/admin/patients'),
  deleteAdmin: (id) => api.delete(`/admin/admins/${id}`),
  deletePatient: (id) => api.delete(`/admin/patients/${id}`),
}

export const prescriptionAPI = {
  create: (data) => api.post('/prescriptions', data),
  getMy: () => api.get('/prescriptions/my'),
  getByPatient: (patientId) => api.get(`/prescriptions/patient/${patientId}`),
  getByAppointment: (appointmentId) => api.get(`/prescriptions/appointment/${appointmentId}`),
  getById: (id) => api.get(`/prescriptions/${id}`),
  update: (id, data) => api.put(`/prescriptions/${id}`, data),
}

export default api