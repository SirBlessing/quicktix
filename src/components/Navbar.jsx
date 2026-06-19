import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const isDark    = location.pathname === '/'
  const isHidden  = location.pathname === '/checkin'

  if (isHidden) return null

  return (
    <nav className={`nav ${isDark ? 'nav-dark' : 'nav-light'}`}>
      <div className="nav-inner container">
        <div className="nav-brand" onClick={() => navigate('/')}>
          <div className="nav-logo">Q</div>
          <span className="nav-name">QuickTix</span>
        </div>

        <div className="nav-actions">
          <button className="nav-link" onClick={() => navigate('/explore')}>
            Explore Events
          </button>

          {!user ? (
            <>
              <button
                className="btn btn-ghost"
                style={isDark ? { color: 'rgba(255,255,255,.65)', borderColor: 'rgba(255,255,255,.15)' } : {}}
                onClick={() => navigate('/login')}
              >
                Log In
              </button>
              <button className="btn btn-primary" onClick={() => navigate('/signup')}>
                Get Started →
              </button>
            </>
          ) : (
            <>
              <button
                className="btn btn-ghost"
                style={isDark ? { color: 'rgba(255,255,255,.65)', borderColor: 'rgba(255,255,255,.15)' } : {}}
                onClick={() => navigate('/dashboard')}
              >
                Dashboard
              </button>
              <button
                className="btn btn-primary"
                onClick={() => { logout(); navigate('/') }}
              >
                Log Out
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
