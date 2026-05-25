function AlternateRouteCard({ route }) {
  const layoverHours = Math.floor((route.layoverMinutes || 0) / 60)
  const layoverMins = (route.layoverMinutes || 0) % 60

  // Fix total duration calculation
  const calculateTotalDuration = () => {
    if (!route.train1?.departureTime || !route.train2?.arrivalTime) return 'N/A'

    const toMins = (timeStr) => {
      const [h, m] = timeStr.split(':').map(Number)
      return h * 60 + m
    }

    const depMins = toMins(route.train1.departureTime)
    let arrMins = toMins(route.train2.arrivalTime)

    // Handle overnight
    if (arrMins <= depMins) arrMins += 24 * 60

    const totalMins = arrMins - depMins
    const hours = Math.floor(totalMins / 60)
    const mins = totalMins % 60
    return `${hours}h ${mins}m`
  }

  return (
    <div className="card mb-3 shadow-sm" style={{
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      borderLeft: '4px solid #e63946'
    }}>
      <div className="card-body p-3">

        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <span className="badge me-2" style={{ backgroundColor: '#e63946' }}>
              🔀 Alternate Route
            </span>
            <span className="text-muted small">via {route.via}</span>
          </div>
          <div className="text-success fw-semibold">
            From ₹{route.cheapestPrice}
          </div>
        </div>

        {/* Train 1 */}
        <div className="border rounded p-2 mb-2" style={{ backgroundColor: '#f9fafb' }}>
          <div className="small text-muted fw-semibold mb-2">🚂 Train 1</div>
          <div className="d-flex align-items-center gap-3 mb-1">
            <div className="text-center">
              <div className="fw-bold" style={{ fontSize: '18px' }}>
                {route.train1.departureTime}
              </div>
              <div className="text-muted" style={{ fontSize: '11px' }}>
                {route.train1.from}
              </div>
            </div>
            <div className="flex-grow-1 text-center">
              <div className="text-muted" style={{ fontSize: '11px' }}>
                {route.train1.trainName}
              </div>
              <div style={{ borderTop: '1.5px dashed #d1d5db', margin: '4px 0' }}></div>
              <div className="text-muted" style={{ fontSize: '10px' }}>
                {route.train1.trainNumber}
              </div>
            </div>
            <div className="text-center">
              <div className="fw-bold" style={{ fontSize: '18px' }}>
                {route.train1.estimatedArrival}
              </div>
              <div className="text-muted" style={{ fontSize: '11px' }}>
                {route.train1.to}
              </div>
            </div>
          </div>

          {/* Train 1 classes */}
          <div className="d-flex gap-2 mt-2 flex-wrap">
            {route.train1.classes && route.train1.classes.map((cls, i) => (
              <div key={i} className="text-center p-2" style={{
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                minWidth: '75px',
                backgroundColor: 'white',
                fontSize: '12px'
              }}>
                <div className="fw-semibold">{cls.className}</div>
                <div>₹{cls.price}</div>
                {cls.waitlistCount > 0 ? (
                  <div style={{ color: '#dc2626', fontSize: '11px' }}>
                    WL {cls.waitlistCount}
                  </div>
                ) : (
                  <div style={{ color: '#1a7f37', fontSize: '11px' }}>
                    Available
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Layover */}
        <div className="text-center my-2">
          <span className="badge bg-warning text-dark">
            ⏱ {layoverHours}h {layoverMins}m layover at {route.via}
          </span>
        </div>

        {/* Train 2 */}
        <div className="border rounded p-2" style={{ backgroundColor: '#f9fafb' }}>
          <div className="small text-muted fw-semibold mb-2">🚂 Train 2</div>
          <div className="d-flex align-items-center gap-3 mb-1">
            <div className="text-center">
              <div className="fw-bold" style={{ fontSize: '18px' }}>
                {route.train2.departureTime}
              </div>
              <div className="text-muted" style={{ fontSize: '11px' }}>
                {route.train2.from}
              </div>
            </div>
            <div className="flex-grow-1 text-center">
              <div className="text-muted" style={{ fontSize: '11px' }}>
                {route.train2.trainName}
              </div>
              <div style={{ borderTop: '1.5px dashed #d1d5db', margin: '4px 0' }}></div>
              <div className="text-muted" style={{ fontSize: '10px' }}>
                {route.train2.trainNumber}
              </div>
            </div>
            <div className="text-center">
              <div className="fw-bold" style={{ fontSize: '18px' }}>
                {route.train2.arrivalTime}
              </div>
              <div className="text-muted" style={{ fontSize: '11px' }}>
                {route.train2.to}
              </div>
            </div>
          </div>

          {/* Train 2 classes */}
          <div className="d-flex gap-2 mt-2 flex-wrap">
            {route.train2.classes && route.train2.classes.map((cls, i) => (
              <div key={i} className="text-center p-2" style={{
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                minWidth: '75px',
                backgroundColor: 'white',
                fontSize: '12px'
              }}>
                <div className="fw-semibold">{cls.className}</div>
                <div>₹{cls.price}</div>
                {cls.waitlistCount > 0 ? (
                  <div style={{ color: '#dc2626', fontSize: '11px' }}>
                    WL {cls.waitlistCount}
                  </div>
                ) : (
                  <div style={{ color: '#1a7f37', fontSize: '11px' }}>
                    Available
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-3 d-flex justify-content-between align-items-center">
          <span className="text-muted small">
            Total journey: {calculateTotalDuration()}
          </span>
          <span className="fw-semibold text-success">
            Cheapest combo: ₹{route.cheapestPrice}
          </span>
        </div>

      </div>
    </div>
  )
}

export default AlternateRouteCard