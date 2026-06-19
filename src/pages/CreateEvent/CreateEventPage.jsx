import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './CreateEvent.css'

const CATEGORIES = ['Conference', 'Church', 'Social', 'Training', 'Concert', 'Workshop', 'Sports', 'Education', 'Other']

function CreateEventPage() {
  const navigate = useNavigate()
  const [step,  setStep]  = useState(1)
  const [saved, setSaved] = useState(false)
  const [form,  setForm]  = useState({
    title: '', date: '', time: '', location: '',
    category: 'Conference', description: '', coverImage: '',
    isFree: true, price: '', capacity: '',
  })

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const handlePublish = () => {
    setSaved(true)
    // TODO: POST /api/events with form data
    setTimeout(() => navigate('/dashboard'), 2000)
  }

  return (
    <main className="create-event fade-in">
      <div className="container--sm">

        <Link to="/dashboard" className="back-btn">← Back to Dashboard</Link>

        <h2 className="create-event__title">Create New Event</h2>
        <p className="create-event__sub">Fill in the details below — should take less than 2 minutes!</p>

        {/* Step progress */}
        <div className="stepper">
          {[['1', 'Basic Info'], ['2', 'Tickets'], ['3', 'Review']].map(([s, label], i) => (
            <div key={s} className="stepper__item">
              <div className="stepper__pair">
                <button
                  className={`stepper__dot ${step >= i + 1 ? 'stepper__dot--done' : ''} ${step === i + 1 ? 'stepper__dot--active' : ''}`}
                  onClick={() => step > i + 1 && setStep(i + 1)}
                >
                  {step > i + 1 ? '✓' : s}
                </button>
                <span className={`stepper__label ${step === i + 1 ? 'stepper__label--active' : ''}`}>{label}</span>
              </div>
              {i < 2 && <div className={`stepper__line ${step > i + 1 ? 'stepper__line--done' : ''}`} />}
            </div>
          ))}
        </div>

        {saved && (
          <div className="alert alert--success">
            <span className="alert__icon">🎉</span>
            <div>
              <p className="alert__title">Event Published!</p>
              <p className="alert__sub">Redirecting to dashboard...</p>
            </div>
          </div>
        )}

        <div className="create-event__card qt-card">

          {/* ── Step 1: Basic Info ── */}
          {step === 1 && (
            <div className="create-event__step">
              <div className="form-group">
                <label className="form-label" htmlFor="title">Event Title *</label>
                <input id="title" className="form-input" placeholder="e.g. Lagos Tech Summit 2025" value={form.title} onChange={e => update('title', e.target.value)} />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="date">Date *</label>
                  <input id="date" className="form-input" type="date" value={form.date} onChange={e => update('date', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="time">Time *</label>
                  <input id="time" className="form-input" type="time" value={form.time} onChange={e => update('time', e.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="location">Location / Venue *</label>
                <input id="location" className="form-input" placeholder="e.g. Civic Centre, Victoria Island, Lagos" value={form.location} onChange={e => update('location', e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="category">Category</label>
                <select id="category" className="form-input" value={form.category} onChange={e => update('category', e.target.value)}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="desc">Event Description</label>
                <textarea
                  id="desc"
                  className="form-input form-input--textarea"
                  placeholder="Tell attendees what your event is about, what to expect, dress code, etc."
                  value={form.description}
                  onChange={e => update('description', e.target.value)}
                />
              </div>

              <div className="create-event__actions create-event__actions--right">
                <button className="btn btn--primary" onClick={() => setStep(2)}>Next: Tickets →</button>
              </div>
            </div>
          )}

          {/* ── Step 2: Tickets ── */}
          {step === 2 && (
            <div className="create-event__step">
              <p className="create-event__step-heading">Event Type</p>
              <div className="ticket-toggle">
                <button className={`ticket-toggle__btn ${form.isFree ? 'ticket-toggle__btn--active' : ''}`} onClick={() => update('isFree', true)}>
                  <span className="ticket-toggle__icon">🎁</span>
                  <span className="ticket-toggle__label">Free Event</span>
                  <span className="ticket-toggle__desc">No charge for attendees</span>
                </button>
                <button className={`ticket-toggle__btn ${!form.isFree ? 'ticket-toggle__btn--active' : ''}`} onClick={() => update('isFree', false)}>
                  <span className="ticket-toggle__icon">💳</span>
                  <span className="ticket-toggle__label">Paid Event</span>
                  <span className="ticket-toggle__desc">Sell tickets in Naira</span>
                </button>
              </div>

              {!form.isFree && (
                <div className="form-group">
                  <label className="form-label" htmlFor="price">Ticket Price (₦) *</label>
                  <input id="price" className="form-input" type="number" min="100" placeholder="5000" value={form.price} onChange={e => update('price', e.target.value)} />
                  <p className="form-hint">QuickTix charges 5% per ticket sold. You keep the rest, paid directly to your account within 24hrs.</p>
                </div>
              )}

              <div className="form-group">
                <label className="form-label" htmlFor="capacity">Maximum Capacity *</label>
                <input id="capacity" className="form-input" type="number" min="1" placeholder="500" value={form.capacity} onChange={e => update('capacity', e.target.value)} />
              </div>

              <div className="ticket-includes">
                <p className="ticket-includes__title">Every ticket includes:</p>
                {[
                  'Unique QR code sent to attendee email',
                  'Real-time check-in scanner for organizers',
                  'WhatsApp-shareable confirmation',
                  'Attendance tracking dashboard',
                ].map(f => (
                  <p key={f} className="ticket-includes__item">
                    <span className="ticket-includes__check">✓</span> {f}
                  </p>
                ))}
              </div>

              <div className="create-event__actions">
                <button className="btn btn--ghost" onClick={() => setStep(1)}>← Back</button>
                <button className="btn btn--primary" onClick={() => setStep(3)}>Review Event →</button>
              </div>
            </div>
          )}

          {/* ── Step 3: Review ── */}
          {step === 3 && (
            <div className="create-event__step">
              <p className="create-event__step-heading">Review Your Event</p>
              <div className="review-list">
                {[
                  ['Event Title',  form.title      || 'Lagos Tech Summit 2025'],
                  ['Date',         form.date        || '2025-08-15'],
                  ['Time',         form.time        || '09:00'],
                  ['Location',     form.location    || 'Eko Convention Centre'],
                  ['Category',     form.category],
                  ['Ticket Type',  form.isFree ? 'Free' : `₦${Number(form.price || 0).toLocaleString()} per ticket`],
                  ['Capacity',     `${form.capacity || 500} attendees`],
                ].map(([label, val]) => (
                  <div key={label} className="review-list__row">
                    <span className="review-list__label">{label}</span>
                    <span className="review-list__value">{val}</span>
                  </div>
                ))}
              </div>

              <div className="create-event__actions">
                <button className="btn btn--ghost" onClick={() => setStep(2)}>← Edit</button>
                <button className="btn btn--primary create-event__publish" onClick={handlePublish} disabled={saved}>
                  🚀 Publish Event
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </main>
  )
}

export default CreateEventPage
