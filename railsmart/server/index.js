const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()

const authRoutes = require('./routes/authRoutes')
const trainRoutes = require('./routes/trainRoutes')
const alternateRoutes = require('./routes/alternateRoutes')
const passengerRoutes = require('./routes/passengerRoutes')
const bookingRoutes = require('./routes/bookingRoutes')
const wlAlertRoutes = require('./routes/wlAlertRoutes')
const notificationRoutes = require('./routes/notificationRoutes')
const { checkAllWLAlerts } = require('./utils/wlChecker')

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully!')
    // Start WL checker after DB connects
    setInterval(checkAllWLAlerts, 5 * 60 * 1000)
    console.log('⏰ WL Checker started — runs every 5 minutes')
  })
  .catch((err) => console.log('MongoDB connection error:', err.message))

// Health check
app.get('/', (req, res) => {
  res.json({
    status: 'running',
    message: 'RailSmart API is running!',
    version: '1.0.0'
  })
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/trains', trainRoutes)
app.use('/api/alternate', alternateRoutes)
app.use('/api/passengers', passengerRoutes)
app.use('/api/booking', bookingRoutes)
app.use('/api/wl-alerts', wlAlertRoutes)
app.use('/api/notifications', notificationRoutes)

// 404 handler — unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  })
})

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message)
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'https://railsmart-c905uh47v-prachilakha16s-projects.vercel.app',
    /\.vercel\.app$/
  ],
  credentials: true
}

app.use(cors(corsOptions))

app.use(cors(corsOptions))
//railsmart-git-main-prachilakha16s-projects.vercel.app
//railsmart-c905uh47v-prachilakha16s-projects.vercel.app