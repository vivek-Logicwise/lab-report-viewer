import { useState } from 'react';
import './MarkerTable.css';

/**
 * Marker Table Component
 * Displays lab markers grouped by category
 */
function MarkerTable({ markers }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  if (!markers || markers.length === 0) return null;

  // Get unique categories
  const categories = ['All', ...new Set(markers.map(m => m.category))];

  // Filter markers
  const filteredMarkers = markers.filter(marker => {
    const matchesCategory = selectedCategory === 'All' || marker.category === selectedCategory;
    const markerName = marker.marker_name || marker.name || '';
    const markerCode = marker.marker_code || marker.code || '';
    const matchesSearch = markerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         markerCode.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Group markers by category
  const groupedMarkers = filteredMarkers.reduce((acc, marker) => {
    if (!acc[marker.category]) {
      acc[marker.category] = [];
    }
    acc[marker.category].push(marker);
    return acc;
  }, {});

  /**
   * Get status badge class
   */
  const getStatusClass = (status) => {
    const statusUpper = status?.toUpperCase();
    const statusMap = {
      'NORMAL': 'status-normal',
      'ELEVATED': 'status-elevated',
      'HIGH': 'status-high',
      'CRITICAL': 'status-critical',
    };
    return statusMap[statusUpper] || 'status-normal';
  };

  return (
    <div className="marker-section">
      <h2>Lab Markers</h2>

      <div className="marker-controls">
        <div className="category-filters">
          {categories.map(category => (
            <button
              key={category}
              className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <input
          type="text"
          className="marker-search"
          placeholder="Search markers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="marker-groups">
        {Object.entries(groupedMarkers).map(([category, categoryMarkers]) => (
          <div key={category} className="marker-group">
            <h3 className="category-heading">{category}</h3>
            
            <div className="marker-table">
              <div className="marker-table-header">
                <div className="col-code">Code</div>
                <div className="col-name">Marker Name</div>
                <div className="col-value">Value</div>
                <div className="col-unit">Unit</div>
                <div className="col-range">Reference Range</div>
                <div className="col-status">Status</div>
              </div>

              {categoryMarkers.map((marker, index) => (
                <div key={index} className="marker-row">
                  <div className="col-code">{marker.marker_code || marker.code}</div>
                  <div className="col-name">{marker.marker_name || marker.name}</div>
                  <div className="col-value">{marker.value}</div>
                  <div className="col-unit">{marker.unit}</div>
                  <div className="col-range">
                    {marker.reference_range || 'N/A'}
                  </div>
                  <div className="col-status">
                    <span className={`status-badge ${getStatusClass(marker.status)}`}>
                      {marker.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {filteredMarkers.length === 0 && (
        <div className="no-results">
          No markers found matching your search.
        </div>
      )}
    </div>
  );
}

export default MarkerTable;
