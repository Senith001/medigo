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
    if (err.response?.status === 401) { 
      localStorage.removeItem('token'); 
      
      const currentPath = window.location.pathname;
      
      // FIX 2: Don't redirect if they are already on ANY login page
      if (currentPath !== '/login' && currentPath !== '/admin-login') {
        
        // If they were in the admin section, boot them to admin-login
        if (currentPath.startsWith('/admin')) {
          window.location.href = '/admin-login';
        } else {
          // Otherwise, boot them to the regular patient login
          window.location.href = '/login'; 
        }
      }
    }
    return Promise.reject(err);
  }
);

//===============================================================================
//                    Auth Service APIs (Port 5001)
//===============================================================================
export const authAPI = {
  login:            (data) => api.post('http://localhost:5001/api/auth/login', data),
  register:         (data) => api.post('http://localhost:5001/api/auth/register/patient', data),
  verifyOtp:        (data) => api.post('http://localhost:5001/api/auth/verify-otp', data),
  getMe:            () => api.get('http://localhost:5001/api/auth/me'),
  changePassword:   (data) => api.put('http://localhost:5001/api/auth/change-password', data),
  requestDeleteOtp: () => api.post('http://localhost:5001/api/auth/me/request-delete-otp'),
  deleteMyAccount:  (data) => api.delete('http://localhost:5001/api/auth/me', { data }),
  setupAdminPassword: (data) => api.post('http://localhost:5001/api/auth/setup-password', data),
}

//===============================================================================
//                    Appointment Service APIs (Port 5005)
//===============================================================================
export const appointmentAPI = {
  book:            (data)       => api.post(`${APPT_URL}/appointments`, data),
  getAll:          (params)     => api.get(`${APPT_URL}/appointments`, { params }),
  getById:         (id)         => api.get(`${APPT_URL}/appointments/${id}`),
  modify:          (id, data)   => api.put(`${APPT_URL}/appointments/${id}`, data),
  cancel:          (id, reason) => api.put(`${APPT_URL}/appointments/${id}/cancel`, { reason }),
  updateStatus:    (id, data)   => api.put(`${APPT_URL}/appointments/${id}/status`, data),
  getAvailability: (doctorId, date) => api.get(`${APPT_URL}/appointments/doctor/${doctorId}/availability`, { params: { date } }),
  searchDoctors:   (specialty)  => api.get(`${APPT_URL}/appointments/search`, { params: { specialty } }),
}

//===============================================================================
//                    Admin Service APIs (Port 5003)
//===============================================================================
export const adminAPI = {
  getPatients: () => api.get('http://localhost:5003/api/admin/patients'),
  getPatientById: (id) => api.get(`http://localhost:5003/api/admin/patients/${id}`),
  deletePatient: (id) => api.delete(`http://localhost:5003/api/admin/patients/${id}`),
  getDoctors: () => api.get('http://localhost:5003/api/admin/doctors'),
  updateDoctorStatus: (id, status) => api.patch(`http://localhost:5003/api/admin/doctors/${id}/status`, { status }),
  getAdminsList: () => api.get('http://localhost:5003/api/admin/list'),
  createAdmin: (data) => api.post('http://localhost:5003/api/admin/create', data),
  toggleAdminStatus: (id) => api.patch(`http://localhost:5003/api/admin/admins/${id}/status`),
  resendInvitation: (id) => api.post(`http://localhost:5003/api/admin/admins/${id}/resend-invitation`),
  adminLogin: (data) => api.post('http://localhost:5003/api/admin/login', data),
  bootstrapSuperAdmin: (data, superKey) => api.post('http://localhost:5003/api/admin/bootstrap-superadmin', data, {
    headers: { 'x-admin-super-key': superKey }
  }),
}

//===============================================================================
//                    Patient Service APIs (Port 5002)
//===============================================================================
export const patientAPI = {
  getMyProfile: () => api.get('http://localhost:5002/api/patients/me'),
  updateMyProfile: (data) => api.put('http://localhost:5002/api/patients/me', data),
}
//===============================================================================
//                    Doctor Service APIs (Port 5004)
//===============================================================================





//===============================================================================
//                    Report Service APIs (Port 5006)
//===============================================================================





//===============================================================================
//                    Payement Service APIs (Port 5007)
//===============================================================================




//===============================================================================
//                    Telemedicine Service APIs (Port 5008)
//===============================================================================

export default api