import React from 'react'
import './Legend.css'

const Legend = () => {
  const legendItems = [
    { color: '#E8F5E9', label: 'Safe (0-20)', description: 'Low danger level' },
    { color: '#FFF9C4', label: 'Moderate (20-40)', description: 'Moderate danger' },
    { color: '#FFE0B2', label: 'High (40-60)', description: 'High danger' },
    { color: '#FFCDD2', label: 'Critical (60+)', description: 'Extremely dangerous' },
    { color: '#C8E6C9', label: 'Exit', description: 'Evacuation exit' },
  ]

  const hazardItems = [
    { symbol: 'F', label: 'Fire Detected', color: '#dc2626' },
    { symbol: 'CO', label: 'High CO (>50ppm)', color: '#991b1b' },
    { symbol: 'O2', label: 'O2 Cylinder Risk', color: '#d97706' },
    { symbol: 'C', label: 'High Crowd Density', color: '#ea580c' },
    { symbol: 'X', label: 'Blocked Exit', color: '#dc2626' },
  ]

  return (
    <div className="legend-panel">
      <h3 className="legend-title">Map Legend</h3>
      
      <div className="legend-section">
        <h4 className="legend-section-title">Danger Levels</h4>
        <div className="legend-items">
          {legendItems.map((item, idx) => (
            <div key={idx} className="legend-item">
              <div 
                className="legend-color" 
                style={{ backgroundColor: item.color, border: '1px solid #e5e7eb' }}
              />
              <div className="legend-text">
                <div className="legend-label">{item.label}</div>
                <div className="legend-description">{item.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="legend-section">
        <h4 className="legend-section-title">Hazard Indicators</h4>
        <div className="legend-items">
          {hazardItems.map((item, idx) => (
            <div key={idx} className="legend-item">
              <div className="legend-icon" style={{ 
                color: item.color,
                backgroundColor: '#f9fafb',
                border: `1px solid ${item.color}`,
                borderRadius: '3px',
                padding: '2px 6px',
                fontSize: '10px',
                fontWeight: '600',
                fontFamily: 'Inter, monospace'
              }}>
                {item.symbol}
              </div>
              <div className="legend-label">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="legend-section">
        <h4 className="legend-section-title">Routes</h4>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-route recommended" />
            <div className="legend-label">Recommended Route</div>
          </div>
          <div className="legend-item">
            <div className="legend-route alternative" />
            <div className="legend-label">Alternative Routes</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Legend

