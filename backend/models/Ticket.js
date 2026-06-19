const mongoose = require('mongoose')
const { v4: uuidv4 } = require('uuid')

const schema = new mongoose.Schema({
  ticketId:      { type: String, unique: true, default: () => 'QT-' + Date.now() + '-' + uuidv4().slice(0,6).toUpperCase() },
  event:         { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  attendee:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  attendeeName:  { type: String, required: true, trim: true },
  attendeeEmail: { type: String, required: true, lowercase: true, trim: true },
  attendeePhone: { type: String, default: '' },
  quantity:      { type: Number, default: 1, min: 1, max: 10 },
  unitPrice:     { type: Number, default: 0 },
  totalAmount:   { type: Number, default: 0 },
  paymentStatus: { type: String, enum: ['free','pending','paid','failed','refunded'], default: 'free' },
  paystackReference: { type: String, default: '' },
  paidAt:        { type: Date },
  qrCode:        { type: String, default: '' },
  qrCodeData:    { type: String, default: '' },
  isCheckedIn:   { type: Boolean, default: false },
  checkedInAt:   { type: Date },
  checkedInBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status:        { type: String, enum: ['active','cancelled','refunded'], default: 'active' }
}, { timestamps: true })

schema.index({ event: 1 })
schema.index({ attendeeEmail: 1 })

schema.pre('save', function(next) {
  if (this.isModified('quantity') || this.isModified('unitPrice')) {
    this.totalAmount = this.unitPrice * this.quantity
  }
  next()
})

schema.statics.validateQR = async function(qrData) {
  const ticket = await this.findOne({ qrCodeData: qrData, status: 'active' }).populate('event','title date location status')
  if (!ticket) return { valid: false, reason: 'Ticket not found or cancelled' }
  if (ticket.paymentStatus === 'pending') return { valid: false, reason: 'Payment not confirmed' }
  if (ticket.isCheckedIn) return { valid: false, reason: 'Ticket already used', checkedAt: ticket.checkedInAt }
  if (ticket.event.status === 'cancelled') return { valid: false, reason: 'Event has been cancelled' }
  return { valid: true, ticket }
}

module.exports = mongoose.model('Ticket', schema)
