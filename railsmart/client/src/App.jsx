import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Home from './pages/Home'
import TrainList from './pages/TrainList'
import Dashboard from './pages/Dashboard'
import Booking from './pages/Booking'

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token')
  if (!token) {
    return <Navigate to="/login" />
  }
  return children
}

// Simple 404 page
const NotFound = () => (
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa'
  }}>
    <div style={{ fontSize: '64px' }}>🚂</div>
    <h4 className="fw-bold mt-3">Page Not Found</h4>
    <p className="text-muted">
      This route doesn't exist on our railway network!
    </p>
    <a href="/" className="btn mt-2"
      style={{ backgroundColor: '#e63946', color: 'white' }}>
      Back to Home
    </a>
  </div>
)

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
        <Route path="/trains" element={
          <ProtectedRoute>
            <TrainList />
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/booking" element={
          <ProtectedRoute>
            <Booking />
          </ProtectedRoute>
        } />
        {/* 404 — catches all unknown routes */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App