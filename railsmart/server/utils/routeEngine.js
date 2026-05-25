// SINGLE HOP ALTERNATE ROUTE ENGINE
const MIN_LAYOVER = 45    // 45 minutes minimum
const MAX_LAYOVER = 120   // 2 hours maximum
const MIN_WL_CHANCE = 60  // Both legs must have at least 60% confirmation chance

// Convert time string "16:25" to minutes since midnight
const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0
  const [hours, minutes] = timeStr.split(':').map(Number)
  return hours * 60 + minutes
}

// Tier-based max journey time
const getMaxAllowedTime = (directMinutes) => {
  if (directMinutes <= 240) return directMinutes + 180
  if (directMinutes <= 480) return directMinutes * 1.5
  if (directMinutes <= 900) return directMinutes + 360
  return directMinutes + 480
}

// Get best confirmation chance for a train on a specific class
// If class not specified, take best available class chance
const getBestConfirmChance = (train, selectedClass) => {
  if (!train.classes || train.classes.length === 0) return 100
  if (selectedClass && selectedClass !== 'ALL') {
    const cls = train.classes.find(c => c.className === selectedClass)
    if (cls) return cls.confirmChance || 0
  }
  // Return best chance across all classes
  return Math.max(...train.classes.map(c => c.confirmChance || 0))
}

// Get arrival time at a stop using stops array first
const getArrivalAtStop = (train, stopName) => {
  if (train.stops && train.stops.length > 0) {
    const stop = train.stops.find(
      s => s.station.toLowerCase() === stopName.toLowerCase()
    )
    if (stop && stop.arrivalTime) {
      const base = timeToMinutes(stop.arrivalTime)
      return base + (stop.dayOffset || 0) * 24 * 60
    }
    if (stop && stop.departureTime) {
      const base = timeToMinutes(stop.departureTime)
      return base + (stop.dayOffset || 0) * 24 * 60
    }
  }

  // Fallback proportional estimate
  const stopIndex = train.stopsAt.findIndex(
    s => s.toLowerCase() === stopName.toLowerCase()
  )
  if (stopIndex === -1) return null

  const totalStops = train.stopsAt.length + 1
  const depMinutes = timeToMinutes(train.departureTime)
  const arrMinutes = timeToMinutes(train.arrivalTime)

  let totalDuration = arrMinutes - depMinutes
  if (totalDuration < 0) totalDuration += 24 * 60

  const fraction = (stopIndex + 1) / totalStops
  return depMinutes + Math.floor(totalDuration * fraction)
}

// Get departure time FROM a stop for Train 2
const getDepartureFromStop = (train, stopName) => {
  if (train.stops && train.stops.length > 0) {
    const stop = train.stops.find(
      s => s.station.toLowerCase() === stopName.toLowerCase()
    )
    if (stop && stop.departureTime) {
      const base = timeToMinutes(stop.departureTime)
      return base + (stop.dayOffset || 0) * 24 * 60
    }
  }

  if (train.source.toLowerCase() === stopName.toLowerCase()) {
    return timeToMinutes(train.departureTime)
  }

  const stopIndex = train.stopsAt.findIndex(
    s => s.toLowerCase() === stopName.toLowerCase()
  )
  if (stopIndex === -1) return null

  const totalStops = train.stopsAt.length + 1
  const depMinutes = timeToMinutes(train.departureTime)
  const arrMinutes = timeToMinutes(train.arrivalTime)

  let totalDuration = arrMinutes - depMinutes
  if (totalDuration < 0) totalDuration += 24 * 60

  const fraction = (stopIndex + 1) / totalStops
  return depMinutes + Math.floor(totalDuration * fraction)
}

// Format minutes to HH:MM
const minutesToTime = (minutes) => {
  const m = ((minutes % (24 * 60)) + 24 * 60) % (24 * 60)
  return `${Math.floor(m / 60).toString().padStart(2, '0')}:${(m % 60).toString().padStart(2, '0')}`
}

// Check stop ordering
const isStopBefore = (train, stopA, stopB) => {
  const allStops = [train.source, ...train.stopsAt, train.destination]
  const indexA = allStops.findIndex(s => s.toLowerCase() === stopA.toLowerCase())
  const indexB = allStops.findIndex(s => s.toLowerCase() === stopB.toLowerCase())
  if (indexA === -1 || indexB === -1) return false
  return indexA < indexB
}

