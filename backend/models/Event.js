const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true, maxlength: 120 },
  slug:        { type: String, unique: true, lowercase: true },
  description: { type: String, required: true, maxlength: 5000 },
  category:    { type: String, required: true, enum: ['Conference','Church','Social','Training','Concert','Workshop','Sports','Education','Other'] },
  coverImage:  { type: String, default: '' },
  date:        { type: Date, required: true },
  endDate:     { type: Date },
  time:        { type: String, required: true },
  location:    { type: String, required: true, maxlength: 200 },
  isOnline:    { type: Boolean, default: false },
  onlineLink:  { type: String, default: '' },
  isFree:      { type: Boolean, default: true },
  price:       { type: Number, default: 0, min: 0 },
  capacity:    { type: Number, required: true, min: 1 },
  ticketsSold: { type: Number, default: 0 },
  totalRevenue:{ type: Number, default: 0 },
  organizer:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  organizerName:{ type: String },
  status:      { type: String, enum: ['draft','published','cancelled','completed'], default: 'published' },
  tags:        [String],
  featured:    { type: Boolean, default: false }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })

schema.index({ status: 1 })
schema.index({ category: 1 })
schema.index({ organizer: 1 })
schema.index({ title: 'text', description: 'text' })

schema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = this.title.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-') + '-' + Date.now()
  }
  next()
})

schema.virtual('spotsLeft').get(function() { return this.capacity - this.ticketsSold })
schema.virtual('soldOut').get(function() { return this.ticketsSold >= this.capacity })
schema.virtual('pctSold').get(function() { return Math.round((this.ticketsSold / this.capacity) * 100) })

module.exports = mongoose.model('Event', schema)
