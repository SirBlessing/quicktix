import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AuthPage.css';

export default function AuthPage({ mode = 'login' }) {
  const isLogin = mode === 'login';
  const navigate = useNavigate();

  const [form, setForm]       = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Please fill in all required fields.');
      return;
    }
    setError('');
    setLoading(true);
    /* ── Replace this with your real API call ──
       POST /api/auth/login  or  /api/auth/register
       Then store the JWT in localStorage / context
    ── */
    setTimeout(() => {
      setLoading(false);
      navigate('/dashboard');
    }, 1200);
  };

  return (
    <div className="auth-page">
      {/* LEFT PANEL */}
      <div className="auth-page__left">
        <Link to="/" className="auth-page__logo">
          <div className="auth-page__logo-mark">Q</div>
          <span className="auth-page__logo-text">QuickTix</span>
        </Link>
        <div className="auth-page__left-content">
          <h2 className="auth-page__left-title">
            Nigeria's simplest event ticketing platform.
          </h2>
          <ul className="auth-page__left-list">
            {[
              '⚡ Create an event page in under 2 minutes',
              '💳 Collect payments in Naira via Paystack',
              '📱 QR-code check-in for every attendee',
              '📊 Real-time sales and attendance analytics',
            ].map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className="auth-page__testimonial">
            <p className="auth-page__testimonial-text">
              "QuickTix made our church convention ticketing completely stress-free.
              We sold 2,100 tickets in 3 days and checked in everyone in minutes."
            </p>
            <div className="auth-page__testimonial-author">
              <div className="auth-page__testimonial-avatar">AK</div>
              <div>
                <strong>Adeola Komolafe</strong>
                <span>RCCG Youth Ministry</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="auth-page__right">
        <div className="auth-page__card qt-card fade-in">
          <div className="auth-page__card-header">
            <h1 className="auth-page__card-title">
              {isLogin ? 'Welcome back!' : 'Create your account'}
            </h1>
            <p className="auth-page__card-sub">
              {isLogin
                ? 'Log in to manage your events'
                : 'Start hosting events in minutes — it is free'}
            </p>
          </div>

          <form className="auth-page__form" onSubmit={handleSubmit} noValidate>
            {!isLogin && (
              <div className="auth-page__field">
                <label className="qt-label" htmlFor="name">Full Name</label>
                <input
                  id="name"
                  className="qt-input"
                  type="text"
                  placeholder="Adunni Johnson"
                  value={form.name}
                  onChange={update('name')}
                  autoComplete="name"
                />
              </div>
            )}

            <div className="auth-page__field">
              <label className="qt-label" htmlFor="email">Email Address</label>
              <input
                id="email"
                className="qt-input"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={update('email')}
                autoComplete="email"
                required
              />
            </div>

            <div className="auth-page__field">
              <div className="auth-page__pw-row">
                <label className="qt-label" htmlFor="password">Password</label>
                {isLogin && (
                  <a href="#" className="auth-page__forgot">Forgot password?</a>
                )}
              </div>
              <input
                id="password"
                className="qt-input"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={update('password')}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                required
              />
            </div>

            {error && <p className="auth-page__error">{error}</p>}

            <button
              type="submit"
              className="btn-primary auth-page__submit"
              disabled={loading}
            >
              {loading
                ? 'Please wait...'
                : isLogin
                ? 'Log In'
                : 'Create Account'}
            </button>
          </form>

          <p className="auth-page__switch">
            {isLogin ? 'New to QuickTix? ' : 'Already have an account? '}
            <Link to={isLogin ? '/signup' : '/login'} className="auth-page__switch-link">
              {isLogin ? 'Create account' : 'Log in'}
            </Link>
          </p>

          <div className="auth-page__secure">
            🔒 Your payment and data are secured by Paystack &amp; 256-bit SSL
          </div>
        </div>
      </div>
    </div>
  );
}