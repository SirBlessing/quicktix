import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Auth.css'

function SignupPage({ setUser }) {
  const navigate  = useNavigate()
  const [form,    setForm]    = useState({ name: '', email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const handleSignup = (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) {
      setError('Please fill in all fields.')
      return
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match.')
      return
    }
    setError('')
    setLoading(true)
    // TODO: replace with real API call → POST /api/auth/signup
    setTimeout(() => {
      setUser({ name: form.name, email: form.email })
      navigate('/dashboard')
    }, 1200)
  }

  return (
    <main className="auth-page fade-in">
      <div className="auth-card qt-card">

        <div className="auth-card__header">
          <div className="auth-logo">Q</div>
          <h1 className="auth-card__title">Create your account</h1>
          <p className="auth-card__sub">Start hosting events in minutes — no card needed</p>
        </div>

        {error && (
          <div className="alert alert--error">
            <span className="alert__icon">⚠️</span>
            <div><p className="alert__title">{error}</p></div>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSignup} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name</label>
            <input
              id="name"
              className="form-input"
              type="text"
              placeholder="Adunni Johnson"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              autoComplete="name"
            />
          </div>

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
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              className="form-input"
              type="password"
              placeholder="Min. 8 characters"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirm">Confirm Password</label>
            <input
              id="confirm"
              className="form-input"
              type="password"
              placeholder="Repeat your password"
              value={form.confirm}
              onChange={e => setForm({ ...form, confirm: e.target.value })}
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn--primary btn--full auth-form__submit"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create Free Account'}
          </button>
        </form>

        <p className="auth-card__switch">
          Already have an account?{' '}
          <Link to="/login" className="auth-card__switch-link">Log in</Link>
        </p>

        <div className="auth-card__trust">
          🔒 Your data and payments are secured by 256-bit SSL encryption
        </div>

      </div>
    </main>
  )
}

export default SignupPage
