import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import client from '../api/client'

export default function CheckInPage() {
  const navigate      = useNavigate()
  const { user }      = useAuth()
  const [events,      setEvents]      = useState([])
  const [activeEvent, setActiveEvent] = useState('')
  const [stats,       setStats]       = useState(null)
  const [feed,        setFeed]        = useState([])
  const [ticketId,    setTicketId]    = useState('')
  const [result,      setResult]      = useState(null) // { valid, name, reason }
  const [checking,    setChecking]    = useState(false)
  const inputRef = useRef(null)
  const pollRef  = useRef(null)

  // Load organizer's events
  useEffect(() => {
    client.get('/events/my')
      .then(r => {
        const evs = r.data.events || []
        setEvents(evs)
        if (evs.length) setActiveEvent(evs[0]._id)
      })
      .catch(() => {})
  }, [])

  // Poll stats + feed when active event changes
  useEffect(() => {
    if (!activeEvent) return
    const load = () => {
      client.get(`/checkin/${activeEvent}/stats`).then(r => setStats(r.data.stats)).catch(() => {})
      client.get(`/checkin/${activeEvent}/feed`).then(r => setFeed(r.data.feed || [])).catch(() => {})
    }
    load()
    pollRef.current = setInterval(load, 8000)
    return () => clearInterval(pollRef.current)
  }, [activeEvent])

  const currentEvent = events.find(e => e._id === activeEvent)

  const checkIn = async (e) => {
    e.preventDefault()
    if (!ticketId.trim() || !activeEvent) return
    setChecking(true)
    setResult(null)
    try {
      const r = await client.post('/checkin/manual', {
        ticketId: ticketId.trim().toUpperCase(),
        eventId:  activeEvent
      })
      setResult({ valid: r.data.valid, name: r.data.attendee?.name, reason: r.data.reason, checkedAt: r.data.checkedAt })
      if (r.data.valid) {
        // Refresh stats after successful check-in
        client.get(`/checkin/${activeEvent}/stats`).then(r => setStats(r.data.stats)).catch(() => {})
        client.get(`/checkin/${activeEvent}/feed`).then(r => setFeed(r.data.feed || [])).catch(() => {})
      }
    } catch (err) {
      setResult({ valid: false, reason: err.response?.data?.message || 'Check-in failed. Try again.' })
    } finally {
      setChecking(false)
      setTicketId('')
      inputRef.current?.focus()
    }
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
            <span className="checkin-mode">Check-In</span>
          </div>
          <button className="btn btn-ghost-dark btn-sm" onClick={() => navigate('/dashboard')}>
            ← Dashboard
          </button>
        </div>
      </header>

      <div className="checkin-body">

        {/* Event selector */}
        {events.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 24px', color:'rgba(255,255,255,.5)' }}>
            <p style={{ fontSize:32, marginBottom:12 }}>📭</p>
            <p>No events found. Create an event first.</p>
            <button className="btn btn-primary" style={{ marginTop:16 }} onClick={() => navigate('/create-event')}>
              Create Event
            </button>
          </div>
        ) : (
          <>
            <div className="checkin-event-row">
              <div className="checkin-event-info">
                <div style={{ width:40, height:40, background:'rgba(255,255,255,.1)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, overflow:'hidden' }}>
                  {currentEvent?.coverImage
                    ? <img src={currentEvent.coverImage} alt={currentEvent.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                    : <span style={{ fontSize:18 }}>🎟️</span>}
                </div>
                <div>
                  <p className="checkin-event-title">{currentEvent?.title || 'Select an event'}</p>
                  {currentEvent && (
                    <p className="checkin-event-meta">
                      📅 {new Date(currentEvent.date).toLocaleDateString('en-NG', { month:'short', day:'numeric', year:'numeric' })}
                    </p>
                  )}
                </div>
              </div>
              {events.length > 1 && (
                <select className="checkin-select" value={activeEvent} onChange={e => setActiveEvent(e.target.value)}>
                  {events.map(ev => <option key={ev._id} value={ev._id}>{ev.title}</option>)}
                </select>
              )}
            </div>

            {/* Stats */}
            {stats && (
              <div className="checkin-stats">
                {[
                  { icon:'✅', label:'Checked In',    value: stats.checkedIn     ?? 0,  color:'#4ade80' },
                  { icon:'🎟️', label:'Total Expected', value: stats.totalExpected ?? 0,  color:'#fff' },
                  { icon:'⏳', label:'Remaining',      value: stats.remaining     ?? 0,  color:'#facc15' },
                  { icon:'📊', label:'Check-In Rate',  value: `${stats.checkInRate ?? 0}%`, color:'#fb923c' },
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
            )}

            {/* Main grid */}
            <div className="checkin-main">

              {/* Manual check-in */}
              <div className="scanner-panel">
                <h2 className="scanner-title">Manual Check-In</h2>
                <p style={{ color:'rgba(255,255,255,.5)', fontSize:13, marginBottom:20 }}>
                  Type the ticket ID (e.g. QT-1234567-ABC123) or scan the QR code with a barcode scanner plugged into your device.
                </p>

                <form onSubmit={checkIn} style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  <input
                    ref={inputRef}
                    className="input"
                    placeholder="QT-1234567-ABC123"
                    value={ticketId}
                    onChange={e => setTicketId(e.target.value.toUpperCase())}
                    style={{ fontFamily:'monospace', fontSize:16, letterSpacing:1, textTransform:'uppercase' }}
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="btn btn-primary btn-full"
                    disabled={checking || !ticketId.trim() || !activeEvent}
                    style={{ padding:14, fontSize:15 }}
                  >
                    {checking ? '⏳ Checking...' : '✅ Check In Attendee'}
                  </button>
                </form>

                {/* Result */}
                {result && (
                  <div style={{
                    marginTop: 20,
                    padding: '18px 20px',
                    borderRadius: 16,
                    background: result.valid ? 'rgba(74,222,128,.12)' : 'rgba(248,113,113,.12)',
                    border: `1.5px solid ${result.valid ? '#4ade80' : '#f87171'}`,
                    textAlign: 'center'
                  }}>
                    <p style={{ fontSize: 40, marginBottom: 8 }}>{result.valid ? '✅' : '❌'}</p>
                    <p style={{ fontSize: 17, fontWeight: 700, color: result.valid ? '#4ade80' : '#f87171', marginBottom: 4 }}>
                      {result.valid ? 'Check-In Successful!' : 'Invalid Ticket'}
                    </p>
                    {result.valid
                      ? <p style={{ color:'rgba(255,255,255,.7)', fontSize:15 }}>Welcome, <strong>{result.name}</strong>!</p>
                      : <p style={{ color:'rgba(255,255,255,.5)', fontSize:14 }}>{result.reason}</p>
                    }
                  </div>
                )}

                <div style={{ marginTop:24, padding:'14px 16px', background:'rgba(255,255,255,.04)', borderRadius:12, fontSize:13, color:'rgba(255,255,255,.4)', lineHeight:1.6 }}>
                  💡 <strong style={{ color:'rgba(255,255,255,.6)' }}>Tip:</strong> When an attendee shows their QR code, you can use any barcode/QR scanner device — it will type the ticket ID into the box automatically and submit. Or type it manually.
                </div>
              </div>

              {/* Live feed */}
              <div className="scan-feed">
                <div className="feed-header">
                  <h2 className="feed-title">Recent Check-Ins</h2>
                  <span className="badge badge-dark">{feed.length}</span>
                </div>
                <div className="feed-list">
                  {feed.length === 0 && (
                    <p style={{ color:'rgba(255,255,255,.3)', fontSize:13, textAlign:'center', padding:'24px 0' }}>
                      No check-ins yet
                    </p>
                  )}
                  {feed.map((entry, i) => (
                    <div key={i} className="feed-entry valid">
                      <span className="feed-icon">✅</span>
                      <div className="feed-info">
                        <p className="feed-name">{entry.name}</p>
                        <p className="feed-id">{entry.id}</p>
                      </div>
                      <span className="feed-time">
                        {new Date(entry.checkedInAt).toLocaleTimeString('en-NG', { hour:'2-digit', minute:'2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </>
        )}
      </div>
    </div>
  )
}