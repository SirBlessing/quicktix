const express = require('express')
const crypto  = require('crypto')
const router  = express.Router()
const { asyncHandler, AppError } = require('../middleware/error')
const { protect } = require('../middleware/auth')
const Event   = require('../models/Event')
const Ticket  = require('../models/Ticket')
const { generateQR }           = require('../utils/qrcode')
const { sendTicket }           = require('../utils/email')
const { verifyPayment }        = require('../utils/paystack')

// Helper: activate ticket after confirmed payment
const activateTicket = async (ticket, event) => {
  if (ticket.paymentStatus === 'paid') return // already done (idempotent)
  ticket.paymentStatus = 'paid'
  ticket.paidAt        = new Date()
  if (!ticket.qrCode) {
    // QR points to the FRONTEND ticket page
    const qrData      = `${process.env.CLIENT_URL}/ticket/${ticket.ticketId}`
    ticket.qrCode     = await generateQR(qrData)
    ticket.qrCodeData = qrData
  }
  await ticket.save()
  await Event.findByIdAndUpdate(ticket.event, {
    $inc: { ticketsSold: ticket.quantity, totalRevenue: ticket.totalAmount }
  })
  try { await sendTicket(ticket, event) } catch(e) { console.error('Ticket email:', e.message) }
}

// GET /api/payments/verify/:reference  — called after Paystack redirect
router.get('/verify/:reference', asyncHandler(async (req, res) => {
  const data = await verifyPayment(req.params.reference)
  if (data.status !== 'success')
    return res.status(400).json({ success: false, message: 'Payment was not successful.' })

  const ticket = await Ticket.findOne({ paystackReference: req.params.reference }).populate('event')
  if (!ticket) throw new AppError('Ticket not found for this payment.', 404)

  await activateTicket(ticket, ticket.event)
  res.json({ success: true, message: 'Payment confirmed! 🎉', ticket })
}))

// POST /api/payments/webhook  — Paystack server-to-server confirmation
router.post('/webhook', express.raw({ type: 'application/json' }), asyncHandler(async (req, res) => {
  const sig  = req.headers['x-paystack-signature']
  const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY).update(req.body).digest('hex')
  if (hash !== sig) return res.status(400).json({ message: 'Invalid signature.' })

  // Send 200 immediately — Paystack requires response within 5s
  res.status(200).json({ received: true })

  try {
    const event = JSON.parse(req.body.toString())
    if (event.event === 'charge.success') {
      const ticket = await Ticket.findOne({ paystackReference: event.data.reference }).populate('event')
      if (ticket) await activateTicket(ticket, ticket.event)
    }
    if (event.event === 'charge.failed') {
      await Ticket.findOneAndUpdate(
        { paystackReference: event.data.reference },
        { paymentStatus: 'failed' }
      )
    }
  } catch(e) { console.error('Webhook processing error:', e.message) }
}))

// GET /api/payments/payout-summary
router.get('/payout-summary', protect, asyncHandler(async (req, res) => {
  const events  = await Event.find({ organizer: req.user._id })
  const eventIds = events.map(e => e._id)
  const agg = await Ticket.aggregate([
    { $match: { event: { $in: eventIds }, paymentStatus: 'paid', status: 'active' } },
    { $group: { _id: null, grossRevenue: { $sum: '$totalAmount' }, totalTickets: { $sum: '$quantity' } } }
  ])
  const s           = agg[0] || { grossRevenue: 0, totalTickets: 0 }
  const platformFee = Math.round(s.grossRevenue * 0.05)
  res.json({ success: true, summary: { grossRevenue: s.grossRevenue, platformFee, netRevenue: s.grossRevenue - platformFee, totalTickets: s.totalTickets, currency: 'NGN' } })
}))

module.exports = router