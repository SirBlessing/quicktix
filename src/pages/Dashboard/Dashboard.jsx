import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts'
import { SAMPLE_EVENTS, ANALYTICS_DATA, REVENUE_DATA } from '../../data/events'
import './Dashboard.css'

function Dashboard({ user }) {
  const navigate = useNavigate()
  const [tab, setTab] = useState('overview')

  const firstName = (user?.name || 'Organizer').split(' ')[0]

  return (
    <div className="dashboard">

      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar__profile">
          <div className="sidebar__avatar">{(user?.name || 'U')[0]}</div>
          <div>
            <p className="sidebar__name">{user?.name || 'Organizer'}</p>
            <p className="sidebar__email">{user?.email || 'organizer@email.com'}</p>
          </div>
        </div>

        <nav className="sidebar__nav">
          {[
            ['overview',   '📊', 'Overview'],
            ['my-events',  '🎟️', 'My Events'],
            ['analytics',  '📈', 'Analytics'],
          ].map(([id, icon, label]) => (
            <button
              key={id}
              className={`sidebar__link ${tab === id ? 'sidebar__link--active' : ''}`}
              onClick={() => setTab(id)}
            >
              <span>{icon}</span> {label}
            </button>
          ))}

          <div className="sidebar__divider" />

          <button
            className="sidebar__link"
            onClick={() => navigate('/checkin')}
          >
            <span>📱</span> Check-In Tool
          </button>
        </nav>

        <Link to="/create-event" className="sidebar__create-btn btn btn--primary">
          + Create Event
        </Link>
      </aside>

      {/* ── Main ── */}
      <main className="dash-main fade-in">

        {/* OVERVIEW */}
        {tab === 'overview' && (
          <>
            <div className="dash-header">
              <h2 className="dash-title">Good day, {firstName} 👋</h2>
              <p className="dash-sub">Here's what's happening with your events</p>
            </div>

            <div className="stat-grid">
              {[
                { label: 'Total Events',       value: '4',      icon: '🎟️', change: '+1 this month' },
                { label: 'Tickets Sold',       value: '3,315',  icon: '✅', change: '+89 this week' },
                { label: 'Revenue',            value: '₦18.2M', icon: '💰', change: '+₦342K this week' },
                { label: 'Avg Check-In Rate',  value: '85%',    icon: '📱', change: 'across all events' },
              ].map(s => (
                <div key={s.label} className="stat-card qt-card">
                  <div className="stat-card__top">
                    <span className="stat-card__label">{s.label}</span>
                    <span className="stat-card__icon">{s.icon}</span>
                  </div>
                  <p className="stat-card__value">{s.value}</p>
                  <p className="stat-card__change">{s.change}</p>
                </div>
              ))}
            </div>

            <div className="dash-section-header">
              <h3 className="dash-section-title">Recent Events</h3>
              <button className="dash-see-all" onClick={() => setTab('my-events')}>View all →</button>
            </div>

            <div className="recent-events">
              {SAMPLE_EVENTS.slice(0, 3).map(event => (
                <Link to={`/event/${event.id}`} key={event.id} className="recent-event-row qt-card">
                  <span className="recent-event-row__emoji">{event.image}</span>
                  <div className="recent-event-row__info">
                    <p className="recent-event-row__title">{event.title}</p>
                    <p className="recent-event-row__meta">
                      {new Date(event.date).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })} · {event.location.split(',')[0]}
                    </p>
                  </div>
                  <div className="recent-event-row__tickets">
                    <span className="recent-event-row__count">{event.ticketsSold.toLocaleString()}</span>
                    <span className="recent-event-row__count-label">tickets</span>
                  </div>
                  <span className="badge badge--green">Active</span>
                </Link>
              ))}
            </div>
          </>
        )}

        {/* MY EVENTS */}
        {tab === 'my-events' && (
          <>
            <div className="dash-header dash-header--row">
              <div>
                <h2 className="dash-title">My Events</h2>
                <p className="dash-sub">Manage all your created events</p>
              </div>
              <Link to="/create-event" className="btn btn--primary">+ New Event</Link>
            </div>

            <div className="events-grid">
              {SAMPLE_EVENTS.map(event => (
                <div key={event.id} className="event-mgmt-card qt-card">
                  <div className="event-mgmt-card__cover">
                    <span>{event.image}</span>
                    <span className={`badge badge--${event.price === 0 ? 'green' : 'orange'}`}>
                      {event.price === 0 ? 'Free' : `₦${event.price.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="event-mgmt-card__body">
                    <p className="event-mgmt-card__title">{event.title}</p>
                    <p className="event-mgmt-card__meta">📅 {new Date(event.date).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })} · {event.category}</p>
                    <div className="progress-bar" style={{ marginBottom: 6 }}>
                      <div className="progress-bar__fill" style={{ width: `${(event.ticketsSold / event.capacity) * 100}%` }} />
                    </div>
                    <p className="event-mgmt-card__spots">{event.ticketsSold} / {event.capacity} tickets</p>
                    <div className="event-mgmt-card__actions">
                      <Link to={`/event/${event.id}`} className="btn btn--ghost btn--sm">View</Link>
                      <Link to="/checkin" className="btn btn--primary btn--sm">Check-In</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ANALYTICS */}
        {tab === 'analytics' && (
          <>
            <div className="dash-header">
              <h2 className="dash-title">Analytics</h2>
              <p className="dash-sub">Track the performance of your events</p>
            </div>

            <div className="analytics-charts">
              <div className="chart-card qt-card">
                <h4 className="chart-card__title">Tickets Sold — This Week</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={ANALYTICS_DATA} barSize={22}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--g200)" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--g400)', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--g400)', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontFamily: 'Outfit, sans-serif', fontSize: 13 }}
                      cursor={{ fill: 'rgba(255,102,0,0.06)' }}
                    />
                    <Bar dataKey="tickets" fill="var(--orange)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-card qt-card">
                <h4 className="chart-card__title">Monthly Revenue (₦)</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={REVENUE_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--g200)" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--g400)', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--g400)', fontSize: 12 }} tickFormatter={v => `₦${(v / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={v => [`₦${v.toLocaleString()}`, 'Revenue']}
                      contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontFamily: 'Outfit, sans-serif', fontSize: 13 }} />
                    <Line type="monotone" dataKey="revenue" stroke="var(--navy)" strokeWidth={2.5} dot={{ fill: 'var(--orange)', r: 4, strokeWidth: 0 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="qt-card analytics-table-card">
              <h4 className="chart-card__title" style={{ padding: '20px 22px 0' }}>Event Breakdown</h4>
              <div className="table-scroll">
                <table className="analytics-table">
                  <thead>
                    <tr>
                      {['Event', 'Category', 'Tickets Sold', 'Revenue', 'Status'].map(h => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {SAMPLE_EVENTS.map(e => (
                      <tr key={e.id}>
                        <td className="analytics-table__name">{e.title.split(' ').slice(0, 4).join(' ')}</td>
                        <td><span className="badge badge--navy">{e.category}</span></td>
                        <td>{e.ticketsSold.toLocaleString()}</td>
                        <td className="analytics-table__revenue">
                          {e.price === 0 ? '—' : `₦${(e.ticketsSold * e.price).toLocaleString()}`}
                        </td>
                        <td><span className="badge badge--green">Active</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

      </main>
    </div>
  )
}

export default Dashboard
