import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'

import LandingPage from './pages/LandingPage'
import LoginPage from './pages/Auth/LoginPage'
import RegisterPage from './pages/Auth/RegisterPage'
import VerifyOTPPage from './pages/Auth/VerifyOTPPage'
import AdminLogin from './pages/Auth/AdminLogin'
import DoctorLogin from './pages/Admin/DoctorLogin'
import DoctorRegistration from './pages/Auth/DoctorRegistration'
import ManageAvailability from './pages/Doctor/ManageAvailability'
import PatientDashboard from './pages/Patient/PatientDashboard'
import PatientProfile from './pages/Patient/PatientProfile'
import DoctorDashboard from './pages/Doctor/DoctorDashboard'
import DoctorAppointments from './pages/Doctor/DoctorAppointments'
import DoctorProfile from './pages/Doctor/DoctorProfile'
import AdminLayout from './pages/Admin/AdminLayout'
import AdminDashboard from './pages/Admin/AdminDashboard'
import PatientManagement from './pages/Admin/PatientManagement'
import DoctorManagement from './pages/Admin/DoctorManagement'
import AdminManagement from './pages/Admin/AdminManagement'
import AdminProfile from './pages/Admin/AdminProfile'
import AdminSetup from './pages/Admin/AdminSetup'
import SuperAdminBootstrap from './pages/Admin/SuperAdminBootstrap'
import SearchDoctors from './pages/Appointment/SearchDoctors'
import DoctorSessions from './pages/Appointment/DoctorSessions'
import MyAppointments from './pages/Appointment/MyAppointments'
import RescheduleAppointment from './pages/Appointment/RescheduleAppointment'
import PaymentSelector from './pages/Payment/PaymentSelector'
import Checkout from './pages/Payment/Checkout'
import BankTransferForm from './pages/Payment/BankTransferForm'
import StripeCallback from './pages/Payment/StripeCallback'
import AdminPayments from './pages/Payment/AdminPayments'
import Lobby from './pages/Telemedicine/Lobby'
import VideoRoom from './pages/Telemedicine/VideoRoom'
import Telemedicine from './pages/Telemedicine/Telemedicine'
import PatientRecords from './pages/Doctor/PatientRecords'
import ReportCenter from './pages/Report/ReportCenter'
import PaymentHistory from './pages/Patient/PaymentHistory'
import MyPrescriptions from './pages/Patient/MyPrescriptions'
import DoctorPrescriptions from './pages/Doctor/Prescriptions'

function Layout() {
  const { token, user } = useAuth()
  const location = useLocation()
  const isLandingPage = location.pathname === '/'
  const showStandardNavbar = token && user?.role === 'patient' && !isLandingPage

  return (
    <>
      {showStandardNavbar && <Navbar />}
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/doctor-register" element={<DoctorRegistration />} />
        <Route path="/verify-otp" element={<VerifyOTPPage />} />

        {/* Admin Auth */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/doctor-login" element={<DoctorLogin />} />
        <Route path="/admin/setup" element={<AdminSetup />} />
        <Route path="/admin/bootstrap" element={<SuperAdminBootstrap />} />

        {/* Admin Protected */}
        <Route path="/admin" element={<ProtectedRoute roles={['admin', 'superadmin']}><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="admins" element={<AdminManagement />} />
          <Route path="patients" element={<PatientManagement />} />
          <Route path="doctors" element={<DoctorManagement />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="profile" element={<AdminProfile />} />
        </Route>

        {/* Doctor Protected */}
        <Route path="/doctor" element={<ProtectedRoute roles={['doctor']}><DoctorDashboard /></ProtectedRoute>} />
        <Route path="/doctor/dashboard" element={<ProtectedRoute roles={['doctor']}><DoctorDashboard /></ProtectedRoute>} />
        <Route path="/doctor/appointments" element={<ProtectedRoute roles={['doctor']}><DoctorAppointments /></ProtectedRoute>} />
        <Route path="/doctor/availability" element={<ProtectedRoute roles={['doctor']}><ManageAvailability /></ProtectedRoute>} />
        <Route path="/doctor/profile" element={<ProtectedRoute roles={['doctor']}><DoctorProfile /></ProtectedRoute>} />
        <Route path="/doctor/records" element={<ProtectedRoute roles={['doctor']}><PatientRecords /></ProtectedRoute>} />

        {/* Patient Protected */}
        <Route path="/dashboard" element={<ProtectedRoute roles={['patient']}><PatientDashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute roles={['patient']}><PatientProfile /></ProtectedRoute>} />
        <Route path="/search" element={<ProtectedRoute roles={['patient']}><SearchDoctors /></ProtectedRoute>} />
        <Route path="/doctor/:doctorId/sessions" element={<ProtectedRoute roles={['patient']}><DoctorSessions /></ProtectedRoute>} />
        <Route path="/checkout/:sessionId" element={<ProtectedRoute roles={['patient']}><Checkout /></ProtectedRoute>} />
        <Route path="/appointments" element={<ProtectedRoute roles={['patient']}><MyAppointments /></ProtectedRoute>} />
        <Route path="/appointments/:id/reschedule" element={<ProtectedRoute roles={['patient', 'admin']}><RescheduleAppointment /></ProtectedRoute>} />

        {/* Reports */}
        <Route path="/reports" element={<ProtectedRoute roles={['patient']}><ReportCenter /></ProtectedRoute>} />

        {/* Payment History */}
        <Route path="/payments" element={<ProtectedRoute roles={['patient']}><PaymentHistory /></ProtectedRoute>} />

        {/* Prescriptions */}
        <Route path="/prescriptions" element={<ProtectedRoute roles={['patient']}><MyPrescriptions /></ProtectedRoute>} />
        <Route path="/doctor/prescriptions" element={<ProtectedRoute roles={['doctor']}><DoctorPrescriptions /></ProtectedRoute>} />

        {/* Payment */}
        <Route path="/payment/:appointmentId" element={<ProtectedRoute roles={['patient']}><PaymentSelector /></ProtectedRoute>} />
        <Route path="/payment/bank-transfer/:appointmentId" element={<ProtectedRoute roles={['patient']}><BankTransferForm /></ProtectedRoute>} />
        <Route path="/payment/success" element={<StripeCallback status="success" />} />
        <Route path="/payment/cancel" element={<StripeCallback status="cancel" />} />

        {/* Telemedicine */}
        <Route path="/telemedicine" element={<ProtectedRoute roles={['patient', 'doctor']}><Telemedicine /></ProtectedRoute>} />
        <Route path="/telemedicine/lobby/:appointmentId" element={<ProtectedRoute roles={['patient', 'doctor']}><Lobby /></ProtectedRoute>} />
        <Route path="/telemedicine/room/:sessionId" element={<ProtectedRoute roles={['patient', 'doctor']}><VideoRoom /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to={
          token
            ? (['admin', 'superadmin'].includes(user?.role) ? '/admin'
              : user?.role === 'doctor' ? '/doctor' : '/dashboard')
            : '/login'
        } replace />} />
      </Routes>
    </>
  )
}

// ✅ FIXED: BrowserRouter outermost — AuthProvider inside — Layout innermost
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout />
      </AuthProvider>
    </BrowserRouter>
  )
}