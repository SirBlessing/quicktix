import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import client from '../api/client'

export default function LoginPage() {
  const [form,    setForm]    = useState({ email:'', password:'' })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate  = useNavigate()

  const handle = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const r = await client.post('/auth/login', form)
      login(r.data.token, r.data.user)
      navigate('/dashboard')
    } catch(err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
    } finally { setLoading(false) }
  }

  return (
    <div className="auth-page">
      <div className="auth-card fade-up">
        <div className="auth-logo">Q</div>
        <h1 className="auth-title">Welcome back!</h1>
        <p className="auth-sub">Log in to manage your events</p>

        {error && (
          <div className="alert alert-err">
            <span className="alert-icon">⚠️</span>
            <div><p className="alert-msg">{error}</p></div>
          </div>
        )}

        <form className="auth-form" onSubmit={handle} noValidate>
          <div className="form-group">
            <label className="label-dark">Email Address</label>
            <input className="input-dark" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({...form, email:e.target.value})} required />
          </div>
          <div className="form-group">
            <div className="auth-label-row">
              <label className="label-dark">Password</label>
              <button type="button" className="auth-forgot">Forgot password?</button>
            </div>
            <input className="input-dark" type="password" placeholder="••••••••" value={form.password} onChange={e => setForm({...form, password:e.target.value})} required />
          </div>
          <button type="submit" className="btn btn-primary btn-full" style={{padding:'14px'}} disabled={loading}>
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <p className="auth-switch">
          New to QuickTix?{' '}
          <button className="auth-switch-link" onClick={() => navigate('/signup')}>Create account</button>
        </p>
        <div className="auth-trust">🔒 Secured by 256-bit SSL encryption</div>
      </div>
    </div>
  )
}
