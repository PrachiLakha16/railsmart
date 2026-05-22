// SINGLE HOP ALTERNATE ROUTE ENGINE
// Logic: A → B → C
// Train 1: source = A, stopsAt includes B
// Train 2: stopsAt includes B AND stopsAt/destination includes C
// Validate: Train 2 departs AFTER Train 1 arrives at B

const MIN_LAYOVER = 60 // 1 hour minimum
const MAX_LAYOVER = 8 * 60 // 8 hour maximum

// Convert time string "16:25" to minutes since midnight
const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0
  const [hours, minutes] = timeStr.split(':').map(Number)
  return hours * 60 + minutes
}

// Get arrival time at a stop using the stops array (accurate)
// Falls back to proportional estimate if stops array not available
const getArrivalAtStop = (train, stopName) => {
  // Try stops array first (accurate data)
  if (train.stops && train.stops.length > 0) {
    const stop = train.stops.find(
      s => s.station.toLowerCase() === stopName.toLowerCase()
    )
    if (stop && stop.arrivalTime) {
      return timeToMinutes(stop.arrivalTime)
    }
    if (stop && stop.departureTime) {
      return timeToMinutes(stop.departureTime)
    }
  }

  // Fallback: proportional estimate using stopsAt
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
  const minutesAtStop = depMinutes + Math.floor(totalDuration * fraction)

  return minutesAtStop % (24 * 60)
}

// Get departure time FROM a stop for Train 2
const getDepartureFromStop = (train, stopName) => {
  // Try stops array first
  if (train.stops && train.stops.length > 0) {
    const stop = train.stops.find(
      s => s.station.toLowerCase() === stopName.toLowerCase()
    )
    if (stop && stop.departureTime) {
      return timeToMinutes(stop.departureTime)
    }
  }

  // If train originates at this stop
  if (train.source.toLowerCase() === stopName.toLowerCase()) {
    return timeToMinutes(train.departureTime)
  }

  // Fallback: proportional estimate
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
  return (depMinutes + Math.floor(totalDuration * fraction)) % (24 * 60)
}

// Format minutes to HH:MM
const minutesToTime = (minutes) => {
  const m = ((minutes % (24 * 60)) + 24 * 60) % (24 * 60)
  return `${Math.floor(m / 60).toString().padStart(2, '0')}:${(m % 60).toString().padStart(2, '0')}`
}
// Check if stopA comes before stopB in a train's journey
const isStopBefore = (train, stopA, stopB) => {
  const allStops = [train.source, ...train.stopsAt, train.destination]
  const indexA = allStops.findIndex(s => s.toLowerCase() === stopA.toLowerCase())
  const indexB = allStops.findIndex(s => s.toLowerCase() === stopB.toLowerCase())
  if (indexA === -1 || indexB === -1) return false
  return indexA < indexB
}
// Main function
const findAlternateRoutes = (allTrains, source, destination) => {
  const alternateRoutes = []
  const seen = new Set() // avoid duplicates

  // Train 1: starts at source, has stops
  const trainsFromSource = allTrains.filter(train =>
    train.source.toLowerCase() === source.toLowerCase() &&
    train.stopsAt && train.stopsAt.length > 0
  )

  for (const train1 of trainsFromSource) {
    for (const stop of train1.stopsAt) {

      // Skip if stop is the destination
      if (stop.toLowerCase() === destination.toLowerCase()) continue

      // Train 2: must pass through stop AND reach destination
      // Either destination is train2's destination OR in train2's stopsAt
      const connectingTrains = allTrains.filter(train => {
        if (train._id.toString() === train1._id.toString()) return false // not same train

        const passesThruStop =
          train.source.toLowerCase() === stop.toLowerCase() ||
          (train.stopsAt && train.stopsAt.some(s => s.toLowerCase() === stop.toLowerCase()))

        const reachesDestination =
          train.destination.toLowerCase() === destination.toLowerCase() ||
          (train.stopsAt && train.stopsAt.some(s => s.toLowerCase() === destination.toLowerCase()))

        return passesThruStop && reachesDestination
      })

      for (const train2 of connectingTrains) {
        const arrivalAtStop = getArrivalAtStop(train1, stop)
        const departureFromStop = getDepartureFromStop(train2, stop)
        // Improvement 1: Prevent backward routes
// Train1: source must come before via stop
if (!isStopBefore(train1, source, stop)) continue

// Train2: via stop must come before destination
if (!isStopBefore(train2, stop, destination)) continue
        if (arrivalAtStop === null || departureFromStop === null) continue

        let gap = departureFromStop - arrivalAtStop
        if (gap < 0) gap += 24 * 60

        if (gap < MIN_LAYOVER || gap > MAX_LAYOVER) continue

        // Deduplicate
        const key = `${train1.trainNumber}-${stop}-${train2.trainNumber}`
        if (seen.has(key)) continue
        seen.add(key)

        // Total duration
        const totalArr = timeToMinutes(train2.arrivalTime)
        const totalDep = timeToMinutes(train1.departureTime)
        let totalMins = totalArr - totalDep
        if (totalMins < 0) totalMins += 24 * 60

        alternateRoutes.push({
          type: 'ALTERNATE',
          via: stop,
          train1: {
            trainNumber: train1.trainNumber,
            trainName: train1.trainName,
            from: train1.source,
            to: stop,
            departureTime: train1.departureTime,
            estimatedArrival: minutesToTime(arrivalAtStop),
            classes: train1.classes
          },
          train2: {
            trainNumber: train2.trainNumber,
            trainName: train2.trainName,
            from: stop,
            to: destination,
            departureTime: minutesToTime(departureFromStop),
            arrivalTime: train2.arrivalTime,
            classes: train2.classes
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

  // Sort by cheapest price
  alternateRoutes.sort((a, b) => a.cheapestPrice - b.cheapestPrice)

  return alternateRoutes
}

module.exports = { findAlternateRoutes, timeToMinutes }