import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'

// --- Auth Imports ---
import LoginPage              from './pages/Auth/LoginPage'
import RegisterPage           from './pages/Auth/RegisterPage'
import VerifyOTPPage          from './pages/Auth/VerifyOTPPage'
import AdminLogin             from './pages/Auth/AdminLogin'

// --- Dashboard Imports ---
import PatientDashboard       from './pages/Patient/PatientDashboard'
import PatientProfile         from './pages/Patient/PatientProfile'
import AdminLayout            from './pages/Admin/AdminLayout'
import AdminDashboard         from './pages/Admin/AdminDashboard'
import PatientManagement      from './pages/Admin/PatientManagement'
import DoctorManagement       from './pages/Admin/DoctorManagement'
import AdminManagement        from './pages/Admin/AdminManagement'
import AdminProfile           from './pages/Admin/AdminProfile'

// --- Teammate's Existing Imports ---
import SearchDoctors          from './pages/SearchDoctors'
import { BookAppointment }    from './pages/BookAppointment'
import MyAppointments         from './pages/MyAppointments'
import RescheduleAppointment  from './pages/RescheduleAppointment'

function Layout() {
  const { token, user } = useAuth()

  // Only show the standard patient/public navbar if it's NOT an admin.
  // Admins usually have their own sidebar/navbar layout.
  const showStandardNavbar = token && !['admin', 'superadmin'].includes(user?.role)

  return (
    <>
      {showStandardNavbar && <Navbar />}
      <Routes>
        {/* --- Public Auth Routes --- */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-otp" element={<VerifyOTPPage />} />
        
        {/* --- Admin Auth Routes --- */}
        <Route path="/admin-login" element={<AdminLogin />} />

        {/* --- Protected Admin Routes --- */}
        <Route path="/admin" element={<ProtectedRoute roles={['admin', 'superadmin']}><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="admins" element={<AdminManagement />} />
          <Route path="patients" element={<PatientManagement />} />
          <Route path="doctors" element={<DoctorManagement />} />
          <Route path="profile" element={<AdminProfile />} />
        </Route>

        {/* --- Protected Patient Routes --- */}
        <Route path="/dashboard" element={<ProtectedRoute roles={['patient']}><PatientDashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute roles={['patient']}><PatientProfile /></ProtectedRoute>} />
        <Route path="/search" element={<ProtectedRoute roles={['patient']}><SearchDoctors /></ProtectedRoute>} />
        <Route path="/book" element={<ProtectedRoute roles={['patient']}><BookAppointment /></ProtectedRoute>} />
        <Route path="/appointments" element={<ProtectedRoute roles={['patient']}><MyAppointments /></ProtectedRoute>} />
        <Route path="/appointments/:id/reschedule" element={<ProtectedRoute roles={['patient','admin']}><RescheduleAppointment /></ProtectedRoute>} />
        
        {/* --- Fallback Redirect --- */}
        {/* If logged in as admin, default to /admin. If patient, default to /dashboard. Otherwise /login */}
        <Route path="*" element={<Navigate to={token ? (['admin','superadmin'].includes(user?.role) ? '/admin' : '/dashboard') : '/login'} replace />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    </AuthProvider>
  )
}