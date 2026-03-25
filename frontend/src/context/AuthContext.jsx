import { createContext, useContext, useState, useEffect } from 'react'
const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('token'))

  useEffect(() => {
    if (token) {
      try {
        const p = JSON.parse(atob(token.split('.')[1]))
        if (p.exp * 1000 < Date.now()) { logout(); return }
        setUser({ id: p.id, userId: p.userId, name: p.fullName || p.name || p.email?.split('@')[0], email: p.email, role: p.role })
      } catch { logout() }
    }
  }, [token])

  const login = (newToken, userData = null) => {
    localStorage.setItem('token', newToken)
    setToken(newToken)
    if (userData) {
      setUser({ id: userData._id || userData.id, userId: userData.userId, name: userData.fullName || userData.name, email: userData.email, role: userData.role })
    } else {
      const p = JSON.parse(atob(newToken.split('.')[1]))
      setUser({ id: p.id, userId: p.userId, name: p.fullName || p.email?.split('@')[0], email: p.email, role: p.role })
    }
  }

  const logout = () => { localStorage.removeItem('token'); setToken(null); setUser(null) }

  return <AuthContext.Provider value={{ user, token, login, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
