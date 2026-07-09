import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import client from '../api/client'

export default function LoginPage() {
  const navigate          = useNavigate()
  const { login }         = useAuth()
  const [form, setForm]   = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      setError('Please fill in all fields.')
      return
    }
    setError('')
    setLoading(true)

    try {
      const res = await client.post('/auth/login', {
        email:    form.email.trim().toLowerCase(),
        password: form.password
      })

      // Store token and update global auth state
      localStorage.setItem('qt_token', res.data.token)
      login(res.data.user, res.data.token)
      navigate('/dashboard')

    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your connection and try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page fade-in">
      <div className="auth-card qt-card">

        <div className="auth-card__header">
          <div className="auth-logo">Q</div>
          <h1 className="auth-card__title">Welcome back!</h1>
          <p className="auth-card__sub">Log in to manage your events</p>
        </div>

        {error && (
          <div className="alert alert--error">
            <span className="alert__icon">⚠️</span>
            <p className="alert__title">{error}</p>
          </div>
        )}

        <form className="auth-form" onSubmit={handleLogin} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              id="email"
              className="form-input"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <div className="auth-form__label-row">
              <label className="form-label" htmlFor="password">Password</label>
              <a href="/forgot-password" className="auth-form__forgot">Forgot password?</a>
            </div>
            <input
              id="password"
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn--primary btn--full auth-form__submit"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <p className="auth-card__switch">
          New to QuickTix?{' '}
          <Link to="/signup" className="auth-card__switch-link">Create account</Link>
        </p>

        <div className="auth-card__trust">
          🔒 Your data and payments are secured by 256-bit SSL encryption
        </div>

      </div>
    </main>
  )
}