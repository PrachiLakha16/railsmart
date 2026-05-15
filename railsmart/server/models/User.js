 const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  // Saved passengers for Tatkal autofill
  savedPassengers: [
    {
      name: String,
      age: Number,
      gender: String,
      berthPreference: String
    }
  ]
}, { timestamps: true })

module.exports = mongoose.model('User', userSchema)