import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import axios from 'axios'

function Dashboard() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user'))
  const token = localStorage.getItem('token')

  // Active tab
  const [activeTab, setActiveTab] = useState('passengers')

  // Passengers state
  const [passengers, setPassengers] = useState([])
  const [loadingPassengers, setLoadingPassengers] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    berthPreference: 'No Preference',
    idType: 'Aadhaar',
    idNumber: ''
  })

  // WL Alerts state
  const [wlAlerts, setWlAlerts] = useState([])
  const [loadingAlerts, setLoadingAlerts] = useState(true)

  // Notifications state
  const [notifications, setNotifications] = useState([])
  const [loadingNotifications, setLoadingNotifications] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  // Saved routes state
  const [savedRoutes, setSavedRoutes] = useState([
    { from: 'Delhi', to: 'Mumbai', label: 'Home → Work' },
    { from: 'Delhi', to: 'Patna', label: 'Delhi → Patna' }
  ])

  // Global states
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Load data on mount
  useEffect(() => {
    fetchPassengers()
    fetchWLAlerts()
    fetchNotifications()
  }, [])

  // Auto dismiss success
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 2000)
      return () => clearTimeout(timer)
    }
  }, [success])

  // ─────────────────────────────────────────
  // PASSENGERS
  // ─────────────────────────────────────────

  const fetchPassengers = async () => {
    try {
      setLoadingPassengers(true)
      const res = await axios.get(
        'http://localhost:5000/api/passengers',
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setPassengers(res.data.passengers)
    } catch (err) {
      setError('Failed to load passengers')
    }
    setLoadingPassengers(false)
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
    if (!formData.name || !formData.age || !formData.gender) {
      setError('Name, age and gender are required')
      return
    }
    try {
      if (editingId) {
        await axios.put(
          `http://localhost:5000/api/passengers/${editingId}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        setSuccess('Passenger updated!')
      } else {
        await axios.post(
          'http://localhost:5000/api/passengers',
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        setSuccess('Passenger added!')
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

  // ─────────────────────────────────────────
  // WL ALERTS
  // ─────────────────────────────────────────

  const fetchWLAlerts = async () => {
    try {
      setLoadingAlerts(true)
      const res = await axios.get(
        'http://localhost:5000/api/wl-alerts',
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setWlAlerts(res.data.alerts || [])
    } catch (err) {
      console.log('Could not load WL alerts')
    }
    setLoadingAlerts(false)
  }

  const cancelAlert = async (alertId) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/wl-alerts/${alertId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setSuccess('WL Alert cancelled!')
      await fetchWLAlerts()
    } catch (err) {
      setError('Failed to cancel alert')
    }
  }

  const getAlertStatusColor = (status) => {
    if (status === 'ACTIVE') return '#16a34a'
    if (status === 'TRIGGERED') return '#2563eb'
    if (status === 'EXPIRED') return '#6b7280'
    if (status === 'CANCELLED') return '#dc2626'
    return '#6b7280'
  }

  const getChanceColor = (chance) => {
    if (chance >= 70) return '#16a34a'
    if (chance >= 50) return '#d97706'
    return '#dc2626'
  }

  // ─────────────────────────────────────────
  // NOTIFICATIONS
  // ─────────────────────────────────────────

  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true)
      const res = await axios.get(
        'http://localhost:5000/api/notifications',
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setNotifications(res.data.notifications || [])
      setUnreadCount(res.data.unreadCount || 0)
    } catch (err) {
      console.log('Could not load notifications')
    }
    setLoadingNotifications(false)
  }

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(
        `http://localhost:5000/api/notifications/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setNotifications(prev =>
        prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) { }
  }

  const markAllRead = async () => {
    try {
      await axios.put(
        'http://localhost:5000/api/notifications/mark-all-read',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
      setSuccess('All notifications marked as read!')
    } catch (err) { }
  }

  const clearAllNotifications = async () => {
    if (!window.confirm('Clear all notifications?')) return
    try {
      await axios.delete(
        'http://localhost:5000/api/notifications/clear-all',
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setNotifications([])
      setUnreadCount(0)
      setSuccess('All notifications cleared!')
    } catch (err) { }
  }

  const getNotificationColor = (type) => {
    if (type === 'CRITICAL') return '#dc2626'
    if (type === 'URGENT') return '#ea580c'
    if (type === 'WARNING') return '#d97706'
    return '#2563eb'
  }

  // ─────────────────────────────────────────
  // TABS CONFIG
  // ─────────────────────────────────────────

  const tabs = [
    { id: 'passengers', label: '👥 Passengers', count: passengers.length },
    { id: 'wlalerts', label: '🔔 WL Alerts', count: wlAlerts.filter(a => a.alertStatus === 'ACTIVE').length },
    { id: 'notifications', label: '📢 Notifications', count: unreadCount },
    { id: 'routes', label: '🗺️ Saved Routes', count: savedRoutes.length }
  ]

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <Navbar />

      <div className="container mt-4">

        {/* Toast */}
        {success && (
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
            fontWeight: '500',
            animation: 'fadeIn 0.2s ease'
          }}>
            ✅ {success}
          </div>
        )}

        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h5 className="fw-bold mb-1">My Dashboard</h5>
            <p className="text-muted small mb-0">Welcome back, {user?.name}</p>
          </div>
          <button
            className="btn btn-sm"
            style={{ backgroundColor: '#e63946', color: 'white' }}
            onClick={() => navigate('/')}
          >
            🔍 Search Trains
          </button>
        </div>

        {/* Quick Stats */}
        <div className="row g-3 mb-4">
          {[
            { icon: '👥', label: 'Saved Passengers', value: passengers.length, color: '#ede9fe' },
            { icon: '🔔', label: 'Active WL Alerts', value: wlAlerts.filter(a => a.alertStatus === 'ACTIVE').length, color: '#fef3c7' },
            { icon: '📢', label: 'Unread Notifications', value: unreadCount, color: '#fee2e2' },
            { icon: '🗺️', label: 'Saved Routes', value: savedRoutes.length, color: '#dcfce7' }
          ].map((stat, i) => (
            <div key={i} className="col-md-3">
              <div className="card border-0 shadow-sm p-3 text-center"
                style={{ borderRadius: '12px', backgroundColor: stat.color }}>
                <div style={{ fontSize: '24px' }}>{stat.icon}</div>
                <div className="fw-bold mt-1" style={{ fontSize: '22px' }}>{stat.value}</div>
                <div className="text-muted small">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="card shadow-sm" style={{ borderRadius: '12px' }}>

          {/* Tab Headers */}
          <div className="d-flex border-bottom px-3 pt-3 gap-1 flex-wrap">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="btn btn-sm mb-2"
                style={{
                  backgroundColor: activeTab === tab.id ? '#e63946' : 'transparent',
                  color: activeTab === tab.id ? 'white' : '#6b7280',
                  borderRadius: '8px',
                  border: activeTab === tab.id ? 'none' : '1px solid #e5e7eb',
                  fontSize: '13px'
                }}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="badge ms-1"
                    style={{
                      backgroundColor: activeTab === tab.id ? 'white' : '#e63946',
                      color: activeTab === tab.id ? '#e63946' : 'white',
                      fontSize: '10px'
                    }}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="p-4">

            {/* ─── PASSENGERS TAB ─── */}
            {activeTab === 'passengers' && (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h6 className="fw-bold mb-0">Saved Passengers</h6>
                    <p className="text-muted small mb-0">
                      Used for quick Tatkal autofill
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
                      <div className="col-md-4">
                        <label className="form-label small fw-semibold">Full Name *</label>
                        <input type="text" name="name"
                          className="form-control form-control-sm"
                          placeholder="e.g. Rahul Sharma"
                          value={formData.name} onChange={handleChange} />
                      </div>
                      <div className="col-md-2">
                        <label className="form-label small fw-semibold">Age *</label>
                        <input type="number" name="age"
                          className="form-control form-control-sm"
                          placeholder="28" value={formData.age}
                          onChange={handleChange} min="1" max="120" />
                      </div>
                      <div className="col-md-2">
                        <label className="form-label small fw-semibold">Gender *</label>
                        <select name="gender"
                          className="form-select form-select-sm"
                          value={formData.gender} onChange={handleChange}>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small fw-semibold">Berth Preference</label>
                        <select name="berthPreference"
                          className="form-select form-select-sm"
                          value={formData.berthPreference} onChange={handleChange}>
                          <option value="No Preference">No Preference</option>
                          <option value="Lower">Lower</option>
                          <option value="Middle">Middle</option>
                          <option value="Upper">Upper</option>
                          <option value="Side Lower">Side Lower</option>
                          <option value="Side Upper">Side Upper</option>
                        </select>
                      </div>
                      <div className="col-md-3">
                        <label className="form-label small fw-semibold">ID Type</label>
                        <select name="idType"
                          className="form-select form-select-sm"
                          value={formData.idType} onChange={handleChange}>
                          <option value="Aadhaar">Aadhaar</option>
                          <option value="PAN">PAN</option>
                          <option value="Passport">Passport</option>
                          <option value="Driving License">Driving License</option>
                        </select>
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small fw-semibold">ID Number</label>
                        <input type="text" name="idNumber"
                          className="form-control form-control-sm"
                          placeholder="Optional"
                          value={formData.idNumber} onChange={handleChange} />
                      </div>
                    </div>
                    <div className="d-flex gap-2 mt-3">
                      <button className="btn btn-sm"
                        style={{ backgroundColor: '#e63946', color: 'white' }}
                        onClick={handleSubmit}>
                        {editingId ? 'Update Passenger' : 'Save Passenger'}
                      </button>
                      <button className="btn btn-sm btn-outline-secondary"
                        onClick={resetForm}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Passengers List */}
                {loadingPassengers ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-danger spinner-border-sm"></div>
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
                    {passengers.map(passenger => (
                      <div key={passenger._id} className="col-md-6">
                        <div className="border rounded p-3" style={{
                          borderRadius: '10px',
                          backgroundColor: 'white',
                          borderLeft: '3px solid #e63946'
                        }}>
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
                              <button className="btn btn-sm btn-outline-secondary"
                                style={{ fontSize: '11px' }}
                                onClick={() => handleEdit(passenger)}>
                                ✏️ Edit
                              </button>
                              <button className="btn btn-sm btn-outline-danger"
                                style={{ fontSize: '11px' }}
                                onClick={() => handleDelete(passenger._id)}>
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
            )}

            {/* ─── WL ALERTS TAB ─── */}
            {activeTab === 'wlalerts' && (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h6 className="fw-bold mb-0">WL Alerts</h6>
                    <p className="text-muted small mb-0">
                      Monitoring your waitlisted tickets
                    </p>
                  </div>
                  <button className="btn btn-sm btn-outline-secondary"
                    onClick={fetchWLAlerts}>
                    🔄 Refresh
                  </button>
                </div>

                {loadingAlerts ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-danger spinner-border-sm"></div>
                  </div>
                ) : wlAlerts.length === 0 ? (
                  <div className="text-center py-4"
                    style={{ backgroundColor: '#f9fafb', borderRadius: '10px' }}>
                    <div style={{ fontSize: '32px' }}>🔔</div>
                    <div className="fw-semibold mt-2">No WL alerts set</div>
                    <div className="text-muted small mt-1">
                      Set alerts from train search results on waitlisted tickets
                    </div>
                  </div>
                ) : (
                  <div className="row g-2">
                    {wlAlerts.map(alert => (
                      <div key={alert._id} className="col-12">
                        <div className="border rounded p-3" style={{
                          borderRadius: '10px',
                          backgroundColor: 'white',
                          borderLeft: `3px solid ${getAlertStatusColor(alert.alertStatus)}`
                        }}>
                          <div className="d-flex justify-content-between align-items-start">
                            <div className="flex-grow-1">
                              <div className="d-flex align-items-center gap-2 mb-1">
                                <span className="fw-semibold">{alert.trainName}</span>
                                <span className="badge"
                                  style={{
                                    backgroundColor: getAlertStatusColor(alert.alertStatus),
                                    fontSize: '10px'
                                  }}>
                                  {alert.alertStatus}
                                </span>
                              </div>
                              <div className="text-muted small">
                                {alert.from} → {alert.to} · {alert.selectedClass}
                              </div>
                              <div className="d-flex gap-3 mt-2">
                                <div className="small">
                                  <span className="text-muted">WL: </span>
                                  <span className="fw-semibold" style={{ color: '#dc2626' }}>
                                    {alert.currentWLNumber}
                                  </span>
                                  <span className="text-muted ms-1">
                                    (was {alert.initialWLNumber})
                                  </span>
                                </div>
                                <div className="small">
                                  <span className="text-muted">Chance: </span>
                                  <span className="fw-semibold"
                                    style={{ color: getChanceColor(alert.currentConfirmChance) }}>
                                    {alert.currentConfirmChance}%
                                  </span>
                                </div>
                                <div className="small text-muted">
                                  Checked: {new Date(alert.lastChecked).toLocaleTimeString('en-IN')}
                                </div>
                              </div>
                            </div>
                            {alert.alertStatus === 'ACTIVE' && (
                              <button
                                className="btn btn-sm btn-outline-danger ms-2"
                                style={{ fontSize: '11px' }}
                                onClick={() => cancelAlert(alert._id)}
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ─── NOTIFICATIONS TAB ─── */}
            {activeTab === 'notifications' && (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h6 className="fw-bold mb-0">Notifications</h6>
                    <p className="text-muted small mb-0">
                      WL alerts and important updates
                    </p>
                  </div>
                  <div className="d-flex gap-2">
                    {unreadCount > 0 && (
                      <button className="btn btn-sm btn-outline-secondary"
                        style={{ fontSize: '12px' }}
                        onClick={markAllRead}>
                        Mark all read
                      </button>
                    )}
                    {notifications.length > 0 && (
                      <button className="btn btn-sm btn-outline-danger"
                        style={{ fontSize: '12px' }}
                        onClick={clearAllNotifications}>
                        Clear all
                      </button>
                    )}
                  </div>
                </div>

                {loadingNotifications ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-danger spinner-border-sm"></div>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="text-center py-4"
                    style={{ backgroundColor: '#f9fafb', borderRadius: '10px' }}>
                    <div style={{ fontSize: '32px' }}>📢</div>
                    <div className="fw-semibold mt-2">No notifications yet</div>
                    <div className="text-muted small mt-1">
                      WL drop alerts will appear here
                    </div>
                  </div>
                ) : (
                  <div>
                    {notifications.map(notification => (
                      <div
                        key={notification._id}
                        onClick={() => markAsRead(notification._id)}
                        className="border rounded p-3 mb-2"
                        style={{
                          borderRadius: '10px',
                          backgroundColor: notification.isRead ? 'white' : '#fef9f9',
                          borderLeft: `3px solid ${getNotificationColor(notification.type)}`,
                          cursor: 'pointer'
                        }}
                      >
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="flex-grow-1">
                            <div className="d-flex align-items-center gap-2 mb-1">
                              <span className="fw-semibold small"
                                style={{ color: getNotificationColor(notification.type) }}>
                                {notification.title}
                              </span>
                              <span className="badge"
                                style={{
                                  backgroundColor: getNotificationColor(notification.type),
                                  fontSize: '9px'
                                }}>
                                {notification.type}
                              </span>
                            </div>
                            <div className="text-muted small" style={{ lineHeight: '1.5' }}>
                              {notification.message}
                            </div>
                            <div className="text-muted mt-1" style={{ fontSize: '10px' }}>
                              {new Date(notification.createdAt).toLocaleString('en-IN')}
                            </div>
                          </div>
                          {!notification.isRead && (
                            <div style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              backgroundColor: '#e63946',
                              marginTop: '4px',
                              flexShrink: 0
                            }}></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ─── SAVED ROUTES TAB ─── */}
            {activeTab === 'routes' && (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h6 className="fw-bold mb-0">Saved Routes</h6>
                    <p className="text-muted small mb-0">
                      Quick access to your frequent routes
                    </p>
                  </div>
                </div>

                {savedRoutes.length === 0 ? (
                  <div className="text-center py-4"
                    style={{ backgroundColor: '#f9fafb', borderRadius: '10px' }}>
                    <div style={{ fontSize: '32px' }}>🗺️</div>
                    <div className="fw-semibold mt-2">No saved routes</div>
                    <div className="text-muted small mt-1">
                      Search a route and save it for quick access
                    </div>
                  </div>
                ) : (
                  <div className="row g-2">
                    {savedRoutes.map((route, index) => (
                      <div key={index} className="col-md-4">
                        <div className="border rounded p-3"
                          style={{
                            borderRadius: '10px',
                            backgroundColor: 'white',
                            borderLeft: '3px solid #16a34a',
                            cursor: 'pointer'
                          }}
                          onClick={() => navigate(`/?from=${route.from}&to=${route.to}`)}
                        >
                          <div className="fw-semibold small mb-1">{route.label}</div>
                          <div className="text-muted small">
                            {route.from} → {route.to}
                          </div>
                          <div className="mt-2">
                            <button
                              className="btn btn-sm"
                              style={{
                                backgroundColor: '#e63946',
                                color: 'white',
                                fontSize: '11px'
                              }}
                              onClick={(e) => {
                                e.stopPropagation()
                                const today = new Date().toISOString().split('T')[0]
                                navigate(`/trains?from=${route.from}&to=${route.to}&date=${today}&class=ALL&cheapest=false`)
                              }}
                            >
                              Search Now →
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
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

export default Dashboard