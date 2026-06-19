const express = require('express')
const { asyncHandler, AppError } = require('../middleware/error')
const { protect } = require('../middleware/auth')
const Event  = require('../models/Event')
const Ticket = require('../models/Ticket')
const r = express.Router()

// GET /api/events
r.get('/', asyncHandler(async (req, res) => {
  const { page=1, limit=12, category, search, isFree, sort='-createdAt' } = req.query
  const q = { status: 'published' }
  if (category) q.category = category
  if (isFree !== undefined) q.isFree = isFree === 'true'
  if (search) q.$text = { $search: search }
  const skip  = (Number(page)-1) * Number(limit)
  const total = await Event.countDocuments(q)
  const events = await Event.find(q).populate('organizer','name avatar').sort(sort).skip(skip).limit(Number(limit)).lean()
  res.json({ success: true, total, pages: Math.ceil(total/Number(limit)), page: Number(page), events })
}))

// GET /api/events/my
r.get('/my', protect, asyncHandler(async (req, res) => {
  const events = await Event.find({ organizer: req.user._id }).sort('-createdAt')
  res.json({ success: true, events })
}))

// GET /api/events/dashboard-stats
r.get('/dashboard-stats', protect, asyncHandler(async (req, res) => {
  const events  = await Event.find({ organizer: req.user._id })
  const ids     = events.map(e => e._id)
  const agg     = await Ticket.aggregate([
    { $match: { event: { $in: ids }, status: 'active', paymentStatus: { $in: ['free','paid'] } } },
    { $group: { _id: null, totalTickets: { $sum: '$quantity' }, totalRevenue: { $sum: '$totalAmount' }, checkedIn: { $sum: { $cond: ['$isCheckedIn',1,0] } } } }
  ])
  const s = agg[0] || { totalTickets:0, totalRevenue:0, checkedIn:0 }
  res.json({ success: true, stats: { totalEvents: events.length, ...s, checkInRate: s.totalTickets > 0 ? Math.round(s.checkedIn/s.totalTickets*100) : 0 } })
}))

// GET /api/events/:id
r.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params
  let event = id.match(/^[0-9a-fA-F]{24}$/) ? await Event.findById(id).populate('organizer','name avatar') : null
  if (!event) event = await Event.findOne({ slug: id }).populate('organizer','name avatar')
  if (!event) throw new AppError('Event not found', 404)
  res.json({ success: true, event })
}))

// POST /api/events
r.post('/', protect, asyncHandler(async (req, res) => {
  const { title, description, category, date, time, location, isFree, price, capacity, coverImage, tags, isOnline, onlineLink, endDate } = req.body
  if (!title || !description || !category || !date || !time || !location || !capacity)
    return res.status(400).json({ success: false, message: 'Please fill in all required fields.' })
  const event = await Event.create({ title, description, category, date, endDate, time, location, isFree: isFree !== false, price: isFree ? 0 : Number(price)||0, capacity: Number(capacity), coverImage: coverImage||'', tags: tags||[], isOnline: !!isOnline, onlineLink: onlineLink||'', organizer: req.user._id, organizerName: req.user.name })
  res.status(201).json({ success: true, message: 'Event created! 🎉', event })
}))

// PUT /api/events/:id
r.put('/:id', protect, asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id)
  if (!event) throw new AppError('Event not found', 404)
  if (event.organizer.toString() !== req.user._id.toString())
    return res.status(403).json({ success: false, message: 'Not your event.' })
  const allowed = ['title','description','category','date','endDate','time','location','price','capacity','coverImage','tags','status','isOnline','onlineLink']
  allowed.forEach(f => { if (req.body[f] !== undefined) event[f] = req.body[f] })
  if (req.body.capacity && Number(req.body.capacity) < event.ticketsSold)
    return res.status(400).json({ success: false, message: `Capacity can't be less than tickets sold (${event.ticketsSold}).` })
  await event.save()
  res.json({ success: true, message: 'Event updated.', event })
}))

// DELETE /api/events/:id
r.delete('/:id', protect, asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id)
  if (!event) throw new AppError('Event not found', 404)
  if (event.organizer.toString() !== req.user._id.toString())
    return res.status(403).json({ success: false, message: 'Not your event.' })
  if (event.ticketsSold > 0)
    return res.status(400).json({ success: false, message: 'Cannot delete event with sold tickets. Cancel it instead.' })
  await event.deleteOne()
  res.json({ success: true, message: 'Event deleted.' })
}))

// GET /api/events/:id/attendees
r.get('/:id/attendees', protect, asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id)
  if (!event) throw new AppError('Event not found', 404)
  if (event.organizer.toString() !== req.user._id.toString())
    return res.status(403).json({ success: false, message: 'Access denied.' })
  const { isCheckedIn, page=1, limit=50 } = req.query
  const q = { event: req.params.id, status: 'active' }
  if (isCheckedIn !== undefined) q.isCheckedIn = isCheckedIn === 'true'
  const total = await Ticket.countDocuments(q)
  const attendees = await Ticket.find(q).select('ticketId attendeeName attendeeEmail attendeePhone quantity isCheckedIn checkedInAt paymentStatus createdAt').sort('-createdAt').skip((Number(page)-1)*Number(limit)).limit(Number(limit))
  res.json({ success: true, total, attendees })
}))

module.exports = r
