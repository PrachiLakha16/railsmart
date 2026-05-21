const express = require('express')
const router = express.Router()
const Train = require('../models/Train')

// Search trains by source, destination and class
router.get('/search', async (req, res) => {
  try {
    const { from, to, class: selectedClass } = req.query

    if (!from || !to) {
      return res.status(400).json({ message: 'Please provide source and destination' })
    }

    // Search trains — case insensitive
    const query = {
      source: { $regex: new RegExp(from, 'i') },
      destination: { $regex: new RegExp(to, 'i') }
    }

    // Filter by class if selected
    if (selectedClass && selectedClass !== 'ALL') {
      query['classes.className'] = selectedClass
    }

    const trains = await Train.find(query)

    if (trains.length === 0) {
      return res.status(404).json({ message: 'No trains found for this route' })
    }

    res.status(200).json({
      message: 'Trains found',
      count: trains.length,
      trains
    })

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// Get single train by ID
router.get('/:id', async (req, res) => {
  try {
    const train = await Train.findById(req.params.id)
    if (!train) {
      return res.status(404).json({ message: 'Train not found' })
    }
    res.status(200).json(train)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

module.exports = router