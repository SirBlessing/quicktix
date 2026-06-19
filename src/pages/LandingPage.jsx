import { useNavigate } from 'react-router-dom'

const FEATURES = [
  { icon: '⚡', title: 'Create in 2 Minutes',    desc: 'Simple form. No tech knowledge needed. Your event is live instantly.' },
  { icon: '💳', title: 'Sell in Naira',           desc: 'Integrated Paystack payments. Money goes directly to your bank account.' },
  { icon: '📱', title: 'QR Check-In',             desc: 'Unique QR per ticket. Scan at the gate. Zero paper lists, zero stress.' },
  { icon: '📊', title: 'Real-time Analytics',     desc: 'See ticket sales, revenue, and attendance as it happens.' },
  { icon: '🎯', title: 'Free or Paid Events',     desc: 'Host free registrations or sell tickets. Your choice, your price.' },
  { icon: '🤝', title: 'Built for Nigeria',       desc: 'Local currency, WhatsApp sharing, familiar payment flows, local support.' },
]

const USE_CASES = [
  { icon: '⛪', label: 'Churches',       desc: 'Programme registration, conference bookings, Easter & Christmas services' },
  { icon: '🎉', label: 'Owambe',         desc: 'Birthday parties, weddings, naming ceremonies — collect aso-ebi fees' },
  { icon: '🏛️', label: 'Conferences',   desc: 'Multi-ticket tiers, speaker lineups, attendee badge management' },
  { icon: '🎓', label: 'Student Events', desc: 'Convocations, SUG elections, departmental socials — simple and free' },
]

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <main>
      {/* HERO */}
      <section className="hero">
        <div className="hero-glow-r" />
        <div className="hero-glow-l" />
        <div className="hero-content fade-up">
          <div className="hero-pill">
            <span className="hero-dot" />
            Built for everyday Nigerians
          </div>
          <h1 className="hero-h1">
            Create Events.<br />
            <span>Sell Tickets.</span><br />
            Check In. Done.
          </h1>
          <p className="hero-sub">
            QuickTix is the fastest way for Nigerian organizers to create an event page,
            sell tickets in Naira, and manage attendees — all in one place.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/signup')}>
              Create Your Event Free →
            </button>
            <button className="btn btn-outline-white btn-lg" onClick={() => navigate('/explore')}>
              Explore Events
            </button>
          </div>
        </div>
        <div className="hero-stats container">
          {[['10,000+','Tickets Sold'],['500+','Events Created'],['₦50M+','Revenue Processed']].map(([v,l]) => (
            <div key={l} className="hero-stat">
              <span className="hero-stat-val">{v}</span>
              <span className="hero-stat-lbl">{l}</span>
            </div>
          ))}
        </div>
      </section>

      {/* TRUST BAR */}
      <div className="trust-bar">
        <div className="trust-inner container">
          <span className="trust-lbl">TRUSTED BY</span>
          {['🏛️ CcHub','⛪ RCCG Youth','🎓 UNILAG Students','🎵 AfroBeat Fest','💼 Lagos Tech Week'].map(o => (
            <span key={o} className="trust-org">{o}</span>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section className="sec-pad" style={{ background: 'var(--page-bg)' }}>
        <div className="container">
          <div className="sec-head">
            <h2 className="sec-title">3 Steps to Your Event</h2>
            <p className="sec-sub">No technical skill required. If you can fill a form, you can host an event.</p>
          </div>
          <div className="steps-grid">
            {[
              { n:'1', title:'Create Your Event',   desc:'Fill in the event name, date, location, and ticket price. Done in under 2 minutes.' },
              { n:'2', title:'Share Your Link',      desc:'Get a unique event page. Share on WhatsApp, Instagram, or anywhere your crowd is.' },
              { n:'3', title:'Check In Attendees',  desc:'Use our QR scanner at the gate. Instant validation. No paper lists needed.' },
            ].map((s,i) => (
              <div key={i} className="step-card card">
                <span className="step-bg-num">0{s.n}</span>
                <div className="step-num">{s.n}</div>
                <h3 className="step-title">{s.title}</h3>
                <p className="step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="sec-pad feat-section">
        <div className="container">
          <div className="sec-head">
            <h2 className="sec-title sec-title-white">Everything You Need</h2>
            <p className="sec-sub sec-sub-white">No add-ons. No surprises. All in one platform.</p>
          </div>
          <div className="feat-grid">
            {FEATURES.map((f,i) => (
              <div key={i} className="feat-card">
                <span className="feat-icon">{f.icon}</span>
                <h3 className="feat-title">{f.title}</h3>
                <p className="feat-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* USE CASES */}
      <section className="sec-pad" style={{ background: 'var(--page-bg)' }}>
        <div className="container">
          <div className="sec-head">
            <h2 className="sec-title">Made for Every Occasion</h2>
            <p className="sec-sub">Whether it's a church programme or a Lekki owambe, we've got you.</p>
          </div>
          <div className="use-grid">
            {USE_CASES.map((u,i) => (
              <div key={i} className="use-card card">
                <span className="use-icon">{u.icon}</span>
                <h3 className="use-title">{u.label}</h3>
                <p className="use-desc">{u.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="sec-pad price-section">
        <div className="container">
          <div className="sec-head">
            <h2 className="sec-title sec-title-white">Simple Pricing</h2>
            <p className="sec-sub sec-sub-white">Start free. Only pay when you earn.</p>
          </div>
          <div className="price-grid">
            {[
              { tier:'Free Events', price:'₦0', per:'', desc:'For free events & registrations', feats:['Unlimited free events','QR check-in included','Basic analytics','WhatsApp-ready links','Email confirmations'], cta:'Start Free', featured:false },
              { tier:'Paid Events', price:'5%', per:' per ticket', desc:'For ticket sales with payment', feats:['Everything in Free','Paystack integration','Advanced analytics','Payout within 24hrs','Priority support'], cta:'Start Selling', featured:true },
            ].map((p,i) => (
              <div key={i} className={`price-card ${p.featured ? 'price-card-featured' : ''}`}>
                {p.featured && <div className="price-badge">MOST POPULAR</div>}
                <div className="price-tier">{p.tier}</div>
                <div className="price-val">{p.price}<span className="price-per">{p.per}</span></div>
                <p className="price-desc">{p.desc}</p>
                <ul className="price-feats">
                  {p.feats.map(f => <li key={f}><span className="chk">✓</span> {f}</li>)}
                </ul>
                <button className={`btn btn-full ${p.featured ? 'btn-primary' : 'btn-outline-white'}`} onClick={() => navigate('/signup')}>
                  {p.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-strip">
        <div className="container">
          <h2 className="cta-h2">Ready to host your next event?</h2>
          <p className="cta-sub">Join 500+ organizers already using QuickTix across Nigeria.</p>
          <button className="cta-btn" onClick={() => navigate('/signup')}>Create Free Account →</button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="container">
          <div className="footer-top">
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div className="footer-logo">Q</div>
              <span className="footer-name">QuickTix</span>
            </div>
            <span className="footer-tag">Fast, simple ticketing built for Nigerians.</span>
          </div>
          <div className="footer-cols">
            {[
              { title:'Product',  links:['Create Event','Explore Events','Pricing','QR Check-In'] },
              { title:'Company',  links:['About','Blog','Careers','Contact'] },
              { title:'Support',  links:['Help Centre','WhatsApp Support','Privacy Policy','Terms of Use'] },
            ].map(col => (
              <div key={col.title}>
                <div className="footer-col-title">{col.title}</div>
                <ul>{col.links.map(l => <li key={l}><a href="#" className="footer-link">{l}</a></li>)}</ul>
              </div>
            ))}
          </div>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} QuickTix. Made with 🧡 in Nigeria.</span>
            <div className="footer-socials">
              {['Twitter','Instagram','LinkedIn','WhatsApp'].map(s => <a key={s} href="#" className="footer-social">{s}</a>)}
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
