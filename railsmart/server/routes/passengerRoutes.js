const express = require('express')
const router = express.Router()
const User = require('../models/User')
const protect = require('../middleware/authMiddleware')

// All routes protected — user must be logged in

// GET all saved passengers
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    res.status(200).json({
      success: true,
      passengers: user.savedPassengers
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// POST add new passenger
router.post('/', protect, async (req, res) => {
  try {
    const { name, age, gender, berthPreference, idType, idNumber } = req.body

    // Validation
    if (!name || !age || !gender) {
      return res.status(400).json({
        message: 'Name, age and gender are required'
      })
    }

    if (age < 1 || age > 120) {
      return res.status(400).json({ message: 'Please enter valid age' })
    }

    const user = await User.findById(req.user.userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Max 10 passengers per user
    if (user.savedPassengers.length >= 10) {
      return res.status(400).json({
        message: 'Maximum 10 passengers allowed'
      })
    }

    user.savedPassengers.push({
      name,
      age,
      gender,
      berthPreference: berthPreference || 'No Preference',
      idType: idType || 'Aadhaar',
      idNumber: idNumber || ''
    })

    await user.save()

    res.status(201).json({
      success: true,
      message: 'Passenger saved successfully',
      passengers: user.savedPassengers
    })

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// PUT edit passenger
router.put('/:passengerId', protect, async (req, res) => {
  try {
    const { name, age, gender, berthPreference, idType, idNumber } = req.body

    if (!name || !age || !gender) {
      return res.status(400).json({
        message: 'Name, age and gender are required'
      })
    }

    const user = await User.findById(req.user.userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Find passenger by ID
    const passenger = user.savedPassengers.id(req.params.passengerId)
    if (!passenger) {
      return res.status(404).json({ message: 'Passenger not found' })
    }

    // Update fields
    passenger.name = name
    passenger.age = age
    passenger.gender = gender
    passenger.berthPreference = berthPreference || 'No Preference'
    passenger.idType = idType || 'Aadhaar'
    passenger.idNumber = idNumber || ''

    await user.save()

    res.status(200).json({
      success: true,
      message: 'Passenger updated successfully',
      passengers: user.savedPassengers
    })

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// DELETE passenger
router.delete('/:passengerId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const passenger = user.savedPassengers.id(req.params.passengerId)
    if (!passenger) {
      return res.status(404).json({ message: 'Passenger not found' })
    }

    // Remove passenger
    user.savedPassengers.pull(req.params.passengerId)
    await user.save()

    res.status(200).json({
      success: true,
      message: 'Passenger deleted successfully',
      passengers: user.savedPassengers
    })

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

module.exports = router