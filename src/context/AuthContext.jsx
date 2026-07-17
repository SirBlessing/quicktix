import { createContext, useContext, useState, useEffect } from 'react'
import client, { setAuthToken } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const u = localStorage.getItem('qt_user')
      return u ? JSON.parse(u) : null
    } catch { return null }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('qt_token')
    if (!token || token === 'undefined' || token === 'null') {
      setLoading(false)
      return
    }
    // Verify token is still valid in background
    client.get('/auth/me')
      .then(res => {
        setUser(res.data.user)
        localStorage.setItem('qt_user', JSON.stringify(res.data.user))
      })
      .catch(err => {
        // Only clear on definitive rejection (401) not network errors
        if (err.response?.status === 401) {
          localStorage.removeItem('qt_token')
          localStorage.removeItem('qt_user')
          setAuthToken(null)
          setUser(null)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const login = (userData, token) => {
    // Save to localStorage
    localStorage.setItem('qt_token', token)
    localStorage.setItem('qt_user', JSON.stringify(userData))
    // Update axios default header immediately so next request uses it
    setAuthToken(token)
    setUser(userData)
    setLoading(false)
  }

  const logout = () => {
    localStorage.removeItem('qt_token')
    localStorage.removeItem('qt_user')
    setAuthToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)