import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import client from '../api/client'

export default function SignupPage() {
  const navigate          = useNavigate()
  const { login }         = useAuth()
  const [form, setForm]   = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const handleSignup = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) {
      setError('Please fill in all fields.')
      return
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setError('')
    setLoading(true)

    try {
      const res = await client.post('/auth/signup', {
        name:     form.name.trim(),
        email:    form.email.trim().toLowerCase(),
        password: form.password
      })

      // Log to console so we can see the exact response shape
      console.log('Signup response:', res.data)

      const token = res.data?.token
      const user  = res.data?.user

      if (!token) {
        setError('Signup succeeded but no token was returned. Check the console.')
        console.error('No token in response. Full response:', res.data)
        setLoading(false)
        return
      }

      localStorage.setItem('qt_token', token)
      login(user, token)
      navigate('/dashboard')

    } catch (err) {
      console.error('Signup error:', err.response?.data || err.message)
      const msg = err.response?.data?.message || 'Signup failed. Please try again.'
      setError(msg)
      setLoading(false)
    }
  }

  return (
    <main className="auth-page fade-in">
      <div className="auth-card qt-card">
        <div className="auth-card__header">
          <div className="auth-logo">Q</div>
          <h1 className="auth-card__title">Create your account</h1>
          <p className="auth-card__sub">Start hosting events in minutes — it's free</p>
        </div>

        {error && (
          <div className="alert alert--error">
            <span className="alert__icon">⚠️</span>
            <p className="alert__title">{error}</p>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSignup} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name</label>
            <input id="name" className="form-input" type="text" placeholder="Adunni Johnson"
              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} autoComplete="name" />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input id="email" className="form-input" type="email" placeholder="you@example.com"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} autoComplete="email" />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input id="password" className="form-input" type="password" placeholder="At least 8 characters"
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} autoComplete="new-password" />
          </div>
          <button type="submit" className="btn btn--primary btn--full auth-form__submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
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