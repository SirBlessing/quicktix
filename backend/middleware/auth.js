const jwt  = require('jsonwebtoken')
const User = require('../models/User')
const { asyncHandler } = require('./error')

const protect = asyncHandler(async (req, res, next) => {
  const auth = req.headers.authorization
  if (!auth || !auth.startsWith('Bearer'))
    return res.status(401).json({ success: false, message: 'Not authorised. Please log in.' })
  const token = auth.split(' ')[1]
  const decoded = jwt.verify(token, process.env.JWT_SECRET)
  req.user = await User.findById(decoded.id).select('-password')
  if (!req.user) return res.status(401).json({ success: false, message: 'User no longer exists.' })
  next()
})

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' })

module.exports = { protect, generateToken }
