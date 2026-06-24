import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import client from '../api/client'

const CATS = ['Conference','Church','Social','Training','Concert','Workshop','Sports','Education','Other']
const MAX_IMAGE_MB = 3

export default function CreateEventPage() {
  const navigate = useNavigate()
  const fileRef = useRef(null)
  const [step, setStep] = useState(1)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [imgError, setImgError] = useState('')
  const [form, setForm] = useState({
    title:'', description:'', category:'Conference', date:'', time:'', location:'',
    isFree:true, price:'', capacity:'', coverImage:'', tags:'', isOnline:false
  })

  const set = (k,v) => setForm(p => ({...p,[k]:v}))

  const handleFile = (file) => {
    setImgError('')
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setImgError('Please upload an image file (PNG, JPG or WEBP).')
      return
    }
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      setImgError(`Image must be under ${MAX_IMAGE_MB}MB.`)
      return
    }
    const reader = new FileReader()
    reader.onload = () => set('coverImage', reader.result)
    reader.onerror = () => setImgError('Could not read that file. Please try another image.')
    reader.readAsDataURL(file)
  }

  const onDrop = (e) => {
    e.preventDefault()
    handleFile(e.dataTransfer.files?.[0])
  }

  const publish = async () => {
    setError('')
    try {
      await client.post('/events', { ...form, price: Number(form.price)||0, capacity: Number(form.capacity)||0, tags: form.tags.split(',').map(t=>t.trim()).filter(Boolean) })
      setSaved(true)
      setTimeout(() => navigate('/dashboard'), 1600)
    } catch(e) { setError(e.response?.data?.message || 'Failed to create event.') }
  }

  return (
    <div className="page fade-up">
      <div className="container-sm">
        <button className="back" onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>
        <h1 className="page-title">Create New Event</h1>
        <p className="page-sub" style={{marginBottom:32}}>Fill in the details below — takes less than 2 minutes!</p>

        {/* Stepper */}
        <div className="stepper">
          {[['1','Basic Info'],['2','Tickets'],['3','Review']].map(([s,lbl],i) => (
            <div key={s} className="step-item">
              <div className="step-pair">
                <button className={`step-dot ${step > i+1 ? 'done' : step === i+1 ? 'active' : 'idle'}`}
                  onClick={() => step > i+1 && setStep(i+1)}>{step > i+1 ? '✓' : s}</button>
                <span className={`step-lbl ${step===i+1?'active':''}`}>{lbl}</span>
              </div>
              {i < 2 && <div className={`step-line ${step > i+1 ? 'done' : ''}`} />}
            </div>
          ))}
        </div>

        {saved && <div className="alert alert-ok"><span className="alert-icon">🎉</span><div><p className="alert-msg">Event Published!</p><p className="alert-sub">Redirecting to dashboard...</p></div></div>}
        {error && <div className="alert alert-err"><span className="alert-icon">⚠️</span><div><p className="alert-msg">{error}</p></div></div>}

        <div className="card" style={{padding:'32px 28px'}}>

          {step === 1 && (
            <div style={{display:'flex',flexDirection:'column',gap:18}}>
              <div className="form-group">
                <label className="label">Event Title *</label>
                <input className="input" placeholder="e.g. Lagos Tech Summit 2025" value={form.title} onChange={e=>set('title',e.target.value)} />
              </div>

              {/* ── Cover image upload ── */}
              <div className="form-group">
                <label className="label">Event Flyer / Cover Image</label>
                {form.coverImage ? (
                  <div className="upload-preview">
                    <img src={form.coverImage} alt="Event cover preview" />
                    <button
                      type="button"
                      className="upload-remove"
                      onClick={() => { set('coverImage', ''); setImgError('') }}
                    >
                      ✕ Remove
                    </button>
                  </div>
                ) : (
                  <div
                    className="upload-drop"
                    onClick={() => fileRef.current?.click()}
                    onDragOver={e => e.preventDefault()}
                    onDrop={onDrop}
                  >
                    <svg className="upload-drop-icon" width="32" height="32" viewBox="0 0 24 24" fill="none">
                      <path d="M12 16V4m0 0L7 9m5-5l5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <p className="upload-drop-text">Click to upload, or drag &amp; drop</p>
                    <p className="upload-drop-hint">PNG, JPG or WEBP · max {MAX_IMAGE_MB}MB</p>
                  </div>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  style={{display:'none'}}
                  onChange={e => handleFile(e.target.files?.[0])}
                />
                {imgError && <p className="hint" style={{color:'#E53E3E'}}>{imgError}</p>}
                <p className="hint">No flyer? No problem — we'll show a clean placeholder instead.</p>
              </div>
              <div className="row-2">
                <div className="form-group">
                  <label className="label">Date *</label>
                  <input className="input" type="date" value={form.date} onChange={e=>set('date',e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="label">Time *</label>
                  <input className="input" type="time" value={form.time} onChange={e=>set('time',e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label className="label">Location / Venue *</label>
                <input className="input" placeholder="e.g. Civic Centre, Victoria Island, Lagos" value={form.location} onChange={e=>set('location',e.target.value)} />
              </div>
              <div className="form-group">
                <label className="label">Category</label>
                <select className="input" value={form.category} onChange={e=>set('category',e.target.value)}>
                  {CATS.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="label">Event Description *</label>
                <textarea className="input input-area" placeholder="Tell attendees what to expect..." value={form.description} onChange={e=>set('description',e.target.value)} />
              </div>
              <div className="form-actions form-actions-end">
                <button className="btn btn-primary" onClick={() => setStep(2)}>Next: Tickets →</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div style={{display:'flex',flexDirection:'column',gap:18}}>
              <div>
                <label className="label" style={{marginBottom:10}}>Event Type</label>
                <div className="ticket-toggle">
                  {[['🎁','Free Event','No charge for attendees',true],['💳','Paid Event','Sell tickets in Naira',false]].map(([icon,lbl,desc,val]) => (
                    <button key={lbl} className={`toggle-btn ${form.isFree===val?'active':''}`} onClick={()=>set('isFree',val)}>
                      <span className="toggle-icon">{icon}</span>
                      <span className="toggle-label">{lbl}</span>
                      <span className="toggle-desc">{desc}</span>
                    </button>
                  ))}
                </div>
              </div>
              {!form.isFree && (
                <div className="form-group">
                  <label className="label">Ticket Price (₦) *</label>
                  <input className="input" type="number" placeholder="5000" value={form.price} onChange={e=>set('price',e.target.value)} />
                  <p className="hint">QuickTix charges 5% per ticket. You keep the rest, paid to your bank within 24hrs.</p>
                </div>
              )}
              <div className="form-group">
                <label className="label">Maximum Capacity *</label>
                <input className="input" type="number" placeholder="500" value={form.capacity} onChange={e=>set('capacity',e.target.value)} />
              </div>
              <div className="includes-box">
                <p className="includes-title">Every ticket includes:</p>
                {['Unique QR code sent to email','Real-time check-in scanner','WhatsApp-shareable confirmation','Attendance tracking dashboard'].map(f=>(
                  <p key={f} className="includes-item"><span className="includes-chk">✓</span>{f}</p>
                ))}
              </div>
              <div className="form-actions">
                <button className="btn btn-ghost" onClick={()=>setStep(1)}>← Back</button>
                <button className="btn btn-primary" onClick={()=>setStep(3)}>Review Event →</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <p style={{fontSize:15,fontWeight:700,color:'var(--txt1)',marginBottom:18}}>Review Your Event</p>

              {/* Flyer preview in review */}
              {form.coverImage && (
                <div className="review-cover">
                  <img src={form.coverImage} alt="Event flyer preview" />
                </div>
              )}

              <div className="review-list">
                {[
                  ['Title',       form.title||'—'],
                  ['Date',        form.date||'—'],
                  ['Time',        form.time||'—'],
                  ['Location',    form.location||'—'],
                  ['Category',    form.category],
                  ['Ticket Type', form.isFree ? 'Free' : `₦${Number(form.price||0).toLocaleString()} per ticket`],
                  ['Capacity',    `${form.capacity||0} attendees`],
                ].map(([l,v])=>(
                  <div key={l} className="review-row">
                    <span className="review-lbl">{l}</span>
                    <span className="review-val">{v}</span>
                  </div>
                ))}
              </div>
              <div className="form-actions" style={{marginTop:20}}>
                <button className="btn btn-ghost" onClick={()=>setStep(2)}>← Edit</button>
                <button className="btn btn-primary" style={{flex:1,justifyContent:'center'}} onClick={publish} disabled={saved}>
                  🚀 Publish Event
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}