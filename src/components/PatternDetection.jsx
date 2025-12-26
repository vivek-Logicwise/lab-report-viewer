import './PatternDetection.css';

/**
 * Pattern Detection Component
 * Displays detected health patterns from lab markers
 */
function PatternDetection({ patterns }) {
  if (!patterns || patterns.length === 0) {
    return (
      <div className="pattern-detection">
        <h2>🔍 Pattern Detection</h2>
        <div className="no-patterns">
          <div className="no-patterns-icon">✓</div>
          <p>No significant health patterns detected</p>
          <span className="no-patterns-subtitle">All markers appear within normal ranges</span>
        </div>
      </div>
    );
  }

  /**
   * Get severity level from score
   */
  const getSeverityLevel = (severity) => {
    if (severity < 3) return 'Low';
    if (severity < 6) return 'Moderate';
    return 'High';
  };

  /**
   * Get severity color
   */
  const getSeverityColor = (severity) => {
    if (severity < 3) return '#10b981'; // Green
    if (severity < 6) return '#f59e0b'; // Orange
    return '#ef4444'; // Red
  };

  /**
   * Get pattern icon based on name
   */
  const getPatternIcon = (patternName) => {
    const iconMap = {
      'Chronic Inflammation': '🔥',
      'Metabolic Syndrome': '⚡',
      'Cardiovascular Risk': '❤️',
      'Oxidative Stress': '🔬',
      'Liver Stress': '🫀',
      'Vitamin Deficiency': '💊',
      'Thyroid Dysfunction': '🦋',
    };
    return iconMap[patternName] || '🔍';
  };

  // Sort patterns by severity (highest first)
  const sortedPatterns = [...patterns].sort((a, b) => b.severity - a.severity);

  return (
    <div className="pattern-detection">
      <div className="pattern-detection-header">
        <h2>🔍 Pattern Detection</h2>
        <div className="patterns-count">
          {patterns.length} {patterns.length === 1 ? 'Pattern' : 'Patterns'} Detected
        </div>
      </div>

      <div className="patterns-grid">
        {sortedPatterns.map((pattern, index) => {
          const severityLevel = getSeverityLevel(pattern.severity);
          const severityColor = getSeverityColor(pattern.severity);
          
          return (
            <div key={index} className="pattern-card">
              <div className="pattern-card-header">
                <div className="pattern-icon">{getPatternIcon(pattern.name)}</div>
                <div className="pattern-info">
                  <h3 className="pattern-name">{pattern.name}</h3>
                  <div className="pattern-stats">
                    <span className="pattern-marker-count">
                      {pattern.trigger_count || pattern.markers_affected.length} marker{(pattern.trigger_count || pattern.markers_affected.length) !== 1 ? 's' : ''}
                    </span>
                    <span className="pattern-divider">•</span>
                    <span 
                      className="pattern-severity"
                      style={{ color: severityColor }}
                    >
                      {severityLevel} Severity
                    </span>
                  </div>
                </div>
                <div 
                  className="pattern-severity-badge"
                  style={{ 
                    backgroundColor: severityColor + '20',
                    color: severityColor,
                    borderColor: severityColor 
                  }}
                >
                  {pattern.severity.toFixed(1)}
                </div>
              </div>

              <p className="pattern-description">{pattern.description}</p>

              <div className="pattern-markers">
                <div className="pattern-markers-label">Affected Markers:</div>
                <div className="pattern-markers-list">
                  {pattern.markers_affected.map((marker, markerIndex) => (
                    <span key={markerIndex} className="pattern-marker-tag">
                      {marker}
                    </span>
                  ))}
                </div>
              </div>

              {/* Severity Bar */}
              <div className="pattern-severity-bar-container">
                <div className="pattern-severity-bar">
                  <div 
                    className="pattern-severity-bar-fill"
                    style={{ 
                      width: `${(pattern.severity / 9) * 100}%`,
                      backgroundColor: severityColor 
                    }}
                  />
                </div>
                <div className="pattern-severity-labels">
                  <span>Low</span>
                  <span>Moderate</span>
                  <span>High</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Section */}
      <div className="patterns-summary">
        <div className="summary-item">
          <div className="summary-label">Total Patterns</div>
          <div className="summary-value">{patterns.length}</div>
        </div>
        <div className="summary-item">
          <div className="summary-label">Avg Severity</div>
          <div className="summary-value">
            {(patterns.reduce((sum, p) => sum + p.severity, 0) / patterns.length).toFixed(1)}
          </div>
        </div>
        <div className="summary-item">
          <div className="summary-label">Critical Patterns</div>
          <div className="summary-value critical">
            {patterns.filter(p => p.severity >= 6).length}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatternDetection;
