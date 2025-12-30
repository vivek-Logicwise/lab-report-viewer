import './BiologicalAge.css';

/**
 * Biological Age Component
 * Displays biological age vs chronological age comparison
 */
function BiologicalAge({ biologicalAge, chronologicalAge }) {
  if (!biologicalAge) return null;

  // Handle both old and new data structures
  const chronAge = chronologicalAge || biologicalAge.chronological_age || null;
  const bioAge = Number(biologicalAge.biological_age?.toFixed(1)) || 0;
  const difference = biologicalAge.age_delta || biologicalAge.difference || (bioAge - (chronAge || 0));

  // Don't display if we don't have valid data
  if (!chronAge || bioAge === 0) {
    return (
      <div className="biological-age">
        <h2>Biological Age Analysis</h2>
        <div className="age-explanation">
          <p>Biological age calculation requires chronological age data. Please provide your age for accurate analysis.</p>
        </div>
      </div>
    );
  }

  const isYounger = difference < 0;
  const abseDifference = Math.abs(difference).toFixed(1);

  return (
    <div className="biological-age">
      <h2>Biological Age Analysis</h2>

      <div className="age-comparison">
        <div className="age-item">
          <div className="age-label">Chronological Age</div>
          <div className="age-value">{chronAge}</div>
          <div className="age-unit">years</div>
        </div>

        <div className="age-arrow">
          {isYounger ? '→' : '←'}
        </div>

        <div className="age-item">
          <div className="age-label">Biological Age</div>
          <div className="age-value">{bioAge}</div>
          <div className="age-unit">years</div>
        </div>
      </div>

      <div className={`age-difference ${isYounger ? 'younger' : 'older'}`}>
        <div className="difference-icon">
          {isYounger ? '😊' : '⚠️'}
        </div>
        <div className="difference-text">
          Your biological age is{' '}
          <strong>{abseDifference} year{abseDifference !== '1.0' ? 's' : ''}</strong>
          {isYounger ? ' younger' : ' older'} than your chronological age
        </div>
      </div>

      <div className="age-explanation">
        <p>
          {isYounger
            ? 'Your lab markers indicate that your body is functioning at a level typically seen in someone younger than your chronological age. This is a positive indicator of overall health.'
            : 'Your lab markers suggest that your body may be aging faster than your chronological age. Consider lifestyle modifications and consult with your healthcare provider.'}
        </p>
      </div>
    </div>
  );
}

export default BiologicalAge;
