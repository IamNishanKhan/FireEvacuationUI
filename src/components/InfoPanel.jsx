import React from 'react'
import './InfoPanel.css'

const COLORS = {
  BLACK: '#000000',
  RED: '#FF0000',
  GREEN: '#00FF00',
  BLUE: '#0000FF',
  GRAY: '#808080',
  DARK_GREEN: '#006400',
  PURPLE: '#800080',
  ORANGE: '#FFA500',
}

const InfoPanel = ({
  timeStep,
  simulationTime,
  fireCount,
  routes,
  recommended,
  paused,
  autoStep,
  routeChanged,
  evacuationProgress,
  simulationHistory,
}) => {
  return (
    <div className="info-panel">
      <div className="panel-section">
        <h1 className="panel-title">FIRE EVACUATION</h1>
        <div className="panel-subtitle">
          Simulation: {Math.floor((simulationTime || 0) / 60)}m {Math.floor((simulationTime || 0) % 60)}s
          {' / '}
          <span style={{ color: '#666' }}>Step: {timeStep}</span>
        </div>
        
        <div className="panel-divider" />
        
        <div className="fire-status">
          <div className="status-label">Fires: {fireCount}</div>
        </div>
        
        <div className="panel-divider" />
        
        {recommended ? (
          <div className="recommended-section">
            <h2 className="section-title" style={{ 
              color: routeChanged ? COLORS.RED : COLORS.DARK_GREEN,
              animation: routeChanged ? 'flash 0.5s ease-in-out 3' : 'none'
            }}>
              {routeChanged ? '⚠️ ROUTE CHANGED!' : 'RECOMMENDED ROUTE'}
            </h2>
            <div className="route-info">
              <div style={{ fontWeight: 'bold', fontSize: '16px' }}>Exit: {recommended.exit}</div>
              <div className="route-path">
                {recommended.path.length > 6
                  ? `${recommended.path.slice(0, 3).join(' → ')} → ... → ${recommended.path.slice(-2).join(' → ')}`
                  : recommended.path.join(' → ')}
              </div>
              {evacuationProgress !== undefined && (
                <div style={{ marginTop: '12px' }}>
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#666', 
                    marginBottom: '6px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span>Evacuation Progress:</span>
                    <span style={{ fontWeight: 'bold', color: '#00C853' }}>
                      {Math.round(evacuationProgress * 100)}%
                    </span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '8px',
                    backgroundColor: '#E0E0E0',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)'
                  }}>
                    <div style={{
                      width: `${evacuationProgress * 100}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #00C853 0%, #4CAF50 100%)',
                      borderRadius: '4px',
                      transition: 'width 0.1s ease-out',
                      boxShadow: '0 2px 4px rgba(0, 200, 83, 0.3)'
                    }} />
                  </div>
                  <div style={{ 
                    fontSize: '10px', 
                    color: '#999', 
                    marginTop: '4px',
                    textAlign: 'right'
                  }}>
                    {recommended.path[Math.floor(evacuationProgress * (recommended.path.length - 1))] || recommended.path[0]} → {recommended.path[Math.min(Math.floor(evacuationProgress * (recommended.path.length - 1)) + 1, recommended.path.length - 1)] || recommended.path[recommended.path.length - 1]}
                  </div>
                </div>
              )}
              <div style={{ marginTop: '10px' }}>
                <div style={{ color: COLORS.RED, fontWeight: 'bold' }}>
                  Avg Danger: {recommended.risk.avgDanger.toFixed(1)}
                </div>
                <div style={{ color: COLORS.RED, fontSize: '12px' }}>
                  Max Danger: {recommended.risk.maxDanger.toFixed(1)} at {recommended.risk.maxDangerLocation}
                </div>
                <div style={{ fontSize: '12px', color: COLORS.GRAY }}>
                  Path Length: {recommended.risk.pathLength} rooms
                </div>
              </div>
              <div style={{ marginTop: '10px', color: recommended.risk.passable ? COLORS.GREEN : COLORS.RED, fontWeight: 'bold' }}>
                Status: {recommended.risk.passable ? '✓ PASSABLE' : '✗ BLOCKED'}
              </div>
              <div style={{ marginTop: '10px' }}>
                {recommended.risk.hasFire && (
                  <div style={{ color: COLORS.RED, fontWeight: 'bold', fontSize: '14px' }}>⚠️ FIRE DETECTED!</div>
                )}
                {recommended.risk.hasOxygenHazard && (
                  <div style={{ color: COLORS.ORANGE, fontWeight: 'bold', fontSize: '14px' }}>⚠️ O2 EXPLOSION RISK</div>
                )}
                {!recommended.risk.hasFire && !recommended.risk.hasOxygenHazard && (
                  <div style={{ color: COLORS.GREEN, fontSize: '12px' }}>✓ No critical hazards</div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="no-route-section">
            <h2 style={{ color: COLORS.RED }}>NO SAFE ROUTES</h2>
            <h2 style={{ color: COLORS.RED }}>SHELTER IN PLACE</h2>
          </div>
        )}
        
        <div className="panel-divider" />
        
        <div className="all-routes-section">
          <h2 className="section-title">ALL ROUTES ({routes.length})</h2>
          {routes.slice(0, 5).map((route, idx) => {
            const isRec = recommended && recommended.path === route.path
            const routeColors = [COLORS.BLUE, COLORS.PURPLE, '#A52A2A', COLORS.ORANGE, '#6496C8']
            const color = routeColors[idx % routeColors.length]
            
            return (
              <div key={idx} className="route-item" style={{ 
                backgroundColor: isRec ? '#E8F5E9' : 'transparent',
                padding: '8px',
                borderRadius: '4px',
                marginBottom: '5px',
                border: isRec ? `2px solid ${COLORS.GREEN}` : '1px solid transparent'
              }}>
                <div style={{ color, fontWeight: 'bold', fontSize: '14px' }}>
                  Route {idx + 1}: {route.exit} {isRec && '⭐ [RECOMMENDED]'}
                </div>
                <div style={{ fontSize: '12px', marginTop: '4px' }}>
                  <span style={{ color: route.risk.passable ? COLORS.GREEN : COLORS.RED, fontWeight: 'bold' }}>
                    {route.risk.passable ? '✓ PASSABLE' : '✗ BLOCKED'}
                  </span>
                  {' | '}
                  <span style={{ color: COLORS.RED }}>Danger: {route.risk.avgDanger.toFixed(1)}</span>
                  {' | '}
                  <span style={{ color: COLORS.GRAY }}>Length: {route.risk.pathLength}</span>
                </div>
                {(route.risk.hasFire || route.risk.hasOxygenHazard) && (
                  <div style={{ fontSize: '11px', marginTop: '4px' }}>
                    {route.risk.hasFire && <span style={{ color: COLORS.RED }}>🔥 Fire </span>}
                    {route.risk.hasOxygenHazard && <span style={{ color: COLORS.ORANGE }}>⚠️ O2 Risk</span>}
                  </div>
                )}
              </div>
            )
          })}
          {routes.length > 5 && (
            <div style={{ color: COLORS.GRAY, fontSize: '12px', marginTop: '10px' }}>
              ... +{routes.length - 5} more routes available
            </div>
          )}
        </div>
        
        <div className="panel-divider" style={{ marginTop: 'auto' }} />
        
        <div className="controls-section">
          <div className="section-label">CONTROLS:</div>
          <div className="control-item">SPACE: {paused ? 'Resume' : 'Pause'}</div>
          <div className="control-item">N: Next Step</div>
          <div className="control-item">A: Auto Toggle</div>
          <div className="control-item">ESC: Exit</div>
        </div>
      </div>
    </div>
  )
}

export default InfoPanel

