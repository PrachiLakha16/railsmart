import { useNavigate } from 'react-router-dom'

function Home() {
  const navigate = useNavigate()

  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem('user'))

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar navbar-light bg-white border-bottom px-4">
        <span className="navbar-brand fw-bold" style={{ color: '#e63946' }}>
          ixigo
        </span>
        <div className="d-flex align-items-center gap-3">
          <span>Welcome, {user?.name}</span>
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Content */}
      <div className="container mt-5 text-center">
        <h3>Search Trains</h3>
        <p className="text-muted">Search UI coming on Day 5!</p>
      </div>
    </div>
  )
}

export default Home