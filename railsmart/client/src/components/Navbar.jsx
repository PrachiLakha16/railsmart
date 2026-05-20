import { Link, useNavigate } from 'react-router-dom'

function Navbar() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user'))

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <nav className="navbar navbar-light bg-white border-bottom px-4 py-2">
      <div className="d-flex align-items-center gap-4">
        {/* Logo */}
        <span
          className="fw-bold fs-4"
          style={{ color: '#e63946', cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          RailSmart
        </span>

        {/* Trains tab — only one tab we need */}
        <span
          className="fw-semibold pb-1"
          style={{
            color: '#e63946',
            borderBottom: '2px solid #e63946',
            cursor: 'pointer'
          }}
        >
          🚂 Trains
        </span>
      </div>

      {/* Right side */}
      <div className="d-flex align-items-center gap-3">
        {user ? (
          <>
            <span className="text-muted">Hi, {user.name}</span>
            <Link to="/dashboard" className="btn btn-sm btn-outline-secondary">
              Dashboard
            </Link>
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="btn btn-sm"
            style={{ backgroundColor: '#e63946', color: 'white' }}
          >
            Login / Signup
          </Link>
        )}
      </div>
    </nav>
  )
}

export default Navbar