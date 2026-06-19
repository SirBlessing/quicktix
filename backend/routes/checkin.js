const express = require('express')
const { asyncHandler, AppError } = require('../middleware/error')
const { protect } = require('../middleware/auth')
const Event  = require('../models/Event')
const Ticket = require('../models/Ticket')
const r = express.Router()

r.use(protect)

// POST /api/checkin/scan
r.post('/scan', asyncHandler(async (req, res) => {
  const { qrData, eventId } = req.body
  if (!qrData || !eventId) return res.status(400).json({ success: false, message: 'QR data and event ID required.' })

  const result = await Ticket.validateQR(qrData)
  if (!result.valid) return res.json({ success: true, valid: false, reason: result.reason, checkedAt: result.checkedAt || null })

  const { ticket } = result
  if (ticket.event._id.toString() !== eventId)
    return res.json({ success: true, valid: false, reason: 'Ticket is for a different event.' })

  ticket.isCheckedIn = true
  ticket.checkedInAt = new Date()
  ticket.checkedInBy = req.user._id
  await ticket.save()

  res.json({ success: true, valid: true, message: 'Check-in successful! ✅', attendee: { name: ticket.attendeeName, email: ticket.attendeeEmail, ticketId: ticket.ticketId, quantity: ticket.quantity, checkedInAt: ticket.checkedInAt } })
}))

// POST /api/checkin/manual
r.post('/manual', asyncHandler(async (req, res) => {
  const { ticketId, eventId } = req.body
  if (!ticketId || !eventId) return res.status(400).json({ success: false, message: 'Ticket ID and event ID required.' })

  const ticket = await Ticket.findOne({ ticketId: ticketId.trim().toUpperCase(), event: eventId, status: 'active' })
  if (!ticket) return res.json({ success: true, valid: false, reason: 'No ticket found with this ID for this event.' })
  if (ticket.paymentStatus === 'pending') return res.json({ success: true, valid: false, reason: 'Payment not confirmed.' })
  if (ticket.isCheckedIn) return res.json({ success: true, valid: false, reason: 'Ticket already used.', checkedAt: ticket.checkedInAt })

  ticket.isCheckedIn = true
  ticket.checkedInAt = new Date()
  ticket.checkedInBy = req.user._id
  await ticket.save()

  res.json({ success: true, valid: true, message: 'Manual check-in successful! ✅', attendee: { name: ticket.attendeeName, email: ticket.attendeeEmail, ticketId: ticket.ticketId, quantity: ticket.quantity, checkedInAt: ticket.checkedInAt } })
}))

// GET /api/checkin/:eventId/stats
r.get('/:eventId/stats', asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.eventId)
  if (!event) throw new AppError('Event not found', 404)
  if (event.organizer.toString() !== req.user._id.toString())
    return res.status(403).json({ success: false, message: 'Access denied.' })

  const agg = await Ticket.aggregate([
    { $match: { event: event._id, status: 'active', paymentStatus: { $in: ['free','paid'] } } },
    { $group: { _id: null, totalTickets: { $sum: '$quantity' }, checkedIn: { $sum: { $cond: ['$isCheckedIn','$quantity',0] } } } }
  ])
  const s = agg[0] || { totalTickets: 0, checkedIn: 0 }
  const invalidScans = await Ticket.countDocuments({ event: event._id, paymentStatus: { $in: ['pending','failed'] } })

  res.json({ success: true, stats: { eventTitle: event.title, capacity: event.capacity, totalExpected: s.totalTickets, checkedIn: s.checkedIn, remaining: s.totalTickets - s.checkedIn, invalidScans, checkInRate: s.totalTickets > 0 ? Math.round(s.checkedIn / s.totalTickets * 100) : 0 } })
}))

// GET /api/checkin/:eventId/feed
r.get('/:eventId/feed', asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.eventId)
  if (!event) throw new AppError('Event not found', 404)
  if (event.organizer.toString() !== req.user._id.toString())
    return res.status(403).json({ success: false, message: 'Access denied.' })

  const feed = await Ticket.find({ event: req.params.eventId, isCheckedIn: true, status: 'active' })
    .select('ticketId attendeeName checkedInAt quantity').sort('-checkedInAt').limit(50).lean()

  res.json({ success: true, feed: feed.map(t => ({ id: t.ticketId, name: t.attendeeName, quantity: t.quantity, checkedInAt: t.checkedInAt, status: 'valid' })) })
}))

// PATCH /api/checkin/:ticketId/undo
r.patch('/:ticketId/undo', asyncHandler(async (req, res) => {
  const ticket = await Ticket.findOne({ ticketId: req.params.ticketId.toUpperCase(), status: 'active' })
  if (!ticket) throw new AppError('Ticket not found', 404)
  if (!ticket.isCheckedIn) return res.status(400).json({ success: false, message: 'Ticket not checked in yet.' })
  ticket.isCheckedIn = false; ticket.checkedInAt = null; ticket.checkedInBy = null
  await ticket.save()
  res.json({ success: true, message: `Check-in for ${ticket.attendeeName} reversed.` })
}))

module.exports = r
