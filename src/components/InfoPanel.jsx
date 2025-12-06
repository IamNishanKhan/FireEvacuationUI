import React from 'react'
import './InfoPanel.css'

const COLORS = {
  PRIMARY: '#e5e7eb',
  SECONDARY: '#9ca3af',
  SUCCESS: '#34d399',
  WARNING: '#f59e0b',
  DANGER: '#f87171',
  MUTED: '#94a3b8',
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
        <h1 className="panel-title">Fire Evacuation System</h1>
        <div className="panel-subtitle">
          {Math.floor((simulationTime || 0) / 60)}m {Math.floor((simulationTime || 0) % 60)}s
          <span style={{ color: COLORS.SECONDARY, marginLeft: '12px' }}>Step {timeStep}</span>
        </div>
        
        <div className="panel-divider" />
        
        <div className="fire-status">
          <div className="status-label">Active Fires: {fireCount}</div>
        </div>
        
        <div className="panel-divider" />
        
        {recommended ? (
          <div className="recommended-section">
            <h2 className="section-title" style={{ 
              color: routeChanged ? COLORS.DANGER : COLORS.SECONDARY,
              animation: routeChanged ? 'flash 0.5s ease-in-out 3' : 'none'
            }}>
              {routeChanged ? 'Route Changed' : 'Recommended Route'}
            </h2>
            <div className="route-info">
              <div style={{ fontWeight: 600, fontSize: '14px', color: COLORS.PRIMARY, marginBottom: '8px' }}>Exit: {recommended.exit}</div>
              <div className="route-path">
                {recommended.path.length > 6
                  ? `${recommended.path.slice(0, 3).join(' → ')} → ... → ${recommended.path.slice(-2).join(' → ')}`
                  : recommended.path.join(' → ')}
              </div>
              {evacuationProgress !== undefined && (
                <div style={{ marginTop: '12px' }}>
                  <div style={{ 
                    fontSize: '11px', 
                    color: COLORS.SECONDARY, 
                    marginBottom: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontWeight: 500
                  }}>
                    <span>Evacuation Progress</span>
                    <span style={{ fontWeight: 600, color: COLORS.PRIMARY }}>
                      {Math.round(evacuationProgress * 100)}%
                    </span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '6px',
                    backgroundColor: '#e5e7eb',
                    borderRadius: '3px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${evacuationProgress * 100}%`,
                      height: '100%',
                      background: COLORS.SUCCESS,
                      borderRadius: '3px',
                      transition: 'width 0.1s ease-out'
                    }} />
                  </div>
                  <div style={{ 
                    fontSize: '10px', 
                    color: COLORS.MUTED, 
                    marginTop: '6px',
                    textAlign: 'right',
                    fontFamily: 'monospace'
                  }}>
                    {recommended.path[Math.floor(evacuationProgress * (recommended.path.length - 1))] || recommended.path[0]} → {recommended.path[Math.min(Math.floor(evacuationProgress * (recommended.path.length - 1)) + 1, recommended.path.length - 1)] || recommended.path[recommended.path.length - 1]}
                  </div>
                </div>
              )}
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', color: COLORS.SECONDARY, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Avg Danger</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: COLORS.PRIMARY }}>{recommended.risk.avgDanger.toFixed(1)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', color: COLORS.SECONDARY, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Max Danger</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: COLORS.PRIMARY }}>{recommended.risk.maxDanger.toFixed(1)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', color: COLORS.SECONDARY, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Path Length</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: COLORS.PRIMARY }}>{recommended.risk.pathLength} rooms</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e5e7eb' }}>
                  <span style={{ fontSize: '11px', color: COLORS.SECONDARY, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: recommended.risk.passable ? COLORS.SUCCESS : COLORS.DANGER, textTransform: 'uppercase' }}>
                    {recommended.risk.passable ? 'Passable' : 'Blocked'}
                  </span>
                </div>
              </div>
              {recommended.risk.hasFire && (
                <div style={{ marginTop: '12px', padding: '8px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '4px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: COLORS.DANGER, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fire Detected</div>
                </div>
              )}
              {recommended.risk.hasOxygenHazard && (
                <div style={{ marginTop: '12px', padding: '8px 12px', background: '#fffbeb', border: '1px solid #fed7aa', borderRadius: '4px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: COLORS.WARNING, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Oxygen Cylinder Risk</div>
                </div>
              )}
              {!recommended.risk.hasFire && !recommended.risk.hasOxygenHazard && (
                <div style={{ marginTop: '12px', padding: '8px 12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '4px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 500, color: COLORS.SUCCESS }}>No critical hazards</div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="no-route-section">
            <h2 style={{ color: COLORS.DANGER }}>No Safe Routes</h2>
            <h2 style={{ color: COLORS.DANGER, marginTop: '8px' }}>Shelter In Place</h2>
          </div>
        )}
        
        <div className="panel-divider" />
        
        <div className="all-routes-section">
          <h2 className="section-title">All Routes ({routes.length})</h2>
          {routes.slice(0, 5).map((route, idx) => {
            const isRec = recommended && recommended.path === route.path
            
            return (
              <div key={idx} className="route-item" style={{ 
                backgroundColor: isRec ? '#0f172a' : '#0b1220',
                border: isRec ? `1px solid ${COLORS.SUCCESS}` : '1px solid #1f2937'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: COLORS.PRIMARY }}>
                    Route {idx + 1}: {route.exit}
                  </span>
                  {isRec && (
                    <span style={{ fontSize: '10px', fontWeight: 600, color: COLORS.SUCCESS, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Recommended
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '11px', color: COLORS.SECONDARY, display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 500 }}>
                    <span style={{ color: route.risk.passable ? COLORS.SUCCESS : COLORS.DANGER }}>
                      {route.risk.passable ? 'Passable' : 'Blocked'}
                    </span>
                  </span>
                  <span>Danger: {route.risk.avgDanger.toFixed(1)}</span>
                  <span>Length: {route.risk.pathLength}</span>
                </div>
                {(route.risk.hasFire || route.risk.hasOxygenHazard) && (
                  <div style={{ fontSize: '10px', marginTop: '6px', display: 'flex', gap: '8px' }}>
                    {route.risk.hasFire && (
                      <span style={{ color: COLORS.DANGER, fontWeight: 500 }}>Fire</span>
                    )}
                    {route.risk.hasOxygenHazard && (
                      <span style={{ color: COLORS.WARNING, fontWeight: 500 }}>O2 Risk</span>
                    )}
                  </div>
                )}
              </div>
            )
          })}
          {routes.length > 5 && (
            <div style={{ color: COLORS.MUTED, fontSize: '11px', marginTop: '12px', textAlign: 'center' }}>
              +{routes.length - 5} more routes available
            </div>
          )}
        </div>
        
        <div className="panel-divider" style={{ marginTop: 'auto' }} />
        
        <div className="controls-section">
          <div className="section-label">Controls</div>
          <div className="control-item">
            <span style={{ color: COLORS.SECONDARY }}>SPACE</span>
            <span style={{ color: COLORS.PRIMARY, fontWeight: 500 }}>{paused ? 'Resume' : 'Pause'}</span>
          </div>
          <div className="control-item">
            <span style={{ color: COLORS.SECONDARY }}>N</span>
            <span style={{ color: COLORS.PRIMARY, fontWeight: 500 }}>Next Step</span>
          </div>
          <div className="control-item">
            <span style={{ color: COLORS.SECONDARY }}>A</span>
            <span style={{ color: COLORS.PRIMARY, fontWeight: 500 }}>Auto Toggle</span>
          </div>
          <div className="control-item">
            <span style={{ color: COLORS.SECONDARY }}>ESC</span>
            <span style={{ color: COLORS.PRIMARY, fontWeight: 500 }}>Exit</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InfoPanel

