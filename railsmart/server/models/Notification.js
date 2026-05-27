const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['WARNING', 'URGENT', 'CRITICAL', 'INFO'],
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  trainName: { type: String },
  trainNumber: { type: String },
  selectedClass: { type: String },
  currentWLNumber: { type: Number },
  currentConfirmChance: { type: Number },
  isRead: { type: Boolean, default: false },
  alertId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WLAlert'
  }
}, { timestamps: true })

module.exports = mongoose.model('Notification', notificationSchema)