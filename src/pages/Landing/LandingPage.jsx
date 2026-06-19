import { Link } from 'react-router-dom'
import './LandingPage.css'

const FEATURES = [
  { icon: '⚡', title: 'Create in 2 Minutes',     desc: 'Simple form. No tech knowledge needed. Your event is live instantly.' },
  { icon: '💳', title: 'Sell in Naira',            desc: 'Integrated Paystack payments. Collect money directly to your bank account.' },
  { icon: '📱', title: 'QR Check-In',              desc: 'Unique QR per ticket. Scan at the gate. Zero confusion, zero paper lists.' },
  { icon: '📊', title: 'Real-time Analytics',      desc: 'See ticket sales, revenue, and attendance as it happens on your dashboard.' },
  { icon: '🎯', title: 'Free or Paid Events',      desc: 'Host free registrations or sell tickets. Your choice, your price, always.' },
  { icon: '🤝', title: 'Built for Nigeria',        desc: 'Local currency, familiar payment flows, WhatsApp sharing, and local support.' },
]

const USE_CASES = [
  { icon: '⛪', label: 'Churches',        desc: 'Programme registration, conference bookings, Easter/Christmas services' },
  { icon: '🎉', label: 'Owambe',          desc: 'Birthday parties, weddings, naming ceremonies — send links, collect aso-ebi fees' },
  { icon: '🏛️', label: 'Conferences',    desc: 'Multi-ticket tiers, speaker lineups, attendee badge management' },
  { icon: '🎓', label: 'Student Events', desc: 'SUG elections, convocations, departmental socials — simple and free to use' },
]

const STEPS = [
  { step: '01', title: 'Create Your Event',    desc: 'Fill in the event name, date, location, and ticket price. Takes under 2 minutes.',   cta: 'Start Creating' },
  { step: '02', title: 'Share Your Link',      desc: 'Get a unique event page link. Share on WhatsApp, Instagram, or wherever your crowd is.', cta: 'See Example' },
  { step: '03', title: 'Check In Attendees',  desc: 'Use our QR scanner at the gate. Instant validation. No paper lists, no stress.',        cta: 'Watch Demo' },
]

