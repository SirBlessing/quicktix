const errorHandler = (err, req, res, next) => {
  let status  = err.statusCode || 500
  let message = err.message    || 'Server error'
  if (err.name === 'CastError')       { status = 404; message = 'Resource not found' }
  if (err.code === 11000)             { status = 400; message = `${Object.keys(err.keyValue)[0]} already exists` }
  if (err.name === 'ValidationError') { status = 400; message = Object.values(err.errors).map(e => e.message).join('. ') }
  if (err.name === 'JsonWebTokenError')  { status = 401; message = 'Invalid token' }
  if (err.name === 'TokenExpiredError')  { status = 401; message = 'Token expired, please login again' }
  if (process.env.NODE_ENV === 'development') console.error(err.stack)
  res.status(status).json({ success: false, message })
}
const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)
class AppError extends Error {
  constructor(message, statusCode) { super(message); this.statusCode = statusCode }
}
module.exports = { errorHandler, asyncHandler, AppError }
// default export is errorHandler for app.use()
module.exports = errorHandler
module.exports.asyncHandler = asyncHandler
module.exports.AppError = AppError
