import { useParams, Link, useNavigate } from 'react-router-dom'
import { SAMPLE_EVENTS } from '../../data/events'
import './EventPage.css'

function EventPage() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const event      = SAMPLE_EVENTS.find(e => e.id === id) || SAMPLE_EVENTS[0]

  const dateStr = new Date(event.date).toLocaleDateString('en-NG', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  const pct      = Math.round((event.ticketsSold / event.capacity) * 100)
  const spotsLeft = event.capacity - event.ticketsSold

  return (
    <main className="event-page fade-in">

      {/* Cover */}
      <div className="event-page__cover">
        <span className="event-page__cover-emoji">{event.image}</span>
      </div>

      <div className="container event-page__body">
        <div className="event-page__grid">

          {/* Left: Details */}
          <div className="event-page__details">

            <div className="event-page__main-card qt-card">
              <div className="event-page__badges">
                <span className="badge badge--navy">{event.category}</span>
                {event.price === 0 && <span className="badge badge--green">FREE</span>}
              </div>

              <h1 className="event-page__title">{event.title}</h1>

              <ul className="event-page__meta-list">
                <li className="event-page__meta-item">
                  <span className="event-page__meta-icon">📅</span>
                  <span>{dateStr} at {event.time}</span>
                </li>
                <li className="event-page__meta-item">
                  <span className="event-page__meta-icon">📍</span>
                  <span>{event.location}</span>
                </li>
                <li className="event-page__meta-item">
                  <span className="event-page__meta-icon">🎙️</span>
                  <span>Organized by <strong>{event.organizer}</strong></span>
                </li>
              </ul>

              <div className="event-page__divider" />

              <h2 className="event-page__about-title">About this Event</h2>
              <p className="event-page__about">{event.description}</p>
            </div>

            {/* Share */}
            <div className="event-page__share qt-card">
              <p className="event-page__share-title">Share this event</p>
              <div className="event-page__share-btns">
                {['📱 WhatsApp', '🐦 Twitter / X', '🔗 Copy Link'].map(s => (
                  <button key={s} className="event-page__share-btn">{s}</button>
                ))}
              </div>
            </div>

          </div>

          {/* Right: Ticket widget */}
          <aside className="event-page__ticket-widget">

            <div className="ticket-widget qt-card">
              <div className="ticket-widget__price-row">
                <div>
                  <p className="ticket-widget__price-label">Ticket Price</p>
                  <p className={`ticket-widget__price ${event.price === 0 ? 'ticket-widget__price--free' : 'ticket-widget__price--paid'}`}>
                    {event.price === 0 ? 'FREE' : `₦${event.price.toLocaleString()}`}
                  </p>
                </div>
                {spotsLeft < 50 && spotsLeft > 0 && (
                  <span className="badge badge--red">Only {spotsLeft} left!</span>
                )}
              </div>

              <div className="ticket-widget__availability">
                <div className="ticket-widget__avail-row">
                  <span>Availability</span>
                  <span>{spotsLeft.toLocaleString()} spots remaining</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-bar__fill" style={{ width: `${pct}%` }} />
                </div>
                <p className="ticket-widget__avail-count">
                  {event.ticketsSold.toLocaleString()} of {event.capacity.toLocaleString()} registered
                </p>
              </div>

              <Link
                to={`/checkout/${event.id}`}
                className="btn btn--primary btn--full btn--lg ticket-widget__cta"
              >
                {event.price === 0 ? 'Register Now — Free' : 'Buy Ticket →'}
              </Link>

              <p className="ticket-widget__secure">🔒 Secure payment via Paystack</p>

              <div className="ticket-widget__info">
                📱 Your QR ticket is delivered instantly to your email
              </div>
            </div>

          </aside>
        </div>
      </div>

    </main>
  )
}

export default EventPage