function LandingPage() {
  return (
    <main className="landing">

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero__glow hero__glow--right" />
        <div className="hero__glow hero__glow--left" />
        <div className="container hero__content slide-up">
          <div className="hero__pill">
            <span className="hero__pill-dot" />
            Built for everyday Nigerians
          </div>
          <h1 className="hero__heading">
            Create Events.<br />
            <span className="hero__heading--accent">Sell Tickets.</span><br />
            Check In. Done.
          </h1>
          <p className="hero__sub">
            QuickTix is the fastest way for Nigerian organizers to create an event page,
            sell tickets in Naira, and manage attendees — all in one place.
          </p>
          <div className="hero__actions">
            <Link to="/signup" className="btn btn--primary btn--lg">Create Your Event Free →</Link>
            <Link to="/explore" className="btn btn--outline-white btn--lg">Explore Events</Link>
          </div>
        </div>

        <div className="hero__stats container fade-in">
          {[['10,000+', 'Tickets Sold'], ['500+', 'Events Created'], ['₦50M+', 'Revenue Processed']].map(([val, lbl]) => (
            <div key={lbl} className="hero__stat">
              <span className="hero__stat-value">{val}</span>
              <span className="hero__stat-label">{lbl}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── SOCIAL PROOF ── */}
      <section className="trust-bar">
        <div className="container trust-bar__inner">
          <span className="trust-bar__label">TRUSTED BY</span>
          {['🏛️ CcHub', '⛪ RCCG Youth', '🎓 UI Student Union', '🎵 AfroBeat Fest', '💼 Lagos Tech Week'].map(org => (
            <span key={org} className="trust-bar__org">{org}</span>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="how-it-works section-pad">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">3 Steps to Your Event</h2>
            <p className="section-sub">No technical skill required. If you can fill a form, you can host an event.</p>
          </div>
          <div className="steps-grid">
            {STEPS.map((item, i) => (
              <div key={i} className="step-card qt-card">
                <span className="step-card__bg-num">{item.step}</span>
                <div className="step-card__num">{i + 1}</div>
                <h3 className="step-card__title">{item.title}</h3>
                <p className="step-card__desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="features section-pad">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title section-title--white">Everything You Need</h2>
            <p className="section-sub section-sub--white">No add-ons. No surprises. Everything in one platform.</p>
          </div>
          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <div key={i} className="feature-card">
                <span className="feature-card__icon">{f.icon}</span>
                <h3 className="feature-card__title">{f.title}</h3>
                <p className="feature-card__desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── USE CASES ── */}
      <section className="use-cases section-pad">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Made for Every Occasion</h2>
            <p className="section-sub">Whether it's a church programme or a Lekki owambe, we've got you covered.</p>
          </div>
          <div className="use-cases-grid">
            {USE_CASES.map((u, i) => (
              <div key={i} className="use-case-card qt-card">
                <span className="use-case-card__icon">{u.icon}</span>
                <h3 className="use-case-card__label">{u.label}</h3>
                <p className="use-case-card__desc">{u.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="pricing section-pad">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Simple Pricing</h2>
            <p className="section-sub">Start free. Only pay when you earn.</p>
          </div>
          <div className="pricing-grid">

            <div className="pricing-card qt-card">
              <div className="pricing-card__tier">Free Events</div>
              <div className="pricing-card__price">₦0</div>
              <p className="pricing-card__desc">For free events and registrations</p>
              <ul className="pricing-card__features">
                {['Unlimited free events', 'QR check-in included', 'Basic analytics', 'WhatsApp-ready links', 'Email confirmations'].map(f => (
                  <li key={f}><span className="check">✓</span> {f}</li>
                ))}
              </ul>
              <Link to="/signup" className="btn btn--outline btn--full">Start Free</Link>
            </div>

            <div className="pricing-card pricing-card--featured qt-card">
              <div className="pricing-card__badge">MOST POPULAR</div>
              <div className="pricing-card__tier">Paid Events</div>
              <div className="pricing-card__price">
                5%
                <span className="pricing-card__per"> per ticket sold</span>
              </div>
              <p className="pricing-card__desc">For ticket sales with payment</p>
              <ul className="pricing-card__features">
                {['Everything in Free', 'Paystack integration', 'Advanced analytics', 'Payout within 24hrs', 'Priority support'].map(f => (
                  <li key={f}><span className="check">✓</span> {f}</li>
                ))}
              </ul>
              <Link to="/signup" className="btn btn--primary btn--full">Start Selling</Link>
            </div>

          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="cta-banner">
        <div className="container cta-banner__inner">
          <h2 className="cta-banner__heading">Ready to host your next event?</h2>
          <p className="cta-banner__sub">Join 500+ organizers already using QuickTix across Nigeria.</p>
          <Link to="/signup" className="btn cta-banner__btn">Create Free Account →</Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="container footer__inner">
          <div className="footer__top">
            <div className="footer__brand">
              <div className="footer__logo">Q</div>
              <span className="footer__brand-name">QuickTix</span>
            </div>
            <p className="footer__tagline">Fast, simple ticketing built for Nigerians.</p>
          </div>
          <div className="footer__cols">
            {[
              { title: 'Product',  links: ['Create Event', 'Explore Events', 'Pricing', 'QR Check-In'] },
              { title: 'Company',  links: ['About', 'Blog', 'Careers', 'Contact'] },
              { title: 'Support',  links: ['Help Centre', 'WhatsApp Support', 'Privacy Policy', 'Terms of Use'] },
            ].map(col => (
              <div key={col.title} className="footer__col">
                <h4 className="footer__col-title">{col.title}</h4>
                <ul>
                  {col.links.map(l => <li key={l}><a href="#" className="footer__link">{l}</a></li>)}
                </ul>
              </div>
            ))}
          </div>
          <div className="footer__bottom">
            <span>© 2025 QuickTix. Made with 🧡 in Nigeria.</span>
            <div className="footer__socials">
              {['Twitter', 'Instagram', 'LinkedIn', 'WhatsApp'].map(s => (
                <a key={s} href="#" className="footer__social">{s}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>

    </main>
  )
}

export default LandingPage
