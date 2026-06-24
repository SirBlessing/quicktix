require('dotenv').config()
const express   = require('express')
const mongoose  = require('mongoose')
const cors      = require('cors')
const helmet    = require('helmet')
const morgan    = require('morgan')
const rateLimit = require('express-rate-limit')

const app = express()

app.use(helmet())
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }))
app.use(morgan('dev'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }))

app.use('/api/auth',     require('./routes/auth'))
app.use('/api/events',   require('./routes/events'))
app.use('/api/tickets',  require('./routes/tickets'))
app.use('/api/checkin',  require('./routes/checkin'))
app.use('/api/payments', require('./routes/payments'))

app.get('/api/health', (_, res) => res.json({ success: true, message: 'QuickTix API running 🚀' }))

app.use((_, res) => res.status(404).json({ success: false, message: 'Route not found' }))
app.use(require('./middleware/error'))

const PORT = process.env.PORT || 5000

// ── Connect to MongoDB FIRST, then start the server ──────────
// This means: if the DB is unreachable, you get a clear error
// immediately in the console instead of requests silently hanging.
async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 20000
    })
    console.log('✅  MongoDB connected')

    app.listen(PORT, () => console.log(`🚀  Server running on http://localhost:${PORT}`))

  } catch (err) {
    console.error('')
    console.error('❌  Could not connect to MongoDB:', err.message)
    console.error('    The server will NOT start until this is fixed.')
    console.error('    1. Check MongoDB is running (locally) or your cluster is reachable (Atlas).')
    console.error('    2. Check MONGO_URI in your .env file is correct.')
    console.error('       Local example:  mongodb://localhost:27017/quicktix')
    console.error('       Atlas example:  mongodb+srv://<user>:<pass>@cluster.mongodb.net/quicktix')
    console.error('')
    process.exit(1)
  }
}

start()