const {
  findAlternateRoutes,
  getMaxAllowedTime,
  isValidConnection
} = require('./utils/routeEngine')

// ── Constraint tests ──────────────────────────────────────────
console.log('\n── Max allowed time tiers ──')
console.log('3h direct  →', getMaxAllowedTime(180),  'min allowed  (expected 360)')
console.log('6h direct  →', getMaxAllowedTime(360),  'min allowed  (expected 540)')
console.log('10h direct →', getMaxAllowedTime(600),  'min allowed  (expected 960)')
console.log('16h direct →', getMaxAllowedTime(960),  'min allowed  (expected 1440)')

console.log('\n── Layover validation ──')
console.log('30 min layover →', isValidConnection('12:00', 0, '12:30', 0), '(expected false, min is 45)')
console.log('45 min layover →', isValidConnection('12:00', 0, '12:45', 0), '(expected true)')
console.log('2hr layover    →', isValidConnection('12:00', 0, '14:00', 0), '(expected true)')
console.log('2hr 1min       →', isValidConnection('12:00', 0, '14:01', 0), '(expected false)')
console.log('Overnight      →', isValidConnection('23:30', 0, '00:30', 1), '(expected true, 60min)')

// ── Route finding test ────────────────────────────────────────
const mockTrains = [
  {
    _id: { toString: () => '1' },
    trainNumber: '12904',
    trainName: 'Golden Temple Mail',
    classes: [{ type: '2A', price: 2365, confirmChance: 89 }],
    stops: [
      { station: 'Delhi',  departureTime: '04:00', arrivalTime: null,   dayOffset: 0 },
      { station: 'Bhopal', departureTime: '12:30', arrivalTime: '12:20', dayOffset: 0 },
      { station: 'Mumbai', departureTime: null,    arrivalTime: '23:55', dayOffset: 0 }
    ]
  },
  {
    _id: { toString: () => '2' },
    trainNumber: '11078',
    trainName: 'Jhelum Express',
    classes: [{ type: '2A', price: 1500, confirmChance: 75 }],
    stops: [
      { station: 'Delhi',  departureTime: '05:00', arrivalTime: null,    dayOffset: 0 },
      { station: 'Bhopal', departureTime: '13:30', arrivalTime: '13:20', dayOffset: 0 },
      { station: 'Patna',  departureTime: null,    arrivalTime: '22:00', dayOffset: 0 }
    ]
  }
]

// Direct Delhi→Patna would be ~18hrs = 1080 min
const directMinutes = 1080

console.log('\n── Alternate route search: Delhi → Patna via Bhopal ──')
const routes = findAlternateRoutes(mockTrains, 'Delhi', 'Patna', '2A', directMinutes)
console.log('Routes found:', routes.length, '(expected 1)')

if (routes.length > 0) {
  const r = routes[0]
  console.log('Via station  :', r.viaStation)
  console.log('Total time   :', r.totalDuration)
  console.log('Layover      :', r.layoverDuration, '(expected 1h, valid)')
  console.log('Total price  :', r.totalPrice)
  console.log('Avg chance   :', r.avgConfirmChance + '%')
}