import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import client from '../api/client'

const CATS = ['All','Conference','Church','Social','Training','Concert','Workshop','Sports','Education']

function EventCard({ event, onClick }) {
  const pct = Math.round((event.ticketsSold / event.capacity) * 100)
  const date = new Date(event.date).toLocaleDateString('en-NG', { weekday:'short', month:'short', day:'numeric' })
  return (
    <div className="event-card" onClick={onClick}>
      <div className="event-cover">
        <span className="event-emoji">{event.coverImage || '🎟️'}</span>
        <span className={`badge ${event.isFree ? 'badge-green' : 'badge-orange'} event-price`}>
          {event.isFree ? 'FREE' : `₦${event.price.toLocaleString()}`}
        </span>
      </div>
      <div className="event-body">
        <span className="badge badge-gray">{event.category}</span>
        <p className="event-title">{event.title}</p>
        <p className="event-meta">📅 {date}</p>
        <p className="event-meta">📍 {event.location.split(',')[0]}</p>
        <div className="event-prog-wrap">
          <div className="prog"><div className="prog-fill" style={{ width: pct + '%' }} /></div>
          <span className="event-spots">{event.ticketsSold.toLocaleString()} / {event.capacity.toLocaleString()} registered</span>
        </div>
      </div>
    </div>
  )
}

const DEMO = [
  { _id:'1', title:'Lagos Tech Summit 2025', date:'2025-08-15', location:'Eko Convention Centre, Victoria Island', category:'Conference', isFree:false, price:15000, ticketsSold:847, capacity:1200, coverImage:'🏛️' },
  { _id:'2', title:"Adunni's Owambe Celebration", date:'2025-07-20', location:'Civic Centre, Lagos', category:'Social', isFree:true, price:0, ticketsSold:320, capacity:500, coverImage:'🎉' },
  { _id:'3', title:'RCCG Annual Youth Convention', date:'2025-09-01', location:'Redemption Camp, Ogun', category:'Church', isFree:false, price:5000, ticketsSold:2100, capacity:5000, coverImage:'⛪' },
  { _id:'4', title:'UI/UX Design Bootcamp', date:'2025-07-10', location:'Co-Creation Hub, Yaba', category:'Training', isFree:false, price:25000, ticketsSold:48, capacity:60, coverImage:'🎨' },
  { _id:'5', title:'Afrobeats Night — Lagos', date:'2025-08-02', location:'Muri Okunola Park, VI', category:'Concert', isFree:false, price:10000, ticketsSold:540, capacity:800, coverImage:'🎵' },
  { _id:'6', title:'UNILAG Convocation 2025', date:'2025-09-15', location:'J.F. Ade-Ajayi Auditorium', category:'Education', isFree:true, price:0, ticketsSold:1800, capacity:3000, coverImage:'🎓' },
]

export default function ExplorePage() {
  const [events,  setEvents]  = useState(DEMO)
  const [search,  setSearch]  = useState('')
  const [cat,     setCat]     = useState('All')
  const navigate = useNavigate()

  useEffect(() => {
    client.get('/events').then(r => setEvents(r.data.events)).catch(() => {})
  }, [])

  const filtered = events.filter(e => {
    const matchCat = cat === 'All' || e.category === cat
    const matchQ   = e.title.toLowerCase().includes(search.toLowerCase()) || e.location.toLowerCase().includes(search.toLowerCase())
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
          <button className="btn btn-primary" onClick={() => navigate('/create-event')}>+ Create Event</button>
        </div>

        <div className="filter-row">
          <input className="input search-input" placeholder="🔍  Search events..." value={search} onChange={e => setSearch(e.target.value)} />
          <div className="cats">
            {CATS.map(c => (
              <button key={c} className={`cat-btn ${cat === c ? 'active' : ''}`} onClick={() => setCat(c)}>{c}</button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">😕</span>
            <p className="empty-text">No events match. <button className="clear-link" onClick={() => { setSearch(''); setCat('All') }}>Clear filters</button></p>
          </div>
        ) : (
          <div className="events-grid">
            {filtered.map(e => <EventCard key={e._id} event={e} onClick={() => navigate(`/event/${e._id}`)} />)}
          </div>
        )}
      </div>
    </div>
  )
}
