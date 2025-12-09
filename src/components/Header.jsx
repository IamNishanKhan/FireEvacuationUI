import React, { useState } from 'react'
import './Header.css'

const Header = ({ timeStep, simulationTime, fireCount, paused, autoStep, onPause, onStep, onToggleAuto, onReset, onSettings, simulationSpeed, onSpeedChange, totalSimulationTime }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const handleMobileMenuClose = () => {
    setMobileMenuOpen(false)
  }

  const handleControlClick = (callback) => {
    callback()
    // Optionally close menu after action (uncomment if desired)
    // setMobileMenuOpen(false)
  }

  return (
    <>
      <header className="app-header">
        <div className="header-left">
          <div className="logo">
            <div className="logo-icon-wrapper">
              <svg className="logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="logo-text">
              <h1>Fire Evacuation System</h1>
              <p>Real-Time Simulation & Route Planning</p>
            </div>
          </div>
        </div>
      
      <div className="header-center">
        <div className="status-indicators">
          <div className="status-item">
            <div className="status-content">
            <span className="status-label">Simulation Time</span>
            <span className="status-value">{formatSimulationTime(simulationTime || 0)}</span>
            </div>
            <div className="time-progress-bar">
              <div 
                className="time-progress-fill" 
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
          <div className="status-divider"></div>
          <div className="status-item">
            <span className="status-label">Step</span>
            <span className="status-value">{timeStep}</span>
          </div>
          <div className="status-divider"></div>
          <div className="status-item danger">
            <span className="status-label">Active Fires</span>
            <span className="status-value">{fireCount}</span>
          </div>
          <div className="status-divider"></div>
          <div className={`status-item ${paused ? 'paused' : 'running'}`}>
            <span className="status-label">{paused ? 'Paused' : 'Running'}</span>
            <div className={`status-indicator-dot ${paused ? 'paused' : 'running'}`}></div>
          </div>
          <div className="status-divider"></div>
          <div className="status-item speed-control">
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
            className={`control-btn primary ${paused ? 'paused' : ''}`}
            onClick={onPause}
            title="Pause/Resume (Space)"
          >
            <span className="btn-icon">{paused ? '▶' : '⏸'}</span>
            <span className="btn-text">{paused ? 'Resume' : 'Pause'}</span>
          </button>
          <button 
            className="control-btn"
            onClick={onStep}
            title="Next Step (N)"
            disabled={!paused && autoStep}
          >
            <span className="btn-icon">⏭</span>
            <span className="btn-text">Step</span>
          </button>
          <button 
            className={`control-btn ${autoStep ? 'active' : ''}`}
            onClick={onToggleAuto}
            title="Toggle Auto Mode (A)"
          >
            <span className="btn-icon">↻</span>
            <span className="btn-text">{autoStep ? 'Auto' : 'Manual'}</span>
          </button>
          <div className="control-divider"></div>
          <button 
            className="control-btn secondary"
            onClick={onReset}
            title="Reset Simulation"
          >
            <span className="btn-icon">↻</span>
            <span className="btn-text">Reset</span>
          </button>
          <button 
            className="control-btn secondary"
            onClick={onSettings}
            title="Settings"
          >
            <span className="btn-icon">⚙</span>
            <span className="btn-text">Settings</span>
          </button>
        </div>
        
        {/* Hamburger Menu Button - Mobile Only */}
        <button 
          className="mobile-menu-toggle"
          onClick={handleMobileMenuToggle}
          aria-label="Toggle menu"
        >
          <div className={`hamburger ${mobileMenuOpen ? 'active' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>
      </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div 
        className={`mobile-menu-overlay ${mobileMenuOpen ? 'active' : ''}`}
        onClick={handleMobileMenuClose}
      />

      {/* Mobile Sidebar Menu */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'active' : ''}`}>
        <div className="mobile-menu-header">
          <h2>Controls</h2>
          <button 
            className="mobile-menu-close"
            onClick={handleMobileMenuClose}
            aria-label="Close menu"
          >
            ×
          </button>
        </div>

        <div className="mobile-menu-content">
          {/* Status Indicators Section */}
          <div className="mobile-menu-section">
            <h3 className="mobile-menu-section-title">Status</h3>
            <div className="mobile-status-item">
              <span className="mobile-status-label">Simulation Time</span>
              <span className="mobile-status-value">{formatSimulationTime(simulationTime || 0)}</span>
            </div>
            <div className="mobile-time-progress-bar">
              <div 
                className="mobile-time-progress-fill" 
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="mobile-status-item">
              <span className="mobile-status-label">Step</span>
              <span className="mobile-status-value">{timeStep}</span>
            </div>
            <div className="mobile-status-item">
              <span className="mobile-status-label">Active Fires</span>
              <span className="mobile-status-value danger">{fireCount}</span>
            </div>
            <div className="mobile-status-item">
              <span className="mobile-status-label">Status</span>
              <span className={`mobile-status-value ${paused ? 'paused' : 'running'}`}>
                {paused ? 'Paused' : 'Running'}
              </span>
            </div>
          </div>

          {/* Speed Control Section */}
          <div className="mobile-menu-section">
            <h3 className="mobile-menu-section-title">Speed</h3>
            <div className="mobile-speed-selector">
              <button
                className={`mobile-speed-btn ${simulationSpeed === 0.5 ? 'active' : ''}`}
                onClick={() => handleControlClick(() => onSpeedChange(0.5))}
              >
                0.5x
              </button>
              <button
                className={`mobile-speed-btn ${simulationSpeed === 1 ? 'active' : ''}`}
                onClick={() => handleControlClick(() => onSpeedChange(1))}
              >
                1x
              </button>
              <button
                className={`mobile-speed-btn ${simulationSpeed === 2 ? 'active' : ''}`}
                onClick={() => handleControlClick(() => onSpeedChange(2))}
              >
                2x
              </button>
              <button
                className={`mobile-speed-btn ${simulationSpeed === 4 ? 'active' : ''}`}
                onClick={() => handleControlClick(() => onSpeedChange(4))}
              >
                4x
              </button>
            </div>
          </div>

          {/* Control Buttons Section */}
          <div className="mobile-menu-section">
            <h3 className="mobile-menu-section-title">Controls</h3>
            <button 
              className={`mobile-control-btn primary ${paused ? 'paused' : ''}`}
              onClick={() => handleControlClick(onPause)}
            >
              <span className="mobile-btn-icon">{paused ? '▶' : '⏸'}</span>
              <span className="mobile-btn-text">{paused ? 'Resume' : 'Pause'}</span>
            </button>
            <button 
              className="mobile-control-btn"
              onClick={() => handleControlClick(onStep)}
              disabled={!paused && autoStep}
            >
              <span className="mobile-btn-icon">⏭</span>
              <span className="mobile-btn-text">Next Step</span>
            </button>
            <button 
              className={`mobile-control-btn ${autoStep ? 'active' : ''}`}
              onClick={() => handleControlClick(onToggleAuto)}
            >
              <span className="mobile-btn-icon">↻</span>
              <span className="mobile-btn-text">{autoStep ? 'Auto Mode' : 'Manual Mode'}</span>
            </button>
            <button 
              className="mobile-control-btn secondary"
              onClick={() => handleControlClick(onReset)}
            >
              <span className="mobile-btn-icon">↻</span>
              <span className="mobile-btn-text">Reset Simulation</span>
            </button>
            <button 
              className="mobile-control-btn secondary"
              onClick={() => handleControlClick(onSettings)}
            >
              <span className="mobile-btn-icon">⚙</span>
              <span className="mobile-btn-text">Settings</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default Header

