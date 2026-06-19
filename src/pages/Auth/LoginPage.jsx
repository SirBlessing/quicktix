import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Auth.css'

function LoginPage({ setUser }) {
  const navigate = useNavigate()
  const [form,    setForm]    = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const handleLogin = (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      setError('Please fill in all fields.')
      return
    }
    setError('')
    setLoading(true)
    // TODO: replace with real API call → POST /api/auth/login
    setTimeout(() => {
      setUser({ name: 'Chidi Okeke', email: form.email })
      navigate('/dashboard')
    }, 1200)
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
            <div>
              <p className="alert__title">{error}</p>
            </div>
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
              <a href="#" className="auth-form__forgot">Forgot password?</a>
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

export default LoginPage
