import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

function Login() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    if (!formData.email || !formData.password) {
      setError('Please fill all fields')
      setLoading(false)
      return
    }
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', formData)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{ width: '100%', maxWidth: '420px', padding: '0 16px' }}>

        {/* Logo */}
        <div className="text-center mb-4">
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px'
          }}>
            <div style={{
              backgroundColor: '#e63946',
              borderRadius: '10px',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '18px'
            }}>🚂</div>
            <span style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#e63946',
              letterSpacing: '-0.5px'
            }}>
              RailSmart
            </span>
          </div>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
            Login to your account
          </p>
        </div>

        {/* Card */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '32px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
        }}>

          {error && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '10px 14px',
              fontSize: '13px',
              color: '#dc2626',
              marginBottom: '16px'
            }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label style={{
                fontSize: '13px',
                fontWeight: '500',
                color: '#374151',
                display: 'block',
                marginBottom: '6px'
              }}>
                Email address
              </label>
              <input
                type="email"
                name="email"
                className="form-control"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                style={{ borderRadius: '8px', fontSize: '14px' }}
              />
            </div>

            <div className="mb-4">
              <label style={{
                fontSize: '13px',
                fontWeight: '500',
                color: '#374151',
                display: 'block',
                marginBottom: '6px'
              }}>
                Password
              </label>
              <input
                type="password"
                name="password"
                className="form-control"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                style={{ borderRadius: '8px', fontSize: '14px' }}
              />
            </div>

            <button
              type="submit"
              className="btn w-100"
              disabled={loading}
              style={{
                backgroundColor: loading ? '#c1121f' : '#e63946',
                color: 'white',
                borderRadius: '10px',
                padding: '10px',
                fontSize: '15px',
                fontWeight: '500',
                transition: 'background-color 0.2s'
              }}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Logging in...
                </>
              ) : 'Login →'}
            </button>
          </form>

          <div className="text-center mt-3">
            <span style={{ fontSize: '13px', color: '#6b7280' }}>
              Don't have an account?{' '}
              <Link to="/signup" style={{ color: '#e63946', fontWeight: '500' }}>
                Sign up
              </Link>
            </span>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center mt-3" style={{ fontSize: '12px', color: '#9ca3af' }}>
          🔒 Secure login · Your data is safe
        </p>
      </div>
    </div>
  )
}

export default Login