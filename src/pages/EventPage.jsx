import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import client from '../api/client'
import EventCover from '../components/EventCover'

const DEMO = { _id:'1', title:'Lagos Tech Summit 2025', date:'2025-08-15', time:'09:00 AM', location:'Eko Convention Centre, Victoria Island, Lagos', category:'Conference', isFree:false, price:15000, ticketsSold:847, capacity:1200, coverImage:'', description:'The biggest tech conference in West Africa. Join 3,000+ developers, designers, and founders for two days of learning, building, and networking.', organizer:{ name:'Lagos Tech Community' }, status:'published' }

export default function EventPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [event,   setEvent]   = useState(DEMO)
  const [copied,  setCopied]  = useState(false)

  useEffect(() => {
    client.get(`/events/${id}`).then(r => setEvent(r.data.event)).catch(() => {})
  }, [id])

  const pct       = Math.round((event.ticketsSold / event.capacity) * 100)
  const spotsLeft = event.capacity - event.ticketsSold
  const dateStr   = new Date(event.date).toLocaleDateString('en-NG', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  // ── Share helpers ────────────────────────────────────────
  const pageURL = window.location.href
  const shareText = `Check out "${event.title}" on QuickTix! 🎟️`

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(pageURL)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // Fallback for older browsers / non-HTTPS
      const el = document.createElement('input')
      el.value = pageURL
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  const shareWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText + '\n' + pageURL)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const shareTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(pageURL)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="event-page fade-up">
      <div className="event-banner">
        <EventCover src={event.coverImage} alt={event.title} />
      </div>

      <div className="container">
        <div className="event-grid">

          {/* ── Left ── */}
          <div>
            <div className="card event-main" style={{ marginTop: 0 }}>
              <div className="event-badges">
                <span className="badge badge-gray">{event.category}</span>
                {event.isFree && <span className="badge badge-green">FREE</span>}
              </div>
              <h1 className="event-h1">{event.title}</h1>
              <div className="event-metas">
                <div className="event-meta-item">
                  <span className="event-meta-icon">📅</span>
                  <span>{dateStr} at {event.time}</span>
                </div>
                <div className="event-meta-item">
                  <span className="event-meta-icon">📍</span>
                  <span>{event.location}</span>
                </div>
                <div className="event-meta-item">
                  <span className="event-meta-icon">🎙️</span>
                  <span>Organized by <strong>{event.organizer?.name || 'Organizer'}</strong></span>
                </div>
              </div>
              <div className="divider" />
              <h2 className="event-about-title">About this Event</h2>
              <p className="event-about">{event.description}</p>
            </div>

            {/* ── Share card ── */}
            <div className="card event-share" style={{ marginTop: 18 }}>
              <p className="share-title">Share this event</p>
              <div className="share-btns">
                <button className="share-btn" onClick={shareWhatsApp}>
                  📱 WhatsApp
                </button>
                <button className="share-btn" onClick={shareTwitter}>
                  🐦 Twitter / X
                </button>
                <button className="share-btn" onClick={copyLink}>
                  {copied ? '✅ Copied!' : '🔗 Copy Link'}
                </button>
              </div>
            </div>
          </div>

          {/* ── Right — Ticket widget ── */}
          <div>
            <div className="card ticket-widget">
              <div className="widget-price-row">
                <div>
                  <p className="widget-price-lbl">Ticket Price</p>
                  <p className={`widget-price ${event.isFree ? 'free' : 'paid'}`}>
                    {event.isFree ? 'FREE' : `₦${(event.price || 0).toLocaleString()}`}
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
              <div className="prog" style={{ marginBottom: 6 }}>
                <div className="prog-fill" style={{ width: pct + '%' }} />
              </div>
              <p className="widget-spots">
                {(event.ticketsSold || 0).toLocaleString()} of {(event.capacity || 0).toLocaleString()} registered
              </p>

              {spotsLeft <= 0 ? (
                <button className="btn btn-full" style={{ padding: 16, background: '#9E9788', color: '#fff', borderRadius: 50, fontSize: 16, border: 'none' }} disabled>
                  Sold Out
                </button>
              ) : (
                <button
                  className="btn btn-primary btn-full"
                  style={{ fontSize: 16, padding: 16 }}
                  onClick={() => navigate(`/checkout/${event._id}`)}
                >
                  {event.isFree ? '🎟️ Register Now — Free' : '💳 Buy Ticket →'}
                </button>
              )}

              <p className="widget-secure">🔒 Secure payment via Paystack</p>
              <div className="widget-info">📧 QR ticket delivered instantly to your email</div>

              {/* Link the organiser can copy and send */}
              <div className="widget-share-link">
                <p className="widget-share-label">Share event link</p>
                <div className="widget-link-row">
                  <input
                    className="widget-link-input"
                    readOnly
                    value={pageURL}
                    onFocus={e => e.target.select()}
                  />
                  <button className="btn btn-sm widget-copy-btn" onClick={copyLink}>
                    {copied ? '✅' : '📋'}
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}