// Get arrival time at destination for train2 in absolute minutes
const getArrivalAtDestination = (train2, destination) => {
  if (train2.stops && train2.stops.length > 0) {
    const stop = train2.stops.find(
      s => s.station.toLowerCase() === destination.toLowerCase()
    )
    if (stop) {
      const base = timeToMinutes(stop.arrivalTime || stop.departureTime)
      return base + (stop.dayOffset || 0) * 24 * 60
    }
  }
  return timeToMinutes(train2.arrivalTime)
}

// Main function
const findAlternateRoutes = (allTrains, source, destination, selectedClass) => {
  const alternateRoutes = []
  const seen = new Set()

  // Step 1 — Find direct trains and their best WL chance
  const directTrains = allTrains.filter(t =>
    t.source.toLowerCase() === source.toLowerCase() &&
    t.destination.toLowerCase() === destination.toLowerCase() &&
    !t.isAlternate
  )

  // Get worst direct train WL chance
  // We only suggest alternates BETTER than this
  let directBestChance = 100
  let directMinutes = 900

  if (directTrains.length > 0) {
    // Find best WL chance among direct trains
    directBestChance = Math.max(
      ...directTrains.map(t => getBestConfirmChance(t, selectedClass))
    )

    // Find shortest direct duration
    const durations = directTrains.map(t => {
      const dep = timeToMinutes(t.departureTime)
      const arr = timeToMinutes(t.arrivalTime)
      let d = arr - dep
      if (d < 0) d += 24 * 60
      return d
    })
    directMinutes = Math.min(...durations)
  }

  const maxAllowedTotal = getMaxAllowedTime(directMinutes)

  // Step 2 — Find alternate routes
  const trainsFromSource = allTrains.filter(train =>
    train.source.toLowerCase() === source.toLowerCase() &&
    train.stopsAt && train.stopsAt.length > 0
  )

  for (const train1 of trainsFromSource) {

    // Check Train 1 WL chance first
    const train1Chance = getBestConfirmChance(train1, selectedClass)

    // Skip if Train 1 chance is below minimum threshold
    if (train1Chance < MIN_WL_CHANCE) continue

    for (const stop of train1.stopsAt) {

      if (stop.toLowerCase() === destination.toLowerCase()) continue

      const connectingTrains = allTrains.filter(train => {
        if (train._id.toString() === train1._id.toString()) return false

        const passesThruStop =
          train.source.toLowerCase() === stop.toLowerCase() ||
          (train.stopsAt && train.stopsAt.some(s => s.toLowerCase() === stop.toLowerCase()))

        const reachesDestination =
          train.destination.toLowerCase() === destination.toLowerCase() ||
          (train.stopsAt && train.stopsAt.some(s => s.toLowerCase() === destination.toLowerCase()))

        return passesThruStop && reachesDestination
      })

      for (const train2 of connectingTrains) {

        // Check Train 2 WL chance
        const train2Chance = getBestConfirmChance(train2, selectedClass)

        // Skip if Train 2 chance is below minimum threshold
        if (train2Chance < MIN_WL_CHANCE) continue

        // Combined WL score — weakest link
        const combinedChance = Math.min(train1Chance, train2Chance)

        // Prevent backward routes
        if (!isStopBefore(train1, source, stop)) continue
        if (!isStopBefore(train2, stop, destination)) continue

        const arrivalAtStop = getArrivalAtStop(train1, stop)
        const departureFromStop = getDepartureFromStop(train2, stop)

        if (arrivalAtStop === null || departureFromStop === null) continue

        // Calculate layover
        let gap = departureFromStop - arrivalAtStop
        if (gap < 0) gap += 24 * 60

        // Apply min/max layover constraint
        if (gap < MIN_LAYOVER || gap > MAX_LAYOVER) continue

        // Calculate total journey duration
        const train1DepMinutes = timeToMinutes(train1.departureTime)
        const arrivalAtDestination = getArrivalAtDestination(train2, destination)

        let totalMins = arrivalAtDestination - train1DepMinutes
        if (totalMins < 0) totalMins += 24 * 60
        if (totalMins < gap) totalMins += 24 * 60

        // Apply tier-based max journey time
        if (totalMins > maxAllowedTotal) continue

        // Deduplicate
        const key = `${train1.trainNumber}-${stop}-${train2.trainNumber}`
        if (seen.has(key)) continue
        seen.add(key)

        alternateRoutes.push({
          type: 'ALTERNATE',
          via: stop,
          combinedWLChance: combinedChance,
          train1: {
            trainNumber: train1.trainNumber,
            trainName: train1.trainName,
            from: train1.source,
            to: stop,
            departureTime: train1.departureTime,
            estimatedArrival: minutesToTime(arrivalAtStop),
            classes: train1.classes,
            bestChance: train1Chance
          },
          train2: {
            trainNumber: train2.trainNumber,
            trainName: train2.trainName,
            from: stop,
            to: destination,
            departureTime: minutesToTime(departureFromStop),
            arrivalTime: train2.arrivalTime,
            classes: train2.classes,
            bestChance: train2Chance
          },
          layoverMinutes: gap,
          cheapestPrice:
            Math.min(...train1.classes.map(c => c.price)) +
            Math.min(...train2.classes.map(c => c.price)),
          totalDuration: `${Math.floor(totalMins / 60)}h ${totalMins % 60}m`
        })
      }
    }
  }

  // Sort by combined WL chance descending (highest first)
  // This is the KEY change — best confirmation routes come first
  alternateRoutes.sort((a, b) => b.combinedWLChance - a.combinedWLChance)

  return alternateRoutes
}

