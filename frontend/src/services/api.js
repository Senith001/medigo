import axios from 'axios'

const api = axios.create({ baseURL: '/api', headers: { 'Content-Type': 'application/json' } })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) { localStorage.removeItem('token'); window.location.href = '/login' }
    return Promise.reject(err)
  }
)

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
}

export const appointmentAPI = {
  book:            (data)       => api.post('/appointments', data),
  getAll:          (params)     => api.get('/appointments', { params }),
  getById:         (id)         => api.get(`/appointments/${id}`),
  modify:          (id, data)   => api.put(`/appointments/${id}`, data),
  cancel:          (id, reason) => api.put(`/appointments/${id}/cancel`, { reason }),
  updateStatus:    (id, data)   => api.put(`/appointments/${id}/status`, data),
  getAvailability: (doctorId, date) => api.get(`/appointments/doctor/${doctorId}/availability`, { params: { date } }),
  searchDoctors:   (specialty)  => api.get('/appointments/search', { params: { specialty } }),
}

export default api
