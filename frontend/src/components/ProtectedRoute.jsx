import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, roles }) {
  const { user, token } = useAuth()

  if (!token || !user) {
    return <Navigate to="/login" replace />
  }

  if (roles && !roles.includes(user.role)) {
    // ✅ Wrong role → correct dashboard
    if (['admin', 'superadmin'].includes(user.role)) {
      return <Navigate to="/admin" replace />
    }
    if (user.role === 'doctor') {
      return <Navigate to="/doctor" replace />
    }
    return <Navigate to="/dashboard" replace />
  }

  return children
}