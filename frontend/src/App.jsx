import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'

// --- Public Imports ---
import LandingPage          from './pages/LandingPage'

// --- Auth Imports ---
import LoginPage              from './pages/Auth/LoginPage'
import RegisterPage           from './pages/Auth/RegisterPage'
import VerifyOTPPage          from './pages/Auth/VerifyOTPPage'
import AdminLogin             from './pages/Auth/AdminLogin'
import DoctorLogin            from './pages/Admin/DoctorLogin'
import DoctorRegistration     from './pages/Auth/DoctorRegistration'

// --- Dashboard Imports ---
import PatientDashboard       from './pages/Patient/PatientDashboard'
import PatientProfile         from './pages/Patient/PatientProfile'
import DoctorDashboard        from './pages/Doctor/DoctorDashboard'
import DoctorProfile          from './pages/Doctor/DoctorProfile'
import AdminLayout            from './pages/Admin/AdminLayout'
import AdminDashboard         from './pages/Admin/AdminDashboard'
import PatientManagement      from './pages/Admin/PatientManagement'
import DoctorManagement       from './pages/Admin/DoctorManagement'
import AdminManagement        from './pages/Admin/AdminManagement'
import AdminProfile           from './pages/Admin/AdminProfile'
import AdminSetup             from './pages/Admin/AdminSetup'
import SuperAdminBootstrap    from './pages/Admin/SuperAdminBootstrap'

// --- Common Features ---
import SearchDoctors          from './pages/SearchDoctors'
import { BookAppointment }    from './pages/BookAppointment'
import MyAppointments         from './pages/MyAppointments'
import RescheduleAppointment  from './pages/RescheduleAppointment'

// --- Module Imports (Integrated) ---
import PaymentSelector        from './pages/Payment/PaymentSelector'
import BankTransferForm       from './pages/Payment/BankTransferForm'
import StripeCallback         from './pages/Payment/StripeCallback'
import AdminPayments          from './pages/Payment/AdminPayments'
import Lobby                  from './pages/Telemedicine/Lobby'
import VideoRoom              from './pages/Telemedicine/VideoRoom'
import ReportCenter           from './pages/Report/ReportCenter'

function Layout() {
  const { token, user } = useAuth()

  // Standard navbar for patient and doctor (Admin has its own Sidebar in AdminLayout)
  const showStandardNavbar = token && !['admin', 'superadmin'].includes(user?.role)

  return (
    <>
      {showStandardNavbar && <Navbar />}
      <Routes>
        {/* --- Public Routes --- */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/doctor-register" element={<DoctorRegistration />} />
        <Route path="/verify-otp" element={<VerifyOTPPage />} />
        
        {/* --- Admin Auth Routes --- */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/doctor-login" element={<DoctorLogin />} />
        <Route path="/admin/setup" element={<AdminSetup />} />
        <Route path="/admin/bootstrap" element={<SuperAdminBootstrap />} />

        {/* --- Protected Admin Routes (Nested in Layout) --- */}
        <Route path="/admin" element={<ProtectedRoute roles={['admin', 'superadmin']}><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="admins" element={<AdminManagement />} />
          <Route path="patients" element={<PatientManagement />} />
          <Route path="doctors" element={<DoctorManagement />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="profile" element={<AdminProfile />} />
        </Route>

        {/* --- Protected Doctor Routes --- */}
        <Route path="/doctor" element={<ProtectedRoute roles={['doctor']}><DoctorDashboard /></ProtectedRoute>} />
        <Route path="/doctor/profile" element={<ProtectedRoute roles={['doctor']}><DoctorProfile /></ProtectedRoute>} />

        {/* --- Protected Patient Routes --- */}
        <Route path="/dashboard" element={<ProtectedRoute roles={['patient']}><PatientDashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute roles={['patient']}><PatientProfile /></ProtectedRoute>} />
        <Route path="/search" element={<ProtectedRoute roles={['patient']}><SearchDoctors /></ProtectedRoute>} />
        <Route path="/book" element={<ProtectedRoute roles={['patient']}><BookAppointment /></ProtectedRoute>} />
        <Route path="/appointments" element={<ProtectedRoute roles={['patient']}><MyAppointments /></ProtectedRoute>} />
        <Route path="/appointments/:id/reschedule" element={<ProtectedRoute roles={['patient','admin']}><RescheduleAppointment /></ProtectedRoute>} />
        
        {/* --- Integrated Module Routes --- */}
        <Route path="/reports" element={<ProtectedRoute roles={['patient']}><ReportCenter /></ProtectedRoute>} />
        
        <Route path="/payment/:appointmentId" element={<ProtectedRoute roles={['patient']}><PaymentSelector /></ProtectedRoute>} />
        <Route path="/payment/bank-transfer/:appointmentId" element={<ProtectedRoute roles={['patient']}><BankTransferForm /></ProtectedRoute>} />
        <Route path="/payment/success" element={<StripeCallback status="success" />} />
        <Route path="/payment/cancel" element={<StripeCallback status="cancel" />} />

        <Route path="/telemedicine/lobby/:appointmentId" element={<ProtectedRoute roles={['patient', 'doctor']}><Lobby /></ProtectedRoute>} />
        <Route path="/telemedicine/room/:sessionId" element={<ProtectedRoute roles={['patient', 'doctor']}><VideoRoom /></ProtectedRoute>} />

        {/* --- Fallback Redirect --- */}
        <Route path="*" element={<Navigate to={
          token 
            ? (['admin','superadmin'].includes(user?.role) ? '/admin' 
            : (user?.role === 'doctor' ? '/doctor' : '/dashboard')) 
            : '/login'
        } replace />} />
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