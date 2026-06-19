import { createContext, useContext, useState, useEffect } from 'react'
import client from '../api/client'

const Ctx = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('qt_token')
    if (token) {
      client.get('/auth/me')
        .then(r => setUser(r.data.user))
        .catch(() => localStorage.removeItem('qt_token'))
        .finally(() => setLoading(false))
    } else { setLoading(false) }
  }, [])

  const login = (token, userData) => {
    localStorage.setItem('qt_token', token)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('qt_token')
    setUser(null)
  }

  return <Ctx.Provider value={{ user, loading, login, logout }}>{children}</Ctx.Provider>
}

export const useAuth = () => useContext(Ctx)
