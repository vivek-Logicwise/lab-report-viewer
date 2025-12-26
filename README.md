# Lab Report Viewer - POC React Application

A modern, responsive React application for processing multi-patient lab report PDFs and visualizing backend JSON results.

## Features

### 📤 PDF Upload Page
- Multiple PDF file upload with drag-and-drop support
- Real-time upload progress tracking
- File validation (PDF only)
- Individual file removal before upload
- Navigation disabled during upload processing

### 👤 Patient Result Viewer
- **Patient Details Header**: Display participant ID, age, gender, and report date
- **Summary Cards**: Visual overview of normal, elevated, high, and critical markers
- **Marker Table**: 
  - Grouped by category (Hematology, Biochemistry, etc.)
  - Searchable and filterable
  - Displays marker code, name, value, unit, reference range, and status
  - Color-coded status badges
- **Risk Assessment**:
  - Overall risk score with circular progress indicator
  - Category-wise risk analysis cards
  - Color-coded risk levels (Low/Moderate/High)
- **Biological Age**:
  - Comparison between chronological and biological age
  - Visual age difference indicator
  - Contextual health insights

### 🤖 AI Report Generation
- One-click AI report generation
- Modal display with structured sections
- Loading states and error handling
- Download capability (ready for backend integration)

### 🔄 Navigation
- Previous/Next patient navigation
- Patient counter (e.g., "Patient 2 of 5")
- Loading states during patient data fetching
- Disabled navigation when loading

## Tech Stack

- **Framework**: React 18 with Vite
- **Styling**: Custom CSS with Flexbox/Grid
- **State Management**: React Hooks (useState)
- **API Integration**: Fetch API with mock data fallback

## Project Structure

```
lab-report-viewer/
├── src/
│   ├── components/
│   │   ├── UploadPage.jsx          # PDF upload interface
│   │   ├── UploadPage.css
│   │   ├── PatientViewer.jsx       # Main patient data viewer
│   │   ├── PatientViewer.css
│   │   ├── PatientHeader.jsx       # Patient demographic info
│   │   ├── PatientHeader.css
│   │   ├── SummaryCards.jsx        # Summary statistics cards
│   │   ├── SummaryCards.css
│   │   ├── MarkerTable.jsx         # Lab markers table
│   │   ├── MarkerTable.css
│   │   ├── RiskAssessment.jsx      # Risk analysis visualization
│   │   ├── RiskAssessment.css
│   │   ├── BiologicalAge.jsx       # Biological age comparison
│   │   ├── BiologicalAge.css
│   │   ├── AIReportModal.jsx       # AI report modal
│   │   └── AIReportModal.css
│   ├── services/
│   │   └── api.js                   # API service layer
│   ├── App.jsx                      # Main app component
│   ├── App.css                      # Global styles
│   └── main.jsx                     # App entry point
├── package.json
└── README.md
```

## Installation & Setup

1. **Navigate to the project directory**:
   ```bash
   cd lab-report-viewer
   ```

2. **Install dependencies** (already done during setup):
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**:
   Navigate to `http://localhost:5173`

## Backend Integration

### API Endpoints Expected

#### 1. Upload PDFs
```
POST /api/upload
Content-Type: multipart/form-data

Response:
{
  "patients": [
    {
      "participant": {
        "id": "P1001",
        "code": "PAT-P1001",
        "age": 35,
        "gender": "Male"
      },
      "summary": {
        "normal": 25,
        "elevated": 3,
        "high": 1,
        "critical": 0
      },
      "markers": [
        {
          "code": "HEM1",
          "name": "Hemoglobin",
          "category": "Hematology",
          "value": "14.5",
          "unit": "g/dL",
          "status": "Normal",
          "severity": 0,
          "reference_range": {
            "min": "13.0",
            "max": "17.0"
          }
        }
      ],
      "risk_assessment": {
        "overall_score": 45,
        "category_risks": [
          {
            "category": "Hematology",
            "risk_level": "Low",
            "affected_markers": 0
          }
        ]
      },
      "biological_age": {
        "chronological_age": 35,
        "biological_age": 32,
        "difference": -3
      }
    }
  ]
}
```

#### 2. Generate AI Report
```
POST /api/generate-ai-report
Content-Type: application/json

Body:
{
  "participant_id": "P1001"
}

Response:
{
  "participant_id": "P1001",
  "report": {
    "title": "AI-Generated Health Report",
    "sections": [
      {
        "heading": "Overall Health Assessment",
        "content": "Based on the analysis..."
      }
    ],
    "generated_at": "2025-12-17T10:30:00Z"
  }
}
```

### Configuring Backend URL

Set the backend URL in `.env` file:
```
VITE_API_BASE_URL=http://your-backend-url/api
```

## Mock Data

The application includes comprehensive mock data for testing without a backend:
- Automatically generates realistic patient data
- Simulates upload progress
- Creates varied lab markers across categories
- Generates AI reports on demand

To disable mock data and use real backend, update the API service to remove fallback logic in `src/services/api.js`.

## Responsive Design

- **Desktop**: Full layout with side-by-side components
- **Tablet**: Adjusted grid columns and spacing
- **Mobile**: Stacked layout, collapsible tables, touch-friendly buttons

## Key Features Implementation

### State Management
- Centralized in `App.jsx`
- Patient data stored as array
- Current patient index for navigation
- Page state (upload vs viewer)

### Upload Handling
- Multi-file selection with validation
- Progress tracking (simulated for POC)
- Prevents navigation during upload
- Error handling and user feedback

### Patient Navigation
- Previous/Next buttons
- Loading states during data fetch
- Disabled states when at boundaries
- Smooth transitions between patients

### AI Report
- Modal-based interface
- On-demand generation
- Structured content rendering
- Download preparation (backend integration needed)

## Production Considerations

1. **Remove Mock Data**: Delete mock data functions from `api.js`
2. **Real Progress Tracking**: Use XMLHttpRequest for actual upload progress
3. **Error Boundaries**: Add React error boundaries for production
4. **Authentication**: Implement user authentication if needed
5. **Data Validation**: Add comprehensive input validation
6. **Performance**: Consider React.memo for large datasets
7. **Accessibility**: Add ARIA labels and keyboard navigation
8. **Testing**: Add unit and integration tests

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This is a POC application for demonstration purposes.

## Author

Built as a senior frontend engineer POC project.

