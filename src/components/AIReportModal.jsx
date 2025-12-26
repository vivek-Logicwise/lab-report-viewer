import { useState } from 'react';
import { generateAIReport } from '../services/api';
import './AIReportModal.css';

/**
 * AI Report Modal Component
 * Generates and displays AI-powered health report
 */
function AIReportModal({ participantId, onClose }) {
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Generate AI report
   */
  const handleGenerateReport = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const reportData = await generateAIReport(participantId);
      setReport(reportData);
    } catch (err) {
      setError('Failed to generate AI report. Please try again.');
      console.error('AI Report error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🤖 AI Health Report</h2>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {!report && !isLoading && !error && (
            <div className="report-prompt">
              <p>Generate a comprehensive AI-powered health report analyzing all 280 markers with deep insights and personalized recommendations.</p>
              <button 
                className="generate-report-btn"
                onClick={handleGenerateReport}
              >
                Generate Complete Analysis
              </button>
            </div>
          )}

          {isLoading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Analyzing all 280 markers with AI...</p>
              <small>This may take up to 2 minutes</small>
            </div>
          )}

          {error && (
            <div className="error-state">
              <p>⚠️ {error}</p>
              <button 
                className="retry-btn"
                onClick={handleGenerateReport}
              >
                Retry
              </button>
            </div>
          )}

          {report && (
            <div className="report-content">
              <div className="report-header">
                <div className="report-title">Complete Health Analysis Report</div>
                <div className="report-meta">
                  <span>Report ID: {report.report_id}</span>
                  <span>Engine: {report.analysis_engine}</span>
                  <span>Processing Time: {report.processing_time_seconds}s</span>
                </div>
              </div>

              {/* Executive Summary */}
              <div className="report-section highlight-section">
                <h3 className="section-heading">📊 Executive Summary</h3>
                <div className="section-content">
                  <div className="summary-item">
                    <strong>Overall Status:</strong> 
                    <span className={`status-badge status-${report.executive_summary.overall_health_status.toLowerCase()}`}>
                      {report.executive_summary.overall_health_status.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div className="summary-item">
                    <strong>Biological Age:</strong>
                    <div className="bio-age-summary">
                      <span className="age-value">{report.executive_summary.biological_age_assessment.calculated_biological_age} years</span>
                      <span className={`age-delta ${report.executive_summary.biological_age_assessment.age_delta < 0 ? 'positive' : 'negative'}`}>
                        ({report.executive_summary.biological_age_assessment.age_delta > 0 ? '+' : ''}{report.executive_summary.biological_age_assessment.age_delta} years)
                      </span>
                    </div>
                    <p className="age-interpretation">{report.executive_summary.biological_age_assessment.interpretation}</p>
                  </div>
                </div>
              </div>

              {/* Key Findings */}
              <div className="report-section">
                <h3 className="section-heading">🔍 Key Findings</h3>
                <div className="section-content">
                  <ul className="findings-list">
                    {report.executive_summary.key_findings.map((finding, idx) => (
                      <li key={idx}>{finding}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Priority Actions */}
              <div className="report-section priority-section">
                <h3 className="section-heading">⚡ Priority Actions</h3>
                <div className="section-content">
                  <ol className="priority-list">
                    {report.executive_summary.priority_actions.map((action, idx) => (
                      <li key={idx}>{action}</li>
                    ))}
                  </ol>
                </div>
              </div>

              {/* Statistics */}
              <div className="report-section">
                <h3 className="section-heading">📈 Analysis Statistics</h3>
                <div className="section-content">
                  <div className="stats-grid">
                    <div className="stat-item">
                      <div className="stat-value">{report.summary_statistics.total_markers_analyzed}</div>
                      <div className="stat-label">Total Markers</div>
                    </div>
                    <div className="stat-item normal">
                      <div className="stat-value">{report.summary_statistics.normal_count}</div>
                      <div className="stat-label">Normal</div>
                    </div>
                    <div className="stat-item elevated">
                      <div className="stat-value">{report.summary_statistics.elevated_count}</div>
                      <div className="stat-label">Elevated</div>
                    </div>
                    <div className="stat-item high">
                      <div className="stat-value">{report.summary_statistics.high_count}</div>
                      <div className="stat-label">High</div>
                    </div>
                    <div className="stat-item critical">
                      <div className="stat-value">{report.summary_statistics.critical_count}</div>
                      <div className="stat-label">Critical</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pattern Analysis */}
              <div className="report-section">
                <h3 className="section-heading">🔬 Pattern Analysis</h3>
                <div className="section-content">
                  {report.pattern_analysis.identified_patterns.map((pattern, idx) => (
                    <div key={idx} className="pattern-card">
                      <div className="pattern-header">
                        <h4>{pattern.pattern_name}</h4>
                        <span className={`severity-badge severity-${pattern.severity.toLowerCase()}`}>
                          {pattern.severity.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="pattern-details">
                        <p><strong>Markers Involved:</strong> {pattern.markers_involved.join(', ')}</p>
                        <p><strong>Health Impact:</strong> {pattern.health_implications}</p>
                        <p><strong>Intervention:</strong> {pattern.intervention_strategy}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk Assessment */}
              <div className="report-section">
                <h3 className="section-heading">⚠️ Risk Assessment by Category</h3>
                <div className="section-content">
                  <div className="risk-categories">
                    {Object.entries(report.comprehensive_risk_assessment.category_breakdown).map(([category, data]) => (
                      <div key={category} className="risk-category-card">
                        <div className="risk-cat-header">
                          <span className="cat-name">{category}</span>
                          <span className={`risk-badge risk-${data.risk_level.toLowerCase()}`}>
                            {data.risk_level}
                          </span>
                        </div>
                        <div className="risk-cat-details">
                          <div className="risk-detail">Severity: {data.average_severity}/10</div>
                          <div className="risk-detail">Markers: {data.markers_count}</div>
                          {data.primary_markers && (
                            <div className="risk-detail">Key: {data.primary_markers.join(', ')}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI Insights */}
              <div className="report-section highlight-section">
                <h3 className="section-heading">🤖 AI-Generated Insights</h3>
                <div className="section-content">
                  <p className="narrative">{report.ai_generated_insights.primary_health_narrative}</p>
                  
                  <h4>Optimization Priorities</h4>
                  {report.ai_generated_insights.optimization_priorities.map((priority, idx) => (
                    <div key={idx} className="priority-card">
                      <div className="priority-header">
                        <span className="priority-number">Priority {priority.priority}</span>
                        <strong>{priority.focus}</strong>
                      </div>
                      <p>{priority.rationale}</p>
                      <div className="priority-timeline">Timeline: {priority.expected_timeline}</div>
                      <div className="priority-metrics">
                        <strong>Success Metrics:</strong>
                        <ul>
                          {priority.success_metrics.map((metric, midx) => (
                            <li key={midx}>{metric}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div className="report-section">
                <h3 className="section-heading">💊 Comprehensive Recommendations</h3>
                <div className="section-content">
                  {report.comprehensive_recommendations.critical_interventions.map((intervention, idx) => (
                    <div key={idx} className="intervention-card">
                      <div className="intervention-header">
                        <h4>{intervention.category}</h4>
                        <span className={`priority-badge priority-${intervention.priority.toLowerCase()}`}>
                          {intervention.priority}
                        </span>
                      </div>
                      <ul className="intervention-actions">
                        {intervention.specific_actions.map((action, aidx) => (
                          <li key={aidx}>{action}</li>
                        ))}
                      </ul>
                      <div className="expected-impact">
                        <strong>Expected Impact:</strong> {intervention.expected_impact}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Monitoring Schedule */}
              <div className="report-section">
                <h3 className="section-heading">📅 Monitoring Schedule</h3>
                <div className="section-content">
                  {Object.entries(report.comprehensive_recommendations.monitoring_schedule).map(([timepoint, data]) => (
                    <div key={timepoint} className="monitoring-card">
                      <h4>{timepoint.replace('_', ' ')}</h4>
                      <p><strong>Markers to Retest:</strong> {data.markers_to_retest.join(', ')}</p>
                      <p><strong>Expected Changes:</strong> {data.expected_changes}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="report-footer">
                <small>
                  Generated: {new Date(report.generated_at).toLocaleString()} | 
                  Confidence Score: {(report.report_metadata.confidence_score_overall * 100).toFixed(0)}% |
                  Data Quality: {(report.report_metadata.data_quality_score * 100).toFixed(0)}%
                </small>
                <p className="disclaimer">
                  ⚠️ This AI-generated report should be reviewed by a licensed healthcare provider. 
                  Not intended as medical diagnosis or treatment advice.
                </p>
              </div>
            </div>
          )}
        </div>

        {report && (
          <div className="modal-footer">
            <button className="download-btn">
              📥 Download Report
            </button>
            <button className="close-btn" onClick={onClose}>
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AIReportModal;
