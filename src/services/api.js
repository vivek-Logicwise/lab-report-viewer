/**
 * API Service Layer
 * Handles all backend communication
 * 
 * EXPECTED BACKEND JSON STRUCTURE:
 * Phase 1 - VIP Markers Analysis (27 markers):
 * {
 *   "participant": { "participant_id": 1, "participant_code": "P-IND-001", "chronological_age": 32 },
 *   "summary": { "total_markers": 27, "normal_count": 0, "elevated_count": 4, "high_count": 1, "critical_count": 0 },
 *   "markers": [{ 
 *     "marker_code": "CRP", 
 *     "marker_name": "C-Reactive Protein", 
 *     "category": "Inflammation", 
 *     "value": 4.2, 
 *     "unit": "mg/L", 
 *     "status": "HIGH",  // Calculated based on value vs thresholds
 *     "severity": 6,     // 0=NORMAL, 3=ELEVATED, 6=HIGH, 9=CRITICAL
 *     "reference_used": "Western",
 *     "reference_range": "0-3.5",  // Generated from thresholds
 *     "is_lower_is_worse": false,
 *     "thresholds": { 
 *       "elevated_threshold": 3.5, 
 *       "high_threshold": 10, 
 *       "critical_threshold": 20 
 *     } 
 *   }],
 *   "patterns": [{ 
 *     "name": "Chronic Inflammation", 
 *     "markers_affected": ["CRP", "IL6"], 
 *     "severity": 5.4, 
 *     "trigger_count": 2,
 *     "description": "Multiple inflammatory markers elevated, indicating chronic inflammatory state"
 *   }],
 *   "risk_assessment": { "overall_risk_score": 4.2, "risk_category": "MODERATE", "category_risks": {...} },
 *   "biological_age": { "avg_severity": 4.2, "age_delta": -1.2, "biological_age": 30.8 },
 *   "generated_at": "2025-01-01T10:45:12Z"
 * }
 * 
 * IMPORTANT: Backend must detect patterns by analyzing markers and return them in the response
 * Pattern detection should NOT be done on the frontend
 * 
 * BUSINESS LOGIC IMPLEMENTED:
 * - Status calculation: Based on value comparison with thresholds (handles "lower is worse" markers)
 * - Severity mapping: NORMAL=0, ELEVATED=3, HIGH=6, CRITICAL=9
 * - Risk categories: LOW (0-2.9), MODERATE (3.0-5.9), HIGH (6.0-7.9), CRITICAL (8.0-10.0)
 * - Biological age: ageDelta = (avgSeverity - 5) × 1.5
 */

// Determine API URL based on environment
const getAPIBaseURL = () => {
  // Check if environment variable is set (highest priority)
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // In production (deployed), use deployed backend
  if (import.meta.env.PROD) {
    return 'https://lab-report-backend.vercel.app/api';
  }
  
  // In development (local), use local backend
  return 'http://localhost:3000/api';
};

const API_BASE_URL = getAPIBaseURL();

/**
 * Upload PDF files and get patient data
 * @param {FileList} files - PDF files to upload
 * @param {Function} onProgress - Progress callback (percent)
 * @returns {Promise<Array>} Array of patient data objects
 */
