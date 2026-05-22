const express = require('express')
const router = express.Router()
const Train = require('../models/Train')
const { findAlternateRoutes } = require('../utils/routeEngine')

// GET /api/alternate?source=Delhi&destination=Mumbai
router.get('/', async (req, res) => {
  try {
    const { source, destination } = req.query

    if (!source || !destination) {
      return res.status(400).json({
        message: 'source and destination query params are required'
      })
    }

    if (source.toLowerCase() === destination.toLowerCase()) {
      return res.status(400).json({
        message: 'Source and destination cannot be the same'
      })
    }

    // Fetch all trains from DB
    const allTrains = await Train.find({})

    if (!allTrains || allTrains.length === 0) {
      return res.status(404).json({ message: 'No trains found in database' })
    }

    // Run the alternate route engine
    const alternateRoutes = findAlternateRoutes(allTrains, source, destination)

    if (alternateRoutes.length === 0) {
      return res.status(404).json({
        message: `No alternate routes found from ${source} to ${destination}`,
        alternateRoutes: []
      })
    }

    // Sort by cheapest combined price
    alternateRoutes.sort((a, b) => a.cheapestPrice - b.cheapestPrice)

    res.status(200).json({
      source,
      destination,
      totalAlternates: alternateRoutes.length,
      alternateRoutes
    })

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

module.exports = router