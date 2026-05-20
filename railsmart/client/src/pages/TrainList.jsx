import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import TrainCard from '../components/TrainCard'

// Mock data for now — real data comes on Day 6
const mockTrains = [
  {
    _id: '1',
    trainNumber: '12951',
    trainName: 'Rajdhani Express',
    source: 'Delhi',
    destination: 'Mumbai',
    departureTime: '16:25',
    arrivalTime: '08:15',
    duration: '15h 50m',
    rating: 4.2,
    isAlternate: false,
    classes: [
      { className: 'SL', price: 710, availableSeats: 0, waitlistCount: 44, confirmChance: 47 },
      { className: '3A', price: 1800, availableSeats: 0, waitlistCount: 44, confirmChance: 41 },
      { className: '2A', price: 2555, availableSeats: 0, waitlistCount: 24, confirmChance: 42 },
      { className: '1A', price: 4295, availableSeats: 3, waitlistCount: 0, confirmChance: 100 }
    ]
  },
  {
    _id: '2',
    trainNumber: '12904',
    trainName: 'Golden Temple Mail',
    source: 'Delhi',
    destination: 'Mumbai',
    departureTime: '04:00',
    arrivalTime: '23:55',
    duration: '19h 55m',
    rating: 4.0,
    isAlternate: false,
    classes: [
      { className: 'SL', price: 655, availableSeats: 0, waitlistCount: 69, confirmChance: 70 },
      { className: '3A', price: 1670, availableSeats: 0, waitlistCount: 63, confirmChance: 70 },
      { className: '2A', price: 2365, availableSeats: 0, waitlistCount: 24, confirmChance: 89 },
      { className: '1A', price: 3970, availableSeats: 8, waitlistCount: 0, confirmChance: 100 }
    ]
  },
  {
    _id: '3',
    trainNumber: 'ALT-001',
    trainName: 'Via Surat — Alternate Route',
    source: 'Delhi',
    destination: 'Mumbai',
    departureTime: '06:00',
    arrivalTime: '22:00',
    duration: '16h 00m',
    rating: 3.8,
    isAlternate: true,
    viaStation: 'Surat',
    classes: [
      { className: 'SL', price: 580, availableSeats: 12, waitlistCount: 0, confirmChance: 100 },
      { className: '3A', price: 1450, availableSeats: 6, waitlistCount: 0, confirmChance: 100 },
    ]
  }
]

function TrainList() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const date = searchParams.get('date')
  const showCheapest = searchParams.get('cheapest') === 'true'

  const [trains, setTrains] = useState(mockTrains)
  const [sortBy, setSortBy] = useState('recommended')
  const [departureFilter, setDepartureFilter] = useState([])
  const [showAlternate, setShowAlternate] = useState(showCheapest)

  // Sort trains based on filter
  const getSortedTrains = () => {
    let filtered = showAlternate ? trains : trains.filter(t => !t.isAlternate)

    if (sortBy === 'cheapest') {
      return [...filtered].sort((a, b) => {
        const aPrice = Math.min(...a.classes.map(c => c.price))
        const bPrice = Math.min(...b.classes.map(c => c.price))
        return aPrice - bPrice
      })
    }

    if (sortBy === 'fastest') {
      return [...filtered].sort((a, b) => {
        const aHours = parseInt(a.duration)
        const bHours = parseInt(b.duration)
        return aHours - bHours
      })
    }

    if (sortBy === 'wlChance') {
      return [...filtered].sort((a, b) => {
        const aChance = Math.max(...a.classes.map(c => c.confirmChance))
        const bChance = Math.max(...b.classes.map(c => c.confirmChance))
        return bChance - aChance
      })
    }

    return filtered
  }

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <Navbar />

      <div className="container mt-4">

        {/* Heading */}
        <h5 className="fw-bold mb-1">{from} to {to} Trains</h5>
        <p className="text-muted small mb-3">
          Showing trains for {date}
        </p>

        {/* Date Strip */}
        <div className="card mb-3 p-2 shadow-sm">
          <div className="d-flex gap-3 overflow-auto">
            {[0, 1, 2, 3, 4, 5].map(i => {
              const d = new Date(date)
              d.setDate(d.getDate() + i)
              const label = d.toDateString().slice(0, 10)
              return (
                <div
                  key={i}
                  className="text-center px-3 py-1 rounded"
                  style={{
                    cursor: 'pointer',
                    backgroundColor: i === 0 ? '#e63946' : 'white',
                    color: i === 0 ? 'white' : 'black',
                    minWidth: '80px',
                    border: '1px solid #dee2e6'
                  }}
                >
                  <div className="small fw-semibold">{label}</div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="row">

          {/* Filter Panel */}
          <div className="col-md-3">
            <div className="card shadow-sm p-3">
              <h6 className="fw-bold mb-3">Filters</h6>

              {/* Sort By */}
              <div className="mb-3">
                <div className="fw-semibold small mb-2">Sort By</div>
                {[
                  { value: 'recommended', label: 'Recommended' },
                  { value: 'cheapest', label: '💰 Cheapest First' },
                  { value: 'fastest', label: '⚡ Fastest First' },
                  { value: 'wlChance', label: '🎯 WL Probability' }
                ].map(option => (
                  <div key={option.value} className="form-check">
                    <input
                      type="radio"
                      className="form-check-input"
                      name="sortBy"
                      id={option.value}
                      value={option.value}
                      checked={sortBy === option.value}
                      onChange={(e) => setSortBy(e.target.value)}
                    />
                    <label className="form-check-label small" htmlFor={option.value}>
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>

              {/* Departure Time */}
              <div className="mb-3">
                <div className="fw-semibold small mb-2">Departure Time</div>
                <div className="row g-1">
                  {[
                    { label: 'Early Morning', sub: '00:00 - 06:00', value: 'early' },
                    { label: 'Morning', sub: '06:00 - 12:00', value: 'morning' },
                    { label: 'Afternoon', sub: '12:00 - 18:00', value: 'afternoon' },
                    { label: 'Night', sub: '18:00 - 24:00', value: 'night' }
                  ].map(slot => (
                    <div key={slot.value} className="col-6">
                      <div
                        className="border rounded p-1 text-center small"
                        style={{
                          cursor: 'pointer',
                          backgroundColor: departureFilter.includes(slot.value) ? '#e63946' : 'white',
                          color: departureFilter.includes(slot.value) ? 'white' : 'black'
                        }}
                        onClick={() => {
                          setDepartureFilter(prev =>
                            prev.includes(slot.value)
                              ? prev.filter(v => v !== slot.value)
                              : [...prev, slot.value]
                          )
                        }}
                      >
                        <div className="fw-semibold">{slot.label}</div>
                        <div style={{ fontSize: '10px' }}>{slot.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alternate Routes Toggle */}
              <div className="border-top pt-3">
                <div className="fw-semibold small mb-2">🔀 Alternate Routes</div>
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="alternateToggle"
                    checked={showAlternate}
                    onChange={(e) => setShowAlternate(e.target.checked)}
                  />
                  <label className="form-check-label small" htmlFor="alternateToggle">
                    Show Alternate Routes
                  </label>
                </div>
                {showAlternate && (
                  <div className="small text-muted mt-1">
                    Showing trains via alternate stations
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Train Cards */}
          <div className="col-md-9">
            {getSortedTrains().length === 0 ? (
              <div className="text-center text-muted mt-5">
                No trains found for this route.
              </div>
            ) : (
              getSortedTrains().map(train => (
                <TrainCard key={train._id} train={train} />
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

export default TrainList
