import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'

function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const token = localStorage.getItem('token')

  const [user] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user'))
    } catch { return null }
  })

  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showDropdown, setShowDropdown] = useState(false)
  const [toast, setToast] = useState(null)

  const isOnTrainPage = location.pathname === '/' ||
    location.pathname === '/trains'

  // Fetch notifications every 30 seconds
  useEffect(() => {
    if (!token) return
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [token])

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(
        'http://localhost:5000/api/notifications',
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const newUnread = res.data.unreadCount
      const newNotifications = res.data.notifications

      // Show toast if new notification arrived
      if (newUnread > unreadCount && newNotifications.length > 0) {
        const latest = newNotifications[0]
        if (!latest.isRead) {
          setToast(latest)
          setTimeout(() => setToast(null), 5000)
        }
      }

      setNotifications(newNotifications)
      setUnreadCount(newUnread)
    } catch (err) {
      // Silent fail
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
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
    } catch (err) { }
  }

  const clearAll = async () => {
    try {
      await axios.delete(
        'http://localhost:5000/api/notifications/clear-all',
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setNotifications([])
      setUnreadCount(0)
      setShowDropdown(false)
    } catch (err) { }
  }

  const getNotificationColor = (type) => {
    if (type === 'CRITICAL') return '#dc2626'
    if (type === 'URGENT') return '#ea580c'
    if (type === 'WARNING') return '#d97706'
    return '#2563eb'
  }

  return (
    <>
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          backgroundColor: getNotificationColor(toast.type),
          color: 'white',
          padding: '14px 18px',
          borderRadius: '12px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          maxWidth: '320px',
          fontSize: '13px',
          animation: 'fadeIn 0.3s ease'
        }}>
          <div className="fw-semibold mb-1">{toast.title}</div>
          <div style={{ opacity: 0.9, fontSize: '12px' }}>{toast.message}</div>
          <button
            onClick={() => setToast(null)}
            style={{
              position: 'absolute',
              top: '8px',
              right: '10px',
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >×</button>
        </div>
      )}

      <nav className="navbar navbar-light bg-white border-bottom px-4 py-2"
        style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>

        <div className="d-flex align-items-center gap-4">
          <span
            className="fw-bold fs-4"
            style={{ color: '#e63946', cursor: 'pointer', letterSpacing: '-0.5px' }}
            onClick={() => navigate('/')}
          >
            RailSmart
          </span>
          <span
            className="fw-semibold pb-1 small"
            style={{
              color: isOnTrainPage ? '#e63946' : '#6b7280',
              borderBottom: isOnTrainPage ? '2px solid #e63946' : '2px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onClick={() => navigate('/')}
          >
            🚂 Trains
          </span>
        </div>

        <div className="d-flex align-items-center gap-3">
          {user ? (
            <>
              {/* Notification Bell */}
              <div style={{ position: 'relative' }}>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  style={{ position: 'relative', padding: '4px 10px' }}
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  🔔
                  {unreadCount > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '-6px',
                      right: '-6px',
                      backgroundColor: '#e63946',
                      color: 'white',
                      borderRadius: '50%',
                      width: '18px',
                      height: '18px',
                      fontSize: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold'
                    }}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
               {showDropdown && (
  <div style={{
    position: 'fixed',
    right: '12px',
    top: '60px',
    width: 'min(340px, calc(100vw - 24px))',
    backgroundColor: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
    zIndex: 1000,
    maxHeight: '400px',
    overflowY: 'auto'
  }}>
                    {/* Header */}
                    <div className="d-flex justify-content-between align-items-center p-3"
                      style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <span className="fw-semibold small">
                        Notifications {unreadCount > 0 && (
                          <span className="badge ms-1"
                            style={{ backgroundColor: '#e63946', fontSize: '10px' }}>
                            {unreadCount} new
                          </span>
                        )}
                      </span>
                      <div className="d-flex gap-2">
                        {unreadCount > 0 && (
                          <button
                            className="btn btn-sm"
                            style={{ fontSize: '11px', padding: '2px 8px' }}
                            onClick={markAllRead}
                          >
                            Mark all read
                          </button>
                        )}
                        {notifications.length > 0 && (
                          <button
                            className="btn btn-sm btn-outline-danger"
                            style={{ fontSize: '11px', padding: '2px 8px' }}
                            onClick={clearAll}
                          >
                            Clear all
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Notifications List */}
                    {notifications.length === 0 ? (
                      <div className="text-center py-4 text-muted small">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map(notification => (
                        <div
                          key={notification._id}
                          onClick={() => markAsRead(notification._id)}
                          style={{
                            padding: '12px 16px',
                            borderBottom: '1px solid #f9fafb',
                            backgroundColor: notification.isRead ? 'white' : '#fef9f9',
                            cursor: 'pointer',
                            borderLeft: `3px solid ${getNotificationColor(notification.type)}`
                          }}
                        >
                          <div className="d-flex justify-content-between">
                            <div className="fw-semibold"
                              style={{
                                fontSize: '12px',
                                color: getNotificationColor(notification.type)
                              }}>
                              {notification.title}
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
                          <div className="text-muted mt-1"
                            style={{ fontSize: '11px', lineHeight: '1.4' }}>
                            {notification.message}
                          </div>
                          <div className="text-muted mt-1"
                            style={{ fontSize: '10px' }}>
                            {new Date(notification.createdAt).toLocaleString('en-IN')}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              <span className="text-muted small">
                Hi, <span className="fw-semibold" style={{ color: '#374151' }}>
                  {user.name}
                </span>
              </span>
              <Link to="/dashboard" className="btn btn-sm btn-outline-secondary"
                style={{ fontSize: '13px' }}>
                Dashboard
              </Link>
              <button className="btn btn-sm btn-outline-danger"
                style={{ fontSize: '13px' }}
                onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-sm"
              style={{ backgroundColor: '#e63946', color: 'white', fontSize: '13px' }}>
              Login / Signup
            </Link>
          )}
        </div>
      </nav>
    </>
  )
}

export default Navbar