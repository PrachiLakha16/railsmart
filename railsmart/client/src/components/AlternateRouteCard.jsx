function AlternateRouteCard({ route }) {
  const layoverHours = Math.floor((route.layoverMinutes || 0) / 60)
  const layoverMins = (route.layoverMinutes || 0) % 60

  // WL chance color
  const getChanceColor = (chance) => {
    if (chance >= 80) return '#1a7f37'
    if (chance >= 60) return '#d97706'
    return '#dc2626'
  }

  const getChanceBg = (chance) => {
    if (chance >= 80) return '#dcfce7'
    if (chance >= 60) return '#fef3c7'
    return '#fee2e2'
  }

  // Price breakdown
  const train1MinPrice = route.train1.classes
    ? Math.min(...route.train1.classes.map(c => c.price))
    : 0
  const train2MinPrice = route.train2.classes
    ? Math.min(...route.train2.classes.map(c => c.price))
    : 0

  return (
    <div className="card mb-3 shadow-sm" style={{
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      borderLeft: '4px solid #e63946'
    }}>
      <div className="card-body p-3">

        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex align-items-center gap-2">
            <span className="badge" style={{ backgroundColor: '#e63946' }}>
              🔀 Alternate Route
            </span>
            <span className="text-muted small fw-semibold">via {route.via}</span>
          {route.combinedWLChance && (
  <span className="badge" style={{
    backgroundColor: getChanceBg(route.combinedWLChance),
    color: getChanceColor(route.combinedWLChance),
    border: `1px solid ${getChanceColor(route.combinedWLChance)}`
  }}>
    🎯 {
      route.combinedWLChance >= 90 ? 'High Chance' :
      route.combinedWLChance >= 70 ? 'Good Chance' :
      'Fair Chance'
    }
  </span>
)}
          </div>
          <div className="text-success fw-bold">
            From ₹{route.cheapestPrice}
          </div>
        </div>

        {/* Journey Timeline */}
        <div className="mb-3">

          {/* Train 1 Block */}
          <div className="border rounded p-3 mb-0" style={{
            backgroundColor: '#f9fafb',
            borderBottomLeftRadius: '0',
            borderBottomRightRadius: '0',
            borderBottom: 'none'
          }}>
            {/* Train label */}
            <div className="d-flex justify-content-between mb-2">
              <span className="small fw-semibold" style={{ color: '#6b7280' }}>
                🚂 {route.train1.trainNumber} · {route.train1.trainName}
              </span>
            </div>

            {/* Timing row */}
            <div className="d-flex align-items-center gap-2">
              <div className="text-center" style={{ minWidth: '55px' }}>
                <div className="fw-bold" style={{ fontSize: '20px' }}>
                  {route.train1.departureTime}
                </div>
                <div className="text-muted" style={{ fontSize: '11px' }}>
                  {route.train1.from}
                </div>
              </div>

              <div className="flex-grow-1 text-center px-2">
                <div style={{ position: 'relative', margin: '8px 0' }}>
                  <div style={{
                    borderTop: '2px dashed #9ca3af',
                    position: 'absolute',
                    width: '100%',
                    top: '50%'
                  }}></div>
                  <span style={{
                    position: 'relative',
                    backgroundColor: '#f9fafb',
                    padding: '0 6px',
                    fontSize: '11px',
                    color: '#6b7280'
                  }}>
                    Train 1
                  </span>
                </div>
              </div>

              <div className="text-center" style={{ minWidth: '55px' }}>
                <div className="fw-bold" style={{ fontSize: '20px' }}>
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
                <div key={i} className="text-center p-1" style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  minWidth: '70px',
                  backgroundColor: 'white',
                  fontSize: '11px'
                }}>
                  <div className="fw-semibold">{cls.className}</div>
                  <div>₹{cls.price}</div>
                  {cls.waitlistCount > 0 ? (
                    <>
                      <div style={{ color: '#dc2626' }}>WL {cls.waitlistCount}</div>
                      <div style={{
                        fontSize: '10px',
                        color: getChanceColor(cls.confirmChance),
                        backgroundColor: getChanceBg(cls.confirmChance),
                        borderRadius: '3px',
                        padding: '1px 3px'
                      }}>
                        {cls.confirmChance}%
                      </div>
                    </>
                  ) : (
                    <div style={{ color: '#1a7f37' }}>Available</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Layover Block */}
          <div style={{
            backgroundColor: '#fffbeb',
            border: '1px solid #fde68a',
            borderTop: 'none',
            borderBottom: 'none',
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '14px' }}>⏳</span>
            <div>
              <span className="fw-semibold small" style={{ color: '#92400e' }}>
                {layoverHours}h {layoverMins}m layover
              </span>
              <span className="text-muted small ms-1">
                at {route.via} — time to change trains
              </span>
            </div>
          </div>

          {/* Train 2 Block */}
          <div className="border rounded p-3 mt-0" style={{
            backgroundColor: '#f9fafb',
            borderTopLeftRadius: '0',
            borderTopRightRadius: '0',
            borderTop: 'none'
          }}>
            {/* Train label */}
            <div className="d-flex justify-content-between mb-2">
              <span className="small fw-semibold" style={{ color: '#6b7280' }}>
                🚂 {route.train2.trainNumber} · {route.train2.trainName}
              </span>
            </div>

            {/* Timing row */}
            <div className="d-flex align-items-center gap-2">
              <div className="text-center" style={{ minWidth: '55px' }}>
                <div className="fw-bold" style={{ fontSize: '20px' }}>
                  {route.train2.departureTime}
                </div>
                <div className="text-muted" style={{ fontSize: '11px' }}>
                  {route.train2.from}
                </div>
              </div>

              <div className="flex-grow-1 text-center px-2">
                <div style={{ position: 'relative', margin: '8px 0' }}>
                  <div style={{
                    borderTop: '2px dashed #9ca3af',
                    position: 'absolute',
                    width: '100%',
                    top: '50%'
                  }}></div>
                  <span style={{
                    position: 'relative',
                    backgroundColor: '#f9fafb',
                    padding: '0 6px',
                    fontSize: '11px',
                    color: '#6b7280'
                  }}>
                    Train 2
                  </span>
                </div>
              </div>

              <div className="text-center" style={{ minWidth: '55px' }}>
                <div className="fw-bold" style={{ fontSize: '20px' }}>
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
                <div key={i} className="text-center p-1" style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  minWidth: '70px',
                  backgroundColor: 'white',
                  fontSize: '11px'
                }}>
                  <div className="fw-semibold">{cls.className}</div>
                  <div>₹{cls.price}</div>
                  {cls.waitlistCount > 0 ? (
                    <>
                      <div style={{ color: '#dc2626' }}>WL {cls.waitlistCount}</div>
                      <div style={{
                        fontSize: '10px',
                        color: getChanceColor(cls.confirmChance),
                        backgroundColor: getChanceBg(cls.confirmChance),
                        borderRadius: '3px',
                        padding: '1px 3px'
                      }}>
                        {cls.confirmChance}%
                      </div>
                    </>
                  ) : (
                    <div style={{ color: '#1a7f37' }}>Available</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="border rounded p-2 mb-3" style={{
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0'
        }}>
          <div className="small fw-semibold mb-1" style={{ color: '#166534' }}>
            💰 Price Breakdown
          </div>
          <div className="d-flex justify-content-between small">
            <span className="text-muted">
              Train 1 ({route.train1.from} → {route.train1.to})
            </span>
            <span className="fw-semibold">from ₹{train1MinPrice}</span>
          </div>
          <div className="d-flex justify-content-between small">
            <span className="text-muted">
              Train 2 ({route.train2.from} → {route.train2.to})
            </span>
            <span className="fw-semibold">from ₹{train2MinPrice}</span>
          </div>
          <div className="d-flex justify-content-between small mt-1 pt-1"
            style={{ borderTop: '1px dashed #86efac' }}>
            <span className="fw-semibold" style={{ color: '#166534' }}>
              Total cheapest combo
            </span>
            <span className="fw-bold" style={{ color: '#166534' }}>
              ₹{route.cheapestPrice}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="d-flex justify-content-between align-items-center">
          <span className="text-muted small">
            🕐 Total journey: {route.totalDuration}
          </span>
          <button
            className="btn btn-sm"
            style={{
              backgroundColor: '#e63946',
              color: 'white',
              fontSize: '12px'
            }}
            onClick={() => alert('Booking flow coming soon!')}
          >
            Book This Route
          </button>
        </div>

      </div>
    </div>
  )
}

export default AlternateRouteCard