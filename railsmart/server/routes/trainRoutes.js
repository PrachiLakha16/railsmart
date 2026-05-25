const express = require('express')
const router = express.Router()
const Train = require('../models/Train')
const {
  findAlternateRoutes,
  rankAlternateRoutes,
  parseDurationToMinutes,
  getRouteWLScore
} = require('../utils/routeEngine')
// Search direct trains
router.get('/search', async (req, res) => {
  try {
    const { from, to, class: selectedClass } = req.query

    if (!from || !to) {
      return res.status(400).json({ message: 'Please provide source and destination' })
    }

    const query = {
      source: { $regex: new RegExp(from, 'i') },
      destination: { $regex: new RegExp(to, 'i') }
    }

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

// Alternate route API — with ranking
router.get('/alternate', async (req, res) => {
  try {
    const { from, to, sortBy } = req.query

    if (!from || !to) {
      return res.status(400).json({
        message: 'Please provide source and destination'
      })
    }

    if (from.toLowerCase() === to.toLowerCase()) {
      return res.status(400).json({
        message: 'Source and destination cannot be the same'
      })
    }

    const allTrains = await Train.find({})
    const routes = findAlternateRoutes(allTrains, from, to)

    if (routes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No alternate routes found',
        alternateRoutes: []
      })
    }

    // Rank using smart engine
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
      source: from,
      destination: to,
      sortBy: sortBy || 'recommended',
      count: rankedRoutes.length,
      alternateRoutes: rankedRoutes
    })

  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message
    })
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