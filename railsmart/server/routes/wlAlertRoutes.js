const express = require('express')
const router = express.Router()
const WLAlert = require('../models/WLAlert')
const Train = require('../models/Train')
const protect = require('../middleware/authMiddleware')

// POST — Set a new WL alert
router.post('/', protect, async (req, res) => {
  try {
    const {
      trainId,
      trainNumber,
      trainName,
      from,
      to,
      journeyDate,
      selectedClass,
      currentWLNumber,
      currentConfirmChance,
      triggerWhenChanceAbove
    } = req.body

    // Validation
    if (!trainId || !selectedClass || !journeyDate) {
      return res.status(400).json({
        message: 'trainId, selectedClass and journeyDate are required'
      })
    }

    if (currentWLNumber <= 0) {
      return res.status(400).json({
        message: 'WL alert only needed for waitlisted tickets'
      })
    }

    // Check if alert already exists for same train+class+date
    const existing = await WLAlert.findOne({
      user: req.user.userId,
      trainId,
      selectedClass,
      journeyDate: new Date(journeyDate),
      alertStatus: 'ACTIVE'
    })

    if (existing) {
      return res.status(400).json({
        message: 'Alert already set for this train and class'
      })
    }

    const alert = new WLAlert({
      user: req.user.userId,
      trainId,
      trainNumber,
      trainName,
      from,
      to,
      journeyDate: new Date(journeyDate),
      selectedClass,
      initialWLNumber: currentWLNumber,
      currentWLNumber,
      initialConfirmChance: currentConfirmChance,
      currentConfirmChance,
      triggerWhenChanceAbove: triggerWhenChanceAbove || 70,
      history: [{
        wlNumber: currentWLNumber,
        confirmChance: currentConfirmChance,
        checkedAt: new Date()
      }]
    })

    await alert.save()

    res.status(201).json({
      success: true,
      message: `WL Alert set! You will be notified when confirmation chance exceeds ${triggerWhenChanceAbove || 70}%`,
      alert
    })

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// GET — Get all alerts for logged in user
router.get('/', protect, async (req, res) => {
  try {
    const alerts = await WLAlert.find({
      user: req.user.userId
    }).sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      total: alerts.length,
      alerts
    })

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// GET — Get only active alerts
router.get('/active', protect, async (req, res) => {
  try {
    const alerts = await WLAlert.find({
      user: req.user.userId,
      alertStatus: 'ACTIVE'
    }).sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      total: alerts.length,
      alerts
    })

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// DELETE — Cancel an alert
router.delete('/:alertId', protect, async (req, res) => {
  try {
    const alert = await WLAlert.findOne({
      _id: req.params.alertId,
      user: req.user.userId
    })

    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' })
    }

    alert.alertStatus = 'CANCELLED'
    await alert.save()

    res.status(200).json({
      success: true,
      message: 'Alert cancelled successfully'
    })

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})
router.get('/test-checker', async (req, res) => {
  const { checkAllWLAlerts } = require('../utils/wlChecker')
  await checkAllWLAlerts()
  res.json({ message: 'Checker ran successfully' })
})
// GET — Get WL history for a specific alert
router.get('/:alertId/history', protect, async (req, res) => {
  try {
    const alert = await WLAlert.findOne({
      _id: req.params.alertId,
      user: req.user.userId
    })

    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' })
    }

    res.status(200).json({
      success: true,
      trainName: alert.trainName,
      selectedClass: alert.selectedClass,
      initialWL: alert.initialWLNumber,
      currentWL: alert.currentWLNumber,
      initialChance: alert.initialConfirmChance,
      currentChance: alert.currentConfirmChance,
      history: alert.history
    })

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

module.exports = router