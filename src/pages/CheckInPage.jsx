import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import client from '../api/client'

export default function CheckInPage() {
  const navigate      = useNavigate()
  const [events,      setEvents]      = useState([])
  const [activeEvent, setActiveEvent] = useState('')
  const [stats,       setStats]       = useState(null)
  const [feed,        setFeed]        = useState([])
  const [ticketId,    setTicketId]    = useState('')
  const [result,      setResult]      = useState(null)
  const [checking,    setChecking]    = useState(false)
  const [scanning,    setScanning]    = useState(false)
  const [camError,    setCamError]    = useState('')

  const inputRef  = useRef(null)
  const videoRef  = useRef(null)
  const canvasRef = useRef(null)
  const animRef   = useRef(null)
  const pollRef   = useRef(null)
  const jsQRRef   = useRef(null)

  // Load jsQR dynamically so it doesn't break the build if missing
  useEffect(() => {
    import('jsqr').then(m => { jsQRRef.current = m.default }).catch(() => {})
  }, [])

  useEffect(() => {
    client.get('/events/my')
      .then(r => {
        const evs = r.data.events || []
        setEvents(evs)
        if (evs.length) setActiveEvent(evs[0]._id)
      })
      .catch(() => {})
  }, [])

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

  // Extract QT-xxx from the scanned URL or raw ID
  const extractId = (raw) => {
    if (!raw) return ''
    // If it's a URL like https://quicktiks.netlify.app/ticket/QT-xxx
    if (raw.includes('/ticket/')) {
      return raw.split('/ticket/')[1].split('?')[0].trim().toUpperCase()
    }
    return raw.trim().toUpperCase()
  }

  // Scan loop — runs every animation frame
  const tick = useCallback(() => {
    const video  = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || !jsQRRef.current) {
      animRef.current = requestAnimationFrame(tick)
      return
    }
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width  = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      const img  = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const code = jsQRRef.current(img.data, img.width, img.height, { inversionAttempts: 'dontInvert' })
      if (code?.data) {
        const id = extractId(code.data)
        stopScan()
        setTicketId(id)
        // Auto-submit after a short delay so the UI updates first
        setTimeout(() => doCheckIn(id), 150)
        return
      }
    }
    animRef.current = requestAnimationFrame(tick)
  }, [])

  const startScan = async () => {
    setCamError('')
    setResult(null)
    if (!jsQRRef.current) {
      setCamError('QR scanner not loaded yet. Please wait a moment and try again.')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // rear camera on phones
      })
      setScanning(true)
      // Small delay to let the modal render before attaching stream
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()
          animRef.current = requestAnimationFrame(tick)
        }
      }, 100)
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        setCamError('Camera permission denied. Please allow camera access in your browser settings.')
      } else if (err.name === 'NotFoundError') {
        setCamError('No camera found on this device.')
      } else {
        setCamError('Could not open camera. Use manual entry below instead.')
      }
    }
  }

  const stopScan = () => {
    cancelAnimationFrame(animRef.current)
    const stream = videoRef.current?.srcObject
    if (stream) stream.getTracks().forEach(t => t.stop())
    if (videoRef.current) videoRef.current.srcObject = null
    setScanning(false)
  }

  const doCheckIn = async (id) => {
    const tid = (id || ticketId).trim().toUpperCase()
    if (!tid || !activeEvent) return
    setChecking(true)
    setResult(null)
    try {
      const r = await client.post('/checkin/manual', {
        ticketId: tid,
        eventId:  activeEvent
      })
      setResult({ valid: r.data.valid, name: r.data.attendee?.name, reason: r.data.reason })
      if (r.data.valid) {
        client.get(`/checkin/${activeEvent}/stats`).then(r => setStats(r.data.stats)).catch(() => {})
        client.get(`/checkin/${activeEvent}/feed`).then(r => setFeed(r.data.feed || [])).catch(() => {})
      }
    } catch (err) {
      setResult({ valid: false, reason: err.response?.data?.message || 'Check-in failed.' })
    } finally {
      setChecking(false)
      setTicketId('')
      if (!scanning) inputRef.current?.focus()
    }
  }

  const handleManual = (e) => {
    e.preventDefault()
    doCheckIn()
  }

  return (
    <div className="checkin-page fade-up">

      {/* ── Camera overlay ── */}
      {scanning && (
        <div style={{ position:'fixed', inset:0, background:'#000', zIndex:1000, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
          <div style={{ position:'relative', width:'100%', maxWidth:480 }}>
            <video ref={videoRef} style={{ width:'100%', display:'block', borderRadius:0 }} playsInline muted />
            {/* Hidden canvas used for frame analysis */}
            <canvas ref={canvasRef} style={{ display:'none' }} />
            {/* Viewfinder overlay */}
            <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', pointerEvents:'none' }}>
              <div style={{ width:220, height:220, position:'relative' }}>
                {[
                  { top:0, left:0, borderTop:'3px solid #FF5C00', borderLeft:'3px solid #FF5C00' },
                  { top:0, right:0, borderTop:'3px solid #FF5C00', borderRight:'3px solid #FF5C00' },
                  { bottom:0, left:0, borderBottom:'3px solid #FF5C00', borderLeft:'3px solid #FF5C00' },
                  { bottom:0, right:0, borderBottom:'3px solid #FF5C00', borderRight:'3px solid #FF5C00' },
                ].map((s, i) => (
                  <div key={i} style={{ position:'absolute', width:32, height:32, ...s }} />
                ))}
              </div>
            </div>
          </div>
          <p style={{ color:'rgba(255,255,255,.7)', fontSize:14, marginTop:20, textAlign:'center' }}>
            Point camera at the attendee's QR code
          </p>
          <button
            onClick={stopScan}
            style={{ marginTop:20, background:'rgba(255,255,255,.15)', border:'none', color:'#fff', padding:'12px 32px', borderRadius:50, fontSize:15, cursor:'pointer', fontFamily:'inherit' }}
          >
            ✕ Cancel
          </button>
        </div>
      )}

      {/* ── Top bar ── */}
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
            {/* Event selector */}
            <div className="checkin-event-row">
              <div className="checkin-event-info">
                <div style={{ width:40, height:40, background:'rgba(255,255,255,.1)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, overflow:'hidden' }}>
                  {currentEvent?.coverImage
                    ? <img src={currentEvent.coverImage} alt={currentEvent.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                    : <span style={{ fontSize:18 }}>🎟️</span>}
                </div>
                <div>
                  <p className="checkin-event-title">{currentEvent?.title || 'Select event'}</p>
                  {currentEvent && (
                    <p className="checkin-event-meta">
                      {new Date(currentEvent.date).toLocaleDateString('en-NG', { month:'short', day:'numeric', year:'numeric' })}
                    </p>
                  )}
                </div>
              </div>
              {events.length > 1 && (
                <select className="checkin-select" value={activeEvent} onChange={e => { setActiveEvent(e.target.value); setResult(null) }}>
                  {events.map(ev => <option key={ev._id} value={ev._id}>{ev.title}</option>)}
                </select>
              )}
            </div>

            {/* Stats */}
            {stats && (
              <div className="checkin-stats">
                {[
                  { icon:'✅', label:'Checked In',    value: stats.checkedIn     ?? 0,        color:'#4ade80' },
                  { icon:'🎟️', label:'Total Expected', value: stats.totalExpected ?? 0,        color:'#fff' },
                  { icon:'⏳', label:'Remaining',      value: stats.remaining     ?? 0,        color:'#facc15' },
                  { icon:'📊', label:'Check-In Rate',  value: `${stats.checkInRate ?? 0}%`,   color:'#fb923c' },
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

            <div className="checkin-main">
              <div className="scanner-panel">

                {/* ── Scan button ── */}
                <button
                  className="btn btn-primary btn-full"
                  style={{ padding:16, fontSize:16, marginBottom:16, display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}
                  onClick={startScan}
                  disabled={checking}
                >
                  <span style={{ fontSize:22 }}>📷</span>
                  Scan QR Code with Camera
                </button>

                {camError && (
                  <div style={{ background:'rgba(248,113,113,.12)', border:'1px solid #f87171', borderRadius:12, padding:'10px 14px', fontSize:13, color:'#f87171', marginBottom:12 }}>
                    {camError}
                  </div>
                )}

                <div style={{ display:'flex', alignItems:'center', gap:12, margin:'16px 0', color:'rgba(255,255,255,.3)', fontSize:13 }}>
                  <div style={{ flex:1, height:1, background:'rgba(255,255,255,.1)' }} />
                  or enter ticket ID manually
                  <div style={{ flex:1, height:1, background:'rgba(255,255,255,.1)' }} />
                </div>

                {/* ── Manual entry ── */}
                <form onSubmit={handleManual} style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  <input
                    ref={inputRef}
                    className="input"
                    placeholder="QT-1234567-ABC123"
                    value={ticketId}
                    onChange={e => setTicketId(e.target.value.toUpperCase())}
                    style={{ fontFamily:'monospace', fontSize:16, letterSpacing:1, textTransform:'uppercase' }}
                    autoComplete="off"
                    autoCapitalize="characters"
                  />
                  <button
                    type="submit"
                    className="btn btn-outline btn-full"
                    disabled={checking || !ticketId.trim() || !activeEvent}
                    style={{ padding:13 }}
                  >
                    {checking ? '⏳ Checking...' : '✅ Check In'}
                  </button>
                </form>

                {/* ── Result ── */}
                {result && (
                  <div style={{
                    marginTop: 20, padding:'20px', borderRadius:16, textAlign:'center',
                    background: result.valid ? 'rgba(74,222,128,.12)' : 'rgba(248,113,113,.12)',
                    border: `1.5px solid ${result.valid ? '#4ade80' : '#f87171'}`
                  }}>
                    <p style={{ fontSize:44, margin:'0 0 8px' }}>{result.valid ? '✅' : '❌'}</p>
                    <p style={{ fontSize:18, fontWeight:700, color: result.valid ? '#4ade80' : '#f87171', margin:'0 0 6px' }}>
                      {result.valid ? 'Check-In Successful!' : 'Invalid Ticket'}
                    </p>
                    {result.valid
                      ? <p style={{ color:'rgba(255,255,255,.7)', fontSize:15 }}>Welcome, <strong>{result.name}</strong>! 🎉</p>
                      : <p style={{ color:'rgba(255,255,255,.5)', fontSize:14 }}>{result.reason}</p>
                    }
                    <button
                      onClick={() => { setResult(null); startScan() }}
                      className="btn btn-primary"
                      style={{ marginTop:14, padding:'10px 24px', fontSize:14 }}
                    >
                      📷 Scan Next
                    </button>
                  </div>
                )}
              </div>

              {/* ── Live feed ── */}
              <div className="scan-feed">
                <div className="feed-header">
                  <h2 className="feed-title">Recent Check-Ins</h2>
                  <span className="badge badge-dark">{feed.length}</span>
                </div>
                <div className="feed-list">
                  {feed.length === 0 && (
                    <p style={{ color:'rgba(255,255,255,.3)', fontSize:13, textAlign:'center', padding:'24px 0' }}>No check-ins yet</p>
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