import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts'
import { useAuth } from '../context/AuthContext'
import client from '../api/client'
import EventCover from '../components/EventCover'

const DEMO_EVENTS = [
  { _id:'1', title:'Lagos Tech Summit 2025',     date:'2025-08-15', category:'Conference', price:15000, isFree:false, ticketsSold:847,  capacity:1200, coverImage:'', status:'published' },
  { _id:'2', title:"Adunni's Owambe",            date:'2025-07-20', category:'Social',     price:0,     isFree:true,  ticketsSold:320,  capacity:500,  coverImage:'', status:'published' },
  { _id:'3', title:'RCCG Youth Convention',      date:'2025-09-01', category:'Church',     price:5000,  isFree:false, ticketsSold:2100, capacity:5000, coverImage:'', status:'published' },
  { _id:'4', title:'UI/UX Design Bootcamp',      date:'2025-07-10', category:'Training',   price:25000, isFree:false, ticketsSold:48,   capacity:60,   coverImage:'', status:'published' },
]
const WEEKLY  = [{ n:'Mon',t:12},{ n:'Tue',t:28},{ n:'Wed',t:19},{ n:'Thu',t:45},{ n:'Fri',t:67},{ n:'Sat',t:89},{ n:'Sun',t:52}]
const MONTHLY = [{ n:'Mar',r:124000},{ n:'Apr',r:189000},{ n:'May',r:215000},{ n:'Jun',r:342000},{ n:'Jul',r:289000}]

