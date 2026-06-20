import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import client from '../api/client'
import QRPlaceholder from '../components/QRPlaceholder'

const DEMO = {
  ticketId: 'QT-DEMO-A1B2C3',
  attendeeName: 'Adunni Okonkwo',
  quantity: 1,
  totalAmount: 15000,
  qrCode: '',
  event: {
    title: 'Lagos Tech Summit 2025',
    date: '2025-08-15',
    time: '09:00 AM',
    location: 'Eko Convention Centre, Victoria Island, Lagos',
    coverImage: '🏛️'
  }
}

export default function TicketConfirmPage() {
  const { id } = useParams() // this is the ticketId (e.g. QT-2025-XXXXXX)
  const [ticket, setTicket] = useState(DEMO)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    client.get(`/tickets/${id}`)          // ← was /tickets/verify/${id} which doesn't exist
      .then(r => setTicket(r.data.ticket))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    )
  }

  const event = ticket.event || {}
  const dateShort = event.date
    ? new Date(event.date).toLocaleDateString('en-NG', { weekday: 'short', month: 'short', day: 'numeric' })
    : '—'

  return (
    <div className="ticket-page-bg fade-up">
      <div className="container-xs">

        {/* Heading */}
        <div className="ticket-head">
          <span className="ticket-h-emoji">🎟️</span>
          <h1 className="ticket-h-title">You're In!</h1>
          <p className="ticket-h-sub">Your ticket is confirmed. See you there! 🎉</p>
        </div>

        {/* Ticket card */}
        <div className="ticket-card">

          {/* Header band */}
          <div className="ticket-top">
            <div>
              <p className="ticket-id-lbl">Ticket ID</p>
              <p className="ticket-id-val">{ticket.ticketId}</p>
            </div>
            <span className="ticket-status">CONFIRMED</span>
          </div>

          {/* Perforation */}
          <div className="ticket-perf">
            <div className="perf-circle perf-circle-l" />
            <div className="perf-line" />
            <div className="perf-circle perf-circle-r" />
          </div>

          {/* Body */}
          <div className="ticket-body">
            <span className="ticket-event-emoji">{event.coverImage || '🎟️'}</span>
            <h2 className="ticket-event-title">{event.title || 'Event'}</h2>

            <div className="ticket-meta-grid">
              <div>
                <p className="ticket-meta-lbl">DATE</p>
                <p className="ticket-meta-val">{dateShort}</p>
              </div>
              <div>
                <p className="ticket-meta-lbl">TIME</p>
                <p className="ticket-meta-val">{event.time || '—'}</p>
              </div>
              <div>
                <p className="ticket-meta-lbl">VENUE</p>
                <p className="ticket-meta-val">{(event.location || '—').split(',')[0]}</p>
              </div>
              <div>
                <p className="ticket-meta-lbl">TICKET</p>
                <p className="ticket-meta-val">
                  {ticket.totalAmount === 0 ? 'Free' : `₦${(ticket.totalAmount || 0).toLocaleString()}`}
                </p>
              </div>
              <div>
                <p className="ticket-meta-lbl">ATTENDEE</p>
                <p className="ticket-meta-val">{ticket.attendeeName}</p>
              </div>
              <div>
                <p className="ticket-meta-lbl">QUANTITY</p>
                <p className="ticket-meta-val">{ticket.quantity || 1} ticket{(ticket.quantity || 1) > 1 ? 's' : ''}</p>
              </div>
            </div>
          </div>

          {/* Perforation */}
          <div className="ticket-perf">
            <div className="perf-circle perf-circle-l" />
            <div className="perf-line" />
            <div className="perf-circle perf-circle-r" />
          </div>

          {/* QR */}
          <div className="ticket-qr-sec">
            <p className="ticket-qr-hint">Show this QR code at the entry gate</p>
            <div className="ticket-qr-wrap">
              {ticket.qrCode
                ? <img src={ticket.qrCode} alt="Ticket QR Code" width={150} height={150} />
                : <QRPlaceholder size={150} />}
            </div>
            <p className="ticket-qr-id">{ticket.ticketId}</p>
          </div>

        </div>

        {/* Actions */}
        <div className="ticket-actions">
          <button className="btn btn-primary btn-full" onClick={() => window.print()}>
            ⬇ Download Ticket
          </button>
          <button
            className="btn btn-outline-white btn-full"
            onClick={() => {
              const text = `My QuickTix ticket for ${event.title}: ${window.location.href}`
              window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
            }}
          >
            📱 Share on WhatsApp
          </button>
        </div>

        <p className="ticket-email-note">A copy has also been sent to your email address.</p>

        {/* Add to calendar */}
        <div className="cal-box">
          <p className="cal-title">Don't miss it — add to your calendar</p>
          <div className="cal-btns">
            {['Google Calendar', 'Apple Calendar', 'Outlook'].map(c => (
              <button key={c} className="cal-btn">{c}</button>
            ))}
          </div>
        </div>

        <div className="browse-link">
          <Link to="/explore">Browse more events →</Link>
        </div>

      </div>
    </div>
  )
}