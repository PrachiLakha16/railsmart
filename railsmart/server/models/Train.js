 const mongoose = require('mongoose')

const trainSchema = new mongoose.Schema({
  trainNumber: {
    type: String,
    required: true
  },
  trainName: {
    type: String,
    required: true
  },
  source: {
    type: String,
    required: true
  },
  destination: {
    type: String,
    required: true
  },
  departureTime: {
    type: String,
    required: true
  },
  arrivalTime: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  classes: [
    {
      className: String,    // SL, 3A, 2A, 1A
      price: Number,
      totalSeats: Number,
      availableSeats: Number,
      waitlistCount: Number
    }
  ],
  runningDays: [String],    // ['Mon', 'Wed', 'Fri']
  stopsAt: [String]         // intermediate stations
}, { timestamps: true })

module.exports = mongoose.model('Train', trainSchema)