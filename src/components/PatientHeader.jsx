import './PatientHeader.css';

/**
 * Patient Header Component
 * Displays patient demographic information
 */
function PatientHeader({ participant }) {
  if (!participant) return null;

  return (
    <div className="patient-header">
      <div className="patient-info-grid">
        <div className="info-item">
          <span className="info-label">Patient Name</span>
          <span className="info-value">{participant.patient_name}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Patient ID</span>
          <span className="info-value">{participant.participant_code || participant.code}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Age</span>
          <span className="info-value">{participant.chronological_age || participant.age} years</span>
        </div>
        <div className="info-item">
          <span className="info-label">Gender</span>
          <span className="info-value">{participant.gender || 'N/A'}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Report Date</span>
          <span className="info-value">{new Date().toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}

export default PatientHeader;
