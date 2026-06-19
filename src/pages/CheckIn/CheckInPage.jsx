import { useState } from 'react'
import { Link } from 'react-router-dom'
import { SAMPLE_EVENTS } from '../../data/events'
import './CheckInPage.css'

/* Fake attendee pool to draw from when simulating a scan */
const FAKE_NAMES = [
  'Tunde Balogun', 'Amaka Eze', 'Kemi Adewale', 'Femi Johnson',
  'Ngozi Adeyemi', 'Emeka Obi', 'Sade Okonkwo', 'Chuka Nwosu',
]
const randomName = () => FAKE_NAMES[Math.floor(Math.random() * FAKE_NAMES.length)]
const randomId   = () => 'QT-2025-' + Math.random().toString(36).substring(2, 7).toUpperCase()
const timeNow    = () => new Date().toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })

/* Initial feed */
const INITIAL_FEED = [
  { id: 'QT-2025-A3X9B', name: 'Ngozi Adeyemi',    time: '09:14 AM', status: 'valid' },
  { id: 'QT-2025-MK72P', name: 'Emeka Obi',        time: '09:22 AM', status: 'valid' },
  { id: 'QT-2025-ZZ99X', name: 'Unknown Ticket',   time: '09:31 AM', status: 'invalid' },
  { id: 'QT-2025-C1Q4R', name: 'Sade Okonkwo',     time: '09:45 AM', status: 'valid' },
]

