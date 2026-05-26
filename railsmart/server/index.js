const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()

const authRoutes = require('./routes/authRoutes')
const trainRoutes = require('./routes/trainRoutes')
const alternateRoutes = require('./routes/alternateRoutes')

const app = express()

app.use(cors())
app.use(express.json())

// Connect to MongoDB first
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully!'))
  .catch((err) => console.log('MongoDB connection error:', err.message))

// Register all routes
app.use('/api/auth', authRoutes)
app.use('/api/trains', trainRoutes)
app.use('/api/alternate', alternateRoutes)

app.get('/', (req, res) => {
  res.send('RailSmart backend running!')
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})