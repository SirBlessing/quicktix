import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import client from '../api/client'
import jsQR from 'jsqr'

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
  const streamRef = useRef(null)

  useEffect(() => {
    client.get('/events/my')
      .then(r => { const e = r.data.events||[]; setEvents(e); if(e.length) setActiveEvent(e[0]._id) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!activeEvent) return
    const load = () => {
      client.get(`/checkin/${activeEvent}/stats`).then(r=>setStats(r.data.stats)).catch(()=>{})
      client.get(`/checkin/${activeEvent}/feed`).then(r=>setFeed(r.data.feed||[])).catch(()=>{})
    }
    load()
    pollRef.current = setInterval(load, 8000)
    return () => clearInterval(pollRef.current)
  }, [activeEvent])

  // Clean up camera when unmounting
  useEffect(() => () => stopScan(), [])

  const currentEvent = events.find(e => e._id === activeEvent)

  const extractId = (raw='') => {
    if (raw.includes('/ticket/')) return raw.split('/ticket/')[1].split('?')[0].trim().toUpperCase()
    return raw.trim().toUpperCase()
  }

  const scanLoop = useCallback(() => {
    const video  = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || !scanning) return

    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && video.videoWidth > 0) {
      canvas.width  = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      const img  = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const code = jsQR(img.data, img.width, img.height, { inversionAttempts: 'dontInvert' })
      if (code?.data) {
        const id = extractId(code.data)
        stopScan()
        setTicketId(id)
        doCheckIn(id)
        return
      }
    }
    animRef.current = requestAnimationFrame(scanLoop)
  }, [scanning])

  const startScan = async () => {
    setCamError('')
    setResult(null)
    if (!navigator.mediaDevices?.getUserMedia) {
      setCamError('Camera not supported on this browser. Use manual entry below.')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      })
      streamRef.current = stream
      setScanning(true)
    } catch (err) {
      if (err.name === 'NotAllowedError') setCamError('Camera permission denied. Please allow camera access and try again.')
      else if (err.name === 'NotFoundError') setCamError('No camera found on this device.')
      else setCamError('Could not open camera. Use manual entry below.')
    }
  }

  // Attach stream to video element once scanning=true and video is mounted
  useEffect(() => {
    if (!scanning || !videoRef.current || !streamRef.current) return
    const video = videoRef.current
    video.srcObject = streamRef.current
    video.setAttribute('playsinline', 'true')  // required for iOS
    video.setAttribute('muted', 'true')
    video.muted = true
    video.play()
      .then(() => { animRef.current = requestAnimationFrame(scanLoop) })
      .catch(() => setCamError('Could not start camera preview.'))
    return () => cancelAnimationFrame(animRef.current)
  }, [scanning, scanLoop])

  const stopScan = () => {
    cancelAnimationFrame(animRef.current)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) videoRef.current.srcObject = null
    setScanning(false)
  }

  const doCheckIn = async (id) => {
    const tid = (id || ticketId).trim().toUpperCase()
    if (!tid || !activeEvent) return
    setChecking(true)
    setResult(null)
    try {
      const r = await client.post('/checkin/manual', { ticketId: tid, eventId: activeEvent })
      setResult({ valid: r.data.valid, name: r.data.attendee?.name, reason: r.data.reason })
      if (r.data.valid) {
        client.get(`/checkin/${activeEvent}/stats`).then(r=>setStats(r.data.stats)).catch(()=>{})
        client.get(`/checkin/${activeEvent}/feed`).then(r=>setFeed(r.data.feed||[])).catch(()=>{})
      }
    } catch (err) {
      setResult({ valid: false, reason: err.response?.data?.message || 'Check-in failed.' })
    } finally {
      setChecking(false)
      setTicketId('')
      if (!scanning) inputRef.current?.focus()
    }
  }

  return (
    <div className="checkin-page fade-up">

      {/* Camera overlay */}
      {scanning && (
        <div style={{ position:'fixed', inset:0, background:'#000', zIndex:9999, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
          <div style={{ position:'relative', width:'100%', maxWidth:500 }}>
            <video
              ref={videoRef}
              style={{ width:'100%', display:'block' }}
              playsInline muted autoPlay
            />
            <canvas ref={canvasRef} style={{ display:'none' }} />
            {/* Corner guides */}
            <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', pointerEvents:'none' }}>
              <div style={{ width:240, height:240, position:'relative' }}>
                {[{top:0,left:0,borderTop:'3px solid #FF5C00',borderLeft:'3px solid #FF5C00'},
                  {top:0,right:0,borderTop:'3px solid #FF5C00',borderRight:'3px solid #FF5C00'},
                  {bottom:0,left:0,borderBottom:'3px solid #FF5C00',borderLeft:'3px solid #FF5C00'},
                  {bottom:0,right:0,borderBottom:'3px solid #FF5C00',borderRight:'3px solid #FF5C00'}
                ].map((s,i) => <div key={i} style={{ position:'absolute', width:36, height:36, ...s }} />)}
              </div>
            </div>
            {/* Scan line animation */}
            <div style={{ position:'absolute', left:'50%', transform:'translateX(-50%)', top:'calc(50% - 120px)', width:240, height:2, background:'#FF5C00', opacity:.7, boxShadow:'0 0 8px #FF5C00', animation:'scanline 2s linear infinite' }} />
          </div>
          <p style={{ color:'rgba(255,255,255,.7)', fontSize:14, marginTop:20, textAlign:'center', padding:'0 24px' }}>
            Point the camera at the attendee's QR code
          </p>
          <button onClick={stopScan} style={{ marginTop:16, background:'rgba(255,255,255,.15)', border:'none', color:'#fff', padding:'12px 32px', borderRadius:50, fontSize:15, cursor:'pointer', fontFamily:'inherit' }}>
            ✕ Cancel
          </button>
          <style>{`@keyframes scanline { 0%{top:calc(50% - 120px)} 50%{top:calc(50% + 118px)} 100%{top:calc(50% - 120px)} }`}</style>
        </div>
      )}

      {/* Top bar */}
      <header className="checkin-top">
        <div className="checkin-top-inner">
          <div className="checkin-brand">
            <div className="checkin-logo">Q</div>
            <span className="checkin-name">QuickTix</span>
            <span className="checkin-divider">|</span>
            <span className="checkin-mode">Check-In</span>
          </div>
          <button className="btn btn-ghost-dark btn-sm" onClick={() => navigate('/dashboard')}>← Dashboard</button>
        </div>
      </header>

      <div className="checkin-body">
        {events.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 24px', color:'rgba(255,255,255,.5)' }}>
            <p style={{ fontSize:40, marginBottom:12 }}>📭</p>
            <p>No events found.</p>
            <button className="btn btn-primary" style={{ marginTop:16 }} onClick={() => navigate('/create-event')}>Create Event</button>
          </div>
        ) : (
          <>
            {/* Event selector */}
            <div className="checkin-event-row">
              <div className="checkin-event-info">
                <div style={{ width:40, height:40, background:'rgba(255,255,255,.1)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, overflow:'hidden' }}>
                  {currentEvent?.coverImage ? <img src={currentEvent.coverImage} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <span>🎟️</span>}
                </div>
                <div>
                  <p className="checkin-event-title">{currentEvent?.title || 'Select event'}</p>
                  {currentEvent && <p className="checkin-event-meta">{new Date(currentEvent.date).toLocaleDateString('en-NG',{month:'short',day:'numeric',year:'numeric'})}</p>}
                </div>
              </div>
              {events.length > 1 && (
                <select className="checkin-select" value={activeEvent} onChange={e=>{setActiveEvent(e.target.value);setResult(null)}}>
                  {events.map(ev => <option key={ev._id} value={ev._id}>{ev.title}</option>)}
                </select>
              )}
            </div>

            {/* Stats */}
            {stats && (
              <div className="checkin-stats">
                {[
                  {icon:'✅', label:'Checked In',    value:stats.checkedIn??0,           color:'#4ade80'},
                  {icon:'🎟️', label:'Total Expected', value:stats.totalExpected??0,       color:'#fff'},
                  {icon:'⏳', label:'Remaining',      value:stats.remaining??0,           color:'#facc15'},
                  {icon:'📊', label:'Check-In Rate',  value:`${stats.checkInRate??0}%`,   color:'#fb923c'},
                ].map(s => (
                  <div key={s.label} className="checkin-stat">
                    <span className="checkin-stat-icon">{s.icon}</span>
                    <div>
                      <p className="checkin-stat-val" style={{color:s.color}}>{s.value}</p>
                      <p className="checkin-stat-lbl">{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="checkin-main">
              <div className="scanner-panel">

                {/* Scan button */}
                <button
                  className="btn btn-primary btn-full"
                  style={{ padding:16, fontSize:16, marginBottom:16, display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}
                  onClick={startScan}
                  disabled={checking}
                >
                  <span style={{fontSize:22}}>📷</span> Scan QR Code
                </button>

                {camError && (
                  <div style={{ background:'rgba(248,113,113,.12)', border:'1px solid #f87171', borderRadius:12, padding:'10px 14px', fontSize:13, color:'#f87171', marginBottom:12 }}>
                    ⚠️ {camError}
                  </div>
                )}

                <div style={{ display:'flex', alignItems:'center', gap:12, margin:'16px 0', color:'rgba(255,255,255,.3)', fontSize:12 }}>
                  <div style={{ flex:1, height:1, background:'rgba(255,255,255,.1)' }} />
                  or enter ticket ID manually
                  <div style={{ flex:1, height:1, background:'rgba(255,255,255,.1)' }} />
                </div>

                <form onSubmit={e=>{e.preventDefault();doCheckIn()}} style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  <input
                    ref={inputRef}
                    className="input"
                    placeholder="QT-1234567-ABC123"
                    value={ticketId}
                    onChange={e=>setTicketId(e.target.value.toUpperCase())}
                    style={{ fontFamily:'monospace', fontSize:15, letterSpacing:1 }}
                    autoComplete="off"
                  />
                  <button type="submit" className="btn btn-outline btn-full" disabled={checking||!ticketId.trim()||!activeEvent} style={{padding:13}}>
                    {checking ? '⏳ Checking...' : '✅ Check In'}
                  </button>
                </form>

                {/* Result */}
                {result && (
                  <div style={{
                    marginTop:20, padding:20, borderRadius:16, textAlign:'center',
                    background: result.valid ? 'rgba(74,222,128,.12)' : 'rgba(248,113,113,.12)',
                    border: `1.5px solid ${result.valid ? '#4ade80' : '#f87171'}`
                  }}>
                    <p style={{fontSize:44, margin:'0 0 8px'}}>{result.valid ? '✅' : '❌'}</p>
                    <p style={{fontSize:18, fontWeight:700, color: result.valid?'#4ade80':'#f87171', margin:'0 0 6px'}}>
                      {result.valid ? 'Check-In Successful!' : 'Invalid Ticket'}
                    </p>
                    {result.valid
                      ? <p style={{color:'rgba(255,255,255,.7)',fontSize:15}}>Welcome, <strong>{result.name}</strong>! 🎉</p>
                      : <p style={{color:'rgba(255,255,255,.5)',fontSize:14}}>{result.reason}</p>
                    }
                    <button onClick={()=>{setResult(null);startScan()}} className="btn btn-primary" style={{marginTop:14,padding:'10px 24px',fontSize:14}}>
                      📷 Scan Next
                    </button>
                  </div>
                )}
              </div>

              {/* Live feed */}
              <div className="scan-feed">
                <div className="feed-header">
                  <h2 className="feed-title">Recent Check-Ins</h2>
                  <span className="badge badge-dark">{feed.length}</span>
                </div>
                <div className="feed-list">
                  {feed.length === 0 && <p style={{color:'rgba(255,255,255,.3)',fontSize:13,textAlign:'center',padding:'24px 0'}}>No check-ins yet</p>}
                  {feed.map((entry,i) => (
                    <div key={i} className="feed-entry valid">
                      <span className="feed-icon">✅</span>
                      <div className="feed-info">
                        <p className="feed-name">{entry.name}</p>
                        <p className="feed-id">{entry.id}</p>
                      </div>
                      <span className="feed-time">{new Date(entry.checkedInAt).toLocaleTimeString('en-NG',{hour:'2-digit',minute:'2-digit'})}</span>
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