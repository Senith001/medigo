import { createContext, useContext, useState, useEffect } from 'react'
import { doctorAPI } from '../services/api'

// ✅ FIXED: default value instead of null — prevents crash on hot reload
const AuthContext = createContext({ user: null, token: null, login: () => { }, logout: () => { } })

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [user, setUser] = useState(() => {
    const storedToken = localStorage.getItem('token')
    if (storedToken) {
      try {
        const p = JSON.parse(atob(storedToken.split('.')[1]))
        if (p.exp * 1000 >= Date.now()) {
          return {
            id: p.id,
            userId: p.userId,
            name: p.fullName || p.name || p.email?.split('@')[0],
            email: p.email,
            role: p.role,
          }
        } else {
          localStorage.removeItem('token')
        }
      } catch {
        localStorage.removeItem('token')
      }
    }
    return null
  })

  const syncDoctorId = async (currentUser) => {
    if (currentUser?.role === 'doctor' && !currentUser.doctorId) {
      try {
        const res = await doctorAPI.getProfileByEmail(currentUser.email)
        if (res.data.success) {
          setUser(prev => ({ ...prev, doctorId: res.data.data._id }))
        }
      } catch (err) {
        console.error('Doctor profile sync failed:', err.message)
      }
    }
  }

  useEffect(() => {
    if (token && !user) {
      try {
        const p = JSON.parse(atob(token.split('.')[1]))
        if (p.exp * 1000 < Date.now()) { logout(); return }
        const u = {
          id: p.id,
          userId: p.userId,
          name: p.fullName || p.name || p.email?.split('@')[0],
          email: p.email,
          role: p.role,
        }
        setUser(u)
        syncDoctorId(u)
      } catch {
        logout()
      }
    } else if (user?.role === 'doctor' && !user.doctorId) {
      syncDoctorId(user)
    }
  }, [token])   // ✅ FIXED: removed 'user' from deps — infinite loop prevent

  const login = (newToken, userData = null) => {
    localStorage.setItem('token', newToken)
    setToken(newToken)
    let u
    if (userData) {
      u = {
        id: userData._id || userData.id,
        userId: userData.userId,
        name: userData.fullName || userData.name,
        email: userData.email,
        role: userData.role,
      }
    } else {
      const p = JSON.parse(atob(newToken.split('.')[1]))
      u = {
        id: p.id,
        userId: p.userId,
        name: p.fullName || p.email?.split('@')[0],
        email: p.email,
        role: p.role,
      }
    }
    setUser(u)
    syncDoctorId(u)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  // ✅ FIXED: guard against null context
  if (!context) {
    return { user: null, token: null, login: () => { }, logout: () => { } }
  }
  return context
}