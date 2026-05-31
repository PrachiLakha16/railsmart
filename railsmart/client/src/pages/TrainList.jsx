import React, { useState, useEffect, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import TrainCard from '../components/TrainCard'
import AlternateRouteCard from '../components/AlternateRouteCard'
import { trainAPI, alternateAPI } from '../services/api'

function TrainList() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const date = searchParams.get('date')
  const showCheapest = searchParams.get('cheapest') === 'true'
  const selectedClass = searchParams.get('class')

  const [originalDate] = useState(date)
  const [selectedDate, setSelectedDate] = useState(date)
  const [trains, setTrains] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [maxPrice, setMaxPrice] = useState(5000)

  // Filters
  const [sortBy, setSortBy] = useState('recommended')
  const [departureFilter, setDepartureFilter] = useState([])
  const [classFilter, setClassFilter] = useState([])
  const [priceRange, setPriceRange] = useState([0, 5000])
  const [showAlternate, setShowAlternate] = useState(showCheapest)
  const [alternateRoutes, setAlternateRoutes] = useState([])
  const [loadingAlternate, setLoadingAlternate] = useState(false)

  // Fetch direct trains
  useEffect(() => {
    const fetchTrains = async () => {
      try {
        setLoading(true)
        setError('')
       // Direct trains
const res = await trainAPI.search(from, to, selectedClass)
        const fetchedTrains = res.data.trains

        // Calculate max price
        let max = 0
        fetchedTrains.forEach(train => {
          train.classes.forEach(cls => {
            if (cls.price > max) max = cls.price
          })
        })
        const roundedMax = Math.ceil(max / 500) * 500 || 5000
        setMaxPrice(roundedMax)
        setPriceRange([0, roundedMax])
        setTrains(fetchedTrains)
      } catch (err) {
        setError(err.response?.data?.message || 'No trains found for this route')
        setTrains([])
      }
      setLoading(false)
    }
    fetchTrains()
  }, [from, to, selectedClass])

  // Fetch alternate routes
  useEffect(() => {
    const fetchAlternateRoutes = async () => {
      if (!showAlternate) return
      try {
        setLoadingAlternate(true)
       const res = await alternateAPI.find(from, to, sortBy)
        setAlternateRoutes(res.data.alternateRoutes || [])
      } catch (err) {
        setAlternateRoutes([])
      }
      setLoadingAlternate(false)
    }
    fetchAlternateRoutes()
  }, [showAlternate, from, to, sortBy])

  // Generate 10 days
  const generateDates = () => {
    const dates = []
    for (let i = 0; i < 10; i++) {
      const d = new Date(originalDate)
      d.setDate(d.getDate() + i)
      const dateStr = d.toISOString().split('T')[0]
      const dayName = d.toLocaleDateString('en-IN', { weekday: 'short' })
      const dayNum = d.getDate()
      const month = d.toLocaleDateString('en-IN', { month: 'short' })
      dates.push({ dateStr, label: `${dayName} ${dayNum} ${month}` })
    }
    return dates
  }

  const handleDateClick = (dateStr) => {
    setSelectedDate(dateStr)
    navigate(
      `/trains?from=${from}&to=${to}&date=${dateStr}&class=${selectedClass}&cheapest=${showCheapest}`,
      { replace: true }
    )
  }

  const resetFilters = () => {
    setSortBy('recommended')
    setDepartureFilter([])
    setClassFilter([])
    setPriceRange([0, maxPrice])
  }

  const hasActiveFilters = sortBy !== 'recommended' ||
    departureFilter.length > 0 ||
    classFilter.length > 0 ||
    priceRange[1] < maxPrice

  // Sort and filter — useMemo ensures it reruns when any filter changes
  const sortedTrains = useMemo(() => {
    let filtered = trains.filter(t => !t.isAlternate)

    // Departure time filter
    if (departureFilter.length > 0) {
      filtered = filtered.filter(train => {
        const hour = parseInt(train.departureTime.split(':')[0])
        return departureFilter.some(slot => {
          if (slot === 'early') return hour >= 0 && hour < 6
          if (slot === 'morning') return hour >= 6 && hour < 12
          if (slot === 'afternoon') return hour >= 12 && hour < 18
          if (slot === 'night') return hour >= 18 && hour < 24
          return true
        })
      })
    }

    // Class filter
    if (classFilter.length > 0) {
      filtered = filtered.filter(train =>
        train.classes.some(cls => classFilter.includes(cls.className))
      )
    }

    // Price range filter
    filtered = filtered.filter(train =>
      train.classes.some(cls =>
        cls.price >= priceRange[0] && cls.price <= priceRange[1]
      )
    )

    // Sorting
    if (sortBy === 'cheapest') {
      return [...filtered].sort((a, b) => {
        const aPrice = Math.min(...a.classes.map(c => c.price))
        const bPrice = Math.min(...b.classes.map(c => c.price))
        return aPrice - bPrice
      })
    }

    if (sortBy === 'fastest') {
      return [...filtered].sort((a, b) => {
        const parseDuration = (dur) => {
          const match = dur.match(/(\d+)h\s*(\d+)?m?/)
          if (!match) return 0
          return parseInt(match[1]) * 60 + parseInt(match[2] || 0)
        }
        return parseDuration(a.duration) - parseDuration(b.duration)
      })
    }

    if (sortBy === 'wlChance') {
      return [...filtered].sort((a, b) => {
        const getClassProb = (train) => {
          const cls = train.classes.find(c => c.className === selectedClass)
          return cls ? cls.confirmChance : -1
        }
        const aProb = getClassProb(a)
        const bProb = getClassProb(b)
        if (bProb !== aProb) return bProb - aProb
        const avgProb = (train) =>
          train.classes.reduce((sum, c) => sum + c.confirmChance, 0) / train.classes.length
        return avgProb(b) - avgProb(a)
      })
    }

    if (sortBy === 'availability') {
      return [...filtered].sort((a, b) => {
        const getAvail = (train) =>
          train.classes.filter(c => c.availableSeats > 0).length
        return getAvail(b) - getAvail(a)
      })
    }

    return filtered
  }, [trains, departureFilter, classFilter, priceRange, sortBy, selectedClass])

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <Navbar />

      <div className="container mt-4">

        {/* Heading */}
        <div className="d-flex justify-content-between align-items-center mb-1">
          <h5 className="fw-bold mb-0">
            {from?.charAt(0).toUpperCase() + from?.slice(1).toLowerCase()} to{' '}
            {to?.charAt(0).toUpperCase() + to?.slice(1).toLowerCase()} Trains
          </h5>
          {!loading && sortedTrains.length > 0 && (
            <span className="text-muted small">
              {sortedTrains.length} train{sortedTrains.length !== 1 ? 's' : ''} found
            </span>
          )}
        </div>
        <p className="text-muted small mb-3">Showing trains for {selectedDate}</p>

        {/* Date Strip */}
        <div className="card mb-3 shadow-sm">
          <div
            className="d-flex overflow-auto p-2 gap-2"
            style={{ scrollbarWidth: 'thin' }}
          >
            {generateDates().map(({ dateStr, label }) => (
              <div
                key={dateStr}
                className="text-center px-3 py-2 rounded flex-shrink-0"
                style={{
                  cursor: 'pointer',
                  backgroundColor: selectedDate === dateStr ? '#e63946' : 'white',
                  color: selectedDate === dateStr ? 'white' : '#333',
                  minWidth: '90px',
                  border: selectedDate === dateStr
                    ? '2px solid #e63946'
                    : '1px solid #dee2e6',
                  transition: 'all 0.2s'
                }}
                onClick={() => handleDateClick(dateStr)}
              >
                <div className="small fw-semibold">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="row">

          {/* Filter Panel */}
          <div className="col-md-3">
            <div className="card shadow-sm p-3" style={{ borderRadius: '12px' }}>

              {/* Filter Header */}
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-bold mb-0">Filters</h6>
                {hasActiveFilters && (
                  <button
                    className="btn btn-sm"
                    style={{
                      fontSize: '11px',
                      color: '#e63946',
                      padding: '2px 8px',
                      border: '1px solid #e63946',
                      borderRadius: '6px'
                    }}
                    onClick={resetFilters}
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Active filter warning */}
              {hasActiveFilters && (
                <div className="mb-3 p-2 rounded"
                  style={{ backgroundColor: '#fff5f5', fontSize: '11px', color: '#e63946' }}>
                  🔴 Filters active — some trains may be hidden
                </div>
              )}

              {/* Sort By */}
              <div className="mb-3 pb-3 border-bottom">
                <div className="fw-semibold small mb-2">Sort By</div>
                {[
                  { value: 'recommended', label: '⭐ Recommended' },
                  { value: 'cheapest', label: '💰 Cheapest First' },
                  { value: 'fastest', label: '⚡ Fastest First' },
                  { value: 'wlChance', label: '🎯 WL Probability', sub: 'by your class' },
                  { value: 'availability', label: '✅ Best Availability' }
                ].map(option => (
                  <div key={option.value} className="form-check mb-1">
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
                      {option.sub && (
                        <span className="text-muted ms-1" style={{ fontSize: '10px' }}>
                          ({option.sub})
                        </span>
                      )}
                    </label>
                  </div>
                ))}
              </div>

              {/* Price Range */}
              <div className="mb-3 pb-3 border-bottom">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div className="fw-semibold small">Price Range</div>
                  <div className="small text-muted">
                    ₹0 — ₹{priceRange[1].toLocaleString()}
                  </div>
                </div>
                <input
                  type="range"
                  className="form-range"
                  min={0}
                  max={maxPrice}
                  step={100}
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                  style={{ accentColor: '#e63946' }}
                />
                <div className="d-flex justify-content-between"
                  style={{ fontSize: '10px', color: '#9ca3af' }}>
                  <span>₹0</span>
                  <span>₹{maxPrice.toLocaleString()}</span>
                </div>
                {priceRange[1] < maxPrice && (
                  <div className="small mt-1" style={{ color: '#e63946', fontSize: '11px' }}>
                    Showing trains with class under ₹{priceRange[1].toLocaleString()}
                  </div>
                )}
              </div>

              {/* Class Filter */}
              <div className="mb-3 pb-3 border-bottom">
                <div className="fw-semibold small mb-2">Train Class</div>
                <div className="d-flex flex-wrap gap-1">
                  {['SL', '3A', '2A', '1A'].map(cls => (
                    <div
                      key={cls}
                      onClick={() => {
                        setClassFilter(prev =>
                          prev.includes(cls)
                            ? prev.filter(c => c !== cls)
                            : [...prev, cls]
                        )
                      }}
                      style={{
                        cursor: 'pointer',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '500',
                        border: '1px solid',
                        borderColor: classFilter.includes(cls) ? '#e63946' : '#dee2e6',
                        backgroundColor: classFilter.includes(cls) ? '#e63946' : 'white',
                        color: classFilter.includes(cls) ? 'white' : '#374151',
                        transition: 'all 0.15s',
                        userSelect: 'none'
                      }}
                    >
                      {cls}
                    </div>
                  ))}
                </div>
                {classFilter.length > 0 && (
                  <div className="small mt-1" style={{ color: '#e63946', fontSize: '11px' }}>
                    Showing: {classFilter.join(', ')} only
                  </div>
                )}
              </div>

              {/* Departure Time */}
              <div className="mb-3 pb-3 border-bottom">
                <div className="fw-semibold small mb-2">Departure Time</div>
                <div className="row g-1">
                  {[
                    { label: 'Early Morning', sub: '00:00-06:00', value: 'early', icon: '🌙' },
                    { label: 'Morning', sub: '06:00-12:00', value: 'morning', icon: '🌅' },
                    { label: 'Afternoon', sub: '12:00-18:00', value: 'afternoon', icon: '☀️' },
                    { label: 'Night', sub: '18:00-24:00', value: 'night', icon: '🌆' }
                  ].map(slot => (
                    <div key={slot.value} className="col-6">
                      <div
                        className="border rounded p-1 text-center"
                        style={{
                          cursor: 'pointer',
                          backgroundColor: departureFilter.includes(slot.value) ? '#e63946' : 'white',
                          color: departureFilter.includes(slot.value) ? 'white' : '#374151',
                          transition: 'all 0.15s',
                          borderColor: departureFilter.includes(slot.value) ? '#e63946' : '#dee2e6',
                          userSelect: 'none'
                        }}
                        onClick={() => {
                          setDepartureFilter(prev =>
                            prev.includes(slot.value)
                              ? prev.filter(v => v !== slot.value)
                              : [...prev, slot.value]
                          )
                        }}
                      >
                        <div style={{ fontSize: '14px' }}>{slot.icon}</div>
                        <div style={{ fontSize: '10px', fontWeight: '600' }}>{slot.label}</div>
                        <div style={{ fontSize: '9px', opacity: 0.8 }}>{slot.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alternate Routes */}
              <div>
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
                  <div className="small text-muted mt-1" style={{ fontSize: '11px' }}>
                    Showing high-chance connecting routes
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Train Cards + Alternate Routes */}
          <div className="col-md-9">

            {loading ? (
              <div className="text-center mt-5">
                <div className="spinner-border text-danger" role="status"></div>
                <p className="mt-2 text-muted">Searching trains...</p>
              </div>
            ) : error ? (
              <div className="card p-4 text-center border-0 mt-3"
                style={{ backgroundColor: '#fff5f5', borderRadius: '12px' }}>
                <div style={{ fontSize: '32px' }}>🚂</div>
                <div className="fw-semibold mt-2">No trains found</div>
                <div className="text-muted small mt-1">{error}</div>
                <div className="text-muted small mt-1">
                  Check spelling of station names or try a different route
                </div>
              </div>
            ) : sortedTrains.length === 0 ? (
              <div className="card p-4 text-center border-0 mt-3"
                style={{ backgroundColor: '#fff5f5', borderRadius: '12px' }}>
                <div style={{ fontSize: '32px' }}>🔍</div>
                <div className="fw-semibold mt-2">No trains match filters</div>
                <div className="text-muted small mt-1">
                  Try adjusting price range, class or departure time
                </div>
                <button
                  className="btn btn-sm mt-2"
                  style={{
                    border: '1px solid #e63946',
                    color: '#e63946',
                    borderRadius: '8px'
                  }}
                  onClick={resetFilters}
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              sortedTrains.map(train => (
                <TrainCard key={train._id} train={train} />
              ))
            )}

            {/* Alternate Routes Section */}
            {showAlternate && (
              <div className="mt-4">
                <h6 className="fw-bold mb-3">🔀 Alternate Routes</h6>
                {loadingAlternate ? (
                  <div className="text-center mt-3">
                    <div className="spinner-border text-warning" role="status"></div>
                    <p className="mt-2 text-muted small">Finding best alternate routes...</p>
                  </div>
                ) : alternateRoutes.length > 0 ? (
                  alternateRoutes.map((route, index) => (
                    <AlternateRouteCard key={index} route={route} />
                  ))
                ) : (
                  <div className="card p-4 text-center border-0"
                    style={{ backgroundColor: '#fef9ec', borderRadius: '12px' }}>
                    <div style={{ fontSize: '32px' }}>🔍</div>
                    <div className="fw-semibold mt-2">No alternate routes found</div>
                    <div className="text-muted small mt-1">
                      All connecting routes have low confirmation chances
                      or don't meet timing constraints
                    </div>
                    <div className="text-muted small mt-1">
                      Try a different date or remove class filter
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}

export default TrainList