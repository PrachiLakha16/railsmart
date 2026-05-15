 const express = require('express')
const router = express.Router()

router.get('/search', (req, res) => {
  res.json({ message: 'Train search route working' })
})

module.exports = router