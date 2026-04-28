import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { doctorAPI } from '../services/api'

const AuthContext = createContext({
  user: null, token: null, login: () => { }, logout: () => { }
})

const decodeToken = (t) => {
  try {
    const p = JSON.parse(atob(t.split('.')[1]))
    if (p.exp * 1000 < Date.now()) return null
    return p
  } catch { return null }
}

const buildUser = (p) => ({
  id: p.id || p.userId,
  userId: p.userId || p.id,
  name: p.fullName || p.name || p.email?.split('@')[0],
  email: p.email,
  role: p.role,
})

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('token')
    if (!stored) return null
    const p = decodeToken(stored)
    if (!p) { localStorage.removeItem('token'); return null }
    return buildUser(p)
  })

  // ✅ syncedRef — API call once only per login session
  const syncedRef = useRef(false)

  const syncDoctorId = async (currentUser) => {
    if (
      !currentUser ||
      currentUser.role !== 'doctor' ||
      currentUser.doctorId ||
      syncedRef.current
    ) return

    syncedRef.current = true

    try {
      const res = await doctorAPI.getProfileByEmail(currentUser.email)
      if (res.data.success && res.data.data?._id) {
        setUser(prev => ({ ...prev, doctorId: res.data.data._id }))
      }
    } catch (err) {
      console.error('Doctor profile sync failed:', err.message)
      syncedRef.current = false
    }
  }

  useEffect(() => {
    if (!token) return
    if (!user) {
      const p = decodeToken(token)
      if (!p) { logout(); return }
      const u = buildUser(p)
      setUser(u)
      syncDoctorId(u)
    } else {
      syncDoctorId(user)
    }
  }, [token])

  const login = (newToken, userData = null) => {
    localStorage.setItem('token', newToken)
    setToken(newToken)
    syncedRef.current = false

    let u
    if (userData) {
      u = {
        id: userData._id || userData.id,
        userId: userData.userId || userData._id || userData.id,
        name: userData.fullName || userData.name,
        email: userData.email,
        role: userData.role,
        doctorId: userData.doctorId || null,
      }
    } else {
      const p = decodeToken(newToken)
      if (!p) return
      u = buildUser(p)
    }

    setUser(u)       // ✅ synchronous state update
    syncDoctorId(u)  // async — OK
  }

  const logout = () => {
    localStorage.removeItem('token')
    syncedRef.current = false
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
  if (!context) {
    return { user: null, token: null, login: () => { }, logout: () => { } }
  }
  return context
}