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
  const waitlistCount = parseInt(searchParams.get('waitlistCount') || 0)
  const confirmChance = parseInt(searchParams.get('confirmChance') || 100)

  const [savedPassengers, setSavedPassengers] = useState([])
  const [paymentPreference, setPaymentPreference] = useState('UPI')
  const [loadingAutofill, setLoadingAutofill] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [autofillSuccess, setAutofillSuccess] = useState(false)

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
  const [errors, setErrors] = useState({})
  const [globalError, setGlobalError] = useState('')
  const [success, setSuccess] = useState('')
  const [step, setStep] = useState(1) // 1=filling, 2=confirming, 3=done

  // Fetch autofill data
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

  // Add passenger
  const addPassenger = () => {
    if (passengers.length >= 6) {
      setGlobalError('Maximum 6 passengers per booking')
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
    setGlobalError('')
  }

  // Remove passenger
  const removePassenger = (index) => {
    if (passengers.length === 1) return
    setPassengers(passengers.filter((_, i) => i !== index))
    // Clear errors for removed passenger
    const newErrors = { ...errors }
    delete newErrors[`name_${index}`]
    delete newErrors[`age_${index}`]
    setErrors(newErrors)
  }

  // Update passenger field — clears field error on change
  const updatePassenger = (index, field, value) => {
    const updated = [...passengers]
    updated[index][field] = value
    setPassengers(updated)
    // Clear specific field error
    const newErrors = { ...errors }
    delete newErrors[`${field}_${index}`]
    setErrors(newErrors)
    setGlobalError('')
  }

  // Autofill single passenger
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
    // Clear errors for this passenger
    const newErrors = { ...errors }
    delete newErrors[`name_${index}`]
    delete newErrors[`age_${index}`]
    setErrors(newErrors)
  }

  // Autofill all passengers
  const handleAutofillAll = () => {
    if (savedPassengers.length === 0) {
      setGlobalError('No saved passengers found. Add passengers in Dashboard first.')
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
    // If fewer saved passengers than form rows — keep remaining empty
    const updatedPassengers = passengers.map((p, i) =>
      filled[i] ? filled[i] : p
    )
    setPassengers(updatedPassengers)
    setSelectedPayment(paymentPreference)
    setErrors({})
    setGlobalError('')
    setAutofillSuccess(true)
    setTimeout(() => setAutofillSuccess(false), 2000)
  }

  // Field-level validation
  const validateForm = () => {
    const newErrors = {}
    let valid = true

    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i]

      if (!p.name.trim()) {
        newErrors[`name_${i}`] = 'Name required'
        valid = false
      } else if (p.name.trim().length < 2) {
        newErrors[`name_${i}`] = 'Name too short'
        valid = false
      }

      if (!p.age) {
        newErrors[`age_${i}`] = 'Age required'
        valid = false
      } else if (parseInt(p.age) < 1 || parseInt(p.age) > 120) {
        newErrors[`age_${i}`] = 'Invalid age'
        valid = false
      }
    }

    setErrors(newErrors)
    if (!valid) {
      setGlobalError('Please fix the errors below before confirming')
    }
    return valid
  }

  // Handle confirm button click — show summary first
  const handleConfirmClick = () => {
    setGlobalError('')
    if (!validateForm()) return
    setStep(2) // Show confirmation summary
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Final booking submit
  const handleSubmit = async () => {
    setSubmitting(true)
    setGlobalError('')

    try {
      // Auto-create WL alert if waitlisted
      if (waitlistCount > 0) {
        try {
          await axios.post(
            'http://localhost:5000/api/wl-alerts',
            {
              trainId,
              trainNumber,
              trainName,
              from,
              to,
              journeyDate: new Date().toISOString(),
              selectedClass,
              currentWLNumber: waitlistCount,
              currentConfirmChance: confirmChance,
              triggerWhenChanceAbove: 70
            },
            { headers: { Authorization: `Bearer ${token}` } }
          )
        } catch (alertErr) {
          // Don't block booking if alert fails
          console.log('WL alert creation failed silently')
        }
      }

      // Simulate booking success
      setStep(3)
      setSuccess('Booking confirmed!')

    } catch (err) {
      setGlobalError('Booking failed. Please try again.')
      setStep(1)
    }

    setSubmitting(false)
  }

  // Price calculations
  const baseFare = parseInt(price) * passengers.length
  const tatkalCharge = isTatkal ? Math.floor(parseInt(price) * 0.3) * passengers.length : 0
  const serviceCharge = 15 * passengers.length
  const totalFare = baseFare + tatkalCharge + serviceCharge

  // ─── STEP 3 — Success Screen ───
  if (step === 3) {
    return (
      <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
        <Navbar />
        <div className="container mt-5">
          <div className="card shadow-sm p-5 text-center mx-auto"
            style={{ borderRadius: '16px', maxWidth: '480px' }}>
            <div style={{ fontSize: '56px' }}>🎉</div>
            <h5 className="fw-bold mt-3">Booking Confirmed!</h5>
            <p className="text-muted small mt-2">
              Your ticket for {trainName} has been booked successfully.
            </p>

            <div className="border rounded p-3 mt-3 text-start"
              style={{ backgroundColor: '#f9fafb', borderRadius: '10px' }}>
              <div className="d-flex justify-content-between small mb-1">
                <span className="text-muted">Train</span>
                <span className="fw-semibold">{trainNumber} · {trainName}</span>
              </div>
              <div className="d-flex justify-content-between small mb-1">
                <span className="text-muted">Route</span>
                <span className="fw-semibold">{from} → {to}</span>
              </div>
              <div className="d-flex justify-content-between small mb-1">
                <span className="text-muted">Class</span>
                <span className="fw-semibold">{selectedClass}</span>
              </div>
              <div className="d-flex justify-content-between small mb-1">
                <span className="text-muted">Passengers</span>
                <span className="fw-semibold">{passengers.length}</span>
              </div>
              <div className="d-flex justify-content-between small fw-bold mt-2 pt-2"
                style={{ borderTop: '1px dashed #e5e7eb' }}>
                <span>Total Paid</span>
                <span style={{ color: '#e63946' }}>₹{totalFare}</span>
              </div>
            </div>

            {waitlistCount > 0 && (
              <div className="alert alert-warning small mt-3 py-2">
                🔔 WL Alert set! You'll be notified if confirmation chance drops.
              </div>
            )}

            <div className="d-flex gap-2 mt-4">
              <button
                className="btn w-100"
                style={{ backgroundColor: '#e63946', color: 'white', borderRadius: '10px' }}
                onClick={() => navigate('/dashboard')}
              >
                View Dashboard
              </button>
              <button
                className="btn w-100 btn-outline-secondary"
                style={{ borderRadius: '10px' }}
                onClick={() => navigate('/')}
              >
                Search More
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ─── STEP 2 — Confirmation Summary ───
  if (step === 2) {
    return (
      <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
        <Navbar />
        <div className="container mt-4">

          <div className="d-flex align-items-center gap-2 mb-4">
            <button className="btn btn-sm btn-outline-secondary"
              onClick={() => setStep(1)}>
              ← Edit Details
            </button>
            <h5 className="fw-bold mb-0">Confirm Booking</h5>
          </div>

          <div className="row g-3">
            <div className="col-md-8">

              {/* Train Summary */}
              <div className="card shadow-sm p-3 mb-3" style={{ borderRadius: '12px' }}>
                <h6 className="fw-semibold mb-3">🚂 Journey Details</h6>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="fw-bold">{trainNumber} · {trainName}</div>
                    <div className="text-muted small mt-1">
                      {from} → {to} · {departure} - {arrival}
                    </div>
                    {isTatkal && (
                      <span className="badge bg-warning text-dark mt-1"
                        style={{ fontSize: '10px' }}>
                        ⚡ Tatkal
                      </span>
                    )}
                  </div>
                  <div className="text-end">
                    <div className="badge" style={{
                      backgroundColor: '#e63946',
                      fontSize: '13px',
                      padding: '6px 10px'
                    }}>
                      {selectedClass}
                    </div>
                  </div>
                </div>
              </div>

              {/* Passengers Summary */}
              <div className="card shadow-sm p-3 mb-3" style={{ borderRadius: '12px' }}>
                <h6 className="fw-semibold mb-3">👥 Passengers</h6>
                {passengers.map((p, i) => (
                  <div key={i} className="border rounded p-2 mb-2"
                    style={{ backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                    <div className="d-flex justify-content-between">
                      <div>
                        <span className="fw-semibold small">{p.name}</span>
                        <span className="text-muted small ms-2">
                          {p.age}y · {p.gender} · {p.berthPreference}
                        </span>
                      </div>
                      <span className="text-muted small">{p.idType}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Payment Summary */}
              <div className="card shadow-sm p-3 mb-3" style={{ borderRadius: '12px' }}>
                <h6 className="fw-semibold mb-2">💳 Payment</h6>
                <div className="text-muted small">
                  {selectedPayment === 'UPI' && '📱 '}
                  {selectedPayment === 'Card' && '💳 '}
                  {selectedPayment === 'Net Banking' && '🏦 '}
                  {selectedPayment === 'Wallet' && '👛 '}
                  {selectedPayment}
                </div>
              </div>

              {globalError && (
                <div className="alert alert-danger py-2 small">⚠️ {globalError}</div>
              )}

            </div>

            {/* Price + Confirm */}
            <div className="col-md-4">
              <div className="card shadow-sm p-3 mb-3" style={{ borderRadius: '12px' }}>
                <h6 className="fw-bold mb-3">💰 Price Summary</h6>
                <div className="d-flex justify-content-between small mb-2">
                  <span className="text-muted">Base fare × {passengers.length}</span>
                  <span>₹{baseFare}</span>
                </div>
                {isTatkal && (
                  <div className="d-flex justify-content-between small mb-2">
                    <span className="text-muted">Tatkal charge</span>
                    <span style={{ color: '#ea580c' }}>+₹{tatkalCharge}</span>
                  </div>
                )}
                <div className="d-flex justify-content-between small mb-2">
                  <span className="text-muted">Service charge</span>
                  <span>₹{serviceCharge}</span>
                </div>
                <div className="border-top pt-2 mt-2 d-flex justify-content-between fw-bold">
                  <span>Total</span>
                  <span style={{ color: '#e63946', fontSize: '16px' }}>₹{totalFare}</span>
                </div>
              </div>

              <button
                className="btn w-100 fw-semibold"
                style={{
                  backgroundColor: submitting ? '#c1121f' : '#e63946',
                  color: 'white',
                  borderRadius: '10px',
                  padding: '12px'
                }}
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Processing...
                  </>
                ) : (
                  `Pay ₹${totalFare} & Confirm →`
                )}
              </button>

              <div className="text-center mt-2">
                <small className="text-muted">🔒 Secure booking · No hidden charges</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ─── STEP 1 — Main Booking Form ───
  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <Navbar />

      <div className="container mt-4">

        {/* Header */}
        <div className="d-flex align-items-center gap-2 mb-4">
          <button className="btn btn-sm btn-outline-secondary"
            onClick={() => navigate(-1)}>
            ← Back
          </button>
          <h5 className="fw-bold mb-0">Book Ticket</h5>
          {/* Step indicator */}
          <div className="ms-auto d-flex align-items-center gap-2">
            <span className="badge"
              style={{ backgroundColor: '#e63946', fontSize: '11px' }}>
              Step 1/2: Fill Details
            </span>
          </div>
        </div>

        {/* WL Warning Banner */}
        {waitlistCount > 0 && (
          <div className="alert py-2 mb-3 d-flex align-items-center gap-2"
            style={{
              backgroundColor: '#fef9ec',
              border: '1px solid #fde68a',
              borderRadius: '10px'
            }}>
            <span>⚠️</span>
            <div className="small">
              <span className="fw-semibold">Waitlisted ticket: </span>
              WL {waitlistCount} · {confirmChance}% confirmation chance.
              A WL alert will be set automatically after booking.
            </div>
          </div>
        )}

        {/* Autofill success flash */}
        {autofillSuccess && (
          <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 9999,
            backgroundColor: '#16a34a',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            ⚡ All passengers filled!
          </div>
        )}

        <div className="row g-3">

          {/* Left — Form */}
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
                <input type="checkbox" id="tatkal"
                  className="form-check-input"
                  checked={isTatkal}
                  onChange={(e) => setIsTatkal(e.target.checked)}
                  style={{ cursor: 'pointer' }} />
                <label htmlFor="tatkal"
                  className="form-check-label small fw-semibold"
                  style={{ cursor: 'pointer' }}>
                  ⚡ Tatkal Booking
                  <span className="badge ms-2 bg-warning text-dark"
                    style={{ fontSize: '10px' }}>
                    +₹{Math.floor(parseInt(price) * 0.3)} extra per person
                  </span>
                </label>
              </div>
            </div>

            {/* Autofill Banner */}
            {loadingAutofill ? (
              <div className="card p-3 mb-3 text-center"
                style={{ borderRadius: '12px', backgroundColor: '#f9fafb' }}>
                <div className="spinner-border spinner-border-sm text-warning me-2"></div>
                <span className="small text-muted">Loading saved passengers...</span>
              </div>
            ) : savedPassengers.length > 0 ? (
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
                      {savedPassengers.length} saved passenger(s) — fills all fields instantly
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
            ) : (
              <div className="card p-3 mb-3" style={{
                borderRadius: '12px',
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb'
              }}>
                <div className="small text-muted">
                  💡 Save passengers in Dashboard for one-click Tatkal autofill
                </div>
              </div>
            )}

            {/* Global Error */}
            {globalError && (
              <div className="alert alert-danger py-2 small mb-3"
                style={{ borderRadius: '8px' }}>
                ⚠️ {globalError}
              </div>
            )}

            {/* Passenger Forms */}
            {passengers.map((passenger, index) => (
              <div key={index} className="card shadow-sm p-3 mb-3"
                style={{ borderRadius: '12px' }}>

                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="fw-semibold small">
                    👤 Passenger {index + 1}
                    {index === 0 && (
                      <span className="text-muted ms-1" style={{ fontSize: '10px' }}>
                        (Primary)
                      </span>
                    )}
                  </div>
                  <div className="d-flex gap-2 align-items-center">
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
                      className={`form-control form-control-sm ${errors[`name_${index}`] ? 'is-invalid' : passenger.name ? 'is-valid' : ''}`}
                      placeholder="Full name"
                      value={passenger.name}
                      onChange={(e) => updatePassenger(index, 'name', e.target.value)}
                    />
                    {errors[`name_${index}`] && (
                      <div className="invalid-feedback">{errors[`name_${index}`]}</div>
                    )}
                  </div>

                  {/* Age */}
                  <div className="col-md-2">
                    <label className="form-label small fw-semibold">Age *</label>
                    <input
                      type="number"
                      className={`form-control form-control-sm ${errors[`age_${index}`] ? 'is-invalid' : passenger.age ? 'is-valid' : ''}`}
                      placeholder="Age"
                      value={passenger.age}
                      onChange={(e) => updatePassenger(index, 'age', e.target.value)}
                      min="1"
                      max="120"
                    />
                    {errors[`age_${index}`] && (
                      <div className="invalid-feedback">{errors[`age_${index}`]}</div>
                    )}
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

            {/* Add Passenger */}
            {passengers.length < 6 && (
              <button
                className="btn btn-sm btn-outline-secondary w-100 mb-3"
                style={{ borderRadius: '8px', borderStyle: 'dashed' }}
                onClick={addPassenger}
              >
                + Add Another Passenger ({passengers.length}/6)
              </button>
            )}

          </div>

          {/* Right — Price + Payment */}
          <div className="col-md-4">

            {/* Price Summary */}
            <div className="card shadow-sm p-3 mb-3" style={{ borderRadius: '12px' }}>
              <h6 className="fw-bold mb-3">💰 Price Summary</h6>
              <div className="d-flex justify-content-between small mb-2">
                <span className="text-muted">Base fare × {passengers.length}</span>
                <span>₹{price} × {passengers.length} = ₹{baseFare}</span>
              </div>
              {isTatkal && (
                <div className="d-flex justify-content-between small mb-2">
                  <span className="text-muted">Tatkal charge</span>
                  <span style={{ color: '#ea580c' }}>+₹{tatkalCharge}</span>
                </div>
              )}
              <div className="d-flex justify-content-between small mb-2">
                <span className="text-muted">Service charge</span>
                <span>₹{serviceCharge}</span>
              </div>
              <div className="border-top pt-2 mt-2 d-flex justify-content-between fw-bold">
                <span>Total</span>
                <span style={{ color: '#e63946', fontSize: '16px' }}>₹{totalFare}</span>
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

            {/* Review Button */}
            <button
              className="btn w-100 fw-semibold"
              style={{
                backgroundColor: '#e63946',
                color: 'white',
                borderRadius: '10px',
                padding: '12px'
              }}
              onClick={handleConfirmClick}
            >
              Review & Confirm →
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