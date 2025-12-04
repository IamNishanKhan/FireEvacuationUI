import React from 'react'
import './Header.css'

const Header = ({ timeStep, simulationTime, fireCount, paused, autoStep, onPause, onStep, onToggleAuto, onReset, onSettings, simulationSpeed, onSpeedChange, totalSimulationTime }) => {
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }
  
  const formatSimulationTime = (seconds) => {
    const totalMinutes = Math.floor(seconds / 60)
    const totalSecs = Math.floor(seconds % 60)
    return `${totalMinutes}m ${totalSecs}s`
  }
  
  const progressPercentage = totalSimulationTime > 0 
    ? Math.min((simulationTime / totalSimulationTime) * 100, 100) 
    : 0

  return (
    <header className="app-header">
      <div className="header-left">
        <div className="logo">
          <span className="logo-icon">🔥</span>
          <div className="logo-text">
            <h1>Fire Evacuation System</h1>
            <p>Real-Time Simulation & Route Planning</p>
          </div>
        </div>
      </div>
      
      <div className="header-center">
        <div className="status-indicators">
          <div className="status-item">
            <span className="status-icon">⏱️</span>
            <span className="status-label">Simulation Time</span>
            <span className="status-value">{formatSimulationTime(simulationTime || 0)}</span>
            <div className="time-progress-bar">
              <div 
                className="time-progress-fill" 
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
          <div className="status-item">
            <span className="status-icon">🔄</span>
            <span className="status-label">Step</span>
            <span className="status-value">{timeStep}</span>
          </div>
          <div className="status-item danger">
            <span className="status-icon">🔥</span>
            <span className="status-label">Active Fires</span>
            <span className="status-value">{fireCount}</span>
          </div>
          <div className={`status-item ${paused ? 'paused' : 'running'}`}>
            <span className="status-icon">{paused ? '⏸️' : '▶️'}</span>
            <span className="status-label">{paused ? 'Paused' : 'Running'}</span>
          </div>
          <div className="status-item speed-control">
            <span className="status-icon">⚡</span>
            <span className="status-label">Speed</span>
            <div className="speed-selector">
              <button
                className={`speed-btn ${simulationSpeed === 0.5 ? 'active' : ''}`}
                onClick={() => onSpeedChange(0.5)}
                title="0.5x Speed"
              >
                0.5x
              </button>
              <button
                className={`speed-btn ${simulationSpeed === 1 ? 'active' : ''}`}
                onClick={() => onSpeedChange(1)}
                title="1x Speed (Normal)"
              >
                1x
              </button>
              <button
                className={`speed-btn ${simulationSpeed === 2 ? 'active' : ''}`}
                onClick={() => onSpeedChange(2)}
                title="2x Speed"
              >
                2x
              </button>
              <button
                className={`speed-btn ${simulationSpeed === 4 ? 'active' : ''}`}
                onClick={() => onSpeedChange(4)}
                title="4x Speed"
              >
                4x
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="header-right">
        <div className="header-controls">
          <button 
            className={`control-btn ${paused ? 'paused' : ''}`}
            onClick={onPause}
            title="Pause/Resume (Space)"
          >
            {paused ? '▶ Resume' : '⏸ Pause'}
          </button>
          <button 
            className="control-btn"
            onClick={onStep}
            title="Next Step (N)"
            disabled={!paused && autoStep}
          >
            ⏭ Step
          </button>
          <button 
            className={`control-btn ${autoStep ? 'active' : ''}`}
            onClick={onToggleAuto}
            title="Toggle Auto Mode (A)"
          >
            {autoStep ? '🔄 Auto' : '⏸ Manual'}
          </button>
          <button 
            className="control-btn secondary"
            onClick={onReset}
            title="Reset Simulation"
          >
            🔄 Reset
          </button>
          <button 
            className="control-btn secondary"
            onClick={onSettings}
            title="Settings"
          >
            ⚙️ Settings
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header

