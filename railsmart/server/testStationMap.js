const express = require('express')
const router = express.Router()

const Train = require('../models/Train')

const { findAlternateRoutes } = require('../utils/routeEngine')

const {
  buildAdjacencyMap,
  normalizeStation
} = require('../utils/stationMap')

router.get('/search', async (req, res) => {
  try {
    const { from, to, class: selectedClass } = req.query

    if (!from || !to) {
      return res.status(400).json({
        message: 'from and to are required'
      })
    }

    // Fetch all trains
    const allTrains = await Train.find({})

    // Normalize station names
    const normalizedFrom = normalizeStation(from)
    const normalizedTo = normalizeStation(to)

    // Find direct trains
    const directTrains = allTrains.filter(train => {

      const fromIdx = train.stops.findIndex(
        s => normalizeStation(s.station) === normalizedFrom
      )

      const toIdx = train.stops.findIndex(
        s => normalizeStation(s.station) === normalizedTo
      )

      return fromIdx !== -1 &&
             toIdx !== -1 &&
             fromIdx < toIdx
    })

    // Parse duration helper
    const parseDuration = (dur) => {

      if (!dur) return 600

      const match = dur.match(/(\d+)h\s*(\d+)?m?/)

      if (!match) return 600

      return (
        parseInt(match[1]) * 60 +
        parseInt(match[2] || 0)
      )
    }

    // Use shortest direct train as baseline
    let directMinutes = 600

    if (directTrains.length > 0) {
      directMinutes = Math.min(
        ...directTrains.map(t =>
          parseDuration(t.duration)
        )
      )
    }

    // Build adjacency map
    const adjacencyMap = buildAdjacencyMap(allTrains)

    // Find alternate routes
    const alternateRoutes = findAlternateRoutes(
      allTrains,
      normalizedFrom,
      normalizedTo,
      selectedClass || '2A',
      directMinutes
    )

    res.json({
      trains: directTrains,
      alternateRoutes,
      directMinutes,
      totalFound: directTrains.length,
      alternatesFound: alternateRoutes.length
    })

  } catch (err) {

    console.error('Train search error:', err)

    res.status(500).json({
      message: 'Server error',
      error: err.message
    })
  }
})

module.exports = router
