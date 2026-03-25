import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'

import LoginPage              from './pages/LoginPage'
import HomePage               from './pages/HomePage'
import SearchDoctors          from './pages/SearchDoctors'
import { BookAppointment }    from './pages/BookAppointment'
import MyAppointments         from './pages/MyAppointments'
import RescheduleAppointment  from './pages/RescheduleAppointment'

function Layout() {
  const { token } = useAuth()

  return (
    <>
      {token && <Navbar />}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/search" element={<ProtectedRoute><SearchDoctors /></ProtectedRoute>} />
        <Route path="/book" element={<ProtectedRoute roles={['patient']}><BookAppointment /></ProtectedRoute>} />
        <Route path="/appointments" element={<ProtectedRoute><MyAppointments /></ProtectedRoute>} />
        <Route path="/appointments/:id/reschedule" element={<ProtectedRoute roles={['patient','admin']}><RescheduleAppointment /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to={token ? '/' : '/login'} replace />} />
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
