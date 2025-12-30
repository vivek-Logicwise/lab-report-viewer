import { useState } from 'react';
import PatientHeader from './PatientHeader';
import SummaryCards from './SummaryCards';
import MarkerTable from './MarkerTable';
import RiskAssessment from './RiskAssessment';
import BiologicalAge from './BiologicalAge';
import PatternDetection from './PatternDetection';
import AIReportModal from './AIReportModal';
import './PatientViewer.css';

/**
 * Patient Viewer Component
 * Main component for displaying patient lab results with navigation
 */
function PatientViewer({
  patient,
  currentIndex,
  totalPatients,
  onPrevious,
  onNext,
  isLoadingNext,
  onBackToUpload,
}) {
  const [showAIReport, setShowAIReport] = useState(false);

  if (!patient) {
    return (
      <div className="patient-viewer">
        <div className="no-patient">
          <p>No patient data available</p>
          <button onClick={onBackToUpload}>Back to Upload</button>
        </div>
      </div>
    );
  }

  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex < totalPatients - 1;

  return (
    <div className="patient-viewer">
      {/* Navigation Bar */}
      <div className="viewer-header">
        <button 
          className="back-btn"
          onClick={onBackToUpload}
        >
          ← Back to Upload
        </button>

        <div className="patient-counter">
          Patient {currentIndex + 1} of {totalPatients}
        </div>

        <button 
          className="ai-report-btn"
          onClick={() => setShowAIReport(true)}
        >
          🤖 Generate AI Report
        </button>
      </div>

      {/* Patient Content */}
      <div className="viewer-content">
        {isLoadingNext ? (
          <div className="loading-container">
            <div className="spinner-large"></div>
            <p>Loading patient data...</p>
          </div>
        ) : (
          <>
            <PatientHeader participant={patient.participant} />
            <SummaryCards summary={patient.summary} markers={patient.markers} />
            <PatternDetection patterns={patient.patterns} />
            <MarkerTable markers={patient.markers} />
            <RiskAssessment riskAssessment={patient.risk_assessment} />
            <BiologicalAge 
              biologicalAge={patient.biological_age} 
              chronologicalAge={patient.participant?.chronological_age}
            />
          </>
        )}
      </div>

      {/* Navigation Controls */}
      <div className="viewer-footer">
        <button
          className="nav-btn prev-btn"
          onClick={onPrevious}
          disabled={!canGoPrevious || isLoadingNext}
        >
          ← Previous Patient
        </button>

        <button
          className="nav-btn next-btn"
          onClick={onNext}
          disabled={!canGoNext || isLoadingNext}
        >
          {isLoadingNext ? 'Loading...' : 'Next Patient →'}
        </button>
      </div>

      {/* AI Report Modal */}
      {showAIReport && (
        <AIReportModal
          participantId={patient.participant.id}
          onClose={() => setShowAIReport(false)}
        />
      )}
    </div>
  );
}

export default PatientViewer;
