import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import client from '../api/client'
import EventCover from '../components/EventCover'

export default function CheckInPage() {
  const navigate = useNavigate()
  const [events,       setEvents]       = useState([])
  const [activeEvent,  setActiveEvent]  = useState(null)
  const [stats,        setStats]        = useState({ totalExpected: 0, checkedIn: 0, remaining: 0, invalidScans: 0, checkInRate: 0 })
  const [feed,         setFeed]         = useState([])
  const [scanState,    setScanState]    = useState('idle') // idle | scanning | valid | invalid
  const [resultMsg,    setResultMsg]    = useState('')
  const [manualId,     setManualId]     = useState('')
  const pollRef = useRef(null)

  // Load organizer's events on mount
  useEffect(() => {
    client.get('/events/my')
      .then(r => {
        setEvents(r.data.events)
        if (r.data.events.length) setActiveEvent(r.data.events[0]._id)
      })
      .catch(() => {})
  }, [])

  // Load stats + feed whenever active event changes, and poll every 8s
  useEffect(() => {
    if (!activeEvent) return
    const load = () => {
      client.get(`/checkin/${activeEvent}/stats`).then(r => setStats(r.data.stats)).catch(() => {})
      client.get(`/checkin/${activeEvent}/feed`).then(r => setFeed(r.data.feed)).catch(() => {})
    }
    load()
    pollRef.current = setInterval(load, 8000)
    return () => clearInterval(pollRef.current)
  }, [activeEvent])

  const currentEvent = events.find(e => e._id === activeEvent)

  // ── Simulate a camera scan (in production, integrate a QR scanner lib
  //    like html5-qrcode and call this same handler with the decoded data) ──
  const simulateScan = async () => {
    if (!activeEvent) return
    setScanState('scanning')
    setTimeout(async () => {
      try {
        // In production, qrData comes from the camera scanner.
        // Here we just demo against the most recent ticket if available.
        const fakeQrData = manualId || 'demo-qr-data'
        const r = await client.post('/checkin/scan', { qrData: fakeQrData, eventId: activeEvent })
        if (r.data.valid) {
          setScanState('valid')
          setResultMsg(r.data.attendee.name)
          refreshAfterScan()
        } else {
          setScanState('invalid')
          setResultMsg(r.data.reason)
        }
      } catch (err) {
        setScanState('invalid')
        setResultMsg(err.response?.data?.message || 'Scan failed.')
      }
      setTimeout(() => setScanState('idle'), 2500)
    }, 1300)
  }

  const refreshAfterScan = () => {
    client.get(`/checkin/${activeEvent}/stats`).then(r => setStats(r.data.stats)).catch(() => {})
    client.get(`/checkin/${activeEvent}/feed`).then(r => setFeed(r.data.feed)).catch(() => {})
  }

  const handleManualLookup = async (e) => {
    e.preventDefault()
    if (!manualId.trim() || !activeEvent) return
    setScanState('scanning')
    try {
      const r = await client.post('/checkin/manual', { ticketId: manualId.trim(), eventId: activeEvent })
      if (r.data.valid) {
        setScanState('valid')
        setResultMsg(r.data.attendee.name)
        refreshAfterScan()
      } else {
        setScanState('invalid')
        setResultMsg(r.data.reason)
      }
    } catch (err) {
      setScanState('invalid')
      setResultMsg(err.response?.data?.message || 'Lookup failed.')
    }
    setManualId('')
    setTimeout(() => setScanState('idle'), 2500)
  }

  return (
    <div className="checkin-page fade-up">

      {/* Top bar */}
      <header className="checkin-top">
        <div className="checkin-top-inner">
          <div className="checkin-brand">
            <div className="checkin-logo">Q</div>
            <span className="checkin-name">QuickTix</span>
            <span className="checkin-divider">|</span>
            <span className="checkin-mode">Check-In Mode</span>
          </div>
          <button className="btn btn-ghost-dark btn-sm" onClick={() => navigate('/dashboard')}>
            ← Exit to Dashboard
          </button>
        </div>
      </header>

      <div className="checkin-body">

        {/* Event selector */}
        <div className="checkin-event-row">
          <div className="checkin-event-info">
            <EventCover src={currentEvent?.coverImage} alt={currentEvent?.title} size={40} dark className="checkin-event-emoji" />
            <div>
              <p className="checkin-event-title">{currentEvent?.title || 'No event selected'}</p>
              {currentEvent && (
                <p className="checkin-event-meta">
                  📅 {new Date(currentEvent.date).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}
                  {' · '}📍 {currentEvent.location?.split(',')[0]}
                </p>
              )}
            </div>
          </div>
          {events.length > 0 && (
            <select className="checkin-select" value={activeEvent || ''} onChange={e => setActiveEvent(e.target.value)}>
              {events.map(ev => <option key={ev._id} value={ev._id}>{ev.title}</option>)}
            </select>
          )}
        </div>

        {/* Stats */}
        <div className="checkin-stats">
          {[
            { icon: '✅', label: 'Checked In',     value: stats.checkedIn,     color: 'var(--teal)' },
            { icon: '🎟️', label: 'Total Expected', value: stats.totalExpected, color: '#fff' },
            { icon: '❌', label: 'Invalid Scans',  value: stats.invalidScans,  color: 'var(--red)' },
            { icon: '📊', label: 'Check-In Rate',  value: `${stats.checkInRate}%`, color: 'var(--orange)' },
          ].map(s => (
            <div key={s.label} className="checkin-stat">
              <span className="checkin-stat-icon">{s.icon}</span>
              <div>
                <p className="checkin-stat-val" style={{ color: s.color }}>{s.value}</p>
                <p className="checkin-stat-lbl">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Progress */}
        <div className="checkin-prog-card">
          <div className="checkin-prog-text">
            <span>Overall attendance progress</span>
            <span className="checkin-prog-pct">{stats.checkInRate}%</span>
          </div>
          <div className="prog-dark">
            <div className="prog-fill prog-fill-green" style={{ width: `${stats.checkInRate}%` }} />
          </div>
          <p className="checkin-prog-sub">
            {stats.checkedIn.toLocaleString()} checked in of {stats.totalExpected.toLocaleString()} expected
          </p>
        </div>

        {/* Main two-column */}
        <div className="checkin-main">

          {/* Scanner */}
          <div className="scanner-panel">
            <h2 className="scanner-title">QR Scanner</h2>

            <div className={`viewfinder ${scanState !== 'idle' ? scanState : ''}`}>
              {scanState === 'idle' && (
                <div className="vf-idle">
                  <div className="vf-corner vf-tl" /><div className="vf-corner vf-tr" />
                  <div className="vf-corner vf-bl" /><div className="vf-corner vf-br" />
                  <span className="vf-cam">📷</span>
                  <p className="vf-hint">Camera ready</p>
                  <p className="vf-hint vf-hint-sm">Point at attendee QR code</p>
                </div>
              )}
              {scanState === 'scanning' && (
                <div className="vf-scanning">
                  <div className="scan-line" />
                  <span className="vf-cam">🔍</span>
                  <p className="vf-hint">Scanning...</p>
                </div>
              )}
              {scanState === 'valid' && (
                <div className="vf-result vf-valid">
                  <span className="vf-result-icon">✅</span>
                  <p className="vf-result-title">Ticket Valid!</p>
                  <p className="vf-result-sub">{resultMsg}</p>
                </div>
              )}
              {scanState === 'invalid' && (
                <div className="vf-result vf-invalid">
                  <span className="vf-result-icon">❌</span>
                  <p className="vf-result-title">Invalid Ticket</p>
                  <p className="vf-result-sub">{resultMsg}</p>
                </div>
              )}
            </div>

            <button className="btn btn-primary btn-full scanner-btn" onClick={simulateScan} disabled={scanState === 'scanning' || !activeEvent}>
              {scanState === 'scanning' ? '⏳ Scanning...' : '📱 Scan QR Code'}
            </button>
            <p className="scanner-note">In production this opens your device camera for live QR scanning.</p>

            {/* Manual lookup */}
            <form className="manual-lookup" onSubmit={handleManualLookup}>
              <p className="manual-title">Manual Ticket Lookup</p>
              <div className="manual-row">
                <input
                  className="input"
                  placeholder="e.g. QT-2025-A3X9B"
                  value={manualId}
                  onChange={e => setManualId(e.target.value)}
                />
                <button type="submit" className="btn btn-outline" disabled={!activeEvent}>Check</button>
              </div>
            </form>
          </div>

          {/* Live feed */}
          <div className="scan-feed">
            <div className="feed-header">
              <h2 className="feed-title">Recent Scans</h2>
              <span className="badge badge-dark">{feed.length} total</span>
            </div>
            <div className="feed-list">
              {feed.length === 0 && <p style={{ color: 'rgba(255,255,255,.3)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>No check-ins yet</p>}
              {feed.map((entry, i) => (
                <div key={i} className={`feed-entry ${entry.status}`}>
                  <span className="feed-icon">{entry.status === 'valid' ? '✅' : '❌'}</span>
                  <div className="feed-info">
                    <p className="feed-name">{entry.name}</p>
                    <p className="feed-id">{entry.id}</p>
                  </div>
                  <span className="feed-time">{new Date(entry.checkedInAt).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              ))}
            </div>
            <div className="feed-footer">
              <p className="feed-summary">{stats.checkedIn} checked in · {stats.invalidScans} invalid</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}