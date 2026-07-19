import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import client from '../api/client'
import EventCover from '../components/EventCover'

export default function EventPage() {
  const { id }       = useParams()
  const navigate     = useNavigate()
  const { user }     = useAuth()
  const [event,   setEvent]  = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied,  setCopied]  = useState(false)

  useEffect(() => {
    client.get(`/events/${id}`)
      .then(r => setEvent(r.data.event))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="loading-screen"><div className="spinner" /></div>
  )

  if (!event) return (
    <div className="page" style={{ textAlign:'center', padding:'80px 24px' }}>
      <p style={{ fontSize:48 }}>😕</p>
      <h2 style={{ fontSize:20, fontWeight:700, margin:'16px 0 8px' }}>Event not found</h2>
      <button className="btn btn-primary" onClick={() => navigate('/explore')}>Browse Events</button>
    </div>
  )

  const pct       = Math.round(((event.ticketsSold||0) / event.capacity) * 100)
  const spotsLeft = event.capacity - (event.ticketsSold||0)
  const dateStr   = new Date(event.date).toLocaleDateString('en-NG', {
    weekday:'long', year:'numeric', month:'long', day:'numeric'
  })
  const pageURL = window.location.href

  // Is the logged-in user the organizer?
  const isOrganizer = user && event.organizer &&
    (event.organizer._id === user._id || event.organizer === user._id ||
     event.organizer?._id?.toString() === user._id?.toString())

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(pageURL) }
    catch { const el = document.createElement('input'); el.value = pageURL; document.body.appendChild(el); el.select(); document.execCommand('copy'); document.body.removeChild(el) }
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const shareWhatsApp = () => window.open(`https://wa.me/?text=${encodeURIComponent(`Check out "${event.title}" on QuickTix! 🎟️\n${pageURL}`)}`, '_blank')
  const shareTwitter  = () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out "${event.title}" on QuickTix! 🎟️`)}&url=${encodeURIComponent(pageURL)}`, '_blank')

  return (
    <div className="event-page fade-up">
      <div className="event-banner">
        <EventCover src={event.coverImage} alt={event.title} />
      </div>

      <div className="container">
        <div className="event-grid">

          {/* ── Left — event details ── */}
          <div>
            <div className="card event-main" style={{ marginTop:0 }}>
              <div className="event-badges">
                <span className="badge badge-gray">{event.category}</span>
                {event.isFree && <span className="badge badge-green">FREE</span>}
                {event.status === 'cancelled' && <span className="badge badge-red">CANCELLED</span>}
              </div>
              <h1 className="event-h1">{event.title}</h1>
              <div className="event-metas">
                <div className="event-meta-item"><span className="event-meta-icon">📅</span><span>{dateStr} at {event.time}</span></div>
                <div className="event-meta-item"><span className="event-meta-icon">📍</span><span>{event.location}</span></div>
                <div className="event-meta-item"><span className="event-meta-icon">🎙️</span><span>Organized by <strong>{event.organizer?.name || event.organizerName || 'Organizer'}</strong></span></div>
              </div>
              <div className="divider" />
              <h2 className="event-about-title">About this Event</h2>
              <p className="event-about">{event.description}</p>
            </div>

            <div className="card event-share" style={{ marginTop:18 }}>
              <p className="share-title">Share this event</p>
              <div className="share-btns">
                <button className="share-btn" onClick={shareWhatsApp}>📱 WhatsApp</button>
                <button className="share-btn" onClick={shareTwitter}>🐦 Twitter / X</button>
                <button className="share-btn" onClick={copyLink}>{copied ? '✅ Copied!' : '🔗 Copy Link'}</button>
              </div>
            </div>
          </div>

          {/* ── Right — widget ── */}
          <div>

            {/* ── ORGANIZER PANEL ── */}
            {isOrganizer ? (
              <div className="card ticket-widget">
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16, padding:'10px 14px', background:'rgba(255,92,0,.08)', borderRadius:12 }}>
                  <span style={{ fontSize:20 }}>🎛️</span>
                  <div>
                    <p style={{ fontSize:13, fontWeight:700, color:'var(--orange)', margin:0 }}>You're the organizer</p>
                    <p style={{ fontSize:12, color:'var(--txt3)', margin:0 }}>Manage this event from here</p>
                  </div>
                </div>

                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  <button
                    className="btn btn-primary btn-full"
                    onClick={() => navigate(`/edit-event/${event._id}`)}
                  >
                    ✏️ Edit Event
                  </button>
                  <button
                    className="btn btn-outline btn-full"
                    onClick={() => navigate('/checkin')}
                  >
                    📱 Open Check-In Scanner
                  </button>
                  <button
                    className="btn btn-ghost btn-full"
                    onClick={() => navigate('/dashboard')}
                  >
                    📊 View Dashboard
                  </button>
                </div>

                <div className="divider" style={{ margin:'16px 0' }} />

                <div className="widget-avail-row">
                  <span>Tickets sold</span>
                  <span><strong>{(event.ticketsSold||0).toLocaleString()}</strong> / {event.capacity.toLocaleString()}</span>
                </div>
                <div className="prog" style={{ margin:'8px 0 4px' }}>
                  <div className="prog-fill" style={{ width: pct + '%' }} />
                </div>
                <p className="widget-spots">{spotsLeft.toLocaleString()} spots remaining · {pct}% sold</p>

                {!event.isFree && (
                  <p style={{ fontSize:13, color:'var(--txt3)', marginTop:8 }}>
                    💰 Revenue: <strong style={{ color:'var(--txt1)' }}>₦{((event.totalRevenue||0)).toLocaleString()}</strong>
                  </p>
                )}

                <div className="widget-share-link" style={{ marginTop:16 }}>
                  <p className="widget-share-label">Share with attendees</p>
                  <div className="widget-link-row">
                    <input className="widget-link-input" readOnly value={pageURL} onFocus={e => e.target.select()} />
                    <button className="btn btn-sm widget-copy-btn" onClick={copyLink}>{copied ? '✅' : '📋'}</button>
                  </div>
                </div>
              </div>

            ) : (
              /* ── ATTENDEE BUY WIDGET ── */
              <div className="card ticket-widget">
                <div className="widget-price-row">
                  <div>
                    <p className="widget-price-lbl">Ticket Price</p>
                    <p className={`widget-price ${event.isFree ? 'free' : 'paid'}`}>
                      {event.isFree ? 'FREE' : `₦${(event.price||0).toLocaleString()}`}
                    </p>
                  </div>
                  {spotsLeft < 50 && spotsLeft > 0 && (
                    <span className="badge badge-red">Only {spotsLeft} left!</span>
                  )}
                </div>

                <div className="widget-avail-row">
                  <span>Availability</span>
                  <span>{spotsLeft.toLocaleString()} spots remaining</span>
                </div>
                <div className="prog" style={{ marginBottom:6 }}>
                  <div className="prog-fill" style={{ width: pct + '%' }} />
                </div>
                <p className="widget-spots">
                  {(event.ticketsSold||0).toLocaleString()} of {(event.capacity||0).toLocaleString()} registered
                </p>

                {event.status === 'cancelled' ? (
                  <button className="btn btn-full" style={{ padding:16, background:'#9E9788', color:'#fff', borderRadius:50, fontSize:16, border:'none', cursor:'not-allowed' }} disabled>
                    Event Cancelled
                  </button>
                ) : spotsLeft <= 0 ? (
                  <button className="btn btn-full" style={{ padding:16, background:'#9E9788', color:'#fff', borderRadius:50, fontSize:16, border:'none', cursor:'not-allowed' }} disabled>
                    Sold Out
                  </button>
                ) : (
                  <button
                    className="btn btn-primary btn-full"
                    style={{ fontSize:16, padding:16 }}
                    onClick={() => navigate(`/checkout/${event._id}`)}
                  >
                    {event.isFree ? '🎟️ Register Now — Free' : '💳 Buy Ticket →'}
                  </button>
                )}

                <p className="widget-secure">🔒 Secure payment via Paystack</p>
                <div className="widget-info">📧 QR ticket delivered instantly to your email</div>

                <div className="widget-share-link">
                  <p className="widget-share-label">Share event link</p>
                  <div className="widget-link-row">
                    <input className="widget-link-input" readOnly value={pageURL} onFocus={e => e.target.select()} />
                    <button className="btn btn-sm widget-copy-btn" onClick={copyLink}>{copied ? '✅' : '📋'}</button>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}