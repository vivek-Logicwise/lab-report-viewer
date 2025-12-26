# Component Hierarchy & Data Flow

## Visual Component Tree

```
App.jsx (Root)
├── State Management
│   ├── currentPage: 'upload' | 'viewer'
│   ├── patients: Array<PatientData>
│   ├── currentPatientIndex: number
│   └── isLoadingNext: boolean
│
├── [Page: Upload] ────────────────────────────────────
│   │
│   └── UploadPage.jsx
│       ├── State
│       │   ├── selectedFiles: File[]
│       │   ├── isUploading: boolean
│       │   ├── uploadProgress: number
│       │   └── error: string | null
│       │
│       ├── Methods
│       │   ├── handleFileSelect()
│       │   ├── handleRemoveFile()
│       │   └── handleUpload()
│       │
│       └── Props
│           └── onUploadComplete() → triggers page change
│
└── [Page: Viewer] ────────────────────────────────────
    │
    └── PatientViewer.jsx
        ├── State
        │   └── showAIReport: boolean
        │
        ├── Props (from App)
        │   ├── patient: PatientData
        │   ├── currentIndex: number
        │   ├── totalPatients: number
        │   ├── onPrevious()
        │   ├── onNext()
        │   ├── isLoadingNext: boolean
        │   └── onBackToUpload()
        │
        └── Children Components
            │
            ├── PatientHeader.jsx
            │   └── Props
            │       └── participant: {id, code, age, gender}
            │
            ├── SummaryCards.jsx
            │   └── Props
            │       └── summary: {normal, elevated, high, critical}
            │
            ├── MarkerTable.jsx
            │   ├── State
            │   │   ├── selectedCategory: string
            │   │   └── searchTerm: string
            │   │
            │   └── Props
            │       └── markers: Array<Marker>
            │
            ├── RiskAssessment.jsx
            │   └── Props
            │       └── riskAssessment: {
            │           overall_score: number,
            │           category_risks: Array
            │       }
            │
            ├── BiologicalAge.jsx
            │   └── Props
            │       └── biologicalAge: {
            │           chronological_age: number,
            │           biological_age: number,
            │           difference: number
            │       }
            │
            └── AIReportModal.jsx (Conditional)
                ├── State
                │   ├── report: ReportData | null
                │   ├── isLoading: boolean
                │   └── error: string | null
                │
                ├── Methods
                │   └── handleGenerateReport()
                │
                └── Props
                    ├── participantId: string
                    └── onClose()
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                      User Actions                        │
└─────────────────────────────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────┐
│                       App.jsx                            │
│  • Manages global state                                 │
│  • Routes between pages                                 │
│  • Coordinates data flow                                │
└─────────────────────────────────────────────────────────┘
                           │
                ┌──────────┴──────────┐
                ↓                     ↓
    ┌─────────────────────┐   ┌──────────────────────┐
    │   UploadPage.jsx    │   │  PatientViewer.jsx   │
    │  • File selection   │   │  • Display data      │
    │  • Upload PDFs      │   │  • Navigate patients │
    └─────────────────────┘   └──────────────────────┘
                │                       │
                ↓                       ↓
    ┌─────────────────────┐   ┌──────────────────────┐
    │   API Service       │   │   Sub-Components     │
    │  • uploadPDFFiles() │   │  • PatientHeader     │
    │  • Mock data        │   │  • SummaryCards      │
    └─────────────────────┘   │  • MarkerTable       │
                │              │  • RiskAssessment    │
                │              │  • BiologicalAge     │
                │              └──────────────────────┘
                ↓                       
    ┌─────────────────────┐           ↓
    │  Backend / Mock     │   ┌──────────────────────┐
    │  Returns:           │   │   AIReportModal      │
    │  • Patient array    │   │  • Generate report   │
    └─────────────────────┘   └──────────────────────┘
                │                       │
                │                       ↓
                │              ┌──────────────────────┐
                │              │   API Service        │
                └──────────────→  • generateAIReport()│
                               └──────────────────────┘
```

---

## State Flow

