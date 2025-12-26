# Lab Report Viewer - Component Documentation

## Component Overview

### 1. App.jsx (Main Component)
**Purpose**: Root component managing application state and navigation

**Key Responsibilities**:
- Manages page state (upload vs viewer)
- Stores array of patient data
- Handles current patient index
- Provides navigation callbacks to child components

**State Variables**:
- `currentPage`: 'upload' | 'viewer'
- `patients`: Array of patient data objects
- `currentPatientIndex`: Number (0-based)
- `isLoadingNext`: Boolean for loading state

**Methods**:
- `handleUploadComplete(uploadedPatients)`: Transitions to viewer page with patient data
- `handlePrevious()`: Navigates to previous patient
- `handleNext()`: Navigates to next patient with loading state
- `handleBackToUpload()`: Returns to upload page and resets state

---

### 2. UploadPage.jsx
**Purpose**: Multi-PDF file upload interface

**Features**:
- Drag-and-drop file selection
- Multiple PDF file support
- File validation (PDF only)
- Individual file removal
- Upload progress tracking
- Error handling

**State Variables**:
- `selectedFiles`: Array of File objects
- `isUploading`: Boolean
- `uploadProgress`: Number (0-100)
- `error`: String | null

**Props**:
- `onUploadComplete(patients)`: Callback when upload succeeds

**Key Methods**:
- `handleFileSelect(event)`: Validates and stores selected files
- `handleRemoveFile(index)`: Removes a file from selection
- `handleUpload()`: Initiates upload process
- `formatFileSize(bytes)`: Formats bytes to readable string

---

### 3. PatientViewer.jsx
**Purpose**: Main container for displaying patient lab results

**Features**:
- Navigation header with patient counter
- Loading states
- Content sections orchestration
- Navigation controls

**Props**:
- `patient`: Patient data object
- `currentIndex`: Current patient number
- `totalPatients`: Total number of patients
- `onPrevious()`: Previous button callback
- `onNext()`: Next button callback
- `isLoadingNext`: Loading state boolean
- `onBackToUpload()`: Back to upload callback

**State Variables**:
- `showAIReport`: Boolean for modal visibility

---

### 4. PatientHeader.jsx
**Purpose**: Display patient demographic information

**Features**:
- Responsive grid layout
- Displays ID, code, age, gender, report date
- Clean label/value presentation

**Props**:
- `participant`: Object with patient info
  - `id`: String
  - `code`: String
  - `age`: Number
  - `gender`: String

---

### 5. SummaryCards.jsx
**Purpose**: Visual summary of lab result statistics

**Features**:
- 4 cards: Normal, Elevated, High, Critical
- Color-coded by severity
- Icon indicators
- Hover effects

**Props**:
- `summary`: Object with counts
  - `normal`: Number
  - `elevated`: Number
  - `high`: Number
  - `critical`: Number

**Styling**:
- Green: Normal
- Yellow: Elevated
- Orange: High
- Red: Critical

---

### 6. MarkerTable.jsx
**Purpose**: Display and filter lab markers

**Features**:
- Category filtering (All, Hematology, Biochemistry, etc.)
- Search functionality
- Grouped by category
- Responsive table/card layout
- Color-coded status badges

**Props**:
- `markers`: Array of marker objects
  - `code`: String
  - `name`: String
  - `category`: String
  - `value`: String/Number
  - `unit`: String
  - `status`: 'Normal' | 'Elevated' | 'High' | 'Critical'
  - `severity`: Number (0-3)
  - `reference_range`: { min, max }

**State Variables**:
- `selectedCategory`: String
- `searchTerm`: String

**Key Methods**:
- `getStatusClass(status)`: Returns CSS class for status badge
- Filters markers by category and search term

---

### 7. RiskAssessment.jsx
**Purpose**: Visualize health risk analysis

**Features**:
- Circular progress chart for overall risk score
- Category-wise risk breakdown
- Color-coded risk levels
- Responsive grid layout

**Props**:
- `riskAssessment`: Object
  - `overall_score`: Number (0-100)
  - `category_risks`: Array of objects
    - `category`: String
    - `risk_level`: 'Low' | 'Moderate' | 'High'
    - `affected_markers`: Number

**Key Methods**:
- `getRiskColor(riskLevel)`: Returns color for risk level
- `getOverallRiskCategory(score)`: Calculates risk category from score
  - 0-30: Low Risk
  - 30-70: Moderate Risk
  - 70+: High Risk

---

### 8. BiologicalAge.jsx
**Purpose**: Display biological age comparison

**Features**:
- Visual age comparison
- Difference indicator (younger/older)
- Contextual health explanation
- Gradient background for visual appeal

**Props**:
- `biologicalAge`: Object
  - `chronological_age`: Number
  - `biological_age`: Number
  - `difference`: Number (negative = younger)

**Display Logic**:
- Green background if younger
- Yellow background if older
- Different emoji and messaging based on comparison

---

### 9. AIReportModal.jsx
**Purpose**: Generate and display AI health report

**Features**:
- Modal overlay
- On-demand report generation
- Loading state
- Structured content rendering
- Download button (ready for implementation)
- Error handling with retry

**Props**:
- `participantId`: String
- `onClose()`: Close modal callback

**State Variables**:
- `report`: Object | null
- `isLoading`: Boolean
- `error`: String | null

**Report Structure**:
- `title`: String
- `sections`: Array of { heading, content }
- `generated_at`: ISO date string

---

## API Service (api.js)

### Functions

#### uploadPDFFiles(files, onProgress)
Uploads PDF files to backend

**Parameters**:
- `files`: FileList object
- `onProgress`: Callback function for progress updates

**Returns**: Promise<Array> of patient data

