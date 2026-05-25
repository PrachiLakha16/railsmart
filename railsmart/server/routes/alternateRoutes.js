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

    // Edge Case 1 — Missing params
    if (!source || !destination) {
      return res.status(400).json({
        success: false,
        message: 'source and destination query params are required',
        alternateRoutes: []
      })
    }

    // Edge Case 2 — Same city
    if (source.toLowerCase() === destination.toLowerCase()) {
      return res.status(400).json({
        success: false,
        message: 'Source and destination cannot be the same city',
        alternateRoutes: []
      })
    }

    // Edge Case 3 — Very short station names (likely typos)
    if (source.trim().length < 2 || destination.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Please enter valid station names',
        alternateRoutes: []
      })
    }

    // Fetch all trains
    const allTrains = await Train.find({})

    // Edge Case 4 — Empty database
    if (!allTrains || allTrains.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No trains found in database',
        alternateRoutes: []
      })
    }

    // Find alternate routes
    const routes = findAlternateRoutes(
      allTrains,
      source.trim(),
      destination.trim(),
      selectedClass
    )

    // Edge Case 5 — No routes found
    if (routes.length === 0) {
      return res.status(404).json({
        success: false,
        source,
        destination,
        message: `No alternate routes found from ${source} to ${destination} with good confirmation chances`,
        hint: 'Try searching without class filter or check spelling of station names',
        totalAlternates: 0,
        alternateRoutes: []
      })
    }

    // Rank routes
    let rankedRoutes = rankAlternateRoutes(routes)

    // Apply user sort
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
      message: 'Server error while finding alternate routes',
      error: error.message,
      alternateRoutes: []
    })
  }
})

module.exports = router