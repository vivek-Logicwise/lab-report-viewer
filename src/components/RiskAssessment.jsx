import './RiskAssessment.css';

/**
 * Risk Assessment Component
 * Displays overall risk score and category-wise risks
 */
function RiskAssessment({ riskAssessment }) {
  if (!riskAssessment) return null;

  // Handle both old and new data structures
  const overallScore = riskAssessment.overall_risk_score || riskAssessment.overall_score || 0;
  const riskCategory = riskAssessment.risk_category || '';
  const categoryRisks = riskAssessment.category_risks;

  // Convert new structure to array if it's an object
  const categoryRisksArray = Array.isArray(categoryRisks) 
    ? categoryRisks 
    : Object.keys(categoryRisks || {}).map(key => ({
        category: key,
        ...categoryRisks[key],
        risk_level: getRiskLevelFromSeverity(categoryRisks[key].average_severity),
        affected_markers: categoryRisks[key].markers_count,
      }));

  /**
   * Get risk level from severity score
   */
  function getRiskLevelFromSeverity(severity) {
    if (severity < 2.5) return 'Low';
    if (severity < 5.0) return 'Moderate';
    return 'High';
  }

  /**
   * Get risk level color
   */
  const getRiskColor = (riskLevel) => {
    const colorMap = {
      'Low': '#10b981',
      'Moderate': '#f59e0b',
      'High': '#ef4444',
    };
    return colorMap[riskLevel] || '#6b7280';
  };

  /**
   * Get overall risk category based on score
   */
  const getOverallRiskCategory = (score) => {
    if (riskCategory) {
      return riskCategory === 'LOW' ? 'Low Risk' : 
             riskCategory === 'MODERATE' ? 'Moderate Risk' : 'High Risk';
    }
    if (score < 30) return 'Low Risk';
    if (score < 70) return 'Moderate Risk';
    return 'High Risk';
  };

  // Normalize score to 0-100 range if needed
  const normalizedScore = overallScore > 10 ? overallScore : overallScore * 10;

  return (
    <div className="risk-assessment">
      <h2>Risk Assessment</h2>

      <div className="overall-risk">
        <div className="risk-score-container">
          <div className="risk-score-circle">
            <svg viewBox="0 0 100 100" className="risk-score-svg">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="10"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={normalizedScore < 30 ? '#10b981' : normalizedScore < 70 ? '#f59e0b' : '#ef4444'}
                strokeWidth="10"
                strokeDasharray={`${normalizedScore * 2.827} 282.7`}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="risk-score-text">
              <div className="risk-score-value">{overallScore.toFixed(1)}</div>
              <div className="risk-score-label">Risk Score</div>
            </div>
          </div>
          <div className="risk-category">
            {getOverallRiskCategory(normalizedScore)}
          </div>
        </div>
      </div>

      <div className="category-risks">
        <h3>Category-wise Risk Analysis</h3>
        <div className="risk-cards">
          {categoryRisksArray.map((risk, index) => (
            <div key={index} className="risk-card">
              <div className="risk-card-header">
                <span className="risk-category-name">{risk.category}</span>
                <span 
                  className="risk-level-badge"
                  style={{ backgroundColor: getRiskColor(risk.risk_level) }}
                >
                  {risk.risk_level}
                </span>
              </div>
              <div className="risk-card-body">
                <div className="affected-markers">
                  {risk.affected_markers} marker{risk.affected_markers !== 1 ? 's' : ''} affected
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default RiskAssessment;
