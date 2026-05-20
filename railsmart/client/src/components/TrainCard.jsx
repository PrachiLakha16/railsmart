function TrainCard({ train }) {
  return (
    <div className="card mb-3 shadow-sm">
      <div className="card-body">

        {/* Train name and number */}
        <div className="d-flex justify-content-between align-items-center mb-2">
          <div>
            <span className="fw-semibold">{train.trainNumber} {train.trainName}</span>
            {train.isAlternate && (
              <span
                className="badge ms-2"
                style={{ backgroundColor: '#e63946' }}
              >
                Alternate Route
              </span>
            )}
          </div>
          <div className="text-muted small">⭐ {train.rating || 'N/A'}</div>
        </div>

        {/* Time and duration */}
        <div className="d-flex align-items-center gap-3 mb-3">
          <span className="fw-bold fs-5">{train.departureTime}</span>
          <div className="text-center">
            <div className="text-muted small">{train.duration}</div>
            <div style={{ borderTop: '1px solid #ccc', width: '80px' }}></div>
          </div>
          <span className="fw-bold fs-5">{train.arrivalTime}</span>
          <span className="text-muted small">{train.source} → {train.destination}</span>
        </div>

        {/* Class boxes */}
        <div className="d-flex gap-2 flex-wrap">
          {train.classes && train.classes.map((cls, index) => (
            <div
              key={index}
              className="border rounded p-2 text-center"
              style={{
                minWidth: '90px',
                backgroundColor: cls.availableSeats === 0 ? '#fff8f0' : 'white',
                borderColor: cls.waitlistCount > 0 ? '#ffc107' : '#dee2e6'
              }}
            >
              <div className="fw-semibold small">{cls.className}</div>
              <div className="small">₹{cls.price}</div>
              {cls.waitlistCount > 0 ? (
                <>
                  <div className="fw-bold" style={{ color: '#e63946' }}>
                    WL {cls.waitlistCount}
                  </div>
                  <div className="small text-success">
                    {cls.confirmChance}% Chance
                  </div>
                </>
              ) : (
                <div className="small text-success fw-semibold">Available</div>
              )}
            </div>
          ))}
        </div>

        {/* WL Alert button — your unique feature */}
        <div className="mt-3 d-flex gap-2">
          <button
            className="btn btn-sm btn-outline-warning"
            onClick={() => alert('WL Alert set! We will notify you.')}
          >
            🔔 Set WL Alert
          </button>
          {train.isAlternate && (
            <span className="text-muted small align-self-center">
              via {train.viaStation}
            </span>
          )}
        </div>

      </div>
    </div>
  )
}

export default TrainCard