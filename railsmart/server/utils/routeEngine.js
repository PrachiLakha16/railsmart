/**
 * Converts "HH:MM" to total minutes
 * Handles overnight with dayOffset
 */
const toMinutes = (timeStr, dayOffset = 0) => {
  if (!timeStr) return null
  const [h, m] = timeStr.split(':').map(Number)
  return dayOffset * 24 * 60 + h * 60 + m
}

/**
 * Tier-based max allowed journey time
 * Much more realistic than directTime * 2
 */
const getMaxAllowedTime = (directMinutes) => {
  if (directMinutes <= 240)  return directMinutes + 180       // ≤4 hrs → direct + 3 hrs
  if (directMinutes <= 480)  return directMinutes * 1.5       // 4–8 hrs → direct × 1.5
  if (directMinutes <= 900)  return directMinutes + 360       // 8–15 hrs → direct + 6 hrs
  return directMinutes + 480                                   // 15+ hrs → direct + 8 hrs
}

/**
 * Checks if transfer at via station is valid
 * Min layover: 45 min (Indian trains are delayed)
 * Max layover: 2 hours (user convenience)
 */
const isValidConnection = (arrivalTime, arrivalDay, departureTime, departureDay) => {
  const arrivalMins   = toMinutes(arrivalTime, arrivalDay)
  const departureMins = toMinutes(departureTime, departureDay)

  if (arrivalMins === null || departureMins === null) return false

  let layover = departureMins - arrivalMins

  // If departure appears earlier (overnight), push to next day
  if (layover < 0) layover += 24 * 60

  const MIN_LAYOVER = 45    // 45 minutes
  const MAX_LAYOVER = 120   // 2 hours

  return layover >= MIN_LAYOVER && layover <= MAX_LAYOVER
}

/**
 * Calculates layover in minutes between two trains at via station
 */
const getLayoverMinutes = (arrivalTime, arrivalDay, departureTime, departureDay) => {
  const arrivalMins   = toMinutes(arrivalTime, arrivalDay)
  const departureMins = toMinutes(departureTime, departureDay)
  let layover = departureMins - arrivalMins
  if (layover < 0) layover += 24 * 60
  return layover
}

/**
 * Formats minutes → "Xh Ym" string
 */
const formatDuration = (minutes) => {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

/**
 * Single-hop: A → via → B
 * Max 2 transfers means we call this twice for 2-hop (A→via1→via2→B)
 * For Day 8 we implement 1-hop cleanly, 2-hop in Day 9
 */
const findSingleHopRoutes = (allTrains, from, to, selectedClass, directMinutes) => {
  const results = []
  const maxAllowedTime = getMaxAllowedTime(directMinutes)

  // Trains that pass through 'from'
  const firstLegTrains = allTrains.filter(t =>
    t.stops.some(s => s.station === from)
  )

  // Trains that pass through 'to'
  const secondLegTrains = allTrains.filter(t =>
    t.stops.some(s => s.station === to)
  )

  for (const firstTrain of firstLegTrains) {
    const fromStopIndex = firstTrain.stops.findIndex(s => s.station === from)
    if (fromStopIndex === -1) continue

    // All stops AFTER 'from' are potential via stations
    const stopsAfterFrom = firstTrain.stops.slice(fromStopIndex + 1)

    for (const viaStop of stopsAfterFrom) {
      const viaStation = viaStop.station
      if (viaStation === to) continue

      for (const secondTrain of secondLegTrains) {
        // Skip same train
        if (firstTrain._id.toString() === secondTrain._id.toString()) continue

        const viaStopIndex = secondTrain.stops.findIndex(s => s.station === viaStation)
        const toStopIndex  = secondTrain.stops.findIndex(s => s.station === to)

        // via must exist and come before 'to' in second train
        if (viaStopIndex === -1 || toStopIndex === -1) continue
        if (viaStopIndex >= toStopIndex) continue

        const secondTrainAtVia = secondTrain.stops[viaStopIndex]
        const fromStop         = firstTrain.stops[fromStopIndex]
        const toStop           = secondTrain.stops[toStopIndex]

        // Validate layover (45 min – 2 hrs)
        if (!isValidConnection(
          viaStop.arrivalTime,
          viaStop.dayOffset || 0,
          secondTrainAtVia.departureTime,
          secondTrainAtVia.dayOffset || 0
        )) continue

        // Calculate total journey time
        const departureMinutes = toMinutes(fromStop.departureTime, fromStop.dayOffset || 0)
        const arrivalMinutes   = toMinutes(toStop.arrivalTime, toStop.dayOffset || 0)
        let totalTime = arrivalMinutes - departureMinutes
        if (totalTime < 0) totalTime += 24 * 60  // overnight

        // Reject if exceeds tier-based max
        if (totalTime > maxAllowedTime) continue

        // Reject if arrival is 2+ days after departure
        const totalDays = Math.floor(totalTime / (24 * 60))
        if (totalDays >= 2) continue

        // Class availability
        const cls1 = firstTrain.classes.find(c => c.type === selectedClass)
        const cls2 = secondTrain.classes.find(c => c.type === selectedClass)

        const layoverMins = getLayoverMinutes(
          viaStop.arrivalTime,
          viaStop.dayOffset || 0,
          secondTrainAtVia.departureTime,
          secondTrainAtVia.dayOffset || 0
        )

        results.push({
          type: 'alternate',
          hops: 1,
          viaStation,
          totalDuration: formatDuration(totalTime),
          totalDurationMinutes: totalTime,
          layoverDuration: formatDuration(layoverMins),
          totalPrice: cls1 && cls2 ? cls1.price + cls2.price : null,
          avgConfirmChance: cls1 && cls2
            ? Math.round((cls1.confirmChance + cls2.confirmChance) / 2)
            : 0,
          firstTrain: {
            trainNumber:   firstTrain.trainNumber,
            trainName:     firstTrain.trainName,
            from,
            to:            viaStation,
            departureTime: fromStop.departureTime,
            arrivalTime:   viaStop.arrivalTime,
            classes:       firstTrain.classes,
            hasSelectedClass: !!cls1
          },
          secondTrain: {
            trainNumber:   secondTrain.trainNumber,
            trainName:     secondTrain.trainName,
            from:          viaStation,
            to,
            departureTime: secondTrainAtVia.departureTime,
            arrivalTime:   toStop.arrivalTime,
            classes:       secondTrain.classes,
            hasSelectedClass: !!cls2
          }
        })
      }
    }
  }

  return results
}

/**
 * Main entry point
 * Returns single-hop alternate routes sorted by total time
 * 2-hop will be added Day 9
 */
const findAlternateRoutes = (allTrains, from, to, selectedClass, directMinutes) => {
  const singleHop = findSingleHopRoutes(allTrains, from, to, selectedClass, directMinutes)

  // Sort: available class first, then by avg confirm chance desc, then total time asc
  return singleHop.sort((a, b) => {
    if (b.avgConfirmChance !== a.avgConfirmChance)
      return b.avgConfirmChance - a.avgConfirmChance
    return a.totalDurationMinutes - b.totalDurationMinutes
  })
}

module.exports = {
  findAlternateRoutes,
  isValidConnection,
  getMaxAllowedTime,
  toMinutes,
  formatDuration
}