const express = require('express')
const { body } = require('express-validator')
const { asyncHandler, AppError } = require('../middleware/error')
const { protect, generateToken } = require('../middleware/auth')
const User = require('../models/User')
const crypto = require('crypto')
const { sendWelcome, sendPasswordReset } = require('../utils/email')
const r = express.Router()

const check = (req, res) => {
  const { validationResult } = require('express-validator')
  const e = validationResult(req)
  if (!e.isEmpty()) { res.status(400).json({ success: false, message: e.array()[0].msg }); return true }
  return false
}

r.post('/signup', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
], asyncHandler(async (req, res) => {
  if (check(req, res)) return
  const { name, email, password, phone } = req.body
  if (await User.findOne({ email })) return res.status(400).json({ success: false, message: 'Email already registered.' })
  const user = await User.create({ name, email, password, phone })
  try { await sendWelcome(user) } catch(e) { console.error('Welcome email:', e.message) }
  res.status(201).json({ success: true, token: generateToken(user._id), user: user.toPublic() })
}))

r.post('/login', [
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
], asyncHandler(async (req, res) => {
  if (check(req, res)) return
  const { email, password } = req.body
  const user = await User.findOne({ email }).select('+password')
  if (!user || !(await user.matchPassword(password)))
    return res.status(401).json({ success: false, message: 'Invalid email or password.' })
  if (!user.isActive) return res.status(403).json({ success: false, message: 'Account deactivated.' })
  res.json({ success: true, token: generateToken(user._id), user: user.toPublic() })
}))

r.get('/me', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
  res.json({ success: true, user: user.toPublic() })
}))

r.patch('/update-profile', protect, asyncHandler(async (req, res) => {
  const fields = ['name','phone','bio','avatar','bankDetails']
  const updates = {}
  fields.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f] })
  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true })
  res.json({ success: true, message: 'Profile updated.', user: user.toPublic() })
}))

r.patch('/update-password', protect, asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body
  if (!currentPassword || !newPassword) return res.status(400).json({ success: false, message: 'Both passwords required.' })
  const user = await User.findById(req.user._id).select('+password')
  if (!(await user.matchPassword(currentPassword))) return res.status(401).json({ success: false, message: 'Current password incorrect.' })
  user.password = newPassword
  await user.save()
  res.json({ success: true, token: generateToken(user._id), user: user.toPublic() })
}))

r.post('/forgot-password', asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email })
  if (!user) return res.json({ success: true, message: 'If this email exists, a reset link was sent.' })
  const raw = crypto.randomBytes(32).toString('hex')
  user.resetPasswordToken = crypto.createHash('sha256').update(raw).digest('hex')
  user.resetPasswordExpires = Date.now() + 10 * 60 * 1000
  await user.save({ validateBeforeSave: false })
  try {
    await sendPasswordReset(user, `${process.env.CLIENT_URL}/reset-password/${raw}`)
    res.json({ success: true, message: 'Reset link sent to your email.' })
  } catch(e) {
    user.resetPasswordToken = undefined; user.resetPasswordExpires = undefined
    await user.save({ validateBeforeSave: false })
    throw new AppError('Failed to send email.', 500)
  }
}))

r.patch('/reset-password/:token', asyncHandler(async (req, res) => {
  const hash = crypto.createHash('sha256').update(req.params.token).digest('hex')
  const user = await User.findOne({ resetPasswordToken: hash, resetPasswordExpires: { $gt: Date.now() } })
  if (!user) return res.status(400).json({ success: false, message: 'Token invalid or expired.' })
  user.password = req.body.password
  user.resetPasswordToken = undefined; user.resetPasswordExpires = undefined
  await user.save()
  res.json({ success: true, token: generateToken(user._id), user: user.toPublic() })
}))

module.exports = r
