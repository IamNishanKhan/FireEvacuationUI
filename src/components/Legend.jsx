import React from 'react'
import './Legend.css'

const Legend = () => {
  const legendItems = [
    { color: '#ADD8E6', label: 'Safe (0-20)', description: 'Low danger level' },
    { color: '#FFFFE0', label: 'Moderate (20-40)', description: 'Moderate danger' },
    { color: '#FFA500', label: 'High (40-60)', description: 'High danger' },
    { color: '#FF0000', label: 'Critical (60+)', description: 'Extremely dangerous' },
    { color: '#00FF00', label: 'Exit', description: 'Evacuation exit' },
  ]

  const hazardItems = [
    { icon: '🔥', label: 'Fire Detected', color: '#FF4444' },
    { icon: '💨', label: 'High CO (>50ppm)', color: '#AA4444' },
    { icon: '⚠️', label: 'O2 Cylinder Risk', color: '#FF8800' },
    { icon: '👥', label: 'High Crowd Density', color: '#FFA500' },
    { icon: '🚫', label: 'Blocked Exit', color: '#FF0000' },
  ]

  return (
    <div className="legend-panel">
      <h3 className="legend-title">🗺️ Map Legend</h3>
      
      <div className="legend-section">
        <h4 className="legend-section-title">Danger Levels</h4>
        <div className="legend-items">
          {legendItems.map((item, idx) => (
            <div key={idx} className="legend-item">
              <div 
                className="legend-color" 
                style={{ backgroundColor: item.color }}
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
              <div className="legend-icon" style={{ color: item.color }}>
                {item.icon}
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

