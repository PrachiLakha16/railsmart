const mongoose = require('mongoose')

const passengerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true
  },
  berthPreference: {
    type: String,
    enum: ['Lower', 'Middle', 'Upper', 'Side Lower', 'Side Upper', 'No Preference'],
    default: 'No Preference'
  },
  idType: {
    type: String,
    enum: ['Aadhaar', 'PAN', 'Passport', 'Driving License'],
    default: 'Aadhaar'
  },
  idNumber: { type: String, default: '' }
})

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  savedPassengers: [passengerSchema],
  // Payment preference for Tatkal autofill
  paymentPreference: {
    type: String,
    enum: ['UPI', 'Card', 'Net Banking', 'Wallet'],
    default: 'UPI'
  }
}, { timestamps: true })

module.exports = mongoose.model('User', userSchema)