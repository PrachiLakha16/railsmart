import { useNavigate } from 'react-router-dom'
import { wlAlertAPI } from '../services/api'

function TrainCard({ train }) {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  const getChanceColor = (chance) => {
    if (chance >= 80) return '#1a7f37'
    if (chance >= 50) return '#d97706'
    return '#dc2626'
  }

  const getChanceBg = (chance) => {
    if (chance >= 80) return '#dcfce7'
    if (chance >= 50) return '#fef3c7'
    return '#fee2e2'
  }

  const handleBooking = (cls) => {
  navigate(`/booking?trainId=${train._id}&class=${cls.className}&price=${cls.price}&trainName=${encodeURIComponent(train.trainName)}&trainNumber=${train.trainNumber}&from=${train.source}&to=${train.destination}&departure=${train.departureTime}&arrival=${train.arrivalTime}&waitlistCount=${cls.waitlistCount}&confirmChance=${cls.confirmChance}`)
}

  const handleWLAlert = async (cls) => {
    if (cls.waitlistCount === 0) {
      alert('This class has available seats — no WL alert needed!')
      return
    }

    try {
      const res = await fetch('wlAlertAPI.create(...)', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          trainId: train._id,
          trainNumber: train.trainNumber,
          trainName: train.trainName,
          from: train.source,
          to: train.destination,
          journeyDate: new Date().toISOString(),
          selectedClass: cls.className,
          currentWLNumber: cls.waitlistCount,
          currentConfirmChance: cls.confirmChance,
          triggerWhenChanceAbove: 70
        })
      })
      const data = await res.json()
      if (data.success) {
        alert(`✅ ${data.message}`)
      } else {
        alert(data.message || 'Could not set alert')
      }
    } catch (err) {
      alert('Failed to set WL alert. Please try again.')
    }
  }

  return (
    <div className="card mb-3 shadow-sm" style={{
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      borderLeft: '4px solid #16a34a'
    }}>
      <div className="card-body p-3">

        {/* Train name and number */}
        <div className="d-flex justify-content-between align-items-center mb-2">
          <div>
            <span className="fw-bold" style={{ fontSize: '15px' }}>
              {train.trainNumber}
            </span>
            <span className="text-muted ms-2" style={{ fontSize: '14px' }}>
              {train.trainName}
            </span>
          </div>
          <div className="text-muted small">⭐ {train.rating || 'N/A'}</div>
        </div>

        {/* Timing row */}
        <div className="d-flex align-items-center gap-3 mb-3">
          <div className="text-center">
            <div className="fw-bold" style={{ fontSize: '20px' }}>
              {train.departureTime}
            </div>
            <div className="text-muted" style={{ fontSize: '11px' }}>
              {train.source}
            </div>
          </div>
          <div className="flex-grow-1 text-center">
            <div className="text-muted" style={{ fontSize: '11px' }}>
              {train.duration}
            </div>
            <div style={{ borderTop: '1.5px dashed #d1d5db', margin: '4px 0' }}></div>
            <div className="text-muted" style={{ fontSize: '10px' }}>
              {train.runningDays?.join(', ') || 'Daily'}
            </div>
          </div>
          <div className="text-center">
            <div className="fw-bold" style={{ fontSize: '20px' }}>
              {train.arrivalTime}
            </div>
            <div className="text-muted" style={{ fontSize: '11px' }}>
              {train.destination}
            </div>
          </div>
        </div>

        {/* Class boxes */}
        <div className="d-flex gap-2 flex-wrap">
          {train.classes && train.classes.map((cls, index) => (
            <div
              key={index}
              className="text-center p-2"
              onClick={() => handleBooking(cls)}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                minWidth: '85px',
                backgroundColor: '#fafafa',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = '#fff0f0'
                e.currentTarget.style.borderColor = '#e63946'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = '#fafafa'
                e.currentTarget.style.borderColor = '#e5e7eb'
              }}
            >
              <div className="fw-semibold" style={{ fontSize: '12px' }}>
                {cls.className}
              </div>
              <div style={{ fontSize: '13px', color: '#111' }}>₹{cls.price}</div>
              {cls.waitlistCount > 0 ? (
                <>
                  <div style={{ fontSize: '12px', color: '#dc2626', fontWeight: '600' }}>
                    WL {cls.waitlistCount}
                  </div>
                  <div style={{
                    fontSize: '10px',
                    fontWeight: '600',
                    color: getChanceColor(cls.confirmChance),
                    backgroundColor: getChanceBg(cls.confirmChance),
                    borderRadius: '4px',
                    padding: '1px 4px',
                    marginTop: '2px'
                  }}>
                    {cls.confirmChance}% Chance
                  </div>
                </>
              ) : (
                <div style={{ fontSize: '11px', color: '#1a7f37', fontWeight: '600' }}>
                  Available
                </div>
              )}
              <div style={{
                fontSize: '10px',
                color: '#e63946',
                marginTop: '4px',
                fontWeight: '600'
              }}>
                Book →
              </div>
            </div>
          ))}
        </div>

        {/* WL Alert buttons per class */}
        <div className="mt-3 d-flex gap-2 flex-wrap">
          {train.classes && train.classes
            .filter(cls => cls.waitlistCount > 0)
            .map((cls, index) => (
              <button
                key={index}
                className="btn btn-sm btn-outline-warning"
                style={{ fontSize: '11px' }}
                onClick={() => handleWLAlert(cls)}
              >
                🔔 WL Alert ({cls.className})
              </button>
            ))
          }
        </div>

      </div>
    </div>
  )
}

export default TrainCard