import './SummaryCards.css';

/**
 * Summary Cards Component
 * Displays summary statistics of lab results
 */
function SummaryCards({ summary, markers }) {
  if (!summary && !markers) return null;

  // Calculate counts from summary or markers
  const normalCount = summary?.normal_count ?? summary?.normal ?? 
    (markers?.filter(m => m.status === 'Normal' || m.status === 'NORMAL').length || 0);
  const elevatedCount = summary?.elevated_count ?? summary?.elevated ?? 
    (markers?.filter(m => m.status === 'Elevated' || m.status === 'ELEVATED').length || 0);
  const highCount = summary?.high_count ?? summary?.high ?? 
    (markers?.filter(m => m.status === 'High' || m.status === 'HIGH').length || 0);
  const criticalCount = summary?.critical_count ?? summary?.critical ?? 
    (markers?.filter(m => m.status === 'Critical' || m.status === 'CRITICAL').length || 0);

  const totalMarkers = normalCount + elevatedCount + highCount + criticalCount;

  const cards = [
    {
      label: 'Normal',
      count: normalCount,
      percentage: totalMarkers > 0 ? Math.round((normalCount / totalMarkers) * 100) : 0,
      icon: '✓',
      className: 'card-normal',
    },
    {
      label: 'Elevated',
      count: elevatedCount,
      percentage: totalMarkers > 0 ? Math.round((elevatedCount / totalMarkers) * 100) : 0,
      icon: '⚠',
      className: 'card-elevated',
    },
    {
      label: 'High',
      count: highCount,
      percentage: totalMarkers > 0 ? Math.round((highCount / totalMarkers) * 100) : 0,
      icon: '⚠',
      className: 'card-high',
    },
    {
      label: 'Critical',
      count: criticalCount,
      percentage: totalMarkers > 0 ? Math.round((criticalCount / totalMarkers) * 100) : 0,
      icon: '⚠',
      className: 'card-critical',
    },
  ];

  return (
    <div className="summary-cards">
      {cards.map((card, index) => (
        <div key={index} className={`summary-card ${card.className}`}>
          <div className="card-icon">{card.icon}</div>
          <div className="card-content">
            <div className="card-count">{card.count}</div>
            <div className="card-label">{card.label} Markers</div>
            <div className="card-percentage">{card.percentage}%</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default SummaryCards;
