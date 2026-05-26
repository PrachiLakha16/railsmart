import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import axios from 'axios'

function Booking() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  // Train details from URL params
  const trainId = searchParams.get('trainId')
  const selectedClass = searchParams.get('class')
  const price = searchParams.get('price')
  const trainName = searchParams.get('trainName')
  const trainNumber = searchParams.get('trainNumber')
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const departure = searchParams.get('departure')
  const arrival = searchParams.get('arrival')

  const [savedPassengers, setSavedPassengers] = useState([])
  const [paymentPreference, setPaymentPreference] = useState('UPI')
  const [loadingAutofill, setLoadingAutofill] = useState(false)

  // Passenger form state
  const [passengers, setPassengers] = useState([
    {
      name: '',
      age: '',
      gender: 'Male',
      berthPreference: 'No Preference',
      idType: 'Aadhaar',
      idNumber: ''
    }
  ])

  const [isTatkal, setIsTatkal] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState('UPI')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Fetch saved passengers for autofill
  useEffect(() => {
    const fetchAutofillData = async () => {
      try {
        setLoadingAutofill(true)
        const res = await axios.get(
          'http://localhost:5000/api/booking/autofill',
          { headers: { Authorization: `Bearer ${token}` } }
        )
        setSavedPassengers(res.data.savedPassengers || [])
        setPaymentPreference(res.data.paymentPreference || 'UPI')
        setSelectedPayment(res.data.paymentPreference || 'UPI')
      } catch (err) {
        console.log('Could not fetch autofill data')
      }
      setLoadingAutofill(false)
    }
    fetchAutofillData()
  }, [])

  // Add passenger row
  const addPassenger = () => {
    if (passengers.length >= 6) {
      setError('Maximum 6 passengers per booking')
      return
    }
    setPassengers([...passengers, {
      name: '',
      age: '',
      gender: 'Male',
      berthPreference: 'No Preference',
      idType: 'Aadhaar',
      idNumber: ''
    }])
  }

  // Remove passenger row
  const removePassenger = (index) => {
    if (passengers.length === 1) return
    setPassengers(passengers.filter((_, i) => i !== index))
  }

  // Update passenger field
  const updatePassenger = (index, field, value) => {
    const updated = [...passengers]
    updated[index][field] = value
    setPassengers(updated)
    if (error) setError('')
  }

  // ONE CLICK AUTOFILL — Core Tatkal feature
  const handleAutofill = (savedPassenger, index) => {
    const updated = [...passengers]
    updated[index] = {
      name: savedPassenger.name,
      age: savedPassenger.age,
      gender: savedPassenger.gender,
      berthPreference: savedPassenger.berthPreference,
      idType: savedPassenger.idType,
      idNumber: savedPassenger.idNumber || ''
    }
    setPassengers(updated)
  }

  // Autofill ALL passengers at once
  const handleAutofillAll = () => {
    if (savedPassengers.length === 0) {
      setError('No saved passengers found. Add passengers in Dashboard first.')
      return
    }
    const filled = savedPassengers.slice(0, passengers.length).map(p => ({
      name: p.name,
      age: p.age,
      gender: p.gender,
      berthPreference: p.berthPreference,
      idType: p.idType,
      idNumber: p.idNumber || ''
    }))
    setPassengers(filled)
    setSelectedPayment(paymentPreference)
    setError('')
  }

  // Validate form
  const validateForm = () => {
    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i]
      if (!p.name.trim()) {
        setError(`Passenger ${i + 1}: Name is required`)
        return false
      }
      if (!p.age || p.age < 1 || p.age > 120) {
        setError(`Passenger ${i + 1}: Valid age is required`)
        return false
      }
      if (!p.gender) {
        setError(`Passenger ${i + 1}: Gender is required`)
        return false
      }
    }
    return true
  }

  // Handle booking submit
  const handleSubmit = () => {
    setError('')
    if (!validateForm()) return

    // Show success — real payment integration would go here
    setSuccess('Booking confirmed! PNR will be generated shortly.')
    setTimeout(() => {
      navigate('/')
    }, 3000)
  }

  const totalPrice = price * passengers.length

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <Navbar />

      <div className="container mt-4">

        {/* Header */}
        <div className="d-flex align-items-center gap-2 mb-4">
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>
          <h5 className="fw-bold mb-0">Book Ticket</h5>
        </div>

        <div className="row g-3">

          {/* Left — Booking Form */}
          <div className="col-md-8">

            {/* Train Summary */}
            <div className="card shadow-sm p-3 mb-3" style={{ borderRadius: '12px' }}>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="fw-bold">{trainNumber} · {trainName}</div>
                  <div className="text-muted small mt-1">
                    {from} → {to} · {departure} - {arrival}
                  </div>
                </div>
                <div className="text-end">
                  <div className="badge" style={{
                    backgroundColor: '#e63946',
                    fontSize: '13px',
                    padding: '6px 10px'
                  }}>
                    {selectedClass}
                  </div>
                  <div className="fw-bold mt-1">₹{price}/person</div>
                </div>
              </div>

              {/* Tatkal Toggle */}
              <div className="mt-3 pt-3 border-top d-flex align-items-center gap-2">
                <input
                  type="checkbox"
                  id="tatkal"
                  className="form-check-input"
                  checked={isTatkal}
                  onChange={(e) => setIsTatkal(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                <label htmlFor="tatkal" className="form-check-label small fw-semibold"
                  style={{ cursor: 'pointer' }}>
                  ⚡ Tatkal Booking
                  <span className="badge ms-2 bg-warning text-dark"
                    style={{ fontSize: '10px' }}>
                    +₹{Math.floor(price * 0.3)} extra
                  </span>
                </label>
              </div>
            </div>

            {/* Tatkal Autofill Banner */}
            {savedPassengers.length > 0 && (
              <div className="card p-3 mb-3" style={{
                borderRadius: '12px',
                backgroundColor: '#fff7ed',
                border: '1px solid #fed7aa'
              }}>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="fw-semibold small" style={{ color: '#c2410c' }}>
                      ⚡ Tatkal Autofill Available
                    </div>
                    <div className="text-muted small mt-1">
                      {savedPassengers.length} saved passenger(s) found
                    </div>
                  </div>
                  <button
                    className="btn btn-sm fw-semibold"
                    style={{
                      backgroundColor: '#ea580c',
                      color: 'white',
                      borderRadius: '8px'
                    }}
                    onClick={handleAutofillAll}
                  >
                    ⚡ One-Click Fill All
                  </button>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="alert alert-danger py-2 small mb-3">
                ⚠️ {error}
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="alert alert-success py-2 small mb-3">
                ✅ {success}
              </div>
            )}

            {/* Passenger Forms */}
            {passengers.map((passenger, index) => (
              <div key={index} className="card shadow-sm p-3 mb-3"
                style={{ borderRadius: '12px' }}>

                {/* Passenger header */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="fw-semibold small">
                    👤 Passenger {index + 1}
                  </div>
                  <div className="d-flex gap-2 align-items-center">

                    {/* Individual autofill dropdown */}
                    {savedPassengers.length > 0 && (
                      <div className="dropdown">
                        <button
                          className="btn btn-sm btn-outline-warning dropdown-toggle"
                          style={{ fontSize: '11px' }}
                          data-bs-toggle="dropdown"
                        >
                          ⚡ Autofill
                        </button>
                        <ul className="dropdown-menu">
                          {savedPassengers.map((sp, i) => (
                            <li key={i}>
                              <button
                                className="dropdown-item small"
                                onClick={() => handleAutofill(sp, index)}
                              >
                                {sp.name} · {sp.age}y · {sp.gender}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Remove button */}
                    {passengers.length > 1 && (
                      <button
                        className="btn btn-sm btn-outline-danger"
                        style={{ fontSize: '11px' }}
                        onClick={() => removePassenger(index)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                <div className="row g-2">

                  {/* Name */}
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold">Name *</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Full name"
                      value={passenger.name}
                      onChange={(e) => updatePassenger(index, 'name', e.target.value)}
                    />
                  </div>

                  {/* Age */}
                  <div className="col-md-2">
                    <label className="form-label small fw-semibold">Age *</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      placeholder="Age"
                      value={passenger.age}
                      onChange={(e) => updatePassenger(index, 'age', e.target.value)}
                      min="1"
                      max="120"
                    />
                  </div>

                  {/* Gender */}
                  <div className="col-md-3">
                    <label className="form-label small fw-semibold">Gender *</label>
                    <select
                      className="form-select form-select-sm"
                      value={passenger.gender}
                      onChange={(e) => updatePassenger(index, 'gender', e.target.value)}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Berth */}
                  <div className="col-md-3">
                    <label className="form-label small fw-semibold">Berth</label>
                    <select
                      className="form-select form-select-sm"
                      value={passenger.berthPreference}
                      onChange={(e) => updatePassenger(index, 'berthPreference', e.target.value)}
                    >
                      <option value="No Preference">No Preference</option>
                      <option value="Lower">Lower</option>
                      <option value="Middle">Middle</option>
                      <option value="Upper">Upper</option>
                      <option value="Side Lower">Side Lower</option>
                      <option value="Side Upper">Side Upper</option>
                    </select>
                  </div>

                  {/* ID Type */}
                  <div className="col-md-3">
                    <label className="form-label small fw-semibold">ID Type</label>
                    <select
                      className="form-select form-select-sm"
                      value={passenger.idType}
                      onChange={(e) => updatePassenger(index, 'idType', e.target.value)}
                    >
                      <option value="Aadhaar">Aadhaar</option>
                      <option value="PAN">PAN</option>
                      <option value="Passport">Passport</option>
                      <option value="Driving License">Driving License</option>
                    </select>
                  </div>

                  {/* ID Number */}
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold">ID Number</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Optional"
                      value={passenger.idNumber}
                      onChange={(e) => updatePassenger(index, 'idNumber', e.target.value)}
                    />
                  </div>

                </div>
              </div>
            ))}

            {/* Add Passenger Button */}
            {passengers.length < 6 && (
              <button
                className="btn btn-sm btn-outline-secondary w-100 mb-3"
                onClick={addPassenger}
              >
                + Add Another Passenger
              </button>
            )}

          </div>

          {/* Right — Price Summary + Payment */}
          <div className="col-md-4">

            {/* Price Summary */}
            <div className="card shadow-sm p-3 mb-3" style={{ borderRadius: '12px' }}>
              <h6 className="fw-bold mb-3">💰 Price Summary</h6>

              <div className="d-flex justify-content-between small mb-2">
                <span className="text-muted">Base fare × {passengers.length}</span>
                <span>₹{price} × {passengers.length}</span>
              </div>

              {isTatkal && (
                <div className="d-flex justify-content-between small mb-2">
                  <span className="text-muted">Tatkal charge</span>
                  <span style={{ color: '#ea580c' }}>
                    +₹{Math.floor(price * 0.3) * passengers.length}
                  </span>
                </div>
              )}

              <div className="d-flex justify-content-between small mb-2">
                <span className="text-muted">Service charge</span>
                <span>₹{15 * passengers.length}</span>
              </div>

              <div className="border-top pt-2 mt-2 d-flex justify-content-between fw-bold">
                <span>Total</span>
                <span style={{ color: '#e63946', fontSize: '16px' }}>
                  ₹{
                    (parseInt(price) * passengers.length) +
                    (isTatkal ? Math.floor(price * 0.3) * passengers.length : 0) +
                    (15 * passengers.length)
                  }
                </span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="card shadow-sm p-3 mb-3" style={{ borderRadius: '12px' }}>
              <h6 className="fw-bold mb-3">💳 Payment Method</h6>

              {['UPI', 'Card', 'Net Banking', 'Wallet'].map(method => (
                <div key={method} className="form-check mb-2">
                  <input
                    type="radio"
                    className="form-check-input"
                    name="payment"
                    id={method}
                    checked={selectedPayment === method}
                    onChange={() => setSelectedPayment(method)}
                  />
                  <label className="form-check-label small" htmlFor={method}>
                    {method === 'UPI' && '📱 '}
                    {method === 'Card' && '💳 '}
                    {method === 'Net Banking' && '🏦 '}
                    {method === 'Wallet' && '👛 '}
                    {method}
                    {method === paymentPreference && (
                      <span className="badge ms-2 bg-success"
                        style={{ fontSize: '9px' }}>
                        Preferred
                      </span>
                    )}
                  </label>
                </div>
              ))}
            </div>

            {/* Confirm Button */}
            <button
              className="btn w-100 fw-semibold"
              style={{
                backgroundColor: '#e63946',
                color: 'white',
                borderRadius: '10px',
                padding: '12px'
              }}
              onClick={handleSubmit}
            >
              Confirm Booking →
            </button>

            <div className="text-center mt-2">
              <small className="text-muted">
                🔒 Secure booking · No hidden charges
              </small>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default Booking