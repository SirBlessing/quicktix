import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { SAMPLE_EVENTS } from '../../data/events'
import './CheckoutPage.css'

function CheckoutPage() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const event    = SAMPLE_EVENTS.find(e => e.id === id) || SAMPLE_EVENTS[0]

  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [qty,  setQty]  = useState(1)
  const [step, setStep] = useState('form') // form | processing | success

  const update = (field, val) => setForm(prev => ({ ...prev, [field]: val }))

  const subtotal  = event.price * qty
  const fee       = event.price === 0 ? 0 : Math.round(subtotal * 0.05)
  const total     = subtotal + fee

  const handlePay = (e) => {
    e.preventDefault()
    if (!form.name || !form.email) return
    setStep('processing')
    // TODO: Integrate Paystack inline here
    // PaystackPop.setup({ key, email, amount: total * 100, ... }).openIframe()
    setTimeout(() => {
      setStep('success')
      setTimeout(() => navigate(`/ticket/${event.id}`), 1800)
    }, 2000)
  }

  /* ── Processing State ── */
  if (step === 'processing') {
    return (
      <main className="checkout fade-in">
        <div className="checkout__state">
          <span className="checkout__state-icon">⏳</span>
          <h2 className="checkout__state-title">Processing Payment...</h2>
          <p className="checkout__state-sub">Please don't close this page. Verifying with Paystack.</p>
          <div className="checkout__spinner" />
        </div>
      </main>
    )
  }

  /* ── Success State ── */
  if (step === 'success') {
    return (
      <main className="checkout fade-in">
        <div className="checkout__state checkout__state--success">
          <span className="checkout__state-icon">🎉</span>
          <h2 className="checkout__state-title checkout__state-title--success">Payment Successful!</h2>
          <p className="checkout__state-sub">Generating your QR ticket — please wait...</p>
        </div>
      </main>
    )
  }

  /* ── Main Form ── */
  return (
    <main className="checkout fade-in">
      <div className="container">

        <Link to={`/event/${event.id}`} className="back-btn">← Back to Event</Link>
        <h1 className="checkout__title">Complete Your Registration</h1>

        <div className="checkout__grid">

          {/* ── LEFT: Form ── */}
          <div className="checkout__left">

            {/* Attendee details */}
            <div className="checkout__card qt-card">
              <h2 className="checkout__card-title">Your Details</h2>
              <form className="checkout__form" onSubmit={handlePay} noValidate>

                <div className="form-group">
                  <label className="form-label" htmlFor="co-name">Full Name *</label>
                  <input
                    id="co-name"
                    className="form-input"
                    type="text"
                    placeholder="Adunni Okonkwo"
                    value={form.name}
                    onChange={e => update('name', e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="co-email">Email Address *</label>
                  <input
                    id="co-email"
                    className="form-input"
                    type="email"
                    placeholder="adunni@example.com"
                    value={form.email}
                    onChange={e => update('email', e.target.value)}
                    required
                  />
                  <p className="form-hint">📧 Your ticket will be sent to this email address</p>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="co-phone">Phone Number <span className="checkout__optional">(Optional)</span></label>
                  <input
                    id="co-phone"
                    className="form-input"
                    type="tel"
                    placeholder="+234 800 000 0000"
                    value={form.phone}
                    onChange={e => update('phone', e.target.value)}
                  />
                </div>

              </form>
            </div>

            {/* Payment method — only shown for paid events */}
            {event.price > 0 && (
              <div className="checkout__card qt-card">
                <h2 className="checkout__card-title">Payment Method</h2>

                <div className="payment-method payment-method--selected">
                  <span className="payment-method__icon">🏦</span>
                  <div className="payment-method__info">
                    <p className="payment-method__name">Pay with Paystack</p>
                    <p className="payment-method__desc">Cards, Bank Transfer, USSD, QR Code</p>
                  </div>
                  <div className="payment-method__radio">
                    <div className="payment-method__radio-dot" />
                  </div>
                </div>

                <p className="checkout__secure-note">
                  🔒 Your card details are 100% secure. QuickTix never stores your card information.
                </p>
              </div>
            )}

          </div>

          {/* ── RIGHT: Order Summary ── */}
          <aside className="checkout__right">
            <div className="order-summary qt-card">
              <h2 className="checkout__card-title">Order Summary</h2>

              {/* Event preview */}
              <div className="order-summary__event">
                <span className="order-summary__emoji">{event.image}</span>
                <div className="order-summary__event-info">
                  <p className="order-summary__event-title">{event.title}</p>
                  <p className="order-summary__event-date">
                    📅 {new Date(event.date).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                  <p className="order-summary__event-date">📍 {event.location.split(',')[0]}</p>
                </div>
              </div>

              {/* Quantity picker — only for paid */}
              {event.price > 0 && (
                <div className="order-summary__qty-row">
                  <span className="order-summary__qty-label">Number of Tickets</span>
                  <div className="qty-picker">
                    <button
                      className="qty-picker__btn"
                      onClick={() => setQty(q => Math.max(1, q - 1))}
                      aria-label="Decrease quantity"
                    >−</button>
                    <span className="qty-picker__value">{qty}</span>
                    <button
                      className="qty-picker__btn"
                      onClick={() => setQty(q => Math.min(10, q + 1))}
                      aria-label="Increase quantity"
                    >+</button>
                  </div>
                </div>
              )}

              {/* Line items */}
              <div className="order-summary__lines">
                <div className="order-summary__line">
                  <span>{event.price === 0 ? 'Registration' : `Ticket × ${qty}`}</span>
                  <span>{event.price === 0 ? 'FREE' : `₦${subtotal.toLocaleString()}`}</span>
                </div>
                {event.price > 0 && (
                  <div className="order-summary__line order-summary__line--muted">
                    <span>Processing fee (5%)</span>
                    <span>₦{fee.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Total */}
              {event.price > 0 && (
                <div className="order-summary__total">
                  <span>Total</span>
                  <span className="order-summary__total-value">₦{total.toLocaleString()}</span>
                </div>
              )}

              {/* CTA */}
              <button
                className="btn btn--primary btn--full order-summary__cta"
                onClick={handlePay}
                disabled={!form.name || !form.email}
              >
                {event.price === 0
                  ? '✅ Complete Registration'
                  : `Pay ₦${total.toLocaleString()} →`}
              </button>

              <p className="order-summary__terms">
                By continuing, you agree to QuickTix's{' '}
                <a href="#" className="order-summary__link">Terms of Service</a> and{' '}
                <a href="#" className="order-summary__link">Refund Policy</a>.
              </p>
            </div>
          </aside>

        </div>
      </div>
    </main>
  )
}

export default CheckoutPage
