const mongoose = require('mongoose')

const wlAlertSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  trainId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Train',
    required: true
  },
  trainNumber: { type: String, required: true },
  trainName: { type: String, required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  journeyDate: { type: Date, required: true },
  selectedClass: { type: String, required: true },
  initialWLNumber: { type: Number, required: true },
  currentWLNumber: { type: Number, required: true },
  initialConfirmChance: { type: Number, required: true },
  currentConfirmChance: { type: Number, required: true },
  alertStatus: {
    type: String,
    enum: ['ACTIVE', 'TRIGGERED', 'EXPIRED', 'CANCELLED'],
    default: 'ACTIVE'
  },
  triggerWhenChanceAbove: {
    type: Number,
    default: 70
  },
  lastChecked: {
    type: Date,
    default: Date.now
  },
  history: [
    {
      wlNumber: Number,
      confirmChance: Number,
      checkedAt: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true })

module.exports = mongoose.model('WLAlert', wlAlertSchema)