import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import client from '../api/client'
import EventCover from '../components/EventCover'

const CATS = ['Conference','Church','Social','Training','Concert','Workshop','Sports','Education','Other']
const MAX_IMAGE_MB = 3

export default function EditEventPage() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const fileRef    = useRef(null)

  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState('')
  const [imgError, setImgError] = useState('')
  const [success,  setSuccess]  = useState(false)
  const [original, setOriginal] = useState(null) // to know ticketsSold for capacity guard

  const [form, setForm] = useState({
    title: '', description: '', category: 'Conference',
    date: '', time: '', location: '',
    price: '', capacity: '', coverImage: '',
    tags: '', isOnline: false, onlineLink: '', status: 'published'
  })

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  // ── Load existing event ────────────────────────────────
  useEffect(() => {
    client.get(`/events/${id}`)
      .then(r => {
        const e = r.data.event
        setOriginal(e)
        setForm({
          title:       e.title       || '',
          description: e.description || '',
          category:    e.category    || 'Conference',
          date:        e.date ? e.date.slice(0, 10) : '',
          time:        e.time        || '',
          location:    e.location    || '',
          price:       e.price != null ? String(e.price) : '',
          capacity:    e.capacity != null ? String(e.capacity) : '',
          coverImage:  e.coverImage  || '',
          tags:        (e.tags || []).join(', '),
          isOnline:    e.isOnline    || false,
          onlineLink:  e.onlineLink  || '',
          status:      e.status      || 'published'
        })
      })
      .catch(() => setError('Could not load this event. Check that it exists and you are the organizer.'))
      .finally(() => setLoading(false))
  }, [id])

  // ── Image upload ───────────────────────────────────────
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
    reader.onload  = () => set('coverImage', reader.result)
    reader.onerror = () => setImgError('Could not read that file. Please try another.')
    reader.readAsDataURL(file)
  }

  const onDrop = (e) => {
    e.preventDefault()
    handleFile(e.dataTransfer.files?.[0])
  }

  // ── Save ───────────────────────────────────────────────
  const handleSave = async () => {
    setError('')
    if (!form.title.trim())       return setError('Event title is required.')
    if (!form.date)                return setError('Event date is required.')
    if (!form.time.trim())         return setError('Event time is required.')
    if (!form.location.trim())     return setError('Event location is required.')
    if (!form.capacity)            return setError('Capacity is required.')

    const cap = Number(form.capacity)
    if (original && cap < original.ticketsSold) {
      return setError(`Capacity can't go below ${original.ticketsSold} (tickets already sold).`)
    }

    setSaving(true)
    try {
      await client.put(`/events/${id}`, {
        title:       form.title.trim(),
        description: form.description.trim(),
        category:    form.category,
        date:        form.date,
        time:        form.time.trim(),
        location:    form.location.trim(),
        price:       Number(form.price) || 0,
        capacity:    cap,
        coverImage:  form.coverImage,
        tags:        form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        isOnline:    form.isOnline,
        onlineLink:  form.onlineLink.trim(),
        status:      form.status
      })
      setSuccess(true)
      setTimeout(() => navigate('/dashboard'), 1500)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save changes. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // ── Loading state ──────────────────────────────────────
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div className="page fade-up" style={{ paddingBottom: 60 }}>
      <div className="container-sm">

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard')}>
            ← Back
          </button>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--txt1)', margin: 0 }}>Edit Event</h1>
            <p style={{ fontSize: 14, color: 'var(--txt3)', marginTop: 2 }}>
              Changes go live immediately after saving.
            </p>
          </div>
        </div>

        <div className="card" style={{ padding: 28 }}>

          {/* Cover image */}
          <div className="form-group">
            <label className="label">Event Flyer / Cover Image</label>
            {form.coverImage ? (
              <div className="upload-preview">
                <img src={form.coverImage} alt="Event cover" />
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
              ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp"
              style={{ display: 'none' }}
              onChange={e => handleFile(e.target.files?.[0])}
            />
            {imgError && <p className="hint" style={{ color: '#E53E3E' }}>{imgError}</p>}
          </div>

          {/* Title */}
          <div className="form-group">
            <label className="label">Event Title *</label>
            <input className="input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Lagos Tech Summit 2025" />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="label">Description *</label>
            <textarea className="input" rows={5} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Tell attendees what this event is about..." />
          </div>

          {/* Category */}
          <div className="form-group">
            <label className="label">Category</label>
            <select className="input" value={form.category} onChange={e => set('category', e.target.value)}>
              {CATS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Date & Time */}
          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label className="label">Date *</label>
              <input className="input" type="date" value={form.date} onChange={e => set('date', e.target.value)} />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="label">Time *</label>
              <input className="input" type="time" value={form.time} onChange={e => set('time', e.target.value)} />
            </div>
          </div>

          {/* Location */}
          <div className="form-group">
            <label className="label">Location *</label>
            <input className="input" value={form.location} onChange={e => set('location', e.target.value)} placeholder="e.g. Eko Convention Centre, Victoria Island, Lagos" />
            <label className="hint" style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.isOnline} onChange={e => set('isOnline', e.target.checked)} />
              This is an online event
            </label>
          </div>

          {form.isOnline && (
            <div className="form-group">
              <label className="label">Online Link</label>
              <input className="input" value={form.onlineLink} onChange={e => set('onlineLink', e.target.value)} placeholder="https://meet.google.com/..." />
            </div>
          )}

          {/* Capacity & Price */}
          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label className="label">Capacity *</label>
              <input className="input" type="number" min={original?.ticketsSold || 1} value={form.capacity} onChange={e => set('capacity', e.target.value)} />
              {original && <p className="hint">{original.ticketsSold} tickets already sold — cannot go below this.</p>}
            </div>
            {original && !original.isFree && (
              <div className="form-group" style={{ flex: 1 }}>
                <label className="label">Ticket Price (₦)</label>
                <input className="input" type="number" min={0} value={form.price} onChange={e => set('price', e.target.value)} />
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="form-group">
            <label className="label">Tags <span style={{ fontWeight: 400, color: 'var(--txt3)' }}>(optional)</span></label>
            <input className="input" value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="e.g. tech, networking, lagos" />
            <p className="hint">Separate with commas</p>
          </div>

          {/* Status */}
          <div className="form-group">
            <label className="label">Event Status</label>
            <select className="input" value={form.status} onChange={e => set('status', e.target.value)}>
              <option value="published">Published — visible to everyone</option>
              <option value="draft">Draft — hidden from explore page</option>
              <option value="cancelled">Cancelled</option>
            </select>
            {form.status === 'cancelled' && (
              <p className="hint" style={{ color: '#E53E3E' }}>
                ⚠️ Cancelling will hide this event from attendees and disable new registrations.
              </p>
            )}
          </div>

          {/* Errors */}
          {error && (
            <div className="form-error" style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '12px 16px', color: '#E53E3E', fontSize: 14, marginTop: 8 }}>
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div style={{ background: '#F0FFF4', border: '1px solid #9AE6B4', borderRadius: 12, padding: '12px 16px', color: '#276749', fontSize: 14, marginTop: 8 }}>
              ✅ Changes saved! Redirecting to dashboard...
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => navigate('/dashboard')}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              style={{ flex: 2 }}
              onClick={handleSave}
              disabled={saving || success}
            >
              {saving ? '⏳ Saving...' : '✅ Save Changes'}
            </button>
          </div>

        </div>

        {/* View live link */}
        <div style={{ textAlign: 'center', marginTop: 18 }}>
          <a
            href={`/event/${id}`}
            target="_blank"
            rel="noreferrer"
            style={{ color: 'var(--orange)', fontSize: 14, fontWeight: 600 }}
          >
            View live event page →
          </a>
        </div>

      </div>
    </div>
  )
}