const express = require('express')
const router = express.Router()
const User = require('../models/User')
const protect = require('../middleware/authMiddleware')

// GET saved passengers for autofill
router.get('/autofill', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    res.status(200).json({
      success: true,
      savedPassengers: user.savedPassengers,
      paymentPreference: user.paymentPreference
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// PUT update payment preference
router.put('/payment-preference', protect, async (req, res) => {
  try {
    const { paymentPreference } = req.body
    const validOptions = ['UPI', 'Card', 'Net Banking', 'Wallet']

    if (!validOptions.includes(paymentPreference)) {
      return res.status(400).json({ message: 'Invalid payment preference' })
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { paymentPreference },
      { new: true }
    )

    res.status(200).json({
      success: true,
      message: 'Payment preference updated',
      paymentPreference: user.paymentPreference
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

module.exports = router