### Upload Flow
```
1. User selects PDF files
   ↓
2. UploadPage validates files (PDF only)
   ↓
3. User clicks "Upload"
   ↓
4. UploadPage calls API.uploadPDFFiles()
   ↓
5. API returns patient data array
   ↓
6. UploadPage calls onUploadComplete(patients)
   ↓
7. App.jsx receives patients
   ↓
8. App.jsx updates state:
   - patients = received data
   - currentPatientIndex = 0
   - currentPage = 'viewer'
   ↓
9. PatientViewer renders with first patient
```

### Navigation Flow
```
User clicks "Next Patient"
   ↓
App.jsx.handleNext() called
   ↓
1. Sets isLoadingNext = true
2. Simulates backend wait
3. Increments currentPatientIndex
4. Sets isLoadingNext = false
   ↓
PatientViewer re-renders with new patient
   ↓
All child components update with new data
```

### AI Report Flow
```
User clicks "Generate AI Report"
   ↓
AIReportModal opens (showAIReport = true)
   ↓
User clicks "Generate Report" in modal
   ↓
AIReportModal.handleGenerateReport()
   ↓
1. Sets isLoading = true
2. Calls API.generateAIReport(participantId)
3. Receives report data
4. Sets report = data
5. Sets isLoading = false
   ↓
Report renders in modal
```

---

## Props Drilling Map

```
App.jsx
  └─ patient data
      └─ PatientViewer.jsx
          ├─ patient.participant → PatientHeader.jsx
          ├─ patient.summary → SummaryCards.jsx
          ├─ patient.markers → MarkerTable.jsx
          ├─ patient.risk_assessment → RiskAssessment.jsx
          ├─ patient.biological_age → BiologicalAge.jsx
          └─ patient.participant.id → AIReportModal.jsx
```

---

## Component Communication

### Parent → Child (Props)
- App → UploadPage: `onUploadComplete`
- App → PatientViewer: `patient`, `currentIndex`, `totalPatients`, callbacks
- PatientViewer → All children: specific data slices

### Child → Parent (Callbacks)
- UploadPage → App: `onUploadComplete(patients)`
- PatientViewer → App: `onPrevious()`, `onNext()`, `onBackToUpload()`
- AIReportModal → PatientViewer: `onClose()`

### Sibling Communication
- No direct sibling communication
- All communication goes through App.jsx

---

## File Structure

```
lab-report-viewer/
│
├── public/                          # Static assets
│
├── src/
│   ├── main.jsx                     # Entry point
│   ├── App.jsx                      # Root component ⭐
│   ├── App.css                      # Global styles
│   ├── index.css                    # Reset/base styles
│   │
│   ├── components/                  # React components
│   │   ├── UploadPage.jsx          # Page 1 ⭐
│   │   ├── UploadPage.css
│   │   ├── PatientViewer.jsx       # Page 2 ⭐
│   │   ├── PatientViewer.css
│   │   ├── PatientHeader.jsx       # Demographics
│   │   ├── PatientHeader.css
│   │   ├── SummaryCards.jsx        # Statistics
│   │   ├── SummaryCards.css
│   │   ├── MarkerTable.jsx         # Lab data
│   │   ├── MarkerTable.css
│   │   ├── RiskAssessment.jsx      # Risk viz
│   │   ├── RiskAssessment.css
│   │   ├── BiologicalAge.jsx       # Age comparison
│   │   ├── BiologicalAge.css
│   │   ├── AIReportModal.jsx       # AI report
│   │   └── AIReportModal.css
│   │
│   ├── services/                    # API layer
│   │   └── api.js                  # Backend integration ⭐
│   │
│   └── assets/                      # Images, icons
│
├── .env                             # Environment variables
├── package.json                     # Dependencies
├── vite.config.js                   # Vite configuration
│
├── README.md                        # Main documentation
├── COMPONENT_DOCS.md               # Component reference
├── QUICKSTART.md                   # Quick start guide
├── PROJECT_SUMMARY.md              # Project overview
└── COMPONENT_HIERARCHY.md          # This file
```

⭐ = Critical files for understanding data flow

---

## Key Patterns Used

