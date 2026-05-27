const express = require('express')
const router = express.Router()
const Notification = require('../models/Notification')
const protect = require('../middleware/authMiddleware')

// GET all notifications for user
router.get('/', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({
      user: req.user.userId
    }).sort({ createdAt: -1 }).limit(50)

    const unreadCount = await Notification.countDocuments({
      user: req.user.userId,
      isRead: false
    })

    res.status(200).json({
      success: true,
      unreadCount,
      notifications
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// PUT mark single notification as read
router.put('/:notificationId/read', protect, async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.notificationId, user: req.user.userId },
      { isRead: true }
    )
    res.status(200).json({ success: true, message: 'Marked as read' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// PUT mark all notifications as read
router.put('/mark-all-read', protect, async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.userId, isRead: false },
      { isRead: true }
    )
    res.status(200).json({ success: true, message: 'All marked as read' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// DELETE clear all notifications
router.delete('/clear-all', protect, async (req, res) => {
  try {
    await Notification.deleteMany({ user: req.user.userId })
    res.status(200).json({ success: true, message: 'All notifications cleared' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

module.exports = router