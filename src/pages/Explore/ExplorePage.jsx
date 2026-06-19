import { useState } from 'react'
import { Link } from 'react-router-dom'
import { SAMPLE_EVENTS } from '../../data/events'
import './ExplorePage.css'

const CATEGORIES = ['All', 'Conference', 'Church', 'Social', 'Training', 'Concert', 'Education']

function EventCard({ event }) {
  const dateStr = new Date(event.date).toLocaleDateString('en-NG', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
  })
  const pct = Math.round((event.ticketsSold / event.capacity) * 100)

  return (
    <Link to={`/event/${event.id}`} className="event-card qt-card">
      <div className="event-card__cover">
        <span className="event-card__emoji">{event.image}</span>
        <span className={`badge badge--${event.price === 0 ? 'green' : 'orange'} event-card__price`}>
          {event.price === 0 ? 'FREE' : `₦${event.price.toLocaleString()}`}
        </span>
      </div>
      <div className="event-card__body">
        <span className="badge badge--navy">{event.category}</span>
        <h3 className="event-card__title">{event.title}</h3>
        <p className="event-card__meta">📅 {dateStr}</p>
        <p className="event-card__meta">📍 {event.location.split(',')[0]}</p>
        <div className="event-card__progress">
          <div className="progress-bar">
            <div className="progress-bar__fill" style={{ width: `${pct}%` }} />
          </div>
          <span className="event-card__spots">{event.ticketsSold.toLocaleString()} / {event.capacity.toLocaleString()} registered</span>
        </div>
      </div>
    </Link>
  )
}

function ExplorePage() {
  const [search,   setSearch]   = useState('')
  const [category, setCategory] = useState('All')

  const filtered = SAMPLE_EVENTS.filter(e => {
    const matchCat = category === 'All' || e.category === category
    const matchQ   = e.title.toLowerCase().includes(search.toLowerCase()) ||
                     e.location.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchQ
  })

  return (
    <main className="explore fade-in">
      <div className="container">

        <div className="explore__header">
          <div>
            <h1 className="explore__title">Explore Events</h1>
            <p className="explore__sub">Find events happening across Nigeria</p>
          </div>
          <Link to="/create-event" className="btn btn--primary">+ Create Event</Link>
        </div>

        <div className="explore__filters">
          <input
            className="form-input explore__search"
            type="search"
            placeholder="🔍  Search events or venues..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="explore__cats">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`explore__cat-btn ${category === cat ? 'explore__cat-btn--active' : ''}`}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="explore__empty">
            <span>😕</span>
            <p>No events match your search. <button onClick={() => { setSearch(''); setCategory('All') }} className="explore__clear-btn">Clear filters</button></p>
          </div>
        ) : (
          <div className="explore__grid">
            {filtered.map(event => <EventCard key={event.id} event={event} />)}
          </div>
        )}

      </div>
    </main>
  )
}

export default ExplorePage
