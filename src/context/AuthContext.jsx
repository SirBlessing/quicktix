import { createContext, useContext, useState, useEffect } from 'react'
import client from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(() => {
    try {
      const u = localStorage.getItem('qt_user')
      return u && u !== 'undefined' ? JSON.parse(u) : null
    } catch { return null }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('qt_token')
    if (!token || token === 'undefined' || token === 'null') {
      setLoading(false)
      return
    }
    client.get('/auth/me')
      .then(res => {
        setUser(res.data.user)
        localStorage.setItem('qt_user', JSON.stringify(res.data.user))
      })
      .catch(err => {
        if (err.response?.status === 401) {
          localStorage.removeItem('qt_token')
          localStorage.removeItem('qt_user')
          setUser(null)
        }
      })
      .finally(() => setLoading(false))
  }, [])

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