export default function Dashboard() {
  const [tab,    setTab]    = useState('overview')
  const [events, setEvents] = useState(DEMO_EVENTS)
  const [stats,  setStats]  = useState({ totalEvents:4, totalTickets:3315, totalRevenue:18200000, checkInRate:85 })
  const { user, logout }    = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    client.get('/events/my').then(r => { if(r.data.events.length) setEvents(r.data.events) }).catch(()=>{})
    client.get('/events/dashboard-stats').then(r => setStats(r.data.stats)).catch(()=>{})
  }, [])

  const first = (user?.name || 'Organizer').split(' ')[0]

  return (
    <div className="dash-layout">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-profile">
          <div className="sidebar-avatar">{first[0]}</div>
          <div>
            <p className="sidebar-name">{user?.name || 'Organizer'}</p>
            <p className="sidebar-email">{user?.email || ''}</p>
          </div>
        </div>
        <nav className="sidebar-nav">
          {[['overview','📊','Overview'],['my-events','🎟️','My Events'],['analytics','📈','Analytics']].map(([id,icon,label]) => (
            <button key={id} className={`sidebar-link ${tab===id?'active':''}`} onClick={() => setTab(id)}>
              <span>{icon}</span>{label}
            </button>
          ))}
          <div className="sidebar-divider" />
          <button className="sidebar-link" onClick={() => navigate('/checkin')}>
            <span>📱</span>Check-In Tool
          </button>
        </nav>
        <button className="btn btn-primary btn-full sidebar-create" onClick={() => navigate('/create-event')}>
          + Create Event
        </button>
      </aside>

      {/* MAIN */}
      <main className="dash-main fade-up">
        {/* OVERVIEW */}
        {tab === 'overview' && <>
          <div className="dash-header">
            <h2 className="dash-title">Good day, {first} 👋</h2>
            <p className="dash-sub">Here's what's happening with your events</p>
          </div>
          <div className="stat-grid">
            {[
              { label:'Total Events',    value: stats.totalEvents,                icon:'🎟️', chg:'+1 this month' },
              { label:'Tickets Sold',    value: (stats.totalTickets||0).toLocaleString(), icon:'✅', chg:'+89 this week' },
              { label:'Revenue',         value: `₦${((stats.totalRevenue||0)/1000000).toFixed(1)}M`, icon:'💰', chg:'+₦342K this week' },
              { label:'Check-In Rate',   value: `${stats.checkInRate||0}%`, icon:'📱', chg:'avg across events' },
            ].map(s => (
              <div key={s.label} className="stat-card card">
                <div className="stat-top">
                  <span className="stat-lbl">{s.label}</span>
                  <span className="stat-icon">{s.icon}</span>
                </div>
                <p className="stat-val">{s.value}</p>
                <p className="stat-chg">{s.chg}</p>
              </div>
            ))}
          </div>
          <div className="sec-row"><span className="sec-label">Recent Events</span><button className="see-all" onClick={() => setTab('my-events')}>View all →</button></div>
          <div className="recent-list">
            {events.slice(0,3).map(e => (
              <div key={e._id} className="recent-row card" onClick={() => navigate(`/event/${e._id}`)}>
                <EventCover src={e.coverImage} alt={e.title} size={44} className="recent-emoji" />
                <div className="recent-info">
                  <p className="recent-title">{e.title}</p>
                  <p className="recent-meta">{new Date(e.date).toLocaleDateString('en-NG',{month:'short',day:'numeric',year:'numeric'})} · {e.location?.split(',')[0] || e.category}</p>
                </div>
                <div className="recent-right">
                  <span className="recent-count">{e.ticketsSold.toLocaleString()}</span>
                  <span className="recent-count-lbl">tickets</span>
                </div>
                <span className="badge badge-green">Active</span>
              </div>
            ))}
          </div>
        </>}

        {/* MY EVENTS */}
        {tab === 'my-events' && <>
          <div className="dash-header-row dash-header">
            <div>
              <h2 className="dash-title">My Events</h2>
              <p className="dash-sub">Manage all your created events</p>
            </div>
            <button className="btn btn-primary" onClick={() => navigate('/create-event')}>+ New Event</button>
          </div>
          <div className="mgmt-grid">
            {events.map(e => (
              <div key={e._id} className="mgmt-card card">
                <div className="mgmt-cover">
                  <EventCover src={e.coverImage} alt={e.title} />
                  <span className={`badge ${e.isFree ? 'badge-green' : 'badge-orange'}`}>{e.isFree ? 'Free' : `₦${e.price.toLocaleString()}`}</span>
                </div>
                <div className="mgmt-body">
                  <p className="mgmt-title">{e.title}</p>
                  <p className="mgmt-meta">📅 {new Date(e.date).toLocaleDateString('en-NG',{month:'short',day:'numeric'})} · {e.category}</p>
                  <div className="prog" style={{marginBottom:6}}><div className="prog-fill" style={{width:`${Math.round(e.ticketsSold/e.capacity*100)}%`}} /></div>
                  <p className="mgmt-spots">{e.ticketsSold} / {e.capacity} tickets</p>
                  <div className="mgmt-actions">
                    <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/event/${e._id}`)}>View</button>
                    <button className="btn btn-outline btn-sm" onClick={() => navigate(`/edit-event/${e._id}`)}>Edit</button>
                    <button className="btn btn-primary btn-sm" onClick={() => navigate('/checkin')}>Check-In</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>}

        {/* ANALYTICS */}
        {tab === 'analytics' && <>
          <div className="dash-header">
            <h2 className="dash-title">Analytics</h2>
            <p className="dash-sub">Track the performance of your events</p>
          </div>
          <div className="chart-grid">
            <div className="chart-card card">
              <p className="chart-title">Tickets Sold — This Week</p>
              <ResponsiveContainer width="100%" height={190}>
                <BarChart data={WEEKLY} barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--g100)" vertical={false} />
                  <XAxis dataKey="n" axisLine={false} tickLine={false} tick={{ fill:'var(--txt3)', fontSize:12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill:'var(--txt3)', fontSize:12 }} />
                  <Tooltip contentStyle={{ borderRadius:10, border:'none', boxShadow:'0 4px 16px rgba(0,0,0,.1)', fontFamily:'DM Sans,sans-serif', fontSize:13 }} cursor={{ fill:'rgba(255,92,0,.06)' }} />
                  <Bar dataKey="t" fill="var(--orange)" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-card card">
              <p className="chart-title">Monthly Revenue (₦)</p>
              <ResponsiveContainer width="100%" height={190}>
                <LineChart data={MONTHLY}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--g100)" vertical={false} />
                  <XAxis dataKey="n" axisLine={false} tickLine={false} tick={{ fill:'var(--txt3)', fontSize:12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill:'var(--txt3)', fontSize:12 }} tickFormatter={v=>`₦${(v/1000).toFixed(0)}K`} />
                  <Tooltip formatter={v=>[`₦${v.toLocaleString()}`,'Revenue']} contentStyle={{ borderRadius:10, border:'none', boxShadow:'0 4px 16px rgba(0,0,0,.1)', fontFamily:'DM Sans,sans-serif', fontSize:13 }} />
                  <Line type="monotone" dataKey="r" stroke="var(--dark)" strokeWidth={2.5} dot={{ fill:'var(--orange)', r:4, strokeWidth:0 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="card" style={{overflow:'hidden'}}>
            <div style={{padding:'18px 20px 0'}}><p className="chart-title">Event Breakdown</p></div>
            <div className="tbl-wrap">
              <table>
                <thead><tr>{['Event','Category','Tickets','Revenue','Status'].map(h=><th key={h}>{h}</th>)}</tr></thead>
                <tbody>
                  {events.map(e => (
                    <tr key={e._id}>
                      <td className="td-name">{e.title.split(' ').slice(0,4).join(' ')}</td>
                      <td><span className="badge badge-gray">{e.category}</span></td>
                      <td>{e.ticketsSold.toLocaleString()}</td>
                      <td className="td-rev">{e.isFree ? '—' : `₦${(e.ticketsSold*e.price).toLocaleString()}`}</td>
                      <td><span className="badge badge-green">Active</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>}
      </main>
    </div>
  )
}