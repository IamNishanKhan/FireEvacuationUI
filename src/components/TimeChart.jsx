import React from 'react'
import './TimeChart.css'

const TimeChart = ({ simulationHistory, simulationTime }) => {
  if (!simulationHistory || simulationHistory.length === 0) {
    return null
  }

  const maxFires = Math.max(...simulationHistory.map(h => h.fireCount), 1)
  const maxDanger = Math.max(...simulationHistory.map(h => h.avgDanger), 1)
  const chartHeight = 80
  const chartWidth = 300

  return (
    <div className="time-chart">
      <h3 className="chart-title">Simulation Timeline</h3>
      <div className="chart-container">
        <svg width={chartWidth} height={chartHeight} className="chart-svg">
          {/* Grid lines */}
          {[0, 30, 60, 90, 120].map(time => {
            const x = (time / 120) * chartWidth
            return (
              <line
                key={time}
                x1={x}
                y1={0}
                x2={x}
                y2={chartHeight}
                stroke="#1f2937"
                strokeWidth={1}
                strokeDasharray="2,2"
              />
            )
          })}
          
          {/* Fire count line */}
          <polyline
            points={simulationHistory.map((h, i) => {
              const x = (h.time / 120) * chartWidth
              const y = chartHeight - (h.fireCount / maxFires) * (chartHeight / 2)
              return `${x},${y}`
            }).join(' ')}
            fill="none"
            stroke="#dc2626"
            strokeWidth={2}
            className="chart-line"
          />
          
          {/* Danger level line */}
          <polyline
            points={simulationHistory.map((h, i) => {
              const x = (h.time / 120) * chartWidth
              const y = chartHeight - (h.avgDanger / maxDanger) * (chartHeight / 2) - chartHeight / 2
              return `${x},${y}`
            }).join(' ')}
            fill="none"
            stroke="#d97706"
            strokeWidth={2}
            className="chart-line"
          />
          
          {/* Current time indicator */}
          {simulationTime > 0 && (
            <line
              x1={(simulationTime / 120) * chartWidth}
              y1={0}
              x2={(simulationTime / 120) * chartWidth}
              y2={chartHeight}
              stroke="#374151"
              strokeWidth={2}
              className="current-time-indicator"
            />
          )}
        </svg>
        
        <div className="chart-legend">
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#dc2626' }} />
            <span>Fire Count</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#d97706' }} />
            <span>Avg Danger</span>
          </div>
        </div>
        
        <div className="chart-labels">
          <span>0s</span>
          <span>30s</span>
          <span>60s</span>
          <span>90s</span>
          <span>120s</span>
        </div>
      </div>
    </div>
  )
}

export default TimeChart


