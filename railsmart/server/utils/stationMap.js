/**
 * Major railway hubs and their common aliases
 * This helps match "New Delhi" with "Delhi" etc.
 */
const STATION_ALIASES = {
  'Delhi':        ['Delhi', 'New Delhi', 'NDLS', 'DLI', 'Old Delhi'],
  'Mumbai':       ['Mumbai', 'Mumbai Central', 'MMCT', 'Bombay'],
  'Patna':        ['Patna', 'Patna Junction', 'PNBE'],
  'Bhopal':       ['Bhopal', 'Bhopal Junction', 'BPL'],
  'Agra':         ['Agra', 'Agra Cantt', 'AGC'],
  'Vadodara':     ['Vadodara', 'Baroda', 'BRC'],
  'Surat':        ['Surat', 'ST'],
  'Kota':         ['Kota', 'Kota Junction', 'KOTA'],
  'Mathura':      ['Mathura', 'Mathura Junction', 'MTJ'],
  'Gwalior':      ['Gwalior', 'GWL'],
  'Jhansi':       ['Jhansi', 'Jhansi Junction', 'JHS'],
  'Prayagraj':    ['Prayagraj', 'Allahabad', 'ALD', 'PRYJ'],
  'Lucknow':      ['Lucknow', 'Lucknow NR', 'LKO'],
  'Kanpur':       ['Kanpur', 'Kanpur Central', 'CNB'],
  'Jaipur':       ['Jaipur', 'JP'],
  'Ahmedabad':    ['Ahmedabad', 'ADI'],
  'Pune':         ['Pune', 'Pune Junction', 'PUNE'],
  'Nagpur':       ['Nagpur', 'NGP'],
  'Hyderabad':    ['Hyderabad', 'Secunderabad', 'HYB', 'SC'],
  'Chennai':      ['Chennai', 'Chennai Central', 'MAS'],
  'Bengaluru':    ['Bengaluru', 'Bangalore', 'SBC', 'KSR Bengaluru'],
  'Kolkata':      ['Kolkata', 'Howrah', 'HWH', 'Sealdah', 'SDAH'],
}

/**
 * Flattened lookup: alias → canonical name
 */
const ALIAS_TO_CANONICAL = {}
for (const [canonical, aliases] of Object.entries(STATION_ALIASES)) {
  for (const alias of aliases) {
    ALIAS_TO_CANONICAL[alias.toLowerCase()] = canonical
  }
}

/**
 * Normalize any station name to canonical form
 * e.g. "New Delhi" → "Delhi", "NDLS" → "Delhi"
 */
const normalizeStation = (name) => {
  if (!name) return null
  const key = name.trim().toLowerCase()
  return ALIAS_TO_CANONICAL[key] || name.trim()
}

/**
 * Check if two station names refer to same station
 */
const isSameStation = (a, b) => {
  return normalizeStation(a) === normalizeStation(b)
}

/**
 * Build adjacency map from train data
 * Returns: { 'Delhi': ['Bhopal', 'Agra', 'Vadodara'...], ... }
 * Useful for quickly finding which stations connect to which
 */
const buildAdjacencyMap = (allTrains) => {
  const map = {}

  for (const train of allTrains) {
    if (!train.stops || train.stops.length === 0) continue

    for (let i = 0; i < train.stops.length; i++) {
      const station = normalizeStation(train.stops[i].station)
      if (!map[station]) map[station] = new Set()

      // Every stop after this one is "reachable" from this station on this train
      for (let j = i + 1; j < train.stops.length; j++) {
        const reachable = normalizeStation(train.stops[j].station)
        map[station].add(reachable)
      }
    }
  }

  // Convert Sets to Arrays for easier use
  const result = {}
  for (const [station, reachable] of Object.entries(map)) {
    result[station] = Array.from(reachable)
  }

  return result
}

/**
 * Find all possible via stations between from → to
 * Uses adjacency map for efficiency
 */
const findPossibleViaStations = (adjacencyMap, from, to) => {
  const fromCanonical = normalizeStation(from)
  const toCanonical   = normalizeStation(to)

  const reachableFromSource = adjacencyMap[fromCanonical] || []
  const viaStations = []

  for (const mid of reachableFromSource) {
    if (mid === toCanonical) continue
    const reachableFromMid = adjacencyMap[mid] || []
    if (reachableFromMid.includes(toCanonical)) {
      viaStations.push(mid)
    }
  }

  return viaStations
}

module.exports = {
  normalizeStation,
  isSameStation,
  buildAdjacencyMap,
  findPossibleViaStations,
  STATION_ALIASES
}