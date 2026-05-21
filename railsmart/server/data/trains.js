const trains = [
  // DELHI TO MUMBAI
  {
    trainNumber: '12951',
    trainName: 'Mumbai Rajdhani Express',
    source: 'Delhi',
    destination: 'Mumbai',
    departureTime: '16:25',
    arrivalTime: '08:15',
    duration: '15h 50m',
    isAlternate:   false,
     stops: [
      { station: 'Delhi',    departureTime: '16:25', arrivalTime: null,   dayOffset: 0 },
      { station: 'Kota',     departureTime: '21:05', arrivalTime: '21:00', dayOffset: 0 },
      { station: 'Vadodara', departureTime: '03:05', arrivalTime: '03:00', dayOffset: 1 },
      { station: 'Mumbai',   departureTime: null,    arrivalTime: '08:15', dayOffset: 1 }
    ],
    runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    stopsAt: ['Kota', 'Vadodara', 'Surat'],
    classes: [
      { className: 'SL', price: 710, totalSeats: 100, availableSeats: 0, waitlistCount: 44, confirmChance: 47 },
      { className: '3A', price: 1800, totalSeats: 80, availableSeats: 0, waitlistCount: 44, confirmChance: 41 },
      { className: '2A', price: 2555, totalSeats: 60, availableSeats: 0, waitlistCount: 24, confirmChance: 42 },
      { className: '1A', price: 4295, totalSeats: 20, availableSeats: 3, waitlistCount: 0, confirmChance: 100 }
    ]
  },
  {
    trainNumber: '12953',
    trainName: 'August Kranti Rajdhani',
    source: 'Delhi',
    destination: 'Mumbai',
    departureTime: '17:40',
    arrivalTime: '10:55',
    duration: '17h 15m',
    isAlternate:   false,
     stops: [
      { station: 'Delhi',    departureTime: '17:40', arrivalTime: null,   dayOffset: 0 },
      { station: 'Kota',     departureTime: '22:30', arrivalTime: '22:20', dayOffset: 0 },
      { station: 'Vadodara', departureTime: '04:45', arrivalTime: '04:30', dayOffset: 1 },
      { station: 'Surat',    departureTime: '06:00', arrivalTime: '05:50', dayOffset: 1 },
      { station: 'Mumbai',   departureTime: null,    arrivalTime: '10:55', dayOffset: 1 }
    ],
    runningDays: ['Mon', 'Wed', 'Fri', 'Sun'],
    stopsAt: ['Kota', 'Vadodara'],
    classes: [
      { className: 'SL', price: 680, totalSeats: 100, availableSeats: 0, waitlistCount: 30, confirmChance: 55 },
      { className: '3A', price: 1750, totalSeats: 80, availableSeats: 5, waitlistCount: 0, confirmChance: 100 },
      { className: '2A', price: 2500, totalSeats: 60, availableSeats: 2, waitlistCount: 0, confirmChance: 100 },
      { className: '1A', price: 4200, totalSeats: 20, availableSeats: 0, waitlistCount: 5, confirmChance: 60 }
    ]
  },
  {
    trainNumber: '12904',
    trainName: 'Golden Temple Mail',
    source: 'Delhi',
    destination: 'Mumbai',
    departureTime: '04:00',
    arrivalTime: '23:55',
    duration: '19h 55m',
     isAlternate:   false,
      stops: [
      { station: 'Delhi',    departureTime: '04:00', arrivalTime: null,   dayOffset: 0 },
      { station: 'Mathura',  departureTime: '05:45', arrivalTime: '05:40', dayOffset: 0 },
      { station: 'Agra',     departureTime: '06:30', arrivalTime: '06:25', dayOffset: 0 },
      { station: 'Gwalior',  departureTime: '08:00', arrivalTime: '07:55', dayOffset: 0 },
      { station: 'Jhansi',   departureTime: '09:15', arrivalTime: '09:10', dayOffset: 0 },
      { station: 'Bhopal',   departureTime: '12:30', arrivalTime: '12:20', dayOffset: 0 },
      { station: 'Surat',    departureTime: '21:30', arrivalTime: '21:15', dayOffset: 0 },
      { station: 'Mumbai',   departureTime: null,    arrivalTime: '23:55', dayOffset: 0 }
    ],
    runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    stopsAt: ['Mathura', 'Kota', 'Ratlam', 'Surat', 'Vadodara'],
    classes: [
      { className: 'SL', price: 655, totalSeats: 100, availableSeats: 0, waitlistCount: 69, confirmChance: 70 },
      { className: '3A', price: 1670, totalSeats: 80, availableSeats: 0, waitlistCount: 63, confirmChance: 70 },
      { className: '2A', price: 2365, totalSeats: 60, availableSeats: 0, waitlistCount: 24, confirmChance: 89 },
      { className: '1A', price: 3970, totalSeats: 20, availableSeats: 8, waitlistCount: 0, confirmChance: 100 }
    ]
  },

  // DELHI TO PATNA
  {
    trainNumber: '12309',
    trainName: 'Rajendra Nagar Patna Rajdhani',
    source: 'Delhi',
    destination: 'Patna',
    departureTime: '18:55',
    arrivalTime: '06:00',
    duration: '11h 05m',
    runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    stopsAt: ['Kanpur', 'Allahabad', 'Mughal Sarai'],
    classes: [
      { className: 'SL', price: 480, totalSeats: 100, availableSeats: 0, waitlistCount: 55, confirmChance: 60 },
      { className: '3A', price: 1280, totalSeats: 80, availableSeats: 0, waitlistCount: 40, confirmChance: 65 },
      { className: '2A', price: 1850, totalSeats: 60, availableSeats: 5, waitlistCount: 0, confirmChance: 100 },
      { className: '1A', price: 3100, totalSeats: 20, availableSeats: 2, waitlistCount: 0, confirmChance: 100 }
    ]
  },
  {
    trainNumber: '13237',
    trainName: 'Patna Express',
    source: 'Delhi',
    destination: 'Patna',
    departureTime: '06:30',
    arrivalTime: '21:15',
    duration: '14h 45m',
    runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    stopsAt: ['Agra', 'Kanpur', 'Allahabad', 'Varanasi'],
    classes: [
      { className: 'SL', price: 420, totalSeats: 100, availableSeats: 12, waitlistCount: 0, confirmChance: 100 },
      { className: '3A', price: 1100, totalSeats: 80, availableSeats: 8, waitlistCount: 0, confirmChance: 100 },
      { className: '2A', price: 1600, totalSeats: 60, availableSeats: 3, waitlistCount: 0, confirmChance: 100 },
      { className: '1A', price: 2700, totalSeats: 20, availableSeats: 0, waitlistCount: 8, confirmChance: 45 }
    ]
  },

  // DELHI TO CHENNAI
  {
    trainNumber: '12433',
    trainName: 'Chennai Rajdhani Express',
    source: 'Delhi',
    destination: 'Chennai',
    departureTime: '15:55',
    arrivalTime: '15:55',
    duration: '24h 00m',
    runningDays: ['Mon', 'Wed', 'Fri'],
    stopsAt: ['Bhopal', 'Nagpur', 'Vijayawada'],
    classes: [
      { className: '3A', price: 2100, totalSeats: 80, availableSeats: 0, waitlistCount: 35, confirmChance: 58 },
      { className: '2A', price: 3000, totalSeats: 60, availableSeats: 4, waitlistCount: 0, confirmChance: 100 },
      { className: '1A', price: 5000, totalSeats: 20, availableSeats: 1, waitlistCount: 0, confirmChance: 100 }
    ]
  },
  {
    trainNumber: '12621',
    trainName: 'Tamil Nadu Express',
    source: 'Delhi',
    destination: 'Chennai',
    departureTime: '22:30',
    arrivalTime: '07:40',
    duration: '33h 10m',
    runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    stopsAt: ['Agra', 'Bhopal', 'Nagpur', 'Hyderabad'],
    classes: [
      { className: 'SL', price: 720, totalSeats: 100, availableSeats: 0, waitlistCount: 80, confirmChance: 40 },
      { className: '3A', price: 1950, totalSeats: 80, availableSeats: 0, waitlistCount: 50, confirmChance: 55 },
      { className: '2A', price: 2800, totalSeats: 60, availableSeats: 6, waitlistCount: 0, confirmChance: 100 },
      { className: '1A', price: 4700, totalSeats: 20, availableSeats: 2, waitlistCount: 0, confirmChance: 100 }
    ]
  },

  // DELHI TO KOLKATA
  {
    trainNumber: '12301',
    trainName: 'Howrah Rajdhani Express',
    source: 'Delhi',
    destination: 'Kolkata',
    departureTime: '16:55',
    arrivalTime: '09:55',
    duration: '17h 00m',
    runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    stopsAt: ['Kanpur', 'Allahabad', 'Gaya'],
    classes: [
      { className: 'SL', price: 620, totalSeats: 100, availableSeats: 0, waitlistCount: 60, confirmChance: 50 },
      { className: '3A', price: 1650, totalSeats: 80, availableSeats: 0, waitlistCount: 45, confirmChance: 62 },
      { className: '2A', price: 2350, totalSeats: 60, availableSeats: 3, waitlistCount: 0, confirmChance: 100 },
      { className: '1A', price: 3950, totalSeats: 20, availableSeats: 1, waitlistCount: 0, confirmChance: 100 }
    ]
  },
  {
    trainNumber: '12303',
    trainName: 'Poorva Express',
    source: 'Delhi',
    destination: 'Kolkata',
    departureTime: '08:00',
    arrivalTime: '06:20',
    duration: '22h 20m',
    runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    stopsAt: ['Agra', 'Kanpur', 'Allahabad', 'Varanasi', 'Gaya'],
    classes: [
      { className: 'SL', price: 560, totalSeats: 100, availableSeats: 15, waitlistCount: 0, confirmChance: 100 },
      { className: '3A', price: 1500, totalSeats: 80, availableSeats: 7, waitlistCount: 0, confirmChance: 100 },
      { className: '2A', price: 2150, totalSeats: 60, availableSeats: 2, waitlistCount: 0, confirmChance: 100 },
      { className: '1A', price: 3600, totalSeats: 20, availableSeats: 0, waitlistCount: 10, confirmChance: 38 }
    ]
  },

  // MUMBAI TO KOLKATA
  {
    trainNumber: '12809',
    trainName: 'Mumbai Howrah Mail',
    source: 'Mumbai',
    destination: 'Kolkata',
    departureTime: '21:35',
    arrivalTime: '05:45',
    duration: '32h 10m',
    runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    stopsAt: ['Nagpur', 'Raipur', 'Jharsuguda'],
    classes: [
      { className: 'SL', price: 590, totalSeats: 100, availableSeats: 0, waitlistCount: 50, confirmChance: 55 },
      { className: '3A', price: 1580, totalSeats: 80, availableSeats: 4, waitlistCount: 0, confirmChance: 100 },
      { className: '2A', price: 2250, totalSeats: 60, availableSeats: 1, waitlistCount: 0, confirmChance: 100 },
      { className: '1A', price: 3800, totalSeats: 20, availableSeats: 0, waitlistCount: 6, confirmChance: 50 }
    ]
  },

  // ALTERNATE ROUTES
  // Delhi → Mumbai via Lucknow
  {
    trainNumber: 'ALT-001',
    trainName: 'Delhi to Mumbai via Lucknow',
    source: 'Delhi',
    destination: 'Mumbai',
    departureTime: '06:00',
    arrivalTime: '23:00',
    duration: '17h 00m',
    runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    stopsAt: ['Lucknow', 'Kanpur', 'Surat'],
    isAlternate: true,
    viaStation: 'Lucknow',
    classes: [
      { className: 'SL', price: 580, totalSeats: 100, availableSeats: 20, waitlistCount: 0, confirmChance: 100 },
      { className: '3A', price: 1450, totalSeats: 80, availableSeats: 12, waitlistCount: 0, confirmChance: 100 },
      { className: '2A', price: 2100, totalSeats: 60, availableSeats: 5, waitlistCount: 0, confirmChance: 100 }
    ]
  },
  // Delhi → Mumbai via Jaipur
  {
    trainNumber: 'ALT-002',
    trainName: 'Delhi to Mumbai via Jaipur',
    source: 'Delhi',
    destination: 'Mumbai',
    departureTime: '09:00',
    arrivalTime: '06:00',
    duration: '21h 00m',
    runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    stopsAt: ['Jaipur', 'Ahmedabad', 'Surat'],
    isAlternate: true,
    viaStation: 'Jaipur',
    classes: [
      { className: 'SL', price: 520, totalSeats: 100, availableSeats: 30, waitlistCount: 0, confirmChance: 100 },
      { className: '3A', price: 1380, totalSeats: 80, availableSeats: 18, waitlistCount: 0, confirmChance: 100 }
    ]
  },
  // Delhi → Patna via Varanasi
  {
    trainNumber: 'ALT-003',
    trainName: 'Delhi to Patna via Varanasi',
    source: 'Delhi',
    destination: 'Patna',
    departureTime: '07:00',
    arrivalTime: '22:00',
    duration: '15h 00m',
    runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    stopsAt: ['Kanpur', 'Varanasi'],
    isAlternate: true,
    viaStation: 'Varanasi',
    classes: [
      { className: 'SL', price: 390, totalSeats: 100, availableSeats: 25, waitlistCount: 0, confirmChance: 100 },
      { className: '3A', price: 980, totalSeats: 80, availableSeats: 10, waitlistCount: 0, confirmChance: 100 }
    ]
  },
  // Delhi → Kolkata via Patna
  {
    trainNumber: 'ALT-004',
    trainName: 'Delhi to Kolkata via Patna',
    source: 'Delhi',
    destination: 'Kolkata',
    departureTime: '10:00',
    arrivalTime: '08:00',
    duration: '22h 00m',
    runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    stopsAt: ['Kanpur', 'Patna', 'Gaya'],
    isAlternate: true,
    viaStation: 'Patna',
    classes: [
      { className: 'SL', price: 540, totalSeats: 100, availableSeats: 18, waitlistCount: 0, confirmChance: 100 },
      { className: '3A', price: 1420, totalSeats: 80, availableSeats: 8, waitlistCount: 0, confirmChance: 100 }
    ]
  },
  // Mumbai → Kolkata via Nagpur
  {
    trainNumber: 'ALT-005',
    trainName: 'Mumbai to Kolkata via Nagpur',
    source: 'Mumbai',
    destination: 'Kolkata',
    departureTime: '14:00',
    arrivalTime: '20:00',
    duration: '30h 00m',
    runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    stopsAt: ['Nagpur', 'Raipur'],
    isAlternate: true,
    viaStation: 'Nagpur',
    classes: [
      { className: 'SL', price: 560, totalSeats: 100, availableSeats: 22, waitlistCount: 0, confirmChance: 100 },
      { className: '3A', price: 1480, totalSeats: 80, availableSeats: 14, waitlistCount: 0, confirmChance: 100 }
    ]
  }
]

module.exports = trains