### 1. Container/Presenter Pattern
- **Container**: `App.jsx`, `PatientViewer.jsx` (manage state)
- **Presenter**: All other components (receive props, display)

### 2. Controlled Components
- All form inputs are controlled (value + onChange)
- State always represents current UI state

### 3. Lifting State Up
- Shared state lives in `App.jsx`
- Child components receive via props
- Updates flow through callbacks

### 4. Composition
- Small, focused components
- Composed into larger features
- Reusable and testable

### 5. Single Responsibility
- Each component has one job
- Easy to understand and maintain
- Clear separation of concerns

---

## Data Transformation Points

### 1. API → App
```javascript
// API returns
{ patients: [...] }

// App stores
patients: [...]
```

### 2. App → PatientViewer
```javascript
// App passes
patient={patients[currentPatientIndex]}

// PatientViewer receives
props.patient
```

### 3. PatientViewer → Children
```javascript
// Destructures and passes specific pieces
<PatientHeader participant={patient.participant} />
<SummaryCards summary={patient.summary} />
<MarkerTable markers={patient.markers} />
```

### 4. User Input → State
```javascript
// File selection
onChange={handleFileSelect}
  ↓
setSelectedFiles([...files])

// Search input
onChange={(e) => setSearchTerm(e.target.value)}
  ↓
setSearchTerm(value)
```

---

## Render Triggers

### What causes re-renders?

1. **App.jsx re-renders when**:
   - `currentPage` changes
   - `patients` array changes
   - `currentPatientIndex` changes
   - `isLoadingNext` changes

2. **UploadPage re-renders when**:
   - `selectedFiles` changes
   - `isUploading` changes
   - `uploadProgress` changes
   - `error` changes

3. **PatientViewer re-renders when**:
   - `patient` prop changes (new patient)
   - `currentIndex` changes
   - `isLoadingNext` changes
   - `showAIReport` changes

4. **Child components re-render when**:
   - Their specific props change
   - Parent re-renders (by default)

### Optimization Opportunities

For large datasets, consider:
- `React.memo()` for child components
- `useMemo()` for expensive calculations
- `useCallback()` for callback props
- Virtual scrolling for long lists

---

## Event Flow Examples

### Example 1: Upload Complete
```
1. User clicks "Upload" button
   ↓
2. UploadPage.handleUpload()
   - setIsUploading(true)
   - calls uploadPDFFiles()
   ↓
3. API.uploadPDFFiles()
   - processes files
   - returns patient data
   ↓
4. UploadPage receives data
   - calls onUploadComplete(patients)
   ↓
5. App.handleUploadComplete(patients)
   - setPatients(patients)
   - setCurrentPatientIndex(0)
   - setCurrentPage('viewer')
   ↓
6. App re-renders
   - shows PatientViewer
   ↓
7. PatientViewer renders
   - passes patient data to children
   ↓
8. All child components render with data
```

### Example 2: Search Markers
```
1. User types in search box
   ↓
2. MarkerTable onChange event
   - setSearchTerm(value)
   ↓
3. MarkerTable re-renders
   - filters markers based on searchTerm
   - displays filtered results
   ↓
4. No parent re-render (local state)
```

### Example 3: Generate AI Report
```
1. User clicks "Generate AI Report"
   ↓
2. PatientViewer button onClick
   - setShowAIReport(true)
   ↓
3. AIReportModal renders
   ↓
4. User clicks "Generate Report"
   ↓
5. AIReportModal.handleGenerateReport()
   - setIsLoading(true)
   - calls generateAIReport(participantId)
   ↓
6. API.generateAIReport()
   - returns report data
   ↓
7. AIReportModal receives data
   - setReport(data)
   - setIsLoading(false)
   ↓
8. Report content renders
```

---

## Summary

This application follows a clear, hierarchical component structure with:
- **Single source of truth** (App.jsx)
- **Unidirectional data flow** (top-down)
- **Clear component boundaries**
- **Predictable state updates**
- **Easy to test and maintain**

The architecture supports:
- Easy addition of new features
- Component reusability
- Clear debugging path
- Performance optimization
- Scalability
