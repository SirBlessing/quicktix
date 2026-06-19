const express = require('express')
const crypto  = require('crypto')
const { asyncHandler, AppError } = require('../middleware/error')
const { protect } = require('../middleware/auth')
const Event   = require('../models/Event')
const Ticket  = require('../models/Ticket')
const { verifyPayment } = require('../utils/paystack')
const { generateQR }    = require('../utils/qrcode')
const { sendTicket }    = require('../utils/email')
const r = express.Router()

// POST /api/payments/webhook  (raw body — Paystack HMAC check)
r.post('/webhook', express.raw({ type: 'application/json' }), asyncHandler(async (req, res) => {
  const sig  = req.headers['x-paystack-signature']
  const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY).update(req.body).digest('hex')
  if (hash !== sig) return res.status(400).json({ message: 'Invalid signature' })

  res.status(200).json({ received: true }) // ACK immediately

  try {
    const evt = JSON.parse(req.body.toString())
    if (evt.event === 'charge.success') {
      const ticket = await Ticket.findOne({ paystackReference: evt.data.reference })
      if (!ticket || ticket.paymentStatus === 'paid') return

      const event   = await Event.findById(ticket.event)
      ticket.paymentStatus = 'paid'
      ticket.paidAt = new Date()
      if (!ticket.qrCode) {
        const qrData = `${process.env.API_URL}/api/checkin/scan?ticket=${ticket.ticketId}`
        ticket.qrCode = await generateQR(qrData)
        ticket.qrCodeData = qrData
      }
      await ticket.save()
      await Event.findByIdAndUpdate(ticket.event, { $inc: { ticketsSold: ticket.quantity, totalRevenue: ticket.totalAmount } })
      try { await sendTicket(ticket, event) } catch(e) { console.error('Email:', e.message) }
    }
    if (evt.event === 'charge.failed') {
      await Ticket.findOneAndUpdate({ paystackReference: evt.data.reference }, { paymentStatus: 'failed' })
    }
  } catch(e) { console.error('Webhook error:', e.message) }
}))

// GET /api/payments/verify/:reference
r.get('/verify/:reference', asyncHandler(async (req, res) => {
  const data   = await verifyPayment(req.params.reference)
  if (data.status !== 'success') return res.status(400).json({ success: false, message: 'Payment not successful.' })

  const ticket = await Ticket.findOne({ paystackReference: req.params.reference }).populate('event', 'title date time location')
  if (!ticket) throw new AppError('Ticket not found for this reference', 404)
  if (ticket.paymentStatus === 'paid') return res.json({ success: true, message: 'Already verified.', ticket })

  const event = ticket.event
  ticket.paymentStatus = 'paid'
  ticket.paidAt = new Date()
  if (!ticket.qrCode) {
    const qrData = `${process.env.API_URL}/api/checkin/scan?ticket=${ticket.ticketId}`
    ticket.qrCode = await generateQR(qrData)
    ticket.qrCodeData = qrData
  }
  await ticket.save()
  await Event.findByIdAndUpdate(event._id, { $inc: { ticketsSold: ticket.quantity, totalRevenue: ticket.totalAmount } })
  try { await sendTicket(ticket, event) } catch(e) { console.error('Email:', e.message) }

  res.json({ success: true, message: 'Payment verified! Your ticket is confirmed. 🎉', ticket })
}))

// GET /api/payments/payout-summary
r.get('/payout-summary', protect, asyncHandler(async (req, res) => {
  const events = await Event.find({ organizer: req.user._id })
  const ids    = events.map(e => e._id)
  const agg    = await Ticket.aggregate([
    { $match: { event: { $in: ids }, paymentStatus: 'paid', status: 'active' } },
    { $group: { _id: null, gross: { $sum: '$totalAmount' }, tickets: { $sum: '$quantity' }, orders: { $sum: 1 } } }
  ])
  const s = agg[0] || { gross: 0, tickets: 0, orders: 0 }
  res.json({ success: true, summary: { grossRevenue: s.gross, platformFee: Math.round(s.gross * 0.05), netRevenue: Math.round(s.gross * 0.95), totalTickets: s.tickets, totalOrders: s.orders, currency: 'NGN' } })
}))

module.exports = r