function CheckInPage() {
  const event = SAMPLE_EVENTS[0]   // In production: pass the event via route state

  const [scanState,  setScanState]  = useState('idle')   // idle | scanning | valid | invalid
  const [feed,       setFeed]       = useState(INITIAL_FEED)
  const [stats,      setStats]      = useState({ checkedIn: 847, invalid: 12 })
  const [activeEvent, setActiveEvent] = useState(event.id)

  const simulateScan = () => {
    setScanState('scanning')
    setTimeout(() => {
      const isValid = Math.random() > 0.25
      const result  = isValid ? 'valid' : 'invalid'
      setScanState(result)

      const entry = {
        id:     isValid ? randomId()      : 'QT-INVALID',
        name:   isValid ? randomName()    : 'Unknown / Duplicate Ticket',
        time:   timeNow(),
        status: result,
      }

      setFeed(prev => [entry, ...prev.slice(0, 19)])   // keep last 20
      setStats(prev => ({
        checkedIn: isValid ? prev.checkedIn + 1 : prev.checkedIn,
        invalid:   isValid ? prev.invalid       : prev.invalid + 1,
      }))

      setTimeout(() => setScanState('idle'), 2400)
    }, 1500)
  }

  const capacity    = event.capacity
  const pct         = Math.round((stats.checkedIn / capacity) * 100)
  const validCount  = feed.filter(f => f.status === 'valid').length

  return (
    <main className="checkin fade-in">

      {/* ── Top bar ── */}
      <header className="checkin__topbar">
        <div className="checkin__topbar-inner">
          <div className="checkin__topbar-brand">
            <div className="checkin__topbar-logo">Q</div>
            <span className="checkin__topbar-name">QuickTix</span>
            <span className="checkin__topbar-divider">|</span>
            <span className="checkin__topbar-label">Check-In Mode</span>
          </div>
          <Link to="/dashboard" className="btn btn--ghost btn--sm">← Exit to Dashboard</Link>
        </div>
      </header>

      <div className="container checkin__body">

        {/* ── Event selector ── */}
        <div className="checkin__event-row">
          <div className="checkin__event-info">
            <span className="checkin__event-emoji">{event.image}</span>
            <div>
              <p className="checkin__event-title">{event.title}</p>
              <p className="checkin__event-meta">
                📅 {new Date(event.date).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}
                &nbsp;·&nbsp;
                📍 {event.location.split(',')[0]}
              </p>
            </div>
          </div>
          <select
            className="form-input checkin__event-select"
            value={activeEvent}
            onChange={e => setActiveEvent(e.target.value)}
          >
            {SAMPLE_EVENTS.map(ev => (
              <option key={ev.id} value={ev.id}>{ev.title}</option>
            ))}
          </select>
        </div>

        {/* ── Stats row ── */}
        <div className="checkin__stats">
          {[
            { icon: '✅', label: 'Checked In',    value: stats.checkedIn.toLocaleString(),    color: 'var(--success)' },
            { icon: '🎟️', label: 'Total Expected', value: capacity.toLocaleString(),            color: 'var(--navy)' },
            { icon: '❌', label: 'Invalid Scans',  value: stats.invalid.toString(),             color: 'var(--error)' },
            { icon: '📊', label: 'Check-In Rate',  value: `${pct}%`,                           color: 'var(--orange)' },
          ].map(s => (
            <div key={s.label} className="checkin__stat qt-card">
              <span className="checkin__stat-icon">{s.icon}</span>
              <div>
                <p className="checkin__stat-value" style={{ color: s.color }}>{s.value}</p>
                <p className="checkin__stat-label">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Overall progress */}
        <div className="checkin__progress-row qt-card">
          <div className="checkin__progress-text">
            <span>Overall attendance progress</span>
            <span className="checkin__progress-pct">{pct}%</span>
          </div>
          <div className="progress-bar checkin__progress-bar">
            <div className="progress-bar__fill progress-bar__fill--green" style={{ width: `${pct}%` }} />
          </div>
          <p className="checkin__progress-sub">
            {stats.checkedIn.toLocaleString()} checked in of {capacity.toLocaleString()} expected
          </p>
        </div>

        {/* ── Main two-col ── */}
        <div className="checkin__main">

          {/* Scanner panel */}
          <div className="scanner-panel qt-card">
            <h2 className="scanner-panel__title">QR Scanner</h2>

            {/* Viewfinder */}
            <div className={`scanner-viewfinder scanner-viewfinder--${scanState}`}>

              {scanState === 'idle' && (
                <div className="scanner-viewfinder__idle">
                  <div className="scanner-corner scanner-corner--tl" />
                  <div className="scanner-corner scanner-corner--tr" />
                  <div className="scanner-corner scanner-corner--bl" />
                  <div className="scanner-corner scanner-corner--br" />
                  <span className="scanner-viewfinder__camera-icon">📷</span>
                  <p className="scanner-viewfinder__hint">Camera ready</p>
                  <p className="scanner-viewfinder__hint scanner-viewfinder__hint--sm">Point at attendee QR code</p>
                </div>
              )}

              {scanState === 'scanning' && (
                <div className="scanner-viewfinder__scanning">
                  <div className="scanner-scan-line" />
                  <span className="scanner-viewfinder__camera-icon">🔍</span>
                  <p className="scanner-viewfinder__hint">Scanning...</p>
                </div>
              )}

              {scanState === 'valid' && (
                <div className="scanner-viewfinder__result scanner-viewfinder__result--valid">
                  <span className="scanner-result-icon">✅</span>
                  <p className="scanner-result-title">Ticket Valid!</p>
                  <p className="scanner-result-sub">Entry Approved — Welcome!</p>
                </div>
              )}

              {scanState === 'invalid' && (
                <div className="scanner-viewfinder__result scanner-viewfinder__result--invalid">
                  <span className="scanner-result-icon">❌</span>
                  <p className="scanner-result-title">Invalid Ticket</p>
                  <p className="scanner-result-sub">Do Not Allow Entry</p>
                </div>
              )}

            </div>

            <button
              className="btn btn--primary btn--full scanner-panel__btn"
              onClick={simulateScan}
              disabled={scanState === 'scanning'}
            >
              {scanState === 'scanning' ? '⏳ Scanning...' : '📱 Scan QR Code'}
            </button>

            <p className="scanner-panel__note">
              In production this opens your device camera for real QR scanning.
            </p>

            {/* Manual lookup */}
            <div className="scanner-panel__manual">
              <p className="scanner-panel__manual-title">Manual Ticket Lookup</p>
              <div className="scanner-panel__manual-row">
                <input
                  className="form-input"
                  placeholder="Enter ticket ID e.g. QT-2025-A3X9B"
                />
                <button className="btn btn--outline">Check</button>
              </div>
            </div>
          </div>

          {/* Recent scans feed */}
          <div className="scan-feed qt-card">
            <div className="scan-feed__header">
              <h2 className="scan-feed__title">Recent Scans</h2>
              <span className="badge badge--navy">{feed.length} total</span>
            </div>

            <div className="scan-feed__list">
              {feed.map((entry, i) => (
                <div
                  key={i}
                  className={`scan-entry scan-entry--${entry.status}`}
                >
                  <span className="scan-entry__icon">
                    {entry.status === 'valid' ? '✅' : '❌'}
                  </span>
                  <div className="scan-entry__info">
                    <p className="scan-entry__name">{entry.name}</p>
                    <p className="scan-entry__id">{entry.id}</p>
                  </div>
                  <span className="scan-entry__time">{entry.time}</span>
                </div>
              ))}
            </div>

            <div className="scan-feed__footer">
              <p className="scan-feed__summary">
                {validCount} valid &nbsp;·&nbsp; {feed.length - validCount} invalid
              </p>
              <button
                className="btn btn--ghost btn--sm"
                onClick={() => setFeed([])}
              >
                Clear Feed
              </button>
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}

export default CheckInPage
