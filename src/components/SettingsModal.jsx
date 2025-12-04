import React, { useState } from 'react'
import './SettingsModal.css'

const SettingsModal = ({ isOpen, onClose, settings, onSettingsChange }) => {
  const [localSettings, setLocalSettings] = useState(settings)

  if (!isOpen) return null

  const handleChange = (key, value) => {
    const newSettings = { ...localSettings, [key]: value }
    setLocalSettings(newSettings)
    onSettingsChange(newSettings)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>⚙️ Settings</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="setting-group">
            <label className="setting-label">
              Update Interval
              <span className="setting-description">Time between UI updates (seconds)</span>
            </label>
            <input
              type="range"
              min="0.5"
              max="5"
              step="0.5"
              value={localSettings.updateInterval / 1000}
              onChange={(e) => handleChange('updateInterval', parseFloat(e.target.value) * 1000)}
              className="setting-slider"
            />
            <div className="setting-value">{(localSettings.updateInterval / 1000).toFixed(1)}s</div>
          </div>

          <div className="setting-group">
            <label className="setting-label">
              Simulation Step Duration
              <span className="setting-description">Seconds per simulation step</span>
            </label>
            <input
              type="range"
              min="10"
              max="60"
              step="10"
              value={localSettings.simulationStepDuration}
              onChange={(e) => handleChange('simulationStepDuration', parseInt(e.target.value))}
              className="setting-slider"
            />
            <div className="setting-value">{localSettings.simulationStepDuration}s per step</div>
          </div>

          <div className="setting-group">
            <label className="setting-label">
              Total Simulation Time
              <span className="setting-description">Total simulation duration (seconds)</span>
            </label>
            <input
              type="range"
              min="60"
              max="300"
              step="30"
              value={localSettings.totalSimulationTime}
              onChange={(e) => handleChange('totalSimulationTime', parseInt(e.target.value))}
              className="setting-slider"
            />
            <div className="setting-value">{localSettings.totalSimulationTime}s ({Math.floor(localSettings.totalSimulationTime / 60)} min)</div>
          </div>

          <div className="setting-group">
            <label className="setting-label">
              Fire Spread Intensity
              <span className="setting-description">How fast fire spreads</span>
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={localSettings.fireIntensity}
              onChange={(e) => handleChange('fireIntensity', parseFloat(e.target.value))}
              className="setting-slider"
            />
            <div className="setting-value">{localSettings.fireIntensity.toFixed(1)}x</div>
          </div>

          <div className="setting-group">
            <label className="setting-label">
              Show Room Labels
              <span className="setting-description">Display room names on map</span>
            </label>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={localSettings.showLabels}
                onChange={(e) => handleChange('showLabels', e.target.checked)}
              />
              <span className="toggle-slider" />
            </label>
          </div>

          <div className="setting-group">
            <label className="setting-label">
              Show Danger Scores
              <span className="setting-description">Display danger values on rooms</span>
            </label>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={localSettings.showDangerScores}
                onChange={(e) => handleChange('showDangerScores', e.target.checked)}
              />
              <span className="toggle-slider" />
            </label>
          </div>

          <div className="setting-group">
            <label className="setting-label">
              Animation Speed
              <span className="setting-description">Visual animation speed</span>
            </label>
            <select
              value={localSettings.animationSpeed}
              onChange={(e) => handleChange('animationSpeed', e.target.value)}
              className="setting-select"
            >
              <option value="slow">Slow</option>
              <option value="normal">Normal</option>
              <option value="fast">Fast</option>
            </select>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Close</button>
          <button className="btn-primary" onClick={() => {
            onSettingsChange(localSettings)
            onClose()
          }}>Apply</button>
        </div>
      </div>
    </div>
  )
}

export default SettingsModal

