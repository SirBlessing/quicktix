import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import client from '../api/client'

export default function SignupPage() {
  const [form,    setForm]    = useState({ name:'', email:'', password:'', phone:'' })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate  = useNavigate()

  const handle = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password.length < 8) return setError('Password must be at least 8 characters.')
    setLoading(true)
    try {
      const r = await client.post('/auth/signup', form)
      login(r.data.token, r.data.user)
      navigate('/dashboard')
    } catch(err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.')
    } finally { setLoading(false) }
  }

  return (
    <div className="auth-page">
      <div className="auth-card fade-up">
        <div className="auth-logo">Q</div>
        <h1 className="auth-title">Create account</h1>
        <p className="auth-sub">Start hosting events in minutes — no card needed</p>

        {error && (
          <div className="alert alert-err">
            <span className="alert-icon">⚠️</span>
            <div><p className="alert-msg">{error}</p></div>
          </div>
        )}

        <form className="auth-form" onSubmit={handle} noValidate>
          {[
            { key:'name',     type:'text',     placeholder:'Adunni Johnson',       label:'Full Name' },
            { key:'email',    type:'email',    placeholder:'you@example.com',      label:'Email Address' },
            { key:'phone',    type:'tel',      placeholder:'+234 800 000 0000',    label:'Phone (optional)' },
            { key:'password', type:'password', placeholder:'Min. 8 characters',    label:'Password' },
          ].map(f => (
            <div key={f.key} className="form-group">
              <label className="label-dark">{f.label}</label>
              <input className="input-dark" type={f.type} placeholder={f.placeholder} value={form[f.key]} onChange={e => setForm({...form, [f.key]:e.target.value})} />
            </div>
          ))}
          <button type="submit" className="btn btn-primary btn-full" style={{padding:'14px'}} disabled={loading}>
            {loading ? 'Creating account...' : 'Create Free Account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{' '}
          <button className="auth-switch-link" onClick={() => navigate('/login')}>Log in</button>
        </p>
        <div className="auth-trust">🔒 Secured by 256-bit SSL encryption</div>
      </div>
    </div>
  )
}
