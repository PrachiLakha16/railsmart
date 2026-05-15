 const mongoose = require('mongoose')

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  train: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Train',
    required: true
  },
  journeyDate: {
    type: Date,
    required: true
  },
  passengers: [
    {
      name: String,
      age: Number,
      gender: String,
      berthPreference: String,
      seatNumber: String
    }
  ],
  selectedClass: {
    type: String,
    required: true
  },
  totalFare: {
    type: Number,
    required: true
  },
  bookingStatus: {
    type: String,
    enum: ['CONFIRMED', 'WAITLIST', 'CANCELLED'],
    default: 'CONFIRMED'
  },
  waitlistNumber: {
    type: Number,
    default: null
  },
  pnrNumber: {
    type: String,
    unique: true
  },
  paymentStatus: {
    type: String,
    enum: ['PENDING', 'SUCCESS', 'FAILED'],
    default: 'PENDING'
  }
}, { timestamps: true })

module.exports = mongoose.model('Booking', bookingSchema)