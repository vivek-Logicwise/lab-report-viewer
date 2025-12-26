import { useState } from 'react';
import UploadPage from './components/UploadPage';
import PatientViewer from './components/PatientViewer';
import './App.css';

/**
 * Main App Component
 * Manages:
 * - Current page state (upload vs viewer)
 * - Patient data collection from uploads
 * - Current patient index for navigation
 */
function App() {
  // Page state: 'upload' or 'viewer'
  const [currentPage, setCurrentPage] = useState('upload');
  
  // Array of patient data objects received from backend
  const [patients, setPatients] = useState([]);
  
  // Current patient index being viewed (0-based)
  const [currentPatientIndex, setCurrentPatientIndex] = useState(0);
  
  // Loading state for next patient navigation
  const [isLoadingNext, setIsLoadingNext] = useState(false);

  /**
   * Handle completion of PDF uploads
   * @param {Array} uploadedPatients - Array of patient data from backend
   */
  const handleUploadComplete = (uploadedPatients) => {
    setPatients(uploadedPatients);
    setCurrentPatientIndex(0);
    setCurrentPage('viewer');
  };

  /**
   * Navigate to previous patient
   */
  const handlePrevious = () => {
    if (currentPatientIndex > 0) {
      setCurrentPatientIndex(currentPatientIndex - 1);
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
      
      setCurrentPatientIndex(currentPatientIndex + 1);
      setIsLoadingNext(false);
    }
  };

  /**
   * Return to upload page
   */
  const handleBackToUpload = () => {
    setCurrentPage('upload');
    setPatients([]);
    setCurrentPatientIndex(0);
  };

  return (
    <div className="app">
      {currentPage === 'upload' ? (
        <UploadPage onUploadComplete={handleUploadComplete} />
      ) : (
        <PatientViewer
          patient={patients[currentPatientIndex]}
          currentIndex={currentPatientIndex}
          totalPatients={patients.length}
          onPrevious={handlePrevious}
          onNext={handleNext}
          isLoadingNext={isLoadingNext}
          onBackToUpload={handleBackToUpload}
        />
      )}
    </div>
  );
}

export default App;
