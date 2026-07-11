require('dotenv').config()
const express   = require('express')
const mongoose  = require('mongoose')
const cors      = require('cors')
const helmet    = require('helmet')
const morgan    = require('morgan')
const rateLimit = require('express-rate-limit')

const app = express()

// ── CORS — allow your Netlify frontend ───────────────────
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://quicktiks.netlify.app'
  ],
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}))

// Handle preflight for ALL routes
app.options('*', cors())

app.use(helmet())
app.use(morgan('dev'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }))

// ── Routes ────────────────────────────────────────────────
app.use('/api/auth',     require('./routes/auth'))
app.use('/api/events',   require('./routes/events'))
app.use('/api/tickets',  require('./routes/tickets'))
app.use('/api/checkin',  require('./routes/checkin'))
app.use('/api/payments', require('./routes/payments'))

app.get('/api/health', (_, res) => res.json({
  success: true,
  message: 'QuickTix API running 🚀'
}))

app.use((_, res) => res.status(404).json({ success: false, message: 'Route not found' }))
app.use(require('./middleware/error'))

// ── Start ─────────────────────────────────────────────────
const PORT = process.env.PORT || 5000

async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 8000
    })
    console.log('✅  MongoDB connected')
    app.listen(PORT, () =>
      console.log(`🚀  Server running on port ${PORT}`)
    )
  } catch (err) {
    console.error('❌  MongoDB connection failed:', err.message)
    process.exit(1)
  }
}

start()