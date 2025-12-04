import React from 'react'
import { calculateDangerScore } from '../utils/simulation'
import './StatisticsPanel.css'

const StatisticsPanel = ({ sensors, routes, recommended, timeStep }) => {
  const calculateStats = () => {
    const sensorValues = Object.values(sensors)
    const totalRooms = sensorValues.length || 1
    const roomsWithFire = sensorValues.filter(s => s.fireDetected).length
    const roomsBlocked = sensorValues.filter(s => !s.exitAccessible || s.dangerScore > 70).length
    const avgDanger = sensorValues.reduce((sum, s) => {
      const danger = s.dangerScore ?? calculateDangerScore(s)
      return sum + danger
    }, 0) / totalRooms
    const totalOccupancy = sensorValues.reduce((sum, s) => sum + (s.occupancyDensity || 0), 0)
    const highCO = sensorValues.filter(s => s.carbonMonoxide > 50).length
    const passableRoutes = routes.filter(r => r.risk.passable).length
    
    return {
      totalRooms,
      roomsWithFire,
      roomsBlocked,
      avgDanger: avgDanger.toFixed(1),
      totalOccupancy: (totalOccupancy * 100).toFixed(0),
      highCO,
      passableRoutes,
      totalRoutes: routes.length,
    }
  }

  const stats = calculateStats()

  const StatCard = ({ icon, label, value, color, trend }) => (
    <div className="stat-card">
      <div className="stat-icon" style={{ backgroundColor: color + '20', color }}>
        {icon}
      </div>
      <div className="stat-content">
        <div className="stat-value" style={{ color }}>{value}</div>
        <div className="stat-label">{label}</div>
        {trend && <div className="stat-trend">{trend}</div>}
      </div>
    </div>
  )

  return (
    <div className="statistics-panel">
      <h2 className="panel-title">Statistics</h2>
      
      <div className="stats-grid">
        <StatCard
          icon="🔥"
          label="Active Fires"
          value={stats.roomsWithFire}
          color="#FF4444"
        />
        <StatCard
          icon="🚫"
          label="Blocked Areas"
          value={stats.roomsBlocked}
          color="#FF8800"
        />
        <StatCard
          icon="⚠️"
          label="Avg Danger"
          value={stats.avgDanger}
          color={stats.avgDanger > 50 ? "#FF4444" : stats.avgDanger > 30 ? "#FF8800" : "#44AA44"}
        />
        <StatCard
          icon="👥"
          label="Occupancy"
          value={`${stats.totalOccupancy}%`}
          color="#4488FF"
        />
        <StatCard
          icon="💨"
          label="High CO Areas"
          value={stats.highCO}
          color="#AA4444"
        />
        <StatCard
          icon="✅"
          label="Passable Routes"
          value={`${stats.passableRoutes}/${stats.totalRoutes}`}
          color={stats.passableRoutes > 0 ? "#44AA44" : "#FF4444"}
        />
      </div>

      {recommended && (
        <div className="recommended-stats">
          <h3 className="section-title">Recommended Route Stats</h3>
          <div className="route-stats-grid">
            <div className="route-stat">
              <span className="route-stat-label">Exit:</span>
              <span className="route-stat-value">{recommended.exit}</span>
            </div>
            <div className="route-stat">
              <span className="route-stat-label">Path Length:</span>
              <span className="route-stat-value">{recommended.risk.pathLength} rooms</span>
            </div>
            <div className="route-stat">
              <span className="route-stat-label">Avg Danger:</span>
              <span className="route-stat-value" style={{ color: '#FF4444' }}>
                {recommended.risk.avgDanger.toFixed(1)}
              </span>
            </div>
            <div className="route-stat">
              <span className="route-stat-label">Max Danger:</span>
              <span className="route-stat-value" style={{ color: '#FF8800' }}>
                {recommended.risk.maxDanger.toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StatisticsPanel

