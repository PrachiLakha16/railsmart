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

app.use(cors())
app.use(express.json())

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully!')
    setInterval(checkAllWLAlerts, 5 * 60 * 1000)
    console.log('⏰ WL Checker started — runs every 5 minutes')
  })
  .catch((err) => console.log('MongoDB connection error:', err.message))

app.use('/api/auth', authRoutes)
app.use('/api/trains', trainRoutes)
app.use('/api/alternate', alternateRoutes)
app.use('/api/passengers', passengerRoutes)
app.use('/api/booking', bookingRoutes)
app.use('/api/wl-alerts', wlAlertRoutes)
app.use('/api/notifications', notificationRoutes)

app.get('/', (req, res) => {
  res.send('RailSmart backend running!')
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})