**Fallback**: Generates mock patient data if backend unavailable

---

#### generateAIReport(participantId)
Generates AI health report for a patient

**Parameters**:
- `participantId`: String

**Returns**: Promise<Object> with report data

**Fallback**: Returns mock AI report if backend unavailable

---

#### generateMockPatientData(count)
Creates realistic mock patient data for testing

**Parameters**:
- `count`: Number of patients to generate

**Returns**: Array of patient objects

---

## Data Structure Specifications

### Patient Object
```javascript
{
  participant: {
    id: String,
    code: String,
    age: Number,
    gender: String
  },
  summary: {
    normal: Number,
    elevated: Number,
    high: Number,
    critical: Number
  },
  markers: [
    {
      code: String,
      name: String,
      category: String,
      value: String,
      unit: String,
      status: String,
      severity: Number,
      reference_range: {
        min: String,
        max: String
      }
    }
  ],
  risk_assessment: {
    overall_score: Number,
    category_risks: [
      {
        category: String,
        risk_level: String,
        affected_markers: Number
      }
    ]
  },
  biological_age: {
    chronological_age: Number,
    biological_age: Number,
    difference: Number
  }
}
```

### AI Report Object
```javascript
{
  participant_id: String,
  report: {
    title: String,
    sections: [
      {
        heading: String,
        content: String
      }
    ],
    generated_at: String (ISO date)
  }
}
```

---

## Styling Architecture

### CSS Variables (App.css)
- Colors: Primary, success, warning, danger, grays
- Shadows: sm, md, lg
- Border radius: sm, md, lg
- Consistent design tokens across components

### Responsive Breakpoints
- Desktop: > 1024px
- Tablet: 768px - 1024px
- Mobile: < 768px

### Layout Strategy
- Flexbox for component-level layouts
- CSS Grid for card layouts and tables
- Mobile-first responsive design

---

## User Flow

1. **Upload Page**
   - User selects multiple PDF files
   - Validates files (PDF only)
   - Can remove individual files
   - Clicks "Upload"
   - Progress bar shows upload status
   - Transitions to Patient Viewer

2. **Patient Viewer**
   - Displays first patient automatically
   - User can navigate with Previous/Next buttons
   - Loading state shown while fetching next patient
   - User can click "Generate AI Report" button
   - Modal opens with AI report
   - User can download report
   - User can return to upload page

---

## Integration Guide

### Backend Integration Steps

1. **Update Environment Variables**
   Create `.env` file:
   ```
   VITE_API_BASE_URL=http://your-backend-url/api
   ```

2. **Remove Mock Data**
   In `src/services/api.js`:
   - Remove `generateMockPatientData()` function
   - Remove `generateMockMarkers()` function
   - Remove `generateMockAIReport()` function
   - Remove try-catch fallback to mock data

3. **Implement Real Upload Progress**
   Replace fetch with XMLHttpRequest for real progress:
   ```javascript
   const xhr = new XMLHttpRequest();
   xhr.upload.addEventListener('progress', (e) => {
     if (e.lengthComputable) {
       const percentComplete = (e.loaded / e.total) * 100;
       onProgress(percentComplete);
     }
   });
   ```

4. **Error Handling**
   Update error messages to show backend-specific errors

5. **Authentication**
   Add authorization headers if needed:
   ```javascript
   headers: {
     'Authorization': `Bearer ${token}`
   }
   ```

---

## Testing Strategy

### Manual Testing Checklist

**Upload Page**
- [ ] Select single PDF
- [ ] Select multiple PDFs
- [ ] Try non-PDF files (should show error)
- [ ] Remove files individually
- [ ] Upload with progress tracking
- [ ] Verify transition to viewer

**Patient Viewer**
- [ ] Verify patient header displays correctly
- [ ] Check summary cards show correct counts
- [ ] Test marker table filtering
- [ ] Test marker search
- [ ] Verify risk assessment visualization
- [ ] Check biological age comparison
- [ ] Test Previous/Next navigation
- [ ] Verify loading states
- [ ] Test back to upload

**AI Report**
- [ ] Click Generate AI Report
- [ ] Verify loading state
- [ ] Check report renders correctly
- [ ] Test close modal
- [ ] Test download button (when implemented)

**Responsive Design**
- [ ] Test on desktop (1920px)
- [ ] Test on tablet (768px)
- [ ] Test on mobile (375px)
- [ ] Check all interactions work on touch devices

---

## Performance Considerations

1. **Large Datasets**: If marker arrays are very large (>1000), consider:
   - Virtual scrolling
   - Pagination
   - React.memo for marker rows

2. **Multiple Patients**: Current implementation stores all patient data
   - Consider lazy loading if >50 patients
   - Implement data fetching on navigation

3. **File Upload**: Large PDFs may cause issues
   - Consider chunked upload
   - Add file size validation
   - Show file size warnings

---

## Accessibility Features

Current implementation includes:
- Semantic HTML
- Keyboard navigation support
- Focus states on interactive elements
- Color contrast for readability

**Recommended Additions**:
- ARIA labels for all buttons
- Screen reader announcements for loading states
- Keyboard shortcuts for navigation
- Focus trap in modal
- Skip links for main content

---

## Known Limitations (POC)

1. Mock data instead of real backend
2. Simulated upload progress
3. No authentication
4. No data persistence
5. Limited error handling
6. No automated tests
7. Download functionality not implemented
8. No print stylesheet

---

## Future Enhancements

1. Export to PDF functionality
2. Print-friendly layout
3. Chart visualizations for trends
4. Comparison between patients
5. Historical data tracking
6. Email report functionality
7. Multi-language support
8. Dark mode
9. Customizable themes
10. Advanced filtering and sorting
