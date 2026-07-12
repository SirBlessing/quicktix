import { createContext, useContext, useState, useEffect } from 'react'
import client from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // Seed initial user from localStorage so the dashboard
  // never flashes empty while /auth/me is in-flight
  const [user,    setUser]    = useState(() => {
    try {
      const stored = localStorage.getItem('qt_user')
      return stored ? JSON.parse(stored) : null
    } catch { return null }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('qt_token')

    if (!token) {
      setLoading(false)
      return
    }

    // Verify the token is still valid in the background
    client.get('/auth/me')
      .then(res => {
        setUser(res.data.user)
        // Keep localStorage in sync with latest user data
        localStorage.setItem('qt_user', JSON.stringify(res.data.user))
      })
      .catch(err => {
        // ONLY log out if the server explicitly says token is invalid (401)
        // Do NOT log out on network errors / Render cold-start timeouts
        if (err.response?.status === 401) {
          localStorage.removeItem('qt_token')
          localStorage.removeItem('qt_user')
          setUser(null)
        }
        // Any other error (network down, 500, timeout) → keep the user logged in
      })
      .finally(() => setLoading(false))
  }, [])

  // Called right after a successful login or signup
  const login = (userData, token) => {
    localStorage.setItem('qt_token', token)
    localStorage.setItem('qt_user', JSON.stringify(userData))
    setUser(userData)
    setLoading(false)
  }

  const logout = () => {
    localStorage.removeItem('qt_token')
    localStorage.removeItem('qt_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)