import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import client from '../api/client'
import EventCover from '../components/EventCover'

export default function Dashboard() {
  const navigate         = useNavigate()
  const { user, logout } = useAuth()
  const [tab,     setTab]     = useState('overview')
  const [events,  setEvents]  = useState([])
  const [stats,   setStats]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      client.get('/events/my'),
      client.get('/events/dashboard-stats')
    ])
      .then(([evRes, stRes]) => {
        setEvents(evRes.data.events  || [])
        setStats(stRes.data.stats    || null)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleLogout = () => { logout(); navigate('/login') }

  const statCards = stats ? [
    { label:'TOTAL EVENTS',  value: stats.totalEvents  ?? 0,   sub:'events created',      icon:'🎟️', color:'orange' },
    { label:'TICKETS SOLD',  value:(stats.totalTickets ?? 0).toLocaleString(), sub:'total registrations', icon:'✅', color:'purple' },
    { label:'REVENUE',       value:`₦${((stats.totalRevenue ?? 0)/1000).toFixed(0)}K`, sub:'total earned', icon:'💰', color:'teal' },
    { label:'CHECK-IN RATE', value:`${stats.checkInRate ?? 0}%`, sub:'avg across events', icon:'📱', color:'orange' },
  ] : []

  return (
    <div className="dashboard-page fade-up">

      <header className="dash-header">
        <div className="container">
          <div className="dash-header-inner">
            <div>
              <h1 className="dash-greeting">Hey, {user?.name?.split(' ')[0] || 'there'} 👋</h1>
              <p className="dash-sub">Here's what's happening with your events</p>
            </div>
            <div className="dash-header-actions">
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/create-event')}>+ Create Event</button>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Log out</button>
            </div>
          </div>
        </div>
      </header>

      <div className="container" style={{paddingTop:28,paddingBottom:60}}>

        {/* Stats — only shown when user has events */}
        {!loading && stats && stats.totalEvents > 0 && (
          <div className="dash-stats-grid">
            {statCards.map(s => (
              <div key={s.label} className={`stat-card stat-card--${s.color}`}>
                <div className="stat-card__top">
                  <span className="stat-card__label">{s.label}</span>
                  <span className="stat-card__icon">{s.icon}</span>
                </div>
                <p className="stat-card__value">{s.value}</p>
                <p className="stat-card__sub">{s.sub}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        {!loading && events.length > 0 && (
          <div className="dash-tabs">
            {['overview','my-events','analytics'].map(t => (
              <button key={t} className={`dash-tab ${tab===t?'active':''}`} onClick={() => setTab(t)}>
                {t==='overview'?'Overview':t==='my-events'?'My Events':'Analytics'}
              </button>
            ))}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{textAlign:'center',padding:'80px 0'}}>
            <div className="spinner" />
            <p style={{color:'var(--txt3)',marginTop:14,fontSize:14}}>Loading your dashboard…</p>
          </div>
        )}

        {/* Empty state — new user with no events */}
        {!loading && events.length === 0 && (
          <div className="empty-state">
            <span className="empty-state__icon">🎟️</span>
            <h2 className="empty-state__title">No events yet</h2>
            <p className="empty-state__sub">Create your first event and start selling tickets in minutes.</p>
            <button className="btn btn-primary" onClick={() => navigate('/create-event')}>
              + Create Your First Event
            </button>
          </div>
        )}

        {/* Overview tab */}
        {!loading && events.length > 0 && tab==='overview' && (
          <>
            <div className="section-header">
              <h2 className="section-title">Recent Events</h2>
              <button className="btn-link" onClick={() => setTab('my-events')}>View all →</button>
            </div>
            <div className="recent-list">
              {events.slice(0,5).map(e => (
                <div key={e._id} className="recent-item" onClick={() => navigate(`/event/${e._id}`)}>
                  <EventCover src={e.coverImage} alt={e.title} size={44} className="recent-emoji" />
                  <div className="recent-info">
                    <p className="recent-title">{e.title}</p>
                    <p className="recent-meta">
                      {new Date(e.date).toLocaleDateString('en-NG',{day:'numeric',month:'short',year:'numeric'})} · {e.category}
                    </p>
                  </div>
                  <div className="recent-right">
                    <p className="recent-tickets"><strong>{(e.ticketsSold||0).toLocaleString()}</strong> tickets</p>
                    <span className={`badge ${e.status==='published'?'badge-green':'badge-gray'}`}>
                      {e.status?.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* My Events tab */}
        {!loading && events.length > 0 && tab==='my-events' && (
          <>
            <div className="section-header">
              <h2 className="section-title">My Events</h2>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/create-event')}>+ New Event</button>
            </div>
            <div className="mgmt-grid">
              {events.map(e => {
                const pct = Math.round(((e.ticketsSold||0)/e.capacity)*100)
                return (
                  <div key={e._id} className="mgmt-card card">
                    <div className="mgmt-cover">
                      <EventCover src={e.coverImage} alt={e.title} />
                      <span className={`badge ${e.isFree?'badge-green':'badge-orange'}`}>
                        {e.isFree?'Free':`₦${(e.price||0).toLocaleString()}`}
                      </span>
                    </div>
                    <div className="mgmt-body">
                      <p className="mgmt-title">{e.title}</p>
                      <p className="mgmt-date">
                        {new Date(e.date).toLocaleDateString('en-NG',{day:'numeric',month:'short',year:'numeric'})} · {e.category}
                      </p>
                      <div className="prog" style={{margin:'10px 0 4px'}}>
                        <div className="prog-fill" style={{width:`${pct}%`}} />
                      </div>
                      <p className="mgmt-spots">{(e.ticketsSold||0).toLocaleString()} sold · {(e.capacity-e.ticketsSold).toLocaleString()} remaining</p>
                      <div className="mgmt-actions">
                        <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/event/${e._id}`)}>View</button>
                        <button className="btn btn-outline btn-sm" onClick={() => navigate(`/edit-event/${e._id}`)}>Edit</button>
                        <button className="btn btn-primary btn-sm" onClick={() => navigate('/checkin')}>Check-In</button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* Analytics tab */}
        {!loading && events.length > 0 && tab==='analytics' && (
          <div className="card" style={{padding:40,textAlign:'center'}}>
            <span style={{fontSize:48}}>📊</span>
            <h2 style={{fontSize:20,fontWeight:700,margin:'16px 0 8px'}}>Analytics coming soon</h2>
            <p style={{color:'var(--txt3)',fontSize:15}}>Revenue charts and attendee stats will appear here.</p>
          </div>
        )}

      </div>
    </div>
  )
}