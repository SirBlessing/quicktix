import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import client from '../api/client'
import EventCover from '../components/EventCover'

export default function CheckoutPage() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const [event,   setEvent]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [form,    setForm]    = useState({ attendeeName:'', attendeeEmail:'', attendeePhone:'' })
  const [qty,     setQty]     = useState(1)
  const [step,    setStep]    = useState('form')
  const [error,   setError]   = useState('')

  useEffect(() => {
    client.get(`/events/${id}`)
      .then(r => setEvent(r.data.event))
      .catch(() => setError('Could not load this event.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="page"><div style={{textAlign:'center',padding:'80px 0'}}><div className="spinner"/><p style={{color:'var(--txt3)',marginTop:14,fontSize:14}}>Loading event…</p></div></div>
  )

  if (!event) return (
    <div className="page"><div style={{textAlign:'center',padding:'80px 24px'}}>
      <p style={{fontSize:48,marginBottom:16}}>😕</p>
      <h2 style={{fontSize:20,fontWeight:700,marginBottom:8}}>Event not found</h2>
      <button className="btn btn-primary" onClick={() => navigate('/explore')}>Browse Events</button>
    </div></div>
  )

  // Treat as free if isFree flag is set OR price is 0
  const isFree = event.isFree || !event.price || event.price === 0

  const sub   = isFree ? 0 : (event.price||0) * qty
  const fee   = isFree ? 0 : Math.round(sub * 0.05)
  const total = sub + fee

  const pay = async (e) => {
    e.preventDefault()
    if (!form.attendeeName || !form.attendeeEmail) return setError('Name and email are required.')
    setError('')
    setStep('processing')
    try {
      if (isFree) {
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
    <div className="page"><div style={{textAlign:'center',padding:'80px 24px'}}>
      <div className="spinner" style={{margin:'0 auto 24px'}}/>
      <h2 style={{fontSize:20,fontWeight:700,marginBottom:8}}>{isFree ? 'Registering you...' : 'Redirecting to Paystack...'}</h2>
      <p style={{color:'var(--txt3)'}}>Please wait, do not close this tab.</p>
    </div></div>
  )

  return (
    <div className="page fade-up">
      <div className="container">
        <button className="back" onClick={() => navigate(`/event/${id}`)}>← Back to Event</button>
        <h1 className="page-title">Complete Registration</h1>

        {error && (
          <div className="alert alert-err">
            <span className="alert-icon">⚠️</span>
            <p className="alert-msg">{error}</p>
          </div>
        )}

        <div className="checkout-grid">
          {/* LEFT */}
          <div>
            <div className="card checkout-card">
              <p className="checkout-card-title">Your Details</p>
              <form onSubmit={pay} style={{display:'flex',flexDirection:'column',gap:15}} noValidate>
                {[
                  ['attendeeName','text','Full Name *','Adunni Okonkwo'],
                  ['attendeeEmail','email','Email Address *','adunni@example.com'],
                  ['attendeePhone','tel','Phone (optional)','+234 800 000 0000']
                ].map(([k,t,l,ph]) => (
                  <div key={k} className="form-group">
                    <label className="label">{l}</label>
                    <input className="input" type={t} placeholder={ph} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} />
                    {k === 'attendeeEmail' && <p className="hint">📧 Your ticket will be sent to this email</p>}
                  </div>
                ))}
              </form>
            </div>

            {!isFree && (
              <div className="card checkout-card">
                <p className="checkout-card-title">Payment Method</p>
                <div className="pay-method selected">
                  <span className="pay-icon">🏦</span>
                  <div><p className="pay-name">Pay with Paystack</p><p className="pay-desc">Cards, Bank Transfer, USSD, QR Code</p></div>
                  <div className="pay-radio"><div className="pay-radio-dot"/></div>
                </div>
                <p className="secure-note">🔒 Your payment is secured by Paystack.</p>
              </div>
            )}
          </div>

          {/* RIGHT */}
          <div>
            <div className="card order-card">
              <p className="checkout-card-title">Order Summary</p>
              <div className="order-event">
                <EventCover src={event.coverImage} alt={event.title} size={48} className="order-emoji" />
                <div>
                  <p className="order-event-title">{event.title}</p>
                  <p className="order-event-meta">📅 {new Date(event.date).toLocaleDateString('en-NG',{month:'short',day:'numeric',year:'numeric'})}</p>
                  <p className="order-event-meta">📍 {(event.location||'').split(',')[0]}</p>
                </div>
              </div>

              {!isFree && (
                <div className="qty-row">
                  <span className="qty-lbl">Number of Tickets</span>
                  <div className="qty-ctrl">
                    <button className="qty-btn" type="button" onClick={()=>setQty(q=>Math.max(1,q-1))}>−</button>
                    <span className="qty-val">{qty}</span>
                    <button className="qty-btn" type="button" onClick={()=>setQty(q=>Math.min(10,q+1))}>+</button>
                  </div>
                </div>
              )}

              <div className="order-lines">
                <div className="order-line">
                  <span>{isFree ? 'Registration' : `Ticket × ${qty}`}</span>
                  <span style={{color: isFree ? '#059669', fontWeight:700}}>{isFree ? 'FREE' : `₦${sub.toLocaleString()}`}</span>
                </div>
                {!isFree && (
                  <div className="order-line muted">
                    <span>Processing fee (5%)</span>
                    <span>₦{fee.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {!isFree && (
                <div className="order-total">
                  <span>Total</span>
                  <span className="order-total-val">₦{total.toLocaleString()}</span>
                </div>
              )}

              {isFree && (
                <div style={{background:'rgba(5,150,105,.08)',border:'1px solid rgba(5,150,105,.2)',borderRadius:12,padding:'12px 16px',marginBottom:12,textAlign:'center'}}>
                  <p style={{color:'#059669',fontWeight:700,fontSize:16,margin:0}}>🎉 This event is FREE!</p>
                  <p style={{color:'var(--txt3)',fontSize:13,margin:'4px 0 0'}}>Just register with your name and email</p>
                </div>
              )}

              <button
                className="btn btn-primary btn-full"
                style={{padding:15,fontSize:15}}
                onClick={pay}
                disabled={!form.attendeeName || !form.attendeeEmail}
              >
                {isFree ? '✅ Complete Free Registration' : `Pay ₦${total.toLocaleString()} →`}
              </button>

              <p className="order-terms">
                By continuing you agree to QuickTix's <a href="#">Terms</a> and <a href="#">Refund Policy</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}