import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import client from '../api/client'

export default function Dashboard() {
  const navigate         = useNavigate()
  const { user, logout } = useAuth()
  const [tab,     setTab]     = useState('overview')
  const [events,  setEvents]  = useState([])
  const [stats,   setStats]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(false)

  useEffect(() => {
    Promise.all([
      client.get('/events/my'),
      client.get('/events/dashboard-stats')
    ])
      .then(([evRes, stRes]) => {
        setEvents(evRes.data.events || [])
        setStats(stRes.data.stats   || null)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div style={{ minHeight: '100vh', background: '#F7F5FF', fontFamily: "'DM Sans', sans-serif" }}>

      {/* Top bar */}
      <header style={{ background: '#0D0B1A', padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, background: '#FF5C00', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', fontSize: 18 }}>Q</div>
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 18 }}>QuickTix</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: 'rgba(255,255,255,.6)', fontSize: 14 }}>
            {user?.email}
          </span>
          <button onClick={handleLogout} style={{ background: 'rgba(255,255,255,.1)', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: 50, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
            Log out
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '36px 24px 80px' }}>

        {/* Greeting */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0D0B1A', margin: 0 }}>
              Hey, {user?.name?.split(' ')[0] || 'there'} 👋
            </h1>
            <p style={{ color: '#9E9788', fontSize: 14, marginTop: 4 }}>
              Here's what's happening with your events
            </p>
          </div>
          <button
            onClick={() => navigate('/create-event')}
            style={{ background: '#FF5C00', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 50, fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            + Create Event
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ width: 40, height: 40, border: '3px solid #E8E4DA', borderTopColor: '#FF5C00', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
            <p style={{ color: '#9E9788', marginTop: 16, fontSize: 14 }}>Loading your dashboard…</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 16, padding: '24px', textAlign: 'center', color: '#E53E3E' }}>
            <p style={{ fontWeight: 700, marginBottom: 8 }}>Could not load your events</p>
            <p style={{ fontSize: 14 }}>Check your internet connection and refresh the page.</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && events.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 24px', maxWidth: 420, margin: '0 auto' }}>
            <div style={{ fontSize: 64, marginBottom: 20 }}>🎟️</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0D0B1A', marginBottom: 10 }}>
              No events yet
            </h2>
            <p style={{ color: '#9E9788', fontSize: 15, lineHeight: 1.6, marginBottom: 28 }}>
              Create your first event and start selling tickets in minutes. It's free to get started.
            </p>
            <button
              onClick={() => navigate('/create-event')}
              style={{ background: '#FF5C00', color: '#fff', border: 'none', padding: '14px 32px', borderRadius: 50, fontWeight: 700, fontSize: 16, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              + Create Your First Event
            </button>
          </div>
        )}

        {/* Stats — only when user has events */}
        {!loading && !error && events.length > 0 && stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: 16, marginBottom: 36 }}>
            {[
              { label: 'TOTAL EVENTS',   value: stats.totalEvents  ?? 0,   sub: 'events created',      color: '#FF5C00' },
              { label: 'TICKETS SOLD',   value: (stats.totalTickets ?? 0).toLocaleString(), sub: 'total registrations', color: '#7C3AED' },
              { label: 'REVENUE',        value: `₦${((stats.totalRevenue ?? 0)/1000).toFixed(0)}K`, sub: 'total earned', color: '#059669' },
              { label: 'CHECK-IN RATE',  value: `${stats.checkInRate ?? 0}%`, sub: 'avg across events', color: '#FF5C00' },
            ].map(s => (
              <div key={s.label} style={{ background: '#fff', borderRadius: 20, padding: '22px 24px', border: `1.5px solid ${s.color}22` }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#9E9788', letterSpacing: '.5px', marginBottom: 10 }}>{s.label}</p>
                <p style={{ fontSize: 32, fontWeight: 800, color: '#0D0B1A', margin: '0 0 4px' }}>{s.value}</p>
                <p style={{ fontSize: 13, color: s.color, fontWeight: 600 }}>{s.sub}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        {!loading && !error && events.length > 0 && (
          <>
            <div style={{ display: 'flex', gap: 8, marginBottom: 24, background: '#fff', borderRadius: 50, padding: 4, width: 'fit-content', border: '1px solid #E8E4DA' }}>
              {['overview', 'my-events'].map(t => (
                <button key={t} onClick={() => setTab(t)} style={{ padding: '8px 20px', borderRadius: 50, border: 'none', fontFamily: 'inherit', fontWeight: 600, fontSize: 14, cursor: 'pointer', background: tab === t ? '#FF5C00' : 'transparent', color: tab === t ? '#fff' : '#9E9788', transition: 'all .2s' }}>
                  {t === 'overview' ? 'Overview' : 'My Events'}
                </button>
              ))}
            </div>

            {/* Overview tab */}
            {tab === 'overview' && (
              <div style={{ background: '#fff', borderRadius: 20, overflow: 'hidden', border: '1px solid #E8E4DA' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #E8E4DA', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0D0B1A', margin: 0 }}>Recent Events</h2>
                  <button onClick={() => setTab('my-events')} style={{ background: 'none', border: 'none', color: '#FF5C00', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>View all →</button>
                </div>
                {events.slice(0, 5).map((e, i) => (
                  <div key={e._id} onClick={() => navigate(`/event/${e._id}`)} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 24px', borderBottom: i < Math.min(events.length,5)-1 ? '1px solid #F5F3EE' : 'none', cursor: 'pointer', transition: 'background .15s' }}
                    onMouseEnter={el => el.currentTarget.style.background = '#FAFAF8'}
                    onMouseLeave={el => el.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ width: 44, height: 44, background: '#F5F3EE', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                      {e.coverImage
                        ? <img src={e.coverImage} alt={e.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke="#C4BFB0" strokeWidth="1.5"/><circle cx="8.5" cy="8.5" r="1.5" fill="#C4BFB0"/><path d="M21 15l-5-5L5 21" stroke="#C4BFB0" strokeWidth="1.5" strokeLinecap="round"/></svg>
                      }
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 700, color: '#0D0B1A', fontSize: 15, margin: '0 0 3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.title}</p>
                      <p style={{ color: '#9E9788', fontSize: 13, margin: 0 }}>
                        {new Date(e.date).toLocaleDateString('en-NG', { day:'numeric', month:'short', year:'numeric' })} · {e.category}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ fontWeight: 700, color: '#0D0B1A', fontSize: 15, margin: '0 0 4px' }}>
                        {(e.ticketsSold || 0).toLocaleString()} <span style={{ fontWeight: 400, color: '#9E9788', fontSize: 13 }}>tickets</span>
                      </p>
                      <span style={{ background: e.status === 'published' ? '#D1FAE5' : '#F3F4F6', color: e.status === 'published' ? '#059669' : '#6B7280', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 50 }}>
                        {e.status?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* My Events tab */}
            {tab === 'my-events' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0D0B1A', margin: 0 }}>My Events</h2>
                  <button onClick={() => navigate('/create-event')} style={{ background: '#FF5C00', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 50, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
                    + New Event
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 18 }}>
                  {events.map(e => {
                    const pct = Math.round(((e.ticketsSold||0) / e.capacity) * 100)
                    return (
                      <div key={e._id} style={{ background: '#fff', borderRadius: 20, overflow: 'hidden', border: '1px solid #E8E4DA' }}>
                        <div style={{ height: 100, background: '#0D0B1A', position: 'relative', overflow: 'hidden' }}>
                          {e.coverImage
                            ? <img src={e.coverImage} alt={e.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                            : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke="rgba(255,255,255,.2)" strokeWidth="1.5"/><circle cx="8.5" cy="8.5" r="1.5" fill="rgba(255,255,255,.2)"/><path d="M21 15l-5-5L5 21" stroke="rgba(255,255,255,.2)" strokeWidth="1.5" strokeLinecap="round"/></svg>
                              </div>
                          }
                          <span style={{ position:'absolute', top:10, right:12, background: e.isFree ? '#059669' : '#FF5C00', color:'#fff', fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:50 }}>
                            {e.isFree ? 'Free' : `₦${(e.price||0).toLocaleString()}`}
                          </span>
                        </div>
                        <div style={{ padding: '16px 18px' }}>
                          <p style={{ fontWeight: 700, color: '#0D0B1A', fontSize: 15, margin: '0 0 4px' }}>{e.title}</p>
                          <p style={{ color: '#9E9788', fontSize: 13, margin: '0 0 12px' }}>
                            {new Date(e.date).toLocaleDateString('en-NG',{day:'numeric',month:'short',year:'numeric'})} · {e.category}
                          </p>
                          <div style={{ background: '#F5F3EE', borderRadius: 50, height: 6, marginBottom: 6, overflow: 'hidden' }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: '#FF5C00', borderRadius: 50, transition: 'width .3s' }} />
                          </div>
                          <p style={{ fontSize: 12, color: '#9E9788', margin: '0 0 14px' }}>
                            {(e.ticketsSold||0).toLocaleString()} sold · {(e.capacity - (e.ticketsSold||0)).toLocaleString()} remaining
                          </p>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={() => navigate(`/event/${e._id}`)} style={{ flex:1, background:'#F5F3EE', border:'none', borderRadius:50, padding:'8px 0', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit', color:'#4A4560' }}>View</button>
                            <button onClick={() => navigate(`/edit-event/${e._id}`)} style={{ flex:1, background:'#F5F3EE', border:'none', borderRadius:50, padding:'8px 0', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit', color:'#4A4560' }}>Edit</button>
                            <button onClick={() => navigate('/checkin')} style={{ flex:1, background:'#FF5C00', border:'none', borderRadius:50, padding:'8px 0', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit', color:'#fff' }}>Check-In</button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        )}

      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}