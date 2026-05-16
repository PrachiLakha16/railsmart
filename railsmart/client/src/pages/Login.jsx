import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

function Login() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please fill all fields')
      setLoading(false)
      return
    }

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', formData)

      // Save token to localStorage
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))

      // Redirect to home
      navigate('/')

    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    }

    setLoading(false)
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-5">

          {/* Header */}
          <div className="text-center mb-4">
            <h2 style={{ color: '#e63946', fontWeight: 'bold' }}>ixigo</h2>
            <h5>Login to your account</h5>
          </div>

          {/* Card */}
          <div className="card shadow-sm p-4">

            {/* Error message */}
            {error && (
              <div className="alert alert-danger">{error}</div>
            )}

            <form onSubmit={handleSubmit}>

              {/* Email */}
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              {/* Password */}
              <div className="mb-3">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                className="btn w-100"
                style={{ backgroundColor: '#e63946', color: 'white' }}
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>

            </form>

            {/* Signup link */}
            <div className="text-center mt-3">
              <small>Don't have an account? <Link to="/signup">Sign up</Link></small>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default Login