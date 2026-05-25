const express = require('express')
const router = express.Router()
const Train = require('../models/Train')
const {
  findAlternateRoutes,
  rankAlternateRoutes,
  parseDurationToMinutes,
  getRouteWLScore
} = require('../utils/routeEngine')

// GET /api/alternate?source=X&destination=Y&sortBy=price
router.get('/', async (req, res) => {
  try {
    const { source, destination, sortBy, selectedClass } = req.query

    // Validation
    if (!source || !destination) {
      return res.status(400).json({
        success: false,
        message: 'source and destination query params are required'
      })
    }

    if (source.toLowerCase() === destination.toLowerCase()) {
      return res.status(400).json({
        success: false,
        message: 'Source and destination cannot be the same'
      })
    }

    // Fetch all trains
    const allTrains = await Train.find({})

    if (!allTrains || allTrains.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No trains found in database'
      })
    }

    // Find alternate routes
    const routes = findAlternateRoutes(allTrains, source, destination, selectedClass)

    if (routes.length === 0) {
      return res.status(404).json({
        success: false,
        source,
        destination,
        totalAlternates: 0,
        alternateRoutes: []
      })
    }

    // Rank routes using smart ranking engine
    let rankedRoutes = rankAlternateRoutes(routes)

    // Apply user-requested sort on top of ranking
    if (sortBy === 'price') {
      rankedRoutes = rankedRoutes.sort((a, b) =>
        a.cheapestPrice - b.cheapestPrice
      )
    } else if (sortBy === 'duration') {
      rankedRoutes = rankedRoutes.sort((a, b) =>
        parseDurationToMinutes(a.totalDuration) -
        parseDurationToMinutes(b.totalDuration)
      )
    } else if (sortBy === 'wl') {
      rankedRoutes = rankedRoutes.sort((a, b) =>
        getRouteWLScore(b) - getRouteWLScore(a)
      )
    } else if (sortBy === 'layover') {
      rankedRoutes = rankedRoutes.sort((a, b) =>
        (a.layoverMinutes || 0) - (b.layoverMinutes || 0)
      )
    }
    // default: already ranked by combined score

    res.status(200).json({
      success: true,
      source,
      destination,
      sortBy: sortBy || 'recommended',
      totalAlternates: rankedRoutes.length,
      alternateRoutes: rankedRoutes
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    })
  }
})

module.exports = router