// ─────────────────────────────────────────
// DAY 11 — ROUTE RANKING ENGINE
// ─────────────────────────────────────────

const parseDurationToMinutes = (durationStr) => {
  if (!durationStr) return 9999
  const hoursMatch = durationStr.match(/(\d+)h/)
  const minsMatch = durationStr.match(/(\d+)m/)
  const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0
  const mins = minsMatch ? parseInt(minsMatch[1]) : 0
  return hours * 60 + mins
}

const getRouteWLScore = (route) => {
  const train1WL = route.train1.classes && route.train1.classes.length > 0
    ? Math.max(...route.train1.classes.map(c => c.confirmChance || 100))
    : 100

  const train2WL = route.train2.classes && route.train2.classes.length > 0
    ? Math.max(...route.train2.classes.map(c => c.confirmChance || 100))
    : 100

  return Math.min(train1WL, train2WL)
}

const normalize = (value, min, max) => {
  if (max === min) return 0
  return (value - min) / (max - min)
}

const rankAlternateRoutes = (routes) => {
  if (!routes || routes.length === 0) return []

  const prices = routes.map(r => r.cheapestPrice)
  const durations = routes.map(r => parseDurationToMinutes(r.totalDuration))
  const layovers = routes.map(r => r.layoverMinutes || 0)
  const wlScores = routes.map(r => getRouteWLScore(r))

  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const minDuration = Math.min(...durations)
  const maxDuration = Math.max(...durations)
  const minLayover = Math.min(...layovers)
  const maxLayover = Math.max(...layovers)
  const minWL = Math.min(...wlScores)
  const maxWL = Math.max(...wlScores)

  const scored = routes.map(route => {
    const duration = parseDurationToMinutes(route.totalDuration)
    const wlScore = getRouteWLScore(route)

    const priceScore = normalize(route.cheapestPrice, minPrice, maxPrice)
    const durationScore = normalize(duration, minDuration, maxDuration)
    const layoverScore = normalize(route.layoverMinutes || 0, minLayover, maxLayover)
    // WL is most important now — weight increased to 40%
    const wlRankScore = 1 - normalize(wlScore, minWL, maxWL)

    const finalScore = (
      priceScore * 0.25 +
      durationScore * 0.20 +
      wlRankScore * 0.45 +  // WL probability is now most important
      layoverScore * 0.10
    )

    return {
      ...route,
      rankingScore: parseFloat(finalScore.toFixed(3)),
      rankingBreakdown: {
        priceScore: parseFloat(priceScore.toFixed(3)),
        durationScore: parseFloat(durationScore.toFixed(3)),
        wlScore: parseFloat((1 - wlRankScore).toFixed(3)),
        layoverScore: parseFloat(layoverScore.toFixed(3))
      }
    }
  })

  return scored.sort((a, b) => a.rankingScore - b.rankingScore)
}

module.exports = {
  findAlternateRoutes,
  rankAlternateRoutes,
  parseDurationToMinutes,
  getRouteWLScore
}