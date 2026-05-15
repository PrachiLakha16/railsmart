const express = require('express')
const router = express.Router()
const { signup, login } = require('../controllers/authController')
const protect = require('../middleware/authMiddleware')

// Public routes
router.post('/signup', signup)
router.post('/login', login)

// Protected test route
router.get('/profile', protect, (req, res) => {
  res.json({ message: 'Protected route works!', user: req.user })
})

module.exports = router