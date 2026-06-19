import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import client from '../api/client'

const DEMO = { _id:'1', title:'Lagos Tech Summit 2025', date:'2025-08-15', time:'09:00 AM', location:'Eko Convention Centre, VI', coverImage:'🏛️', isFree:false, price:15000, capacity:1200, ticketsSold:847 }

export default function CheckoutPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [event,  setEvent]  = useState(DEMO)
  const [form,   setForm]   = useState({ attendeeName:'', attendeeEmail:'', attendeePhone:'' })
  const [qty,    setQty]    = useState(1)
  const [step,   setStep]   = useState('form')
  const [error,  setError]  = useState('')

  useEffect(() => { client.get(`/events/${id}`).then(r=>setEvent(r.data.event)).catch(()=>{}) }, [id])

  const sub  = event.price * qty
  const fee  = event.isFree ? 0 : Math.round(sub * 0.05)
  const total = sub + fee

  const pay = async (e) => {
    e.preventDefault()
    if (!form.attendeeName || !form.attendeeEmail) return setError('Name and email are required.')
    setError('')
    setStep('processing')
    try {
      if (event.isFree) {
        const r = await client.post('/tickets/register-free', { eventId:id, ...form, quantity:qty })
        navigate(`/ticket/${r.data.ticket.ticketId}`)
      } else {
        const r = await client.post('/tickets/initiate-payment', { eventId:id, ...form, quantity:qty })
        window.location.href = r.data.data.authorizationUrl
      }
    } catch(err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.')
      setStep('form')
    }
  }

  if (step === 'processing') return (
    <div className="page"><div className="state-box" style={{maxWidth:440,margin:'80px auto'}}><span className="state-icon">⏳</span><h2 className="state-title">Processing...</h2><p className="state-sub">Please wait. {event.isFree ? 'Registering you...' : 'Redirecting to Paystack...'}</p><div className="checkout-spinner" /></div></div>
  )

  return (
    <div className="page fade-up">
      <div className="container">
        <button className="back" onClick={()=>navigate(`/event/${id}`)}>← Back to Event</button>
        <h1 className="page-title">Complete Registration</h1>

        {error && <div className="alert alert-err"><span className="alert-icon">⚠️</span><div><p className="alert-msg">{error}</p></div></div>}

        <div className="checkout-grid">
          {/* LEFT */}
          <div>
            <div className="card checkout-card">
              <p className="checkout-card-title">Your Details</p>
              <form onSubmit={pay} style={{display:'flex',flexDirection:'column',gap:15}} noValidate>
                {[['attendeeName','text','Full Name *','Adunni Okonkwo'],['attendeeEmail','email','Email Address *','adunni@example.com'],['attendeePhone','tel','Phone (optional)','+234 800 000 0000']].map(([k,t,l,ph])=>(
                  <div key={k} className="form-group">
                    <label className="label">{l}</label>
                    <input className="input" type={t} placeholder={ph} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} />
                    {k === 'attendeeEmail' && <p className="hint">📧 Your ticket will be sent to this email</p>}
                  </div>
                ))}
              </form>
            </div>
            {!event.isFree && (
              <div className="card checkout-card">
                <p className="checkout-card-title">Payment Method</p>
                <div className="pay-method selected">
                  <span className="pay-icon">🏦</span>
                  <div><p className="pay-name">Pay with Paystack</p><p className="pay-desc">Cards, Bank Transfer, USSD, QR Code</p></div>
                  <div className="pay-radio"><div className="pay-radio-dot" /></div>
                </div>
                <p className="secure-note">🔒 Your payment is secured by Paystack. QuickTix never stores your card details.</p>
              </div>
            )}
          </div>

          {/* RIGHT */}
          <div>
            <div className="card order-card">
              <p className="checkout-card-title">Order Summary</p>
              <div className="order-event">
                <span className="order-emoji">{event.coverImage || '🎟️'}</span>
                <div>
                  <p className="order-event-title">{event.title}</p>
                  <p className="order-event-meta">📅 {new Date(event.date).toLocaleDateString('en-NG',{month:'short',day:'numeric',year:'numeric'})}</p>
                  <p className="order-event-meta">📍 {event.location?.split(',')[0]}</p>
                </div>
              </div>
              {!event.isFree && (
                <div className="qty-row">
                  <span className="qty-lbl">Number of Tickets</span>
                  <div className="qty-ctrl">
                    <button className="qty-btn" onClick={()=>setQty(q=>Math.max(1,q-1))}>−</button>
                    <span className="qty-val">{qty}</span>
                    <button className="qty-btn" onClick={()=>setQty(q=>Math.min(10,q+1))}>+</button>
                  </div>
                </div>
              )}
              <div className="order-lines">
                <div className="order-line"><span>{event.isFree ? 'Registration' : `Ticket × ${qty}`}</span><span>{event.isFree ? 'FREE' : `₦${sub.toLocaleString()}`}</span></div>
                {!event.isFree && <div className="order-line muted"><span>Processing fee (5%)</span><span>₦{fee.toLocaleString()}</span></div>}
              </div>
              {!event.isFree && (
                <div className="order-total">
                  <span>Total</span>
                  <span className="order-total-val">₦{total.toLocaleString()}</span>
                </div>
              )}
              <button className="btn btn-primary btn-full" style={{padding:15,fontSize:15}} onClick={pay} disabled={!form.attendeeName || !form.attendeeEmail}>
                {event.isFree ? '✅ Complete Registration' : `Pay ₦${total.toLocaleString()} →`}
              </button>
              <p className="order-terms">By continuing you agree to QuickTix's <a href="#">Terms</a> and <a href="#">Refund Policy</a>.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
