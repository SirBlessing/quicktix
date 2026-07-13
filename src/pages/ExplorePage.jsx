import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import client from '../api/client'
import EventCover from '../components/EventCover'

const CATS = ['All','Conference','Church','Social','Training','Concert','Workshop','Sports','Education']

function EventCard({ event, onClick }) {
  const pct  = Math.round(((event.ticketsSold||0) / event.capacity) * 100)
  const date = new Date(event.date).toLocaleDateString('en-NG', { weekday:'short', month:'short', day:'numeric' })
  return (
    <div className="event-card" onClick={onClick}>
      <div className="event-cover">
        <EventCover
          src={event.coverImage?.startsWith('data:') || event.coverImage?.startsWith('http')
            ? event.coverImage : null}
          alt={event.title}
        />
        <span className={`badge ${event.isFree ? 'badge-green' : 'badge-orange'} event-price`}>
          {event.isFree ? 'FREE' : `₦${(event.price||0).toLocaleString()}`}
        </span>
      </div>
      <div className="event-body">
        <span className="badge badge-gray">{event.category}</span>
        <p className="event-title">{event.title}</p>
        <p className="event-meta">📅 {date}</p>
        <p className="event-meta">📍 {(event.location||'').split(',')[0]}</p>
        <div className="event-prog-wrap">
          <div className="prog"><div className="prog-fill" style={{ width: pct + '%' }} /></div>
          <span className="event-spots">
            {(event.ticketsSold||0).toLocaleString()} / {(event.capacity||0).toLocaleString()} registered
          </span>
        </div>
      </div>
    </div>
  )
}

export default function ExplorePage() {
  const navigate       = useNavigate()
  const [events,   setEvents]  = useState([])   // ← starts empty, never shows fake data
  const [loading,  setLoading] = useState(true)
  const [search,   setSearch]  = useState('')
  const [cat,      setCat]     = useState('All')

  useEffect(() => {
    client.get('/events')
      .then(r => setEvents(r.data.events || []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = events.filter(e => {
    const matchCat = cat === 'All' || e.category === cat
    const matchQ   = (e.title||'').toLowerCase().includes(search.toLowerCase())
                  || (e.location||'').toLowerCase().includes(search.toLowerCase())
    return matchCat && matchQ
  })

  return (
    <div className="page fade-up">
      <div className="container">
        <div className="explore-header">
          <div>
            <h1 className="page-title">Explore Events</h1>
            <p className="page-sub">Find events happening across Nigeria</p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/create-event')}>
            + Create Event
          </button>
        </div>

        <div className="filter-row">
          <input
            className="input search-input"
            placeholder="🔍  Search events..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="cats">
            {CATS.map(c => (
              <button
                key={c}
                className={`cat-btn ${cat === c ? 'active' : ''}`}
                onClick={() => setCat(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign:'center', padding:'80px 0' }}>
            <div className="spinner" />
            <p style={{ color:'var(--txt3)', marginTop:14, fontSize:14 }}>
              Loading events…
            </p>
          </div>
        )}

        {/* No events in DB at all */}
        {!loading && events.length === 0 && (
          <div className="empty-state">
            <span className="empty-state__icon">🎟️</span>
            <h2 className="empty-state__title">No events yet</h2>
            <p className="empty-state__sub">
              Be the first to create an event on QuickTix!
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/create-event')}>
              + Create Event
            </button>
          </div>
        )}

        {/* Search returned nothing */}
        {!loading && events.length > 0 && filtered.length === 0 && (
          <div className="empty-state">
            <span className="empty-state__icon">😕</span>
            <h2 className="empty-state__title">No events match</h2>
            <p className="empty-state__sub">Try a different search or category.</p>
            <button
              className="btn btn-outline"
              onClick={() => { setSearch(''); setCat('All') }}
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Real events */}
        {!loading && filtered.length > 0 && (
          <div className="events-grid">
            {filtered.map(e => (
              <EventCard key={e._id} event={e} onClick={() => navigate(`/event/${e._id}`)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}