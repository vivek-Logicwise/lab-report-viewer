import { useState } from 'react';
import { uploadPDFFiles } from '../services/api';
import './UploadPage.css';

/**
 * PDF Upload Page Component
 * Handles multi-file PDF uploads with progress tracking
 */
function UploadPage({ onUploadComplete }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  /**
   * Handle file selection
   */
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    
    // Validate PDF files
    const pdfFiles = files.filter(file => file.type === 'application/pdf');
    
    if (pdfFiles.length !== files.length) {
      setError('Please select only PDF files');
      return;
    }

    setSelectedFiles(pdfFiles);
    setError(null);
  };

  /**
   * Remove a selected file
   */
  const handleRemoveFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  /**
   * Handle file upload
   */
  const handleUpload = async () => {
    debugger;
    if (selectedFiles.length === 0) {
      setError('Please select at least one PDF file');
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Simulate progress (in production, use XMLHttpRequest for real progress)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      // Upload files
      const fileList = selectedFiles.reduce((dt, file, index) => {
        dt.items.add(file);
        return dt;
      }, new DataTransfer()).files;

      const patients = await uploadPDFFiles(fileList, setUploadProgress);

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Wait a moment to show 100% before transitioning
      setTimeout(() => {
        onUploadComplete(patients);
      }, 500);

    } catch (err) {
      setError(err.message || 'Upload failed. Please try again.');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  /**
   * Format file size for display
   */
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="upload-page">
      <div className="upload-container">
        <h1>Lab Report Upload</h1>
        <p className="subtitle">Upload patient lab reports in PDF format</p>

        <div className="upload-area">
          <label htmlFor="file-input" className="file-input-label">
            <div className="upload-icon">📄</div>
            <p className="upload-text">
              Click to select PDF files
            </p>
            <p className="upload-hint">
              Multiple files supported • Each PDF represents one patient
            </p>
            <input
              id="file-input"
              type="file"
              accept=".pdf"
              multiple
              onChange={handleFileSelect}
              disabled={isUploading}
              className="file-input"
            />
          </label>
        </div>

        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        {selectedFiles.length > 0 && (
          <div className="selected-files">
            <h3>Selected Files ({selectedFiles.length})</h3>
            <div className="file-list">
              {selectedFiles.map((file, index) => (
                <div key={index} className="file-item">
                  <div className="file-info">
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">{formatFileSize(file.size)}</span>
                  </div>
                  {!isUploading && (
                    <button
                      className="remove-file-btn"
                      onClick={() => handleRemoveFile(index)}
                      aria-label="Remove file"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {isUploading && (
          <div className="progress-container">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="progress-text">{uploadProgress}% uploaded</p>
          </div>
        )}

        <button
          className="upload-btn"
          onClick={handleUpload}
          disabled={isUploading || selectedFiles.length === 0}
        >
          {isUploading ? 'Uploading...' : `Upload ${selectedFiles.length} File${selectedFiles.length !== 1 ? 's' : ''}`}
        </button>
      </div>
    </div>
  );
}

export default UploadPage;