export const uploadPDFFiles = async (files, onProgress) => {
  const formData = new FormData();
  
  // Add all files to form data
  Array.from(files).forEach((file, index) => {
    formData.append('files', file);
  });

  try {
    debugger;
    // Call the actual API endpoint
    const response = await fetch(`${API_BASE_URL}/biomarkers/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Handle new response format with patients array
    if (data.patients && Array.isArray(data.patients)) {
      // New format: { success, total_patients, patients: [...] }
      return data.patients.map(patient => transformAPIResponse(patient));
    } else if (data.participant) {
      // Old format: single patient object
      return [transformAPIResponse(data)];
    } else {
      throw new Error('Invalid response format from server');
    }
    
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
    
    // MOCK DATA - Fallback to dummy data if API fails
    // Simulate backend response with mock patient data
    //return generateMockPatientData(files.length);
  }
};

/**
 * Transform API response to match internal data structure
 * Handles mapping of category names and adds risk_level to categories
 */
function transformAPIResponse(apiData) {
  // Map backend category names to frontend category names
  const categoryMapping = {
    'Liver': 'Liver Function',
    'Kidney': 'Kidney Function',
    'Hormones': 'Hormones',
    'Inflammation': 'Inflammation',
    'Metabolism': 'Metabolism',
    'Cardiovascular': 'Cardiovascular',
    'Vitamins/Minerals': 'Vitamins/Minerals',
    'Blood Health': 'Blood Health',
    'Thyroid Function': 'Thyroid Function'
  };

  // Transform markers to include mapped categories
  const transformedMarkers = apiData.markers.map(marker => ({
    ...marker,
    category: categoryMapping[marker.category] || marker.category
  }));

  // Transform category_risks to add risk_level based on average_severity
  const transformedCategoryRisks = {};
  if (apiData.risk_assessment && apiData.risk_assessment.category_risks) {
    Object.keys(apiData.risk_assessment.category_risks).forEach(category => {
      const categoryData = apiData.risk_assessment.category_risks[category];
      const mappedCategory = categoryMapping[category] || category;
      
      transformedCategoryRisks[mappedCategory] = {
        ...categoryData,
        risk_level: getRiskLevelFromSeverity(categoryData.average_severity)
      };
    });
  }

  return {
    participant: apiData.participant,
    summary: apiData.summary,
    markers: transformedMarkers,
    patterns: apiData.patterns || [],
    risk_assessment: {
      ...apiData.risk_assessment,
      category_risks: transformedCategoryRisks
    },
    biological_age: apiData.biological_age,
    generated_at: apiData.generated_at
  };
}

/**
 * Determine risk level from average severity
 */
function getRiskLevelFromSeverity(avgSeverity) {
  if (avgSeverity >= 9) return 'CRITICAL';
  if (avgSeverity >= 6) return 'HIGH';
  if (avgSeverity >= 3) return 'MODERATE';
  return 'LOW';
}

/**
 * Generate AI report for a patient
 * @param {string} participantId - Patient participant ID
 * @returns {Promise<Object>} AI report data
 */
export const generateAIReport = async (participantId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/generate-ai-report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ participant_id: participantId }),
    });

    if (!response.ok) {
      throw new Error(`AI Report generation failed: ${response.statusText}`);
    }

    return await response.json();
    
  } catch (error) {
    console.error('AI Report error:', error);
    
    // MOCK DATA - Remove in production
    return generateMockAIReport(participantId);
  }
};

/**
 * Generate mock patterns that simulate backend response
 * Backend should detect patterns based on marker analysis
 */
function generateMockPatterns() {
  // Simulate backend pattern detection response
  return [
    {
      name: 'Chronic Inflammation',
      markers_affected: ['CRP', 'IL6'],
      severity: 5.4,
      trigger_count: 2,
      description: 'Multiple inflammatory markers elevated, indicating chronic inflammatory state'
    },
    {
      name: 'Vitamin Deficiency',
      markers_affected: ['VITD3'],
      severity: 4.2,
      trigger_count: 1,
      description: 'Vitamin/mineral deficiencies detected, requiring supplementation'
    }
  ];
}

/**
 * Detect health patterns based on marker abnormalities
 * NOTE: This function is for reference only - Backend should perform pattern detection
 * The backend analyzes markers and returns patterns in the response
 * Implements pattern detection from Business Logic document
 * @param {Array} markers - Array of marker objects
 * @returns {Array} Detected patterns with severity
 */
function detectHealthPatterns(markers) {
  const patterns = [];

  // Pattern 1: Chronic Inflammation
  // Trigger: 2+ markers abnormal from [CRP, IL6, TNF_ALPHA, FIBRINOGEN]
  const inflammationMarkers = markers.filter(m => 
    ['CRP', 'IL6', 'TNF_ALPHA', 'FIBRINOGEN'].includes(m.marker_code)
  );
  const abnormalInflammation = inflammationMarkers.filter(m => m.status !== 'NORMAL');
  
  if (abnormalInflammation.length > 1) {
    const avgSeverity = abnormalInflammation.reduce((sum, m) => sum + m.severity, 0) / abnormalInflammation.length;
    patterns.push({
      name: 'Chronic Inflammation',
      markers_affected: abnormalInflammation.map(m => m.marker_code),
      severity: Number(avgSeverity.toFixed(2)),
      trigger_count: abnormalInflammation.length,
      description: 'Multiple inflammatory markers elevated, indicating chronic inflammatory state'
    });
  }

  // Pattern 2: Metabolic Syndrome
  // Trigger: 3+ markers abnormal from [GLUCOSE, HBA1C, INSULIN, TRIGLYCERIDES, HDL]
  const metabolicMarkers = markers.filter(m => 
    ['GLUCOSE', 'HBA1C', 'INSULIN', 'TRIG', 'HDL'].includes(m.marker_code)
  );
  const abnormalMetabolic = metabolicMarkers.filter(m => m.status !== 'NORMAL');
  
  if (abnormalMetabolic.length > 1) {
    const avgSeverity = abnormalMetabolic.reduce((sum, m) => sum + m.severity, 0) / abnormalMetabolic.length;
    patterns.push({
      name: 'Metabolic Syndrome',
      markers_affected: abnormalMetabolic.map(m => m.marker_code),
      severity: Number(avgSeverity.toFixed(2)),
      trigger_count: abnormalMetabolic.length,
      description: 'Multiple metabolic markers abnormal, indicating metabolic dysregulation'
    });
  }

  // Pattern 3: Insulin Resistance
  // Trigger: INSULIN or HOMA_IR abnormal
  const insulinMarkers = markers.filter(m => 
    ['INSULIN', 'HOMA_IR', 'GLUCOSE'].includes(m.marker_code)
  );
  const abnormalInsulin = insulinMarkers.filter(m => 
    ['INSULIN', 'HOMA_IR'].includes(m.marker_code) && m.status !== 'NORMAL'
  );
  
  if (abnormalInsulin.length > 1) {
    const relevantMarkers = insulinMarkers.filter(m => m.status !== 'NORMAL');
    if (relevantMarkers.length > 0) {
      const avgSeverity = relevantMarkers.reduce((sum, m) => sum + m.severity, 0) / relevantMarkers.length;
      patterns.push({
        name: 'Insulin Resistance',
        markers_affected: relevantMarkers.map(m => m.marker_code),
        severity: Number(avgSeverity.toFixed(2)),
        trigger_count: abnormalInsulin.length,
        description: 'Insulin resistance detected, indicating impaired glucose metabolism'
      });
    }
  }

  // Pattern 4: Cardiovascular Risk
  // Trigger: 2+ markers abnormal from [LDL, TRIGLYCERIDES, APOB, CRP]
  const cardioMarkers = markers.filter(m => 
    ['LDL', 'TRIG', 'APOB', 'CRP'].includes(m.marker_code)
  );
  const abnormalCardio = cardioMarkers.filter(m => m.status !== 'NORMAL');
  
  if (abnormalCardio.length > 1) {
    const avgSeverity = abnormalCardio.reduce((sum, m) => sum + m.severity, 0) / abnormalCardio.length;
    patterns.push({
      name: 'Cardiovascular Risk',
      markers_affected: abnormalCardio.map(m => m.marker_code),
      severity: Number(avgSeverity.toFixed(2)),
      trigger_count: abnormalCardio.length,
      description: 'Multiple cardiovascular markers elevated, indicating increased heart disease risk'
    });
  }

  // Pattern 5: Liver Stress
  // Trigger: 1+ markers abnormal from [ALT, GGT]
  const liverMarkers = markers.filter(m => 
    ['ALT', 'GGT'].includes(m.marker_code)
  );
  const abnormalLiver = liverMarkers.filter(m => m.status !== 'NORMAL');
  
  if (abnormalLiver.length > 1) {
    const avgSeverity = abnormalLiver.reduce((sum, m) => sum + m.severity, 0) / abnormalLiver.length;
    patterns.push({
      name: 'Liver Stress',
      markers_affected: abnormalLiver.map(m => m.marker_code),
      severity: Number(avgSeverity.toFixed(2)),
      trigger_count: abnormalLiver.length,
      description: 'Liver enzyme elevation detected, indicating hepatic stress or dysfunction'
    });
  }

  // Pattern 6: Vitamin Deficiency
  // Trigger: 1+ markers below optimal from [VITAMIN_D, VITAMIN_B12, FERRITIN]
  const vitaminMarkers = markers.filter(m => 
    ['VITD3', 'B12', 'FERRITIN'].includes(m.marker_code)
  );
  const deficientVitamins = vitaminMarkers.filter(m => m.status !== 'NORMAL');
  
  if (deficientVitamins.length > 1) {
    const avgSeverity = deficientVitamins.reduce((sum, m) => sum + m.severity, 0) / deficientVitamins.length;
    patterns.push({
      name: 'Vitamin Deficiency',
      markers_affected: deficientVitamins.map(m => m.marker_code),
      severity: Number(avgSeverity.toFixed(2)),
      trigger_count: deficientVitamins.length,
      description: 'Vitamin/mineral deficiencies detected, requiring supplementation'
    });
  }

  // Pattern 7: Thyroid Dysfunction
  // Trigger: 1+ markers abnormal from [TSH, T3]
  const thyroidMarkers = markers.filter(m => 
    ['TSH', 'T3'].includes(m.marker_code)
  );
  const abnormalThyroid = thyroidMarkers.filter(m => m.status !== 'NORMAL');
  
  if (abnormalThyroid.length > 1) {
    const avgSeverity = abnormalThyroid.reduce((sum, m) => sum + m.severity, 0) / abnormalThyroid.length;
    patterns.push({
      name: 'Thyroid Dysfunction',
      markers_affected: abnormalThyroid.map(m => m.marker_code),
      severity: Number(avgSeverity.toFixed(2)),
      trigger_count: abnormalThyroid.length,
      description: 'Thyroid hormone imbalance detected, affecting metabolism'
    });
  }

  return patterns;
}

/**
 * Generate mock patient data for testing - Phase 1: VIP Markers Only
 * @param {number} count - Number of patients
 * @returns {Array} Mock patient data with VIP markers
 */
function generateMockPatientData(count) {
  const mockPatients = [];

  for (let i = 0; i < count; i++) {
    const patientId = i + 1;
    const participantCode = `P-IND-${String(patientId).padStart(3, '0')}`;
    const age = 32;
    
    // Phase 1: VIP Markers Only (27 markers)
    const vipMarkers = generateVIPMarkers();
    
    // Patterns should come from backend - using mock patterns for now
    const patterns = generateMockPatterns();
    
    // Calculate summary from VIP markers
    const normalCount = vipMarkers.filter(m => m.status === 'NORMAL').length;
    const elevatedCount = vipMarkers.filter(m => m.status === 'ELEVATED').length;
    const highCount = vipMarkers.filter(m => m.status === 'HIGH').length;
    const criticalCount = vipMarkers.filter(m => m.status === 'CRITICAL').length;
    
    // Calculate risk assessment
    const categoryRisks = calculateCategoryRisks(vipMarkers);
    const overallRiskScore = calculateOverallRisk(categoryRisks);
    const riskCategory = getRiskCategory(overallRiskScore);
    
    // Calculate biological age using business logic formula
    // ageDelta = (avgSeverity - 5) × 1.5
    const avgSeverity = vipMarkers.reduce((sum, m) => sum + m.severity, 0) / vipMarkers.length;
    const ageDelta = (avgSeverity - 5) * 1.5;
    const biologicalAge = age + ageDelta;
    
    mockPatients.push({
      participant: {
        participant_id: patientId,
        participant_code: participantCode,
        chronological_age: age,
      },
      summary: {
        total_markers: 27,
        normal_count: normalCount,
        elevated_count: elevatedCount,
        high_count: highCount,
        critical_count: criticalCount,
      },
      markers: vipMarkers,
      patterns: patterns,
      risk_assessment: {
        overall_risk_score: overallRiskScore,
        risk_category: riskCategory,
        total_weighted_score: categoryRisks.totalWeightedScore,
        total_weight: categoryRisks.totalWeight,
        category_risks: categoryRisks.categories,
      },
      biological_age: {
        avg_severity: avgSeverity,
        age_delta: ageDelta,
        biological_age: biologicalAge,
      },
      generated_at: new Date().toISOString(),
    });
  }

  return mockPatients;
}

/**
 * Calculate marker status based on value and thresholds
 * Implements business logic from Business Logic document
 */
function calculateMarkerStatus(value, thresholds, isLowerIsWorse) {
  const { elevated_threshold, high_threshold, critical_threshold } = thresholds;
  
  if (!isLowerIsWorse) {
    // Standard logic: Higher values are worse
    if (value > critical_threshold) return 'CRITICAL';
    if (value > high_threshold) return 'HIGH';
    if (value > elevated_threshold) return 'ELEVATED';
    return 'NORMAL';
  } else {
    // Reverse logic: Lower values are worse (HDL, Vitamin D, B12, etc.)
    if (value < critical_threshold) return 'CRITICAL';
    if (value < high_threshold) return 'HIGH';
    if (value < elevated_threshold) return 'ELEVATED';
    return 'NORMAL';
  }
}

/**
 * Calculate severity score from status
 * NORMAL=0, ELEVATED=3, HIGH=6, CRITICAL=9
 */
function calculateSeverity(status) {
  const severityMap = {
    'NORMAL': 0,
    'ELEVATED': 3,
    'HIGH': 6,
    'CRITICAL': 9
  };
  return severityMap[status] || 0;
}

/**
 * Generate reference range string from thresholds
 */
function generateReferenceRange(thresholds, isLowerIsWorse) {
  const { elevated_threshold, critical_threshold } = thresholds;
  
  if (!isLowerIsWorse) {
    // Standard: 0 to elevated_threshold is optimal
    return `0-${elevated_threshold}`;
  } else {
    // Reverse: elevated_threshold to infinity is optimal
    return `>${elevated_threshold}`;
  }
}

/**
 * Generate VIP markers (27 high-priority markers) with realistic static values
 * Status and severity are calculated based on business logic
 */
function generateVIPMarkers() {
  // Predefined realistic marker data with values and thresholds
  const markerData = [
    // Inflammation markers (3)
    { marker_code: 'CRP', marker_name: 'C-Reactive Protein', category: 'Inflammation', value: 4.2, unit: 'mg/L', reference_used: 'Western', is_lower_is_worse: false, thresholds: { elevated_threshold: 3.5, high_threshold: 10, critical_threshold: 20 } },
    { marker_code: 'IL6', marker_name: 'Interleukin-6', category: 'Inflammation', value: 6.1, unit: 'pg/mL', reference_used: 'Western', is_lower_is_worse: false, thresholds: { elevated_threshold: 5, high_threshold: 15, critical_threshold: 30 } },
    { marker_code: 'TNF_ALPHA', marker_name: 'TNF-Alpha', category: 'Inflammation', value: 3.68, unit: 'pg/mL', reference_used: 'Western', is_lower_is_worse: false, thresholds: { elevated_threshold: 8, high_threshold: 20, critical_threshold: 40 } },
    
    // Metabolism markers (3)
    { marker_code: 'HBA1C', marker_name: 'Glycated Hemoglobin', category: 'Metabolism', value: 5.8, unit: '%', reference_used: 'Western', is_lower_is_worse: false, thresholds: { elevated_threshold: 5.6, high_threshold: 6.5, critical_threshold: 8.0 } },
    { marker_code: 'GLUCOSE', marker_name: 'Fasting Glucose', category: 'Metabolism', value: 240, unit: 'mg/dL', reference_used: 'Western', is_lower_is_worse: false, thresholds: { elevated_threshold: 100, high_threshold: 126, critical_threshold: 200 } },
    { marker_code: 'INSULIN', marker_name: 'Fasting Insulin', category: 'Metabolism', value: 8.5, unit: 'μIU/mL', reference_used: 'Western', is_lower_is_worse: false, thresholds: { elevated_threshold: 20, high_threshold: 30, critical_threshold: 50 } },
    
    // Cardiovascular markers (4)
    { marker_code: 'LDL', marker_name: 'Low-density Lipoprotein', category: 'Cardiovascular', value: 145, unit: 'mg/dL', reference_used: 'Western', is_lower_is_worse: false, thresholds: { elevated_threshold: 130, high_threshold: 160, critical_threshold: 190 } },
    { marker_code: 'HDL', marker_name: 'HDL Cholesterol', category: 'Cardiovascular', value: 55, unit: 'mg/dL', reference_used: 'Western', is_lower_is_worse: true, thresholds: { elevated_threshold: 40, high_threshold: 30, critical_threshold: 20 } },
    { marker_code: 'TRIG', marker_name: 'Triglycerides', category: 'Cardiovascular', value: 128, unit: 'mg/dL', reference_used: 'Western', is_lower_is_worse: false, thresholds: { elevated_threshold: 150, high_threshold: 200, critical_threshold: 500 } },
    { marker_code: 'APOB', marker_name: 'Apolipoprotein B', category: 'Cardiovascular', value: 88, unit: 'mg/dL', reference_used: 'Western', is_lower_is_worse: false, thresholds: { elevated_threshold: 100, high_threshold: 130, critical_threshold: 160 } },
    
    // Liver Function markers (3)
    { marker_code: 'ALT', marker_name: 'Alanine Transaminase', category: 'Liver Function', value: 28, unit: 'U/L', reference_used: 'Western', is_lower_is_worse: false, thresholds: { elevated_threshold: 40, high_threshold: 80, critical_threshold: 200 } },
    { marker_code: 'AST', marker_name: 'Aspartate Transaminase', category: 'Liver Function', value: 32, unit: 'U/L', reference_used: 'Western', is_lower_is_worse: false, thresholds: { elevated_threshold: 40, high_threshold: 80, critical_threshold: 200 } },
    { marker_code: 'GGT', marker_name: 'Gamma-GT', category: 'Liver Function', value: 38, unit: 'U/L', reference_used: 'Western', is_lower_is_worse: false, thresholds: { elevated_threshold: 50, high_threshold: 100, critical_threshold: 200 } },
    
    // Kidney Function markers (2)
    { marker_code: 'CREAT', marker_name: 'Creatinine', category: 'Kidney Function', value: 0.95, unit: 'mg/dL', reference_used: 'Western', is_lower_is_worse: false, thresholds: { elevated_threshold: 1.2, high_threshold: 2.0, critical_threshold: 4.0 } },
    { marker_code: 'EGFR', marker_name: 'eGFR', category: 'Kidney Function', value: 98, unit: 'mL/min', reference_used: 'Western', is_lower_is_worse: true, thresholds: { elevated_threshold: 90, high_threshold: 60, critical_threshold: 30 } },
    
    // Thyroid Function markers (3)
    { marker_code: 'TSH', marker_name: 'Thyroid Stimulating Hormone', category: 'Thyroid Function', value: 2.1, unit: 'μIU/mL', reference_used: 'Western', is_lower_is_worse: false, thresholds: { elevated_threshold: 4.5, high_threshold: 10, critical_threshold: 20 } },
    { marker_code: 'T3', marker_name: 'Free T3', category: 'Thyroid Function', value: 3.0, unit: 'pg/mL', reference_used: 'Western', is_lower_is_worse: false, thresholds: { elevated_threshold: 4.2, high_threshold: 6.0, critical_threshold: 10.0 } },
    { marker_code: 'T4', marker_name: 'Free T4', category: 'Thyroid Function', value: 1.15, unit: 'ng/dL', reference_used: 'Western', is_lower_is_worse: false, thresholds: { elevated_threshold: 1.8, high_threshold: 3.0, critical_threshold: 5.0 } },
    
    // Vitamins/Minerals markers (4)
    { marker_code: 'VITD3', marker_name: 'Vitamin D', category: 'Vitamins/Minerals', value: 22, unit: 'ng/mL', reference_used: 'Western', is_lower_is_worse: true, thresholds: { elevated_threshold: 30, high_threshold: 20, critical_threshold: 10 } },
    { marker_code: 'B12', marker_name: 'Vitamin B12', category: 'Vitamins/Minerals', value: 485, unit: 'pg/mL', reference_used: 'Western', is_lower_is_worse: true, thresholds: { elevated_threshold: 200, high_threshold: 150, critical_threshold: 100 } },
    { marker_code: 'IRON', marker_name: 'Serum Iron', category: 'Vitamins/Minerals', value: 88, unit: 'μg/dL', reference_used: 'Western', is_lower_is_worse: false, thresholds: { elevated_threshold: 170, high_threshold: 200, critical_threshold: 300 } },
    { marker_code: 'FERRITIN', marker_name: 'Ferritin', category: 'Vitamins/Minerals', value: 105, unit: 'ng/mL', reference_used: 'Western', is_lower_is_worse: false, thresholds: { elevated_threshold: 200, high_threshold: 300, critical_threshold: 500 } },
    
    // Hormones markers (3)
    { marker_code: 'TESTOSTERONE', marker_name: 'Total Testosterone', category: 'Hormones', value: 553, unit: 'ng/dL', reference_used: 'Western', is_lower_is_worse: true, thresholds: { elevated_threshold: 300, high_threshold: 200, critical_threshold: 100 } },
    { marker_code: 'CORTISOL', marker_name: 'Cortisol', category: 'Hormones', value: 15.3, unit: 'μg/dL', reference_used: 'Western', is_lower_is_worse: false, thresholds: { elevated_threshold: 25, high_threshold: 35, critical_threshold: 50 } },
    { marker_code: 'DHEA', marker_name: 'DHEA-S', category: 'Hormones', value: 285, unit: 'μg/dL', reference_used: 'Western', is_lower_is_worse: true, thresholds: { elevated_threshold: 100, high_threshold: 50, critical_threshold: 25 } },
    
    // Blood Health markers (2)
    { marker_code: 'HGB', marker_name: 'Hemoglobin', category: 'Blood Health', value: 14.8, unit: 'g/dL', reference_used: 'Western', is_lower_is_worse: true, thresholds: { elevated_threshold: 13, high_threshold: 10, critical_threshold: 7 } },
    { marker_code: 'WBC', marker_name: 'White Blood Cells', category: 'Blood Health', value: 7.2, unit: 'K/μL', reference_used: 'Western', is_lower_is_worse: false, thresholds: { elevated_threshold: 11, high_threshold: 15, critical_threshold: 25 } },
  ];

  // Calculate status, severity, and reference_range for each marker based on business logic
  return markerData.map(marker => {
    const status = calculateMarkerStatus(marker.value, marker.thresholds, marker.is_lower_is_worse);
    const severity = calculateSeverity(status);
    const reference_range = generateReferenceRange(marker.thresholds, marker.is_lower_is_worse);
    
    return {
      ...marker,
      status,
      severity,
      reference_range
    };
  });
}

/**
 * Calculate category-wise risk assessment
 */
function calculateCategoryRisks(markers) {
  const categories = {};
  let totalWeightedScore = 0;
  let totalWeight = 0;

  // Group markers by category
  markers.forEach(marker => {
    if (!categories[marker.category]) {
      categories[marker.category] = {
        markers: [],
        weight: getCategoryWeight(marker.category),
      };
    }
    categories[marker.category].markers.push(marker);
  });

  // Calculate risk for each category
  const categoryRisks = {};
  Object.keys(categories).forEach(category => {
    const categoryData = categories[category];
    const avgSeverity = categoryData.markers.reduce((sum, m) => sum + m.severity, 0) / categoryData.markers.length;
    const weightedScore = avgSeverity * categoryData.weight;
    
    categoryRisks[category] = {
      average_severity: Number(avgSeverity.toFixed(2)),
      weight: categoryData.weight,
      weighted_score: Number(weightedScore.toFixed(2)),
      markers_count: categoryData.markers.length,
      risk_level: getRiskLevelFromSeverity(avgSeverity)
    };
    
    totalWeightedScore += weightedScore;
    totalWeight += categoryData.weight;
  });

  return {
    categories: categoryRisks,
    totalWeightedScore: Number(totalWeightedScore.toFixed(2)),
    totalWeight: Number(totalWeight.toFixed(2)),
  };
}

/**
 * Get weight for each category
 */
function getCategoryWeight(category) {
  const weights = {
    'Inflammation': 1.5,
    'Metabolism': 1.5,
    'Cardiovascular': 1.3,
    'Liver Function': 1.2,
    'Kidney Function': 1.2,
    'Thyroid Function': 1.1,
    'Vitamins/Minerals': 1.0,
    'Hormones': 1.1,
    'Blood Health': 1.2,
  };
  return weights[category] || 1.0;
}

/**
 * Calculate overall risk score
 */
function calculateOverallRisk(categoryRisks) {
  if (categoryRisks.totalWeight === 0) return 0;
  return Number((categoryRisks.totalWeightedScore / categoryRisks.totalWeight).toFixed(2));
}

/**
 * Get risk category based on overall score
 * Based on business logic: LOW (0-2.9), MODERATE (3.0-5.9), HIGH (6.0-7.9), CRITICAL (8.0-10.0)
 */
function getRiskCategory(score) {
  if (score < 3.0) return 'LOW';
  if (score < 6.0) return 'MODERATE';
  if (score < 8.0) return 'HIGH';
  return 'CRITICAL';
}

/**
 * Generate mock AI report - Phase 2: Complete Analysis with all 280 markers
 */
function generateMockAIReport(participantId) {
  const age = 32;
  const bioAge = age + (Math.random() * 6 - 2);
  
  return {
    analysis_phase: 'COMPLETE_AI_ANALYSIS',
    report_id: `RPT-${new Date().toISOString().split('T')[0]}-${Math.floor(Math.random() * 1000)}`,
    generated_at: new Date().toISOString(),
    analysis_engine: 'Gemini-Pro-1.5',
    processing_time_seconds: Math.floor(Math.random() * 60) + 90,
    
    participant_id: participantId,
    
    executive_summary: {
      overall_health_status: ['LOW_RISK', 'MODERATE_RISK', 'HIGH_RISK'][Math.floor(Math.random() * 3)],
      key_findings: [
        'Chronic inflammatory pattern detected across multiple biomarkers',
        'Early metabolic dysregulation with pre-diabetic markers',
        'Cardiovascular risk factors present requiring intervention',
        'Nutritional deficiencies identified in Vitamin D and Magnesium',
      ],
      priority_actions: [
        'Immediate dietary modifications to address inflammation',
        'Initiate cardiovascular risk reduction protocol',
        'Supplement Vitamin D to optimal levels',
        'Follow-up testing in 90 days',
      ],
      biological_age_assessment: {
        chronological_age: age,
        calculated_biological_age: Number(bioAge.toFixed(1)),
        age_delta: Number((bioAge - age).toFixed(1)),
        interpretation: bioAge < age 
          ? `Body is functioning ${Math.abs(bioAge - age).toFixed(1)} years younger than chronological age`
          : `Body is aging ${Math.abs(bioAge - age).toFixed(1)} years faster than chronological age due to inflammatory burden and metabolic factors`,
      },
    },

    summary_statistics: {
      total_markers_analyzed: 280,
      vip_markers_count: 27,
      secondary_markers_count: 253,
      normal_count: 198 + Math.floor(Math.random() * 20),
      elevated_count: 54 + Math.floor(Math.random() * 10),
      high_count: 21 + Math.floor(Math.random() * 5),
      critical_count: 7 + Math.floor(Math.random() * 3),
      confidence_threshold: 0.85,
      average_confidence_score: 0.93,
    },

    pattern_analysis: {
      identified_patterns: [
        {
          pattern_name: 'Chronic Low-Grade Inflammation',
          severity: 'MODERATE_HIGH',
          confidence: 0.91,
          markers_involved: ['CRP', 'IL6', 'TNF_ALPHA', 'FIBRINOGEN'],
          health_implications: 'Increases cardiovascular disease risk by 2.3x, accelerates biological aging, promotes insulin resistance',
          intervention_strategy: 'Multi-modal approach: dietary anti-inflammatory protocol, targeted supplementation, stress reduction, and metabolic optimization',
        },
        {
          pattern_name: 'Early Metabolic Dysfunction',
          severity: 'MODERATE',
          confidence: 0.87,
          markers_involved: ['HBA1C', 'GLUCOSE', 'INSULIN', 'TRIG'],
          health_implications: 'Pre-diabetic state with 40% risk of progression to diabetes within 5 years without intervention',
          intervention_strategy: 'Immediate carbohydrate management, exercise protocol, consider metformin evaluation by physician',
        },
        {
          pattern_name: 'Cardiovascular Risk Cluster',
          severity: 'MODERATE',
          confidence: 0.89,
          markers_involved: ['LDL', 'APOB', 'CRP', 'HOMOCYSTEINE'],
          health_implications: '10-year cardiovascular event risk estimated at 12% (moderate risk category)',
          intervention_strategy: 'Aggressive lipid management, anti-inflammatory diet, consider statin evaluation, cardiovascular exercise program',
        },
      ],
    },

    comprehensive_risk_assessment: {
      overall_risk_score: Number((Math.random() * 4 + 3).toFixed(1)),
      risk_category: 'MODERATE_HIGH',
      category_breakdown: {
        Inflammation: {
          average_severity: 4.5,
          markers_count: 8,
          weight: 1.8,
          weighted_score: 8.1,
          risk_level: 'HIGH',
          primary_markers: ['CRP', 'IL6', 'TNF_ALPHA'],
        },
        Metabolism: {
          average_severity: 3.8,
          markers_count: 12,
          weight: 1.7,
          weighted_score: 6.46,
          risk_level: 'MODERATE',
          primary_markers: ['HBA1C', 'INSULIN', 'GLUCOSE'],
        },
        Cardiovascular: {
          average_severity: 5.2,
          markers_count: 15,
          weight: 2.0,
          weighted_score: 10.4,
          risk_level: 'MODERATE_HIGH',
          primary_markers: ['LDL', 'APOB'],
        },
        'Liver Function': {
          average_severity: 0.5,
          markers_count: 18,
          weight: 1.3,
          weighted_score: 0.65,
          risk_level: 'LOW',
        },
        'Kidney Function': {
          average_severity: 1.2,
          markers_count: 8,
          weight: 1.5,
          weighted_score: 1.8,
          risk_level: 'LOW',
        },
      },
    },

    ai_generated_insights: {
      primary_health_narrative: 'Your lab results reveal a pattern of chronic low-grade inflammation combined with early metabolic dysfunction, creating a moderate-high cardiovascular risk profile. While your liver, kidney, and thyroid function remain strong, the inflammatory burden and metabolic changes are causing your body to age faster than your chronological age suggests. The positive aspect is that these issues are in early stages and highly responsive to intervention.',
      
      optimization_priorities: [
        {
          priority: 1,
          focus: 'Inflammation Reduction',
          rationale: 'Root cause of multiple downstream issues',
          expected_timeline: '6-12 weeks for significant improvement',
          success_metrics: ['CRP < 1.0 mg/L', 'IL-6 < 3.0 pg/mL', 'Improved energy levels'],
        },
        {
          priority: 2,
          focus: 'Metabolic Optimization',
          rationale: 'Prevent progression to diabetes, improve energy',
          expected_timeline: '8-16 weeks for measurable changes',
          success_metrics: ['HbA1c < 5.4%', 'Fasting glucose < 95 mg/dL', 'Improved body composition'],
        },
        {
          priority: 3,
          focus: 'Cardiovascular Risk Reduction',
          rationale: 'Long-term health protection',
          expected_timeline: '12-24 weeks for lipid improvements',
          success_metrics: ['LDL < 100 mg/dL', 'ApoB < 80 mg/dL', '10-year risk < 7.5%'],
        },
      ],
    },

    comprehensive_recommendations: {
      critical_interventions: [
        {
          category: 'Dietary Modifications',
          priority: 'IMMEDIATE',
          specific_actions: [
            'Adopt Mediterranean diet pattern with emphasis on omega-3 rich fish (3x/week)',
            'Eliminate refined sugars and processed foods completely',
            'Increase fiber intake to 35-40g daily through vegetables and legumes',
            'Implement time-restricted eating (16:8 protocol) to improve insulin sensitivity',
          ],
          expected_impact: '20-30% reduction in inflammatory markers within 8 weeks',
        },
        {
          category: 'Targeted Supplementation',
          priority: 'IMMEDIATE',
          specific_actions: [
            'Omega-3 (EPA/DHA): 2-3g daily with meals',
            'Vitamin D3: 5000 IU daily until levels >40 ng/mL',
            'Magnesium glycinate: 400mg before bed',
            'Curcumin (highly bioavailable): 1000mg daily',
          ],
          expected_impact: '15-25% improvement in multiple biomarker categories',
        },
        {
          category: 'Exercise Protocol',
          priority: 'IMMEDIATE',
          specific_actions: [
            'Cardiovascular: 150 minutes moderate intensity per week',
            'Resistance training: 3x/week full body workouts',
            'High-intensity intervals: 1-2x/week for metabolic adaptation',
            'Daily walking: minimum 7000 steps',
          ],
          expected_impact: 'Significant improvement in insulin sensitivity and cardiovascular fitness',
        },
      ],
      
      monitoring_schedule: {
        '6_weeks': {
          markers_to_retest: ['CRP', 'HbA1c', 'Fasting glucose', 'Lipid panel'],
          expected_changes: 'Early response to interventions, CRP should show 20-40% reduction',
        },
        '12_weeks': {
          markers_to_retest: ['Full inflammatory panel', 'Metabolic markers', 'Complete blood count'],
          expected_changes: 'Significant improvements across all intervention targets',
        },
        '6_months': {
          markers_to_retest: ['Comprehensive re-assessment of all 280 markers'],
          expected_changes: 'Biological age reduction, normalized inflammatory markers',
        },
      },
    },

    report_metadata: {
      report_version: '2.1',
      confidence_score_overall: 0.94,
      data_quality_score: 0.97,
      requires_physician_interpretation: true,
    },
  };
}
