import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import './Navbar.css'

function Navbar({ user, setUser }) {
  const location = useLocation()
  const navigate  = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const isDark = location.pathname === '/'
  const isDashboard = location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/checkin')

  if (isDashboard) return null

  const handleLogout = () => {
    setUser(null)
    navigate('/')
  }

  return (
    <nav className={`navbar ${isDark ? 'navbar--dark' : 'navbar--light'}`}>
      <div className="navbar__inner container">
        <Link to="/" className="navbar__brand">
          <div className="navbar__logo">Q</div>
          <span className="navbar__name">QuickTix</span>
        </Link>

        {/* Desktop links */}
        <div className="navbar__links">
          <Link to="/explore" className="navbar__link">Explore Events</Link>
        </div>

        <div className="navbar__actions">
          {!user ? (
            <>
              <Link to="/login"  className="btn btn--ghost navbar__btn-ghost">Log In</Link>
              <Link to="/signup" className="btn btn--primary">Get Started →</Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" className="btn btn--ghost navbar__btn-ghost">Dashboard</Link>
              <button onClick={handleLogout} className="btn btn--primary">Log Out</button>
            </>
          )}
        </div>

        {/* Hamburger */}
        <button className="navbar__hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          <span className={`hamburger-bar ${menuOpen ? 'open' : ''}`} />
          <span className={`hamburger-bar ${menuOpen ? 'open' : ''}`} />
          <span className={`hamburger-bar ${menuOpen ? 'open' : ''}`} />
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="navbar__mobile-menu">
          <Link to="/explore"  className="mobile-link" onClick={() => setMenuOpen(false)}>Explore Events</Link>
          {!user ? (
            <>
              <Link to="/login"  className="mobile-link" onClick={() => setMenuOpen(false)}>Log In</Link>
              <Link to="/signup" className="btn btn--primary btn--full" onClick={() => setMenuOpen(false)}>Get Started</Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" className="mobile-link" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="btn btn--ghost btn--full">Log Out</button>
            </>
          )}
        </div>
      )}
    </nav>
  )
}

export default Navbar
