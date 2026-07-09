import { createContext, useContext, useState, useEffect } from 'react'
import client from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  // On first load — check if a token exists and fetch the current user
  useEffect(() => {
    const token = localStorage.getItem('qt_token')
    if (!token) {
      setLoading(false)
      return
    }
    client.get('/auth/me')
      .then(res => setUser(res.data.user))
      .catch(() => {
        // Token is invalid or expired — clear it
        localStorage.removeItem('qt_token')
      })
      .finally(() => setLoading(false))
  }, [])

  // Called after a successful login or signup
  const login = (userData, token) => {
    localStorage.setItem('qt_token', token)
    setUser(userData)
  }

  // Called on logout button
  const logout = () => {
    localStorage.removeItem('qt_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)