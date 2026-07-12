import { createContext, useContext, useState, useEffect, useRef } from 'react'
import client from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // Read user from localStorage immediately so the dashboard
  // never flashes blank while we verify the token in the background
  const [user, setUser] = useState(() => {
    try {
      const u = localStorage.getItem('qt_user')
      return u ? JSON.parse(u) : null
    } catch { return null }
  })
  const [loading, setLoading] = useState(true)

  // Track whether login() was just called in this session.
  // If it was, we skip the /auth/me verification entirely —
  // the server already gave us a fresh token, no need to re-check.
  const justLoggedIn = useRef(false)

  useEffect(() => {
    const token = localStorage.getItem('qt_token')

    if (!token) {
      setLoading(false)
      return
    }

    // Skip /auth/me if we literally just signed up or logged in
    if (justLoggedIn.current) {
      setLoading(false)
      return
    }

    // Background token verification (for page refreshes)
    client.get('/auth/me')
      .then(res => {
        setUser(res.data.user)
        localStorage.setItem('qt_user', JSON.stringify(res.data.user))
      })
      .catch(err => {
        // Only clear session on a definitive "token rejected" (401).
        // Network errors, Render cold-starts (503/504/timeout) → stay logged in.
        if (err.response?.status === 401) {
          localStorage.removeItem('qt_token')
          localStorage.removeItem('qt_user')
          setUser(null)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const login = (userData, token) => {
    justLoggedIn.current = true        // skip /auth/me for this session
    localStorage.setItem('qt_token', token)
    localStorage.setItem('qt_user', JSON.stringify(userData))
    setUser(userData)
    setLoading(false)
  }

  const logout = () => {
    justLoggedIn.current = false
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