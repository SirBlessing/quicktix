import { useParams, Link } from 'react-router-dom'
import { SAMPLE_EVENTS } from '../../data/events'
import QRCodeSVG from '../../components/QRCode/QRCodeSVG'
import './TicketConfirmPage.css'

/* Generate a fake ticket ID — in production this comes from the backend */
const makeTicketId = () =>
  'QT-2025-' + Math.random().toString(36).substring(2, 8).toUpperCase()

function TicketConfirmPage() {
  const { id }  = useParams()
  const event   = SAMPLE_EVENTS.find(e => e.id === id) || SAMPLE_EVENTS[0]
  const ticketId = makeTicketId()

  const dateShort = new Date(event.date).toLocaleDateString('en-NG', {
    weekday: 'short', month: 'short', day: 'numeric',
  })

  return (
    <main className="ticket-page fade-in">
      <div className="container--xs">

        {/* Heading */}
        <div className="ticket-page__heading">
          <span className="ticket-page__heading-emoji">🎟️</span>
          <h1 className="ticket-page__title">You're In!</h1>
          <p className="ticket-page__sub">Your ticket is confirmed. See you there! 🎉</p>
        </div>

        {/* ── THE TICKET ── */}
        <div className="ticket">

          {/* Ticket header band */}
          <div className="ticket__header">
            <div>
              <p className="ticket__header-label">Ticket ID</p>
              <p className="ticket__header-id">{ticketId}</p>
            </div>
            <span className="ticket__status-badge">CONFIRMED</span>
          </div>

          {/* Perforation top */}
          <div className="ticket__perf">
            <div className="ticket__perf-circle ticket__perf-circle--left" />
            <div className="ticket__perf-line" />
            <div className="ticket__perf-circle ticket__perf-circle--right" />
          </div>

          {/* Ticket body */}
          <div className="ticket__body">
            <span className="ticket__event-emoji">{event.image}</span>
            <h2 className="ticket__event-title">{event.title}</h2>

            <div className="ticket__meta-grid">
              {[
                ['DATE',    dateShort],
                ['TIME',    event.time],
                ['VENUE',   event.location.split(',')[0]],
                ['TICKET',  event.price === 0 ? 'Free' : `₦${event.price.toLocaleString()}`],
                ['ORGANIZER', event.organizer],
                ['CATEGORY',  event.category],
              ].map(([label, value]) => (
                <div key={label} className="ticket__meta-item">
                  <p className="ticket__meta-label">{label}</p>
                  <p className="ticket__meta-value">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Perforation bottom */}
          <div className="ticket__perf">
            <div className="ticket__perf-circle ticket__perf-circle--left" />
            <div className="ticket__perf-line" />
            <div className="ticket__perf-circle ticket__perf-circle--right" />
          </div>

          {/* QR section */}
          <div className="ticket__qr-section">
            <p className="ticket__qr-instruction">Show this QR code at the entry gate</p>
            <div className="ticket__qr-wrapper">
              <QRCodeSVG size={150} value={ticketId} />
            </div>
            <p className="ticket__qr-id">{ticketId}</p>
          </div>

        </div>
        {/* ── END TICKET ── */}

        {/* Action buttons */}
        <div className="ticket-page__actions">
          <button className="btn btn--primary btn--full ticket-page__download-btn">
            ⬇ Download Ticket (PDF)
          </button>
          <button className="btn btn--outline btn--full">
            📱 Share on WhatsApp
          </button>
        </div>

        <p className="ticket-page__email-note">
          A copy of this ticket has also been sent to your email address.
        </p>

        {/* Add to calendar */}
        <div className="ticket-page__calendar">
          <p className="ticket-page__calendar-title">Don't miss it — add to your calendar</p>
          <div className="ticket-page__calendar-btns">
            {['Google Calendar', 'Apple Calendar', 'Outlook'].map(cal => (
              <button key={cal} className="ticket-page__cal-btn">{cal}</button>
            ))}
          </div>
        </div>

        {/* Browse more */}
        <div className="ticket-page__more">
          <Link to="/explore" className="ticket-page__browse-link">
            Browse more events →
          </Link>
        </div>

      </div>
    </main>
  )
}

export default TicketConfirmPage
