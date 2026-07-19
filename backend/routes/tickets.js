const express = require('express')
const { asyncHandler, AppError } = require('../middleware/error')
const { protect } = require('../middleware/auth')
const Event  = require('../models/Event')
const Ticket = require('../models/Ticket')
const { generateQR } = require('../utils/qrcode')
const { sendTicket }  = require('../utils/email')
const { initPayment } = require('../utils/paystack')
const r = express.Router()

// Helper: validate event before registering
const checkEvent = async (eventId, mustBeFree) => {
  const event = await Event.findById(eventId)
  if (!event)                     throw new AppError('Event not found.', 404)
  if (event.status !== 'published') throw new AppError('This event is not available.', 400)
  if (event.ticketsSold >= event.capacity) throw new AppError('This event is sold out.', 400)
  if (mustBeFree === true  && !event.isFree) throw new AppError('This is a paid event.', 400)
  if (mustBeFree === false &&  event.isFree) throw new AppError('This is a free event.', 400)
  return event
}

// POST /api/tickets/register-free
r.post('/register-free', asyncHandler(async (req, res) => {
  const { eventId, attendeeName, attendeeEmail, attendeePhone, quantity = 1 } = req.body
  if (!eventId || !attendeeName || !attendeeEmail)
    return res.status(400).json({ success: false, message: 'Name, email and eventId are required.' })

  const event = await checkEvent(eventId, true)
  const spotsLeft = event.capacity - event.ticketsSold
  if (quantity > spotsLeft)
    return res.status(400).json({ success: false, message: `Only ${spotsLeft} spot(s) left.` })

  const dup = await Ticket.findOne({ event: eventId, attendeeEmail: attendeeEmail.toLowerCase(), status: 'active' })
  if (dup) return res.status(400).json({ success: false, message: 'This email is already registered for this event.' })

  const ticket = await Ticket.create({
    event: eventId, attendee: req.user?._id || null,
    attendeeName, attendeeEmail: attendeeEmail.toLowerCase(),
    attendeePhone: attendeePhone || '', quantity,
    unitPrice: 0, totalAmount: 0, paymentStatus: 'free'
  })

  // QR points to the FRONTEND ticket page — so phone camera opens the ticket
  const qrData = `${process.env.CLIENT_URL}/ticket/${ticket.ticketId}`
  ticket.qrCode    = await generateQR(qrData)
  ticket.qrCodeData = qrData
  await ticket.save()

  await Event.findByIdAndUpdate(eventId, { $inc: { ticketsSold: quantity } })
  try { await sendTicket(ticket, event) } catch(e) { console.error('Ticket email failed:', e.message) }

  await ticket.populate('event', 'title date time location')
  res.status(201).json({ success: true, message: 'Registration successful! Check your email. 🎉', ticket })
}))

// POST /api/tickets/initiate-payment
r.post('/initiate-payment', asyncHandler(async (req, res) => {
  const { eventId, attendeeName, attendeeEmail, attendeePhone, quantity = 1 } = req.body
  if (!eventId || !attendeeName || !attendeeEmail)
    return res.status(400).json({ success: false, message: 'Name, email and eventId are required.' })

  const event = await checkEvent(eventId, false)
  const spotsLeft = event.capacity - event.ticketsSold
  if (quantity > spotsLeft)
    return res.status(400).json({ success: false, message: `Only ${spotsLeft} spot(s) left.` })

  const dup = await Ticket.findOne({ event: eventId, attendeeEmail: attendeeEmail.toLowerCase(), status: 'active', paymentStatus: { $in: ['pending','paid'] } })
  if (dup) return res.status(400).json({ success: false, message: 'This email is already registered for this event.' })

  const unitPrice    = event.price
  const totalAmount  = unitPrice * quantity
  const fee          = Math.round(totalAmount * 0.05)
  const chargeAmount = totalAmount + fee

  const ticket = await Ticket.create({
    event: eventId, attendee: req.user?._id || null,
    attendeeName, attendeeEmail: attendeeEmail.toLowerCase(),
    attendeePhone: attendeePhone || '', quantity,
    unitPrice, totalAmount, paymentStatus: 'pending'
  })

  const payment = await initPayment({
    email: attendeeEmail,
    amount: chargeAmount * 100,
    reference: ticket._id.toString(),
    metadata: { ticketId: ticket._id.toString(), ticketRef: ticket.ticketId, eventId, eventTitle: event.title },
    callback_url: `${process.env.CLIENT_URL}/checkout/verify?reference=${ticket._id}`
  })

  ticket.paystackReference = payment.reference
  await ticket.save()
  res.json({ success: true, data: { authorizationUrl: payment.authorization_url, reference: payment.reference, amount: chargeAmount } })
}))

// GET /api/tickets/verify/:ticketId  — public ticket lookup
r.get('/verify/:ticketId', asyncHandler(async (req, res) => {
  const ticket = await Ticket.findOne({ ticketId: req.params.ticketId })
    .populate('event', 'title date time location coverImage organizer')
  if (!ticket) throw new AppError('Ticket not found.', 404)
  res.json({ success: true, ticket })
}))

// GET /api/tickets/my-tickets
r.get('/my-tickets', protect, asyncHandler(async (req, res) => {
  const tickets = await Ticket.find({ attendeeEmail: req.user.email, status: 'active' })
    .populate('event', 'title date time location category coverImage status')
    .sort('-createdAt')
  res.json({ success: true, tickets })
}))

// PATCH /api/tickets/:ticketId/cancel
r.patch('/:ticketId/cancel', protect, asyncHandler(async (req, res) => {
  const ticket = await Ticket.findOne({ ticketId: req.params.ticketId, attendeeEmail: req.user.email }).populate('event')
  if (!ticket) throw new AppError('Ticket not found.', 404)
  if (ticket.status === 'cancelled') return res.status(400).json({ success: false, message: 'Already cancelled.' })
  if (ticket.isCheckedIn) return res.status(400).json({ success: false, message: 'Cannot cancel a used ticket.' })
  ticket.status = 'cancelled'
  await ticket.save()
  await Event.findByIdAndUpdate(ticket.event._id, { $inc: { ticketsSold: -ticket.quantity } })
  res.json({ success: true, message: 'Ticket cancelled.' })
}))

module.exports = r