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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSearch = () => {
    // Basic validation
    if (!formData.from || !formData.to || !formData.date) {
      setError('Please fill all fields')
      return
    }

    if (formData.from.toLowerCase() === formData.to.toLowerCase()) {
      setError('Source and destination cannot be same')
      return
    }

    setError('')

    // Navigate to train list with search params
    navigate(`/trains?from=${formData.from}&to=${formData.to}&date=${formData.date}&class=${formData.class}&cheapest=${findCheapest}`)
  }

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <Navbar />

      <div className="container mt-4">

        {/* Search Card */}
        <div className="card shadow-sm p-4">

          {/* Title */}
          <h6 className="text-muted mb-3">Search Trains</h6>

          {/* Search Form */}
          <div className="row g-2 align-items-end">

            {/* From */}
            <div className="col-md-3">
              <label className="form-label small fw-semibold">From</label>
              <input
                type="text"
                name="from"
                className="form-control"
                placeholder="e.g. Delhi"
                value={formData.from}
                onChange={handleChange}
              />
            </div>

            {/* To */}
            <div className="col-md-3">
              <label className="form-label small fw-semibold">To</label>
              <input
                type="text"
                name="to"
                className="form-control"
                placeholder="e.g. Mumbai"
                value={formData.to}
                onChange={handleChange}
              />
            </div>

            {/* Date */}
            <div className="col-md-2">
              <label className="form-label small fw-semibold">Date</label>
              <input
                type="date"
                name="date"
                className="form-control"
                value={formData.date}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Class */}
            <div className="col-md-2">
              <label className="form-label small fw-semibold">Class</label>
              <select
                name="class"
                className="form-select"
                value={formData.class}
                onChange={handleChange}
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
                style={{ backgroundColor: '#e63946', color: 'white' }}
                onClick={handleSearch}
              >
                Search →
              </button>
            </div>

          </div>

          {/* Error */}
          {error && (
            <div className="alert alert-danger mt-3 py-2">{error}</div>
          )}

          {/* Unique Feature Toggle */}
          <div className="mt-3 pt-3 border-top d-flex align-items-center gap-2">
            <input
              type="checkbox"
              id="cheapest"
              className="form-check-input"
              checked={findCheapest}
              onChange={(e) => setFindCheapest(e.target.checked)}
            />
            <label htmlFor="cheapest" className="form-check-label small">
              🔍 Find Cheapest Alternate Routes
              <span className="badge ms-2" style={{ backgroundColor: '#e63946' }}>
                RailSmart Feature
              </span>
            </label>
          </div>

        </div>

        {/* Why RailSmart section */}
        <div className="row mt-4 g-3">
          <div className="col-md-3">
            <div className="card p-3 text-center border-0 shadow-sm">
              <div className="fs-4">🔀</div>
              <div className="fw-semibold mt-2">Alternate Routes</div>
              <div className="text-muted small">Find routes when direct trains are full</div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card p-3 text-center border-0 shadow-sm">
              <div className="fs-4">💰</div>
              <div className="fw-semibold mt-2">Cheapest Route</div>
              <div className="text-muted small">Save money with smart route suggestions</div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card p-3 text-center border-0 shadow-sm">
              <div className="fs-4">🔔</div>
              <div className="fw-semibold mt-2">Smart WL Alerts</div>
              <div className="text-muted small">Get notified when WL confirmation improves</div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card p-3 text-center border-0 shadow-sm">
              <div className="fs-4">⚡</div>
              <div className="fw-semibold mt-2">Tatkal Autofill</div>
              <div className="text-muted small">Book Tatkal tickets in seconds</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Home