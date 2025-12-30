import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import UploadPage from './components/UploadPage';
import PatientViewer from './components/PatientViewer';
import './App.css';

/**
 * Main App Component with React Router
 * Manages:
 * - Routing between upload and viewer pages
 * - Patient data storage and navigation
 * - Current patient index for navigation
 */
function App() {
  // Array of patient data objects received from backend
  const [patients, setPatients] = useState([]);
  
  // Loading state for next patient navigation
  const [isLoadingNext, setIsLoadingNext] = useState(false);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<UploadPageWrapper patients={patients} setPatients={setPatients} />} />
        <Route path="/patient/:index" element={<PatientViewerWrapper patients={patients} setPatients={setPatients} isLoadingNext={isLoadingNext} setIsLoadingNext={setIsLoadingNext} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

/**
 * Upload Page Wrapper Component
 */
function UploadPageWrapper({ patients, setPatients }) {
  const navigate = useNavigate();

  /**
   * Handle completion of PDF uploads
   * @param {Array} uploadedPatients - Array of patient data from backend
   */
  const handleUploadComplete = (uploadedPatients) => {
    setPatients(uploadedPatients);
    navigate('/patient/0');
  };

  return <UploadPage onUploadComplete={handleUploadComplete} />;
}

/**
 * Patient Viewer Wrapper Component
 */
function PatientViewerWrapper({ patients, setPatients, isLoadingNext, setIsLoadingNext }) {
  const navigate = useNavigate();
  const { index } = useParams();
  const currentPatientIndex = parseInt(index, 10);

  // Redirect to upload if no patients
  if (!patients || patients.length === 0) {
    return <Navigate to="/" replace />;
  }

  // Redirect if index is out of bounds
  if (currentPatientIndex < 0 || currentPatientIndex >= patients.length) {
    return <Navigate to="/patient/0" replace />;
  }

  /**
   * Navigate to previous patient
   */
  const handlePrevious = () => {
    if (currentPatientIndex > 0) {
      navigate(`/patient/${currentPatientIndex - 1}`);
    }
  };

  /**
   * Navigate to next patient
   * Shows loading state while waiting for backend processing
   */
  const handleNext = async () => {
    if (currentPatientIndex < patients.length - 1) {
      setIsLoadingNext(true);
      
      // Simulate waiting for backend processing (remove in production)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      navigate(`/patient/${currentPatientIndex + 1}`);
      setIsLoadingNext(false);
    }
  };

  /**
   * Return to upload page
   */
  const handleBackToUpload = () => {
    setPatients([]);
    navigate('/');
  };

  return (
    <PatientViewer
      patient={patients[currentPatientIndex]}
      currentIndex={currentPatientIndex}
      totalPatients={patients.length}
      onPrevious={handlePrevious}
      onNext={handleNext}
      isLoadingNext={isLoadingNext}
      onBackToUpload={handleBackToUpload}
    />
  );
}

export default App;
