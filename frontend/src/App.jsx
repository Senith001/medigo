import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'

// ── Public ────────────────────────────────────────────────────
import LandingPage          from './pages/LandingPage'

// ── Auth ──────────────────────────────────────────────────────
import LoginPage            from './pages/Auth/LoginPage'
import RegisterPage         from './pages/Auth/RegisterPage'
import VerifyOTPPage        from './pages/Auth/VerifyOTPPage'
import AdminLogin           from './pages/Auth/AdminLogin'

// ── Patient ───────────────────────────────────────────────────
import PatientDashboard     from './pages/Patient/PatientDashboard'
import SearchDoctors        from './pages/SearchDoctors'
import { BookAppointment }  from './pages/BookAppointment'
import MyAppointments       from './pages/MyAppointments'
import RescheduleAppointment from './pages/RescheduleAppointment'

// ── Doctor ────────────────────────────────────────────────────
import DoctorDashboard      from './pages/Doctor/DoctorDashboard'
import DoctorRegistration   from './pages/Auth/DoctorRegistration'

// ── Admin ─────────────────────────────────────────────────────
import AdminDashboard       from './pages/Admin/AdminDashboard'
import DoctorsManagement    from './pages/Admin/DoctorsManagement'

// ── Payment ───────────────────────────────────────────────────
import PaymentSelector      from './pages/Payment/PaymentSelector'
import BankTransferForm     from './pages/Payment/BankTransferForm'
import StripeCallback       from './pages/Payment/StripeCallback'
import AdminPayments        from './pages/Payment/AdminPayments'

// ── Telemedicine ──────────────────────────────────────────────
import Lobby                from './pages/Telemedicine/Lobby'
import VideoRoom            from './pages/Telemedicine/VideoRoom'

// ── Reports ───────────────────────────────────────────────────
import ReportCenter         from './pages/Report/ReportCenter'

function Layout() {
  const { token, user } = useAuth()

  // Show navbar only for patient and doctor roles (admin has its own sidebar)
  const showNavbar = token && user?.role !== 'admin'

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        {/* Public */}
        <Route path="/"            element={<LandingPage />} />
        <Route path="/login"       element={<LoginPage />} />
        <Route path="/register"         element={<RegisterPage />} />
        <Route path="/doctor-register"  element={<DoctorRegistration />} />
        <Route path="/verify-otp"       element={<VerifyOTPPage />} />
        <Route path="/admin-login" element={<AdminLogin />} />

        {/* Patient (protected) */}
        <Route path="/dashboard"
          element={<ProtectedRoute roles={['patient']}><PatientDashboard /></ProtectedRoute>} />
        <Route path="/search"
          element={<ProtectedRoute roles={['patient']}><SearchDoctors /></ProtectedRoute>} />
        <Route path="/book"
          element={<ProtectedRoute roles={['patient']}><BookAppointment /></ProtectedRoute>} />
        <Route path="/appointments"
          element={<ProtectedRoute roles={['patient']}><MyAppointments /></ProtectedRoute>} />
        <Route path="/appointments/:id/reschedule"
          element={<ProtectedRoute roles={['patient','admin']}><RescheduleAppointment /></ProtectedRoute>} />
        
        {/* Payments */}
        <Route path="/payment/:appointmentId"
          element={<ProtectedRoute roles={['patient']}><PaymentSelector /></ProtectedRoute>} />
        <Route path="/payment/bank-transfer/:appointmentId"
          element={<ProtectedRoute roles={['patient']}><BankTransferForm /></ProtectedRoute>} />
        <Route path="/payment/success"
          element={<StripeCallback status="success" />} />
        <Route path="/payment/cancel"
          element={<StripeCallback status="cancel" />} />

        {/* Telemedicine */}
        <Route path="/telemedicine/lobby/:appointmentId"
          element={<ProtectedRoute roles={['patient', 'doctor']}><Lobby /></ProtectedRoute>} />
        <Route path="/telemedicine/room/:sessionId"
          element={<ProtectedRoute roles={['patient', 'doctor']}><VideoRoom /></ProtectedRoute>} />

        {/* Reports */}
        <Route path="/reports"
          element={<ProtectedRoute roles={['patient']}><ReportCenter /></ProtectedRoute>} />

        {/* Doctor (protected) */}
        <Route path="/doctor"
          element={<ProtectedRoute roles={['doctor']}><DoctorDashboard /></ProtectedRoute>} />

        {/* Admin (protected) */}
        <Route path="/admin"
          element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/doctors"
          element={<ProtectedRoute roles={['admin']}><DoctorsManagement /></ProtectedRoute>} />
        <Route path="/admin/payments"
          element={<ProtectedRoute roles={['admin']}><AdminPayments /></ProtectedRoute>} />

        {/* Wildcard fallback */}
        <Route path="*" element={
          <Navigate to={
            token
              ? user?.role === 'admin'   ? '/admin'
              : user?.role === 'doctor'  ? '/doctor'
              : '/dashboard'
              : '/'
          } replace />
        } />
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