import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import axios from 'axios'

function Dashboard() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user'))
  const token = localStorage.getItem('token')

  const [passengers, setPassengers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    berthPreference: 'No Preference',
    idType: 'Aadhaar',
    idNumber: ''
  })

  // Fetch passengers on load
  useEffect(() => {
    fetchPassengers()
  }, [])
  // Auto dismiss success message after 3 seconds
useEffect(() => {
  if (success) {
    const timer = setTimeout(() => setSuccess(''), 2000)
    return () => clearTimeout(timer)
  }
}, [success])

  const fetchPassengers = async () => {
    try {
      setLoading(true)
      const res = await axios.get('http://localhost:5000/api/passengers', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setPassengers(res.data.passengers)
    } catch (err) {
      setError('Failed to load passengers')
    }
    setLoading(false)
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const resetForm = () => {
    setFormData({
      name: '',
      age: '',
      gender: 'Male',
      berthPreference: 'No Preference',
      idType: 'Aadhaar',
      idNumber: ''
    })
    setEditingId(null)
    setShowForm(false)
    setError('')
  }

  const handleSubmit = async () => {
    setError('')
    setSuccess('')

    if (!formData.name || !formData.age || !formData.gender) {
      setError('Name, age and gender are required')
      return
    }

    try {
      if (editingId) {
        // Edit existing
        await axios.put(
          `http://localhost:5000/api/passengers/${editingId}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        setSuccess('Passenger updated successfully!')
      } else {
        // Add new
        await axios.post(
          'http://localhost:5000/api/passengers',
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        setSuccess('Passenger added successfully!')
      }
      await fetchPassengers()
      resetForm()
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    }
  }

  const handleEdit = (passenger) => {
    setFormData({
      name: passenger.name,
      age: passenger.age,
      gender: passenger.gender,
      berthPreference: passenger.berthPreference,
      idType: passenger.idType,
      idNumber: passenger.idNumber || ''
    })
    setEditingId(passenger._id)
    setShowForm(true)
    setError('')
    setSuccess('')
  }

  const handleDelete = async (passengerId) => {
    if (!window.confirm('Delete this passenger?')) return
    try {
      await axios.delete(
        `http://localhost:5000/api/passengers/${passengerId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setSuccess('Passenger deleted!')
      await fetchPassengers()
    } catch (err) {
      setError('Failed to delete passenger')
    }
  }

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <Navbar />

      <div className="container mt-4">

        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h5 className="fw-bold mb-1">My Dashboard</h5>
            <p className="text-muted small mb-0">
              Welcome back, {user?.name}
            </p>
          </div>
          <button
            className="btn btn-sm"
            style={{ backgroundColor: '#e63946', color: 'white' }}
            onClick={() => navigate('/')}
          >
            🔍 Search Trains
          </button>
        </div>

        {/* Toast notification */}
{success && (
  <div
    style={{
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
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      animation: 'fadeIn 0.2s ease'
    }}
  >
    ✅ {success}
  </div>
)}

        {/* Saved Passengers Section */}
        <div className="card shadow-sm p-4" style={{ borderRadius: '12px' }}>

          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h6 className="fw-bold mb-0">👥 Saved Passengers</h6>
              <p className="text-muted small mb-0">
                Save passenger details for quick Tatkal booking
              </p>
            </div>
            {!showForm && (
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={() => { setShowForm(true); setError('') }}
              >
                + Add Passenger
              </button>
            )}
          </div>

          {/* Add/Edit Form */}
          {showForm && (
            <div className="border rounded p-3 mb-3"
              style={{ backgroundColor: '#fafafa', borderRadius: '10px' }}>

              <h6 className="fw-semibold mb-3">
                {editingId ? '✏️ Edit Passenger' : '➕ Add New Passenger'}
              </h6>

              {error && (
                <div className="alert alert-danger py-2 small mb-3">
                  ⚠️ {error}
                </div>
              )}

              <div className="row g-2">

                {/* Name */}
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    className="form-control form-control-sm"
                    placeholder="e.g. Rahul Sharma"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>

                {/* Age */}
                <div className="col-md-2">
                  <label className="form-label small fw-semibold">
                    Age *
                  </label>
                  <input
                    type="number"
                    name="age"
                    className="form-control form-control-sm"
                    placeholder="e.g. 28"
                    value={formData.age}
                    onChange={handleChange}
                    min="1"
                    max="120"
                  />
                </div>

                {/* Gender */}
                <div className="col-md-2">
                  <label className="form-label small fw-semibold">
                    Gender *
                  </label>
                  <select
                    name="gender"
                    className="form-select form-select-sm"
                    value={formData.gender}
                    onChange={handleChange}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Berth Preference */}
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">
                    Berth Preference
                  </label>
                  <select
                    name="berthPreference"
                    className="form-select form-select-sm"
                    value={formData.berthPreference}
                    onChange={handleChange}
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
                  <label className="form-label small fw-semibold">
                    ID Type
                  </label>
                  <select
                    name="idType"
                    className="form-select form-select-sm"
                    value={formData.idType}
                    onChange={handleChange}
                  >
                    <option value="Aadhaar">Aadhaar</option>
                    <option value="PAN">PAN</option>
                    <option value="Passport">Passport</option>
                    <option value="Driving License">Driving License</option>
                  </select>
                </div>

                {/* ID Number */}
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">
                    ID Number
                  </label>
                  <input
                    type="text"
                    name="idNumber"
                    className="form-control form-control-sm"
                    placeholder="Optional"
                    value={formData.idNumber}
                    onChange={handleChange}
                  />
                </div>

              </div>

              {/* Form Buttons */}
              <div className="d-flex gap-2 mt-3">
                <button
                  className="btn btn-sm"
                  style={{ backgroundColor: '#e63946', color: 'white' }}
                  onClick={handleSubmit}
                >
                  {editingId ? 'Update Passenger' : 'Save Passenger'}
                </button>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              </div>

            </div>
          )}

          {/* Passengers List */}
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-danger spinner-border-sm"></div>
              <p className="text-muted small mt-2">Loading passengers...</p>
            </div>
          ) : passengers.length === 0 ? (
            <div className="text-center py-4"
              style={{ backgroundColor: '#f9fafb', borderRadius: '10px' }}>
              <div style={{ fontSize: '32px' }}>👤</div>
              <div className="fw-semibold mt-2">No passengers saved yet</div>
              <div className="text-muted small mt-1">
                Add passenger details for quick Tatkal booking
              </div>
            </div>
          ) : (
            <div className="row g-2">
              {passengers.map((passenger) => (
                <div key={passenger._id} className="col-md-6">
                  <div
                    className="border rounded p-3"
                    style={{
                      borderRadius: '10px',
                      backgroundColor: 'white',
                      borderLeft: '3px solid #e63946'
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <div className="fw-semibold">{passenger.name}</div>
                        <div className="text-muted small mt-1">
                          {passenger.age} yrs · {passenger.gender} · {passenger.berthPreference}
                        </div>
                        <div className="text-muted small">
                          {passenger.idType}
                          {passenger.idNumber && ` · ${passenger.idNumber}`}
                        </div>
                      </div>
                      <div className="d-flex gap-1">
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          style={{ fontSize: '11px' }}
                          onClick={() => handleEdit(passenger)}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          style={{ fontSize: '11px' }}
                          onClick={() => handleDelete(passenger._id)}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default Dashboard