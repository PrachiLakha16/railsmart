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
      className: String,
      price: Number,
      totalSeats: Number,
      availableSeats: Number,
      waitlistCount: Number,
      confirmChance: Number
    }
  ],
  stops: [
  {
    station:       { type: String, required: true },
    arrivalTime:   { type: String, default: null },   // null for origin
    departureTime: { type: String, default: null },   // null for destination
    dayOffset:     { type: Number, default: 0 }       // 0=same day, 1=next day, 2=day after
  }
],
  runningDays: [String],
  stopsAt: [String],
  isAlternate: {
    type: Boolean,
    default: false
  },
  viaStation: {
    type: String,
    default: null
  }
}, { timestamps: true })

module.exports = mongoose.model('Train', trainSchema)