import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

function Home() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    from: '',
    to: '',
    date: '',
    class: 'ALL'
  })

  const [findCheapest, setFindCheapest] = useState(false)
  const [error, setError] = useState('')
  const [searching, setSearching] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    // Clear error on input change
    if (error) setError('')
  }

  const handleSearch = () => {
    // Trim inputs
    const from = formData.from.trim()
    const to = formData.to.trim()
    const date = formData.date

    // Validation
    if (!from || !to || !date) {
      setError('Please fill all fields before searching')
      return
    }

    if (from.toLowerCase() === to.toLowerCase()) {
      setError('Source and destination cannot be the same')
      return
    }

    if (from.length < 2 || to.length < 2) {
      setError('Please enter valid station names')
      return
    }

    setError('')
    setSearching(true)

    // Small delay for button feedback
    setTimeout(() => {
      navigate(
        `/trains?from=${from}&to=${to}&date=${date}&class=${formData.class}&cheapest=${findCheapest}`
      )
      setSearching(false)
    }, 300)
  }

  // Allow search on Enter key
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch()
  }

  const features = [
  {
    icon: '🔀',
    title: 'Alternate Routes',
    desc: 'Find routes when direct trains are full or waitlisted',
    bgColor: '#fee2e2',
    iconColor: '#dc2626'
  },
  {
    icon: '💰',
    title: 'Cheapest Route',
    desc: 'Save money with smart multi-train route suggestions',
    bgColor: '#dcfce7',
    iconColor: '#16a34a'
  },
  {
    icon: '🔔',
    title: 'Smart WL Alerts',
    desc: 'Get notified when WL confirmation chance drops',
    bgColor: '#fef3c7',
    iconColor: '#d97706'
  },
  {
    icon: '⚡',
    title: 'Tatkal Autofill',
    desc: 'Book Tatkal tickets in seconds with saved passengers',
    bgColor: '#ede9fe',
    iconColor: '#7c3aed'
  }
]

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <Navbar />

      <div className="container mt-4">

        {/* Search Card */}
        <div className="card shadow-sm p-4" style={{ borderRadius: '12px' }}>

          <h6 className="fw-semibold mb-3" style={{ color: '#374151' }}>
            🚂 Search Trains
          </h6>

          {/* Search Form */}
          <div className="row g-2 align-items-end">

            {/* From */}
            <div className="col-md-3">
              <label className="form-label small fw-semibold text-muted">From</label>
              <input
                type="text"
                name="from"
                className="form-control"
                placeholder="e.g. Delhi"
                value={formData.from}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                style={{ borderRadius: '8px' }}
              />
            </div>

            {/* Swap icon */}
            <div className="col-md-auto d-none d-md-flex align-items-end pb-1">
              <span
                style={{
                  cursor: 'pointer',
                  fontSize: '18px',
                  color: '#9ca3af'
                }}
                onClick={() => setFormData(prev => ({
                  ...prev,
                  from: prev.to,
                  to: prev.from
                }))}
                title="Swap source and destination"
              >
                ⇄
              </span>
            </div>

            {/* To */}
            <div className="col-md-3">
              <label className="form-label small fw-semibold text-muted">To</label>
              <input
                type="text"
                name="to"
                className="form-control"
                placeholder="e.g. Mumbai"
                value={formData.to}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                style={{ borderRadius: '8px' }}
              />
            </div>

            {/* Date */}
            <div className="col-md-2">
              <label className="form-label small fw-semibold text-muted">Date</label>
              <input
                type="date"
                name="date"
                className="form-control"
                value={formData.date}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                style={{ borderRadius: '8px' }}
              />
            </div>

            {/* Class */}
            <div className="col-md-2">
              <label className="form-label small fw-semibold text-muted">Class</label>
              <select
                name="class"
                className="form-select"
                value={formData.class}
                onChange={handleChange}
                style={{ borderRadius: '8px' }}
              >
                <option value="ALL">All Classes</option>
                <option value="SL">Sleeper (SL)</option>
                <option value="3A">AC 3 Tier (3A)</option>
                <option value="2A">AC 2 Tier (2A)</option>
                <option value="1A">AC First Class (1A)</option>
              </select>
            </div>

            {/* Search Button */}
            <div className="col-md-2">
              <button
                className="btn w-100"
                style={{
                  backgroundColor: searching ? '#c1121f' : '#e63946',
                  color: 'white',
                  borderRadius: '8px',
                  transition: 'background-color 0.2s'
                }}
                onClick={handleSearch}
                disabled={searching}
              >
                {searching ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1"
                      role="status"></span>
                    Searching...
                  </>
                ) : (
                  'Search →'
                )}
              </button>
            </div>

          </div>

          {/* Error */}
          {error && (
            <div className="alert alert-danger mt-3 py-2 mb-0"
              style={{ borderRadius: '8px', fontSize: '13px' }}>
              ⚠️ {error}
            </div>
          )}

          {/* Cheapest Alternate Routes Toggle */}
          <div className="mt-3 pt-3 border-top d-flex align-items-center gap-2">
            <input
              type="checkbox"
              id="cheapest"
              className="form-check-input"
              checked={findCheapest}
              onChange={(e) => setFindCheapest(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <label
              htmlFor="cheapest"
              className="form-check-label small"
              style={{ cursor: 'pointer' }}
            >
              🔍 Also find cheapest alternate routes
              <span
                className="badge ms-2"
                style={{ backgroundColor: '#e63946', fontSize: '10px' }}
              >
                RailSmart
              </span>
            </label>
          </div>

        </div>

        {/* Feature Cards */}
        <div className="row mt-4 g-3">
  {features.map((feature, index) => (
    <div key={index} className="col-md-3">
      <div
        className="card border-0 shadow-sm h-100 p-3 text-center"
        style={{
          borderRadius: '14px',
          transition: 'transform 0.2s, box-shadow 0.2s',
          cursor: 'default'
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-4px)'
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = ''
        }}
      >
        <div
          className="mx-auto mb-3"
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: feature.bgColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px'
          }}
        >
          {feature.icon}
        </div>
        <div style={{ fontWeight: '600', fontSize: '14px', color: '#111827' }}>
          {feature.title}
        </div>
        <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px', lineHeight: '1.5' }}>
          {feature.desc}
        </div>
      </div>
    </div>
  ))}
</div>

      </div>
    </div>
  )
}

export default Home