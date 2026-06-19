const mongoose = require('mongoose')
const bcrypt   = require('bcryptjs')

const schema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 8, select: false },
  phone:    { type: String, default: '' },
  avatar:   { type: String, default: '' },
  bio:      { type: String, default: '' },
  bankDetails: {
    bankName:      { type: String, default: '' },
    accountNumber: { type: String, default: '' },
    accountName:   { type: String, default: '' }
  },
  isActive: { type: Boolean, default: true },
  resetPasswordToken:   String,
  resetPasswordExpires: Date
}, { timestamps: true })

schema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

schema.methods.matchPassword = async function(entered) {
  return bcrypt.compare(entered, this.password)
}

schema.methods.toPublic = function() {
  return { _id: this._id, name: this.name, email: this.email, phone: this.phone, avatar: this.avatar, bio: this.bio, createdAt: this.createdAt }
}

module.exports = mongoose.model('User', schema)
