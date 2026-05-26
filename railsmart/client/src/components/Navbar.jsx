import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'

function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()

  // Read user once into state
  const [user] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user'))
    } catch {
      return null
    }
  })

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const isOnTrainPage = location.pathname === '/' ||
    location.pathname === '/trains'

  return (
    <nav className="navbar navbar-light bg-white border-bottom px-4 py-2"
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>

      <div className="d-flex align-items-center gap-4">

        {/* Logo */}
        <span
          className="fw-bold fs-4"
          style={{ color: '#e63946', cursor: 'pointer', letterSpacing: '-0.5px' }}
          onClick={() => navigate('/')}
        >
          RailSmart
        </span>

        {/* Trains tab */}
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

      {/* Right side */}
      <div className="d-flex align-items-center gap-3">
        {user ? (
          <>
            <span className="text-muted small">
              Hi, <span className="fw-semibold" style={{ color: '#374151' }}>
                {user.name}
              </span>
            </span>
            <Link
              to="/dashboard"
              className="btn btn-sm btn-outline-secondary"
              style={{ fontSize: '13px' }}
            >
              Dashboard
            </Link>
            <button
              className="btn btn-sm btn-outline-danger"
              style={{ fontSize: '13px' }}
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="btn btn-sm"
            style={{ backgroundColor: '#e63946', color: 'white', fontSize: '13px' }}
          >
            Login / Signup
          </Link>
        )}
      </div>
    </nav>
  )
}

export default Navbar