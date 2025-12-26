# Quick Start Guide - Lab Report Viewer

## Getting Started (5 minutes)

### 1. Verify Installation ✓
The project is already installed and the dev server is running at:
**http://localhost:5173**

### 2. Test the Application

#### Test Upload Flow:
1. Open http://localhost:5173 in your browser
2. You'll see the upload page with a purple gradient background
3. Click "Click to select PDF files" or drag files into the area
4. Select any PDF file(s) from your computer (you can use any PDF for testing)
5. Click the "Upload" button
6. Watch the progress bar complete
7. Application automatically navigates to Patient Viewer

#### Test Patient Viewer:
1. After upload, you'll see the first patient's data:
   - Patient header with demographics
   - 4 summary cards (Normal, Elevated, High, Critical)
   - Lab markers table grouped by category
   - Risk assessment with circular chart
   - Biological age comparison
2. Try the category filters in the marker table
3. Use the search box to find specific markers
4. Click "Next Patient →" to see the next patient (shows loading state)
5. Click "← Previous Patient" to go back
6. Click "🤖 Generate AI Report" to see the AI report modal

#### Test AI Report:
1. Click "Generate Report" button in the modal
2. Wait for loading (simulated 1 second)
3. View the structured report with sections
4. Close the modal

### 3. Explore the Code

**Key Files to Review**:

1. **App.jsx** - Main state management and routing
   ```
   d:\Burak UI\lab-report-viewer\src\App.jsx
   ```

2. **API Service** - Backend integration point
   ```
   d:\Burak UI\lab-report-viewer\src\services\api.js
   ```

3. **Upload Component**
   ```
   d:\Burak UI\lab-report-viewer\src\components\UploadPage.jsx
   ```

4. **Patient Viewer**
   ```
   d:\Burak UI\lab-report-viewer\src\components\PatientViewer.jsx
   ```

### 4. Customize for Your Backend

#### Step 1: Create .env file
```bash
# Create .env in the root directory
cd "d:\Burak UI\lab-report-viewer"
echo VITE_API_BASE_URL=http://localhost:3001/api > .env
```

#### Step 2: Update API endpoints
The API service in `src/services/api.js` expects two endpoints:

**Upload Endpoint**:
```
POST http://localhost:3001/api/upload
```

**AI Report Endpoint**:
```
POST http://localhost:3001/api/generate-ai-report
```

#### Step 3: Remove mock data (optional)
If you want to force real backend calls, comment out the mock data fallback in `api.js`:
```javascript
// Remove or comment these sections in api.js:
// - generateMockPatientData()
// - generateMockMarkers()
// - generateMockAIReport()
```

### 5. Development Commands

```bash
# Start dev server (already running)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Stop dev server
# Press 'q' in the terminal or Ctrl+C
```

### 6. Project Structure Quick Reference

```
lab-report-viewer/
├── src/
│   ├── components/         # All React components
│   │   ├── UploadPage.jsx
│   │   ├── PatientViewer.jsx
│   │   ├── PatientHeader.jsx
│   │   ├── SummaryCards.jsx
│   │   ├── MarkerTable.jsx
│   │   ├── RiskAssessment.jsx
│   │   ├── BiologicalAge.jsx
│   │   └── AIReportModal.jsx
│   ├── services/
│   │   └── api.js          # Backend integration
│   ├── App.jsx             # Main app component
│   └── App.css             # Global styles
├── README.md               # Full documentation
├── COMPONENT_DOCS.md       # Component details
└── package.json
```

### 7. Common Tasks

#### Add a new lab marker category:
1. Update mock data in `api.js` (if using mock)
2. No code changes needed - it's dynamic!

#### Change color scheme:
1. Edit CSS variables in `src/App.css`
2. Update `--primary-color`, `--success-color`, etc.

#### Add authentication:
1. Update `api.js` to include auth headers
2. Add login page component
3. Update App.jsx to handle auth state

#### Change number of patients generated:
Currently generates based on number of PDFs uploaded.
For testing with specific count, modify `uploadPDFFiles` in `api.js`:
```javascript
return generateMockPatientData(3); // Always generate 3 patients
```

### 8. Troubleshooting

**Issue**: Upload doesn't work
- Check browser console for errors
- Verify API endpoint in .env
- Check if backend is running

**Issue**: Styling looks broken
- Clear browser cache
- Verify all CSS files are imported
- Check browser console for CSS errors

**Issue**: Navigation doesn't work
- Check browser console
- Verify patient data structure matches expected format
- Check currentPatientIndex state

**Issue**: AI Report doesn't generate
- Check browser network tab
- Verify API endpoint
- Check participant_id is being sent correctly

### 9. Next Steps

1. **Connect to Real Backend**
   - Set up your backend API
   - Configure .env file
   - Test with real data

2. **Customize Design**
   - Update colors in App.css
   - Modify component layouts
   - Add your logo/branding

3. **Add Features**
   - Implement download functionality
   - Add print styles
   - Create data export options

4. **Deploy**
   - Run `npm run build`
   - Deploy dist folder to your hosting
   - Configure environment variables

### 10. Getting Help

- Review README.md for full documentation
- Check COMPONENT_DOCS.md for component details
- Review inline code comments
- Check browser console for errors

---

## Quick Reference - Data Structure

### Backend should return this structure:

**Upload Response**:
```json
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
      "markers": [...],
      "risk_assessment": {...},
      "biological_age": {...}
    }
  ]
}
```

**AI Report Response**:
```json
{
  "participant_id": "P1001",
  "report": {
    "title": "AI-Generated Health Report",
    "sections": [
      {
        "heading": "Section Title",
        "content": "Section content..."
      }
    ],
    "generated_at": "2025-12-17T10:30:00Z"
  }
}
```

---

## That's it! You're ready to start developing! 🚀

For detailed component documentation, see COMPONENT_DOCS.md
For full project information, see README.md
