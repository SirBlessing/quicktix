const express = require('express')
const { asyncHandler, AppError } = require('../middleware/error')
const { protect } = require('../middleware/auth')
const Event  = require('../models/Event')
const Ticket = require('../models/Ticket')
const { generateQR } = require('../utils/qrcode')
const { sendTicket } = require('../utils/email')
const { initPayment } = require('../utils/paystack')
const r = express.Router()

// POST /api/tickets/register-free
r.post('/register-free', asyncHandler(async (req, res) => {
  const { eventId, attendeeName, attendeeEmail, attendeePhone, quantity = 1 } = req.body
  if (!eventId || !attendeeName || !attendeeEmail)
    return res.status(400).json({ success: false, message: 'Name, email and event ID are required.' })

  const event = await Event.findById(eventId)
  if (!event) throw new AppError('Event not found', 404)
  if (event.status !== 'published') return res.status(400).json({ success: false, message: 'Event is not available.' })
  if (!event.isFree) return res.status(400).json({ success: false, message: 'This is a paid event. Use the payment flow.' })
  if (event.ticketsSold + quantity > event.capacity) return res.status(400).json({ success: false, message: 'Not enough spots remaining.' })

  const existing = await Ticket.findOne({ event: eventId, attendeeEmail: attendeeEmail.toLowerCase(), status: 'active' })
  if (existing) return res.status(400).json({ success: false, message: 'This email is already registered for this event.' })

  const ticket = await Ticket.create({
    event: eventId, attendee: req.user?._id || null,
    attendeeName, attendeeEmail: attendeeEmail.toLowerCase(),
    attendeePhone: attendeePhone || '', quantity, unitPrice: 0, totalAmount: 0, paymentStatus: 'free'
  })

  const qrData = `${process.env.API_URL}/api/checkin/scan?ticket=${ticket.ticketId}`
  ticket.qrCode = await generateQR(qrData)
  ticket.qrCodeData = qrData
  await ticket.save()

  await Event.findByIdAndUpdate(eventId, { $inc: { ticketsSold: quantity } })
  try { await sendTicket(ticket, event) } catch(e) { console.error('Email error:', e.message) }

  await ticket.populate('event', 'title date time location')
  res.status(201).json({ success: true, message: 'Registration successful! Check your email. 🎉', ticket })
}))

// POST /api/tickets/initiate-payment
r.post('/initiate-payment', asyncHandler(async (req, res) => {
  const { eventId, attendeeName, attendeeEmail, attendeePhone, quantity = 1 } = req.body
  if (!eventId || !attendeeName || !attendeeEmail)
    return res.status(400).json({ success: false, message: 'Name, email and event ID are required.' })

  const event = await Event.findById(eventId)
  if (!event) throw new AppError('Event not found', 404)
  if (event.status !== 'published') return res.status(400).json({ success: false, message: 'Event not available.' })
  if (event.isFree) return res.status(400).json({ success: false, message: 'This is a free event.' })
  if (event.ticketsSold + quantity > event.capacity) return res.status(400).json({ success: false, message: 'Not enough spots.' })

  const existing = await Ticket.findOne({ event: eventId, attendeeEmail: attendeeEmail.toLowerCase(), status: 'active', paymentStatus: { $in: ['pending','paid'] } })
  if (existing) return res.status(400).json({ success: false, message: 'Email already registered for this event.' })

  const unitPrice = event.price
  const totalAmount = unitPrice * quantity
  const fee = Math.round(totalAmount * 0.05)
  const chargeAmount = (totalAmount + fee) * 100 // kobo

  const ticket = await Ticket.create({
    event: eventId, attendee: req.user?._id || null,
    attendeeName, attendeeEmail: attendeeEmail.toLowerCase(),
    attendeePhone: attendeePhone || '', quantity, unitPrice, totalAmount, paymentStatus: 'pending'
  })

  const data = await initPayment({
    email: attendeeEmail, amount: chargeAmount,
    reference: ticket._id.toString(),
    metadata: { ticketId: ticket._id.toString(), ticketRef: ticket.ticketId, eventId, eventTitle: event.title, attendeeName, quantity },
    callback_url: `${process.env.CLIENT_URL}/checkout/verify?reference=${ticket._id}`
  })

  ticket.paystackReference = data.reference
  await ticket.save()

  res.json({ success: true, data: { authorizationUrl: data.authorization_url, reference: data.reference, ticketId: ticket._id, amount: chargeAmount / 100 } })
}))

// GET /api/tickets/my
r.get('/my', protect, asyncHandler(async (req, res) => {
  const tickets = await Ticket.find({ attendeeEmail: req.user.email, status: 'active' })
    .populate('event', 'title date time location category status coverImage')
    .sort('-createdAt')
  res.json({ success: true, tickets })
}))

// GET /api/tickets/:ticketId
r.get('/:ticketId', asyncHandler(async (req, res) => {
  const ticket = await Ticket.findOne({ ticketId: req.params.ticketId })
    .populate('event', 'title date time location organizer coverImage')
  if (!ticket) throw new AppError('Ticket not found', 404)
  res.json({ success: true, ticket })
}))

// PATCH /api/tickets/:ticketId/cancel
r.patch('/:ticketId/cancel', protect, asyncHandler(async (req, res) => {
  const ticket = await Ticket.findOne({ ticketId: req.params.ticketId, attendeeEmail: req.user.email })
  if (!ticket) throw new AppError('Ticket not found', 404)
  if (ticket.status === 'cancelled') return res.status(400).json({ success: false, message: 'Already cancelled.' })
  if (ticket.isCheckedIn) return res.status(400).json({ success: false, message: 'Cannot cancel a used ticket.' })
  ticket.status = 'cancelled'
  await ticket.save()
  await Event.findByIdAndUpdate(ticket.event, { $inc: { ticketsSold: -ticket.quantity } })
  res.json({ success: true, message: 'Ticket cancelled.' })
}))

module.exports = r
