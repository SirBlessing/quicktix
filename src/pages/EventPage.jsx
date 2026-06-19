import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import client from '../api/client'

const DEMO = { _id:'1', title:'Lagos Tech Summit 2025', date:'2025-08-15', time:'09:00 AM', location:'Eko Convention Centre, Victoria Island, Lagos', category:'Conference', isFree:false, price:15000, ticketsSold:847, capacity:1200, coverImage:'🏛️', description:'The biggest tech conference in West Africa. Join 3,000+ developers, designers, and founders for two days of learning, building, and networking.', organizer:{ name:'Lagos Tech Community' }, status:'published' }

export default function EventPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(DEMO)

  useEffect(() => {
    client.get(`/events/${id}`).then(r => setEvent(r.data.event)).catch(() => {})
  }, [id])

  const pct      = Math.round((event.ticketsSold / event.capacity) * 100)
  const spotsLeft = event.capacity - event.ticketsSold
  const dateStr   = new Date(event.date).toLocaleDateString('en-NG', { weekday:'long', year:'numeric', month:'long', day:'numeric' })

  return (
    <div className="event-page fade-up">
      <div className="event-cover">
        <span className="event-cover-emoji">{event.coverImage || '🎟️'}</span>
      </div>

      <div className="container">
        <div className="event-grid">
          {/* Left */}
          <div>
            <div className="card event-main" style={{marginTop:0}}>
              <div className="event-badges">
                <span className="badge badge-gray">{event.category}</span>
                {event.isFree && <span className="badge badge-green">FREE</span>}
              </div>
              <h1 className="event-h1">{event.title}</h1>
              <div className="event-metas">
                <div className="event-meta-item"><span className="event-meta-icon">📅</span><span>{dateStr} at {event.time}</span></div>
                <div className="event-meta-item"><span className="event-meta-icon">📍</span><span>{event.location}</span></div>
                <div className="event-meta-item"><span className="event-meta-icon">🎙️</span><span>Organized by <strong>{event.organizer?.name || 'Organizer'}</strong></span></div>
              </div>
              <div className="divider" />
              <h2 className="event-about-title">About this Event</h2>
              <p className="event-about">{event.description}</p>
            </div>

            <div className="card event-share" style={{marginTop:18}}>
              <p className="share-title">Share this event</p>
              <div className="share-btns">
                {['📱 WhatsApp','🐦 Twitter / X','🔗 Copy Link'].map(s=><button key={s} className="share-btn">{s}</button>)}
              </div>
            </div>
          </div>

          {/* Right — ticket widget */}
          <div>
            <div className="card ticket-widget">
              <div className="widget-price-row">
                <div>
                  <p className="widget-price-lbl">Ticket Price</p>
                  <p className={`widget-price ${event.isFree ? 'free' : 'paid'}`}>
                    {event.isFree ? 'FREE' : `₦${event.price.toLocaleString()}`}
                  </p>
                </div>
                {spotsLeft < 50 && spotsLeft > 0 && <span className="badge badge-red">Only {spotsLeft} left!</span>}
              </div>
              <div className="widget-avail-row">
                <span>Availability</span>
                <span>{spotsLeft.toLocaleString()} spots remaining</span>
              </div>
              <div className="prog" style={{marginBottom:6}}><div className="prog-fill" style={{width:pct+'%'}} /></div>
              <p className="widget-spots">{event.ticketsSold.toLocaleString()} of {event.capacity.toLocaleString()} registered</p>
              <button className="btn btn-primary btn-full" style={{fontSize:16,padding:16}} onClick={() => navigate(`/checkout/${event._id}`)}>
                {event.isFree ? 'Register Now — Free' : 'Buy Ticket →'}
              </button>
              <p className="widget-secure">🔒 Secure payment via Paystack</p>
              <div className="widget-info">📱 QR ticket delivered instantly to your email</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
