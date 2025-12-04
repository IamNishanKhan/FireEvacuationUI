import React, { useState, useEffect, useRef, useCallback } from 'react'
import FloorPlanCanvas from './components/FloorPlanCanvas'
import InfoPanel from './components/InfoPanel'
import Header from './components/Header'
import StatisticsPanel from './components/StatisticsPanel'
import Legend from './components/Legend'
import SettingsModal from './components/SettingsModal'
import TimeChart from './components/TimeChart'
import { calculateDangerScore } from './utils/simulation'
import './App.css'

// Sample floor plan data (matches Python structure)
const createSampleFloorPlan = () => {
  const rooms = [
    { id: 'R1', name: 'Room 101', position: [10, 10], size: [12, 12], type: 'room' },
    { id: 'R2', name: 'Room 102', position: [60, 10], size: [12, 12], type: 'room' },
    { id: 'R3', name: 'Room 103', position: [10, 50], size: [12, 12], type: 'room' },
    { id: 'R4', name: 'Room 104', position: [60, 50], size: [12, 12], type: 'room' },
    { id: 'R5', name: 'Room 105', position: [110, 10], size: [12, 12], type: 'room' },
    { id: 'R6', name: 'Room 106', position: [110, 50], size: [12, 12], type: 'room' },
    { id: 'R7', name: 'Room 107', position: [10, 100], size: [12, 12], type: 'room' },
    { id: 'C1', name: 'Corridor 1', position: [35, 10], size: [15, 6], type: 'corridor', hasOxygenCylinder: true },
    { id: 'C2', name: 'Corridor 2', position: [10, 30], size: [6, 12], type: 'corridor' },
    { id: 'C3', name: 'Corridor 3', position: [60, 30], size: [6, 12], type: 'corridor' },
    { id: 'C4', name: 'Corridor 4', position: [85, 10], size: [15, 6], type: 'corridor' },
    { id: 'C5', name: 'Corridor 5', position: [35, 50], size: [15, 6], type: 'corridor' },
    { id: 'C6', name: 'Corridor 6', position: [85, 50], size: [15, 6], type: 'corridor' },
    { id: 'C7', name: 'Corridor 7', position: [10, 75], size: [6, 15], type: 'corridor' },
    { id: 'C8', name: 'Corridor 8', position: [110, 30], size: [6, 12], type: 'corridor' },
    { id: 'C9', name: 'Corridor 9', position: [110, 75], size: [6, 15], type: 'corridor' },
    { id: 'C10', name: 'Corridor 10', position: [35, 100], size: [15, 6], type: 'corridor' },
    { id: 'EXIT1', name: 'North Exit', position: [135, 10], size: [8, 8], type: 'exit' },
    { id: 'EXIT2', name: 'East Exit', position: [135, 50], size: [8, 8], type: 'exit' },
    { id: 'EXIT3', name: 'South Exit', position: [10, 125], size: [8, 8], type: 'exit' },
    { id: 'EXIT4', name: 'Southeast Exit', position: [110, 125], size: [8, 8], type: 'exit' },
    { id: 'EXIT5', name: 'West Exit', position: [60, 100], size: [8, 8], type: 'exit' },
  ]

  const connections = [
    ['R1', 'C1'], ['C1', 'R2'], ['R2', 'C4'], ['C4', 'R5'], ['R5', 'EXIT1'],
    ['R1', 'C2'], ['C2', 'R3'], ['R3', 'C5'], ['C5', 'R4'], ['R4', 'C6'], ['C6', 'R6'], ['R6', 'EXIT2'],
    ['R3', 'C7'], ['C7', 'EXIT3'],
    ['R6', 'C9'], ['C9', 'EXIT4'],
    ['R7', 'C10'], ['C10', 'EXIT5'],
    ['R2', 'C3'], ['C3', 'R4'],
    ['R5', 'C8'], ['C8', 'R6'],
    ['R3', 'R7'],
  ]

  return { rooms, connections }
}

// Rooms / connections are static – create them once at module scope
const { rooms, connections } = createSampleFloorPlan()
const exits = rooms.filter(r => r.type === 'exit').map(r => r.id)

// Initialize sensor data
const initializeSensors = (rooms) => {
  const sensors = {}
  rooms.forEach(room => {
    sensors[room.id] = {
      fireDetected: false,
      smokeLevel: Math.random() * 0.1,
      temperature: 20 + Math.random() * 5,
      oxygenLevel: 20.5 + Math.random() * 0.5,
      visibility: 95 + Math.random() * 5,
      structuralIntegrity: 100,
      carbonMonoxide: Math.random() * 5,
      occupancyDensity: room.type === 'exit' ? Math.random() * 0.2 + 0.1 : Math.random() * 0.4 + 0.3,
      exitAccessible: true,
      emergencyLighting: true,
    }
  })
  return sensors
}

// Simple pathfinding (A* simplified)
const findRoutes = (start, exits, connections, sensors, rooms) => {
  const routes = []
  
  const calculatePathRisk = (path, sensors, rooms) => {
    const dangerScores = path.map(roomId => calculateDangerScore(sensors[roomId] || {}))
    const totalDanger = dangerScores.reduce((a, b) => a + b, 0)
    const avgDanger = totalDanger / path.length
    const maxDanger = Math.max(...dangerScores)
    const maxDangerLocation = path[dangerScores.indexOf(maxDanger)]
    
    const hasFire = path.some(roomId => sensors[roomId]?.fireDetected)
    const hasOxygenHazard = path.some(roomId => {
      const room = rooms.find(r => r.id === roomId)
      return room?.hasOxygenCylinder && (sensors[roomId]?.temperature > 40 || sensors[roomId]?.fireDetected)
    })
    const passable = dangerScores.every(d => d < 70)
    
    return {
      avgDanger,
      maxDanger,
      maxDangerLocation,
      totalDanger,
      pathLength: path.length,
      hasFire,
      hasOxygenHazard,
      passable,
    }
  }
  
  exits.forEach(exit => {
    // Simple BFS to find path
    const queue = [[start]]
    const visited = new Set([start])
    let found = false
    
    while (queue.length > 0 && !found) {
      const path = queue.shift()
      const current = path[path.length - 1]
      
      if (current === exit) {
        // Calculate risk
        const risk = calculatePathRisk(path, sensors, rooms)
        routes.push({ exit, path, risk })
        found = true
      } else {
        connections.forEach(([a, b]) => {
          if (a === current && !visited.has(b)) {
            visited.add(b)
            queue.push([...path, b])
          } else if (b === current && !visited.has(a)) {
            visited.add(a)
            queue.push([...path, a])
          }
        })
      }
    }
  })
  
  return routes
}

function App() {
  const [sensors, setSensors] = useState(() => initializeSensors(rooms))
  const [timeStep, setTimeStep] = useState(0)
  const [simulationTime, setSimulationTime] = useState(0) // Total simulation time in seconds
  const [routes, setRoutes] = useState([])
  const [recommended, setRecommended] = useState(null)
  const [paused, setPaused] = useState(false)
  const [autoStep, setAutoStep] = useState(true)
  const [routeChanged, setRouteChanged] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [evacuationProgress, setEvacuationProgress] = useState(0) // 0 to 1, progress along route
  const [simulationHistory, setSimulationHistory] = useState([]) // Track simulation history
  const [settings, setSettings] = useState({
    updateInterval: 2000, // UI update interval (ms)
    simulationStepDuration: 30, // Seconds per simulation step
    totalSimulationTime: 120, // 2 minutes total simulation time
    simulationSpeed: 1.0, // Speed multiplier (1x = normal, 2x = fast, etc.)
    fireIntensity: 1.0,
    showLabels: true,
    showDangerScores: true,
    animationSpeed: 'normal',
  })
  
  // Auto-reset when simulation time reaches total
  useEffect(() => {
    if (simulationTime >= settings.totalSimulationTime && !paused) {
      // Optionally auto-reset or pause
      // handleReset()
    }
  }, [simulationTime, settings.totalSimulationTime, paused])
  const previousPathRef = useRef(null)
  
  const intervalRef = useRef(null)
  const animationRef = useRef(null)
  
  // Initialize fire with time tracking
  useEffect(() => {
    setSensors(prev => ({
      ...prev,
      R2: {
        ...prev.R2,
        fireDetected: true,
        smokeLevel: 0.75,
        temperature: 160,
        oxygenLevel: 16,
        visibility: 25,
        carbonMonoxide: 120,
        structuralIntegrity: 95,
        timeSinceFireStart: 0,
        flashoverRisk: 0.3,
        panicLevel: 0.4,
      }
    }))
    setSimulationTime(0)
    setSimulationHistory([])
  }, [])
  
  // Update simulation with realistic 2-minute timeframe dynamics
  const updateSimulation = useCallback(() => {
    const stepDuration = settings.simulationStepDuration
    const totalTime = settings.totalSimulationTime
    
    // Get current time and calculate new time
    setSimulationTime(prevTime => {
      const newTime = prevTime + stepDuration
      
      // Calculate time-based intensity for sensor updates
      const timeFactor = newTime / totalTime
      const intensityMultiplier = 1 + (timeFactor * 0.5)
      
      // Update sensors with time-based calculations (separate update)
      setSensors(prev => {
        const next = { ...prev }
      
      // Fire spreads and intensifies (more realistic over time)
      Object.keys(next).forEach(roomId => {
        const sensor = next[roomId]
        if (sensor.fireDetected) {
          const timeSinceFire = sensor.timeSinceFireStart || 0
          const fireAge = timeSinceFire + stepDuration
          
          // Temperature increases exponentially over time
          const tempIncrease = (5 + Math.random() * 10) * intensityMultiplier * (1 + fireAge / 60)
          const newTemp = Math.min(sensor.temperature + tempIncrease, 300)
          
          // Smoke increases faster as fire ages
          const smokeIncrease = (0.02 + Math.random() * 0.03) * intensityMultiplier * (1 + fireAge / 120)
          const newSmoke = Math.min(sensor.smokeLevel + smokeIncrease, 1)
          
          // Oxygen depletes faster over time
          const oxygenDecrease = (0.2 + Math.random() * 0.3) * intensityMultiplier
          const newOxygen = Math.max(sensor.oxygenLevel - oxygenDecrease, 8)
          
          // Visibility decreases faster
          const visibilityDecrease = (2 + Math.random() * 3) * intensityMultiplier
          const newVisibility = Math.max(sensor.visibility - visibilityDecrease, 0)
          
          // CO increases exponentially
          const coIncrease = (5 + Math.random() * 10) * intensityMultiplier * (1 + fireAge / 60)
          const newCO = Math.min(sensor.carbonMonoxide + coIncrease, 500)
          
          // Structural integrity decreases over time
          const integrityDecrease = (0.5 + Math.random() * 1.5) * intensityMultiplier
          const newIntegrity = Math.max((sensor.structuralIntegrity || 100) - integrityDecrease, 20)
          
          next[roomId] = {
            ...sensor,
            temperature: newTemp,
            smokeLevel: newSmoke,
            oxygenLevel: newOxygen,
            visibility: newVisibility,
            carbonMonoxide: newCO,
            structuralIntegrity: newIntegrity,
            timeSinceFireStart: fireAge,
            // Flashover risk increases with temperature and time
            flashoverRisk: Math.min((sensor.flashoverRisk || 0) + (newTemp > 200 ? 0.05 : 0.02), 1),
            // Panic increases over time
            panicLevel: Math.min((sensor.panicLevel || 0) + 0.02 * intensityMultiplier, 1),
          }
        }
      })
      
      // Fire spreads to neighbors (probability increases with time)
      Object.keys(next).forEach(roomId => {
        const sensor = next[roomId]
        if (sensor.fireDetected) {
          const baseSpreadChance = 0.12 * intensityMultiplier
          
          connections.forEach(([a, b]) => {
            const neighborId = a === roomId ? b : b === roomId ? a : null
            if (neighborId && !next[neighborId].fireDetected) {
              let spreadChance = baseSpreadChance
              
              // Higher chance if neighbor is already hot
              if (next[neighborId].temperature > 70) {
                spreadChance += 0.15
              }
              
              // Higher chance if neighbor has smoke
              if (next[neighborId].smokeLevel > 0.4) {
                spreadChance += 0.1
              }
              
              // Check for oxygen cylinder explosion risk
              const neighborRoom = rooms.find(r => r.id === neighborId)
              if (neighborRoom?.hasOxygenCylinder && next[neighborId].temperature > 50) {
                spreadChance += 0.3 // Much higher explosion risk
              }
              
              if (Math.random() < spreadChance) {
                const neighborSensor = next[neighborId]
                next[neighborId] = {
                  ...neighborSensor,
                  fireDetected: true,
                  smokeLevel: Math.max(neighborSensor.smokeLevel, 0.6 + Math.random() * 0.2),
                  temperature: Math.max(neighborSensor.temperature, 120 + Math.random() * 60),
                  oxygenLevel: Math.max(neighborSensor.oxygenLevel - 2, 14),
                  visibility: Math.min(neighborSensor.visibility, 20 + Math.random() * 10),
                  carbonMonoxide: Math.min(neighborSensor.carbonMonoxide + 50, 200),
                  timeSinceFireStart: 0, // New fire
                }
              }
            }
          })
        }
      })
      
      // Smoke and toxic gases spread to adjacent areas
      Object.keys(next).forEach(roomId => {
        const sensor = next[roomId]
        if (sensor.fireDetected || sensor.smokeLevel > 0.3) {
          connections.forEach(([a, b]) => {
            const neighborId = a === roomId ? b : b === roomId ? a : null
            if (neighborId && !next[neighborId].fireDetected) {
              const neighborSensor = next[neighborId]
              
              // Smoke drifts
              const smokeDrift = (0.03 + Math.random() * 0.05) * intensityMultiplier
              const newSmoke = Math.min(neighborSensor.smokeLevel + smokeDrift, 0.9)
              
              // Temperature rises from heat
              const heatRise = (2 + Math.random() * 6) * intensityMultiplier
              const newTemp = Math.min(neighborSensor.temperature + heatRise, 100)
              
              // Oxygen decreases
              const oxygenLoss = (0.1 + Math.random() * 0.2) * intensityMultiplier
              const newOxygen = Math.max(neighborSensor.oxygenLevel - oxygenLoss, 16)
              
              // Visibility decreases
              const visibilityLoss = (2 + Math.random() * 4) * intensityMultiplier
              const newVisibility = Math.max(neighborSensor.visibility - visibilityLoss, 10)
              
              // CO spreads (reduced concentration)
              const coSpread = sensor.carbonMonoxide * 0.08 * intensityMultiplier
              const newCO = Math.min(neighborSensor.carbonMonoxide + coSpread, 150)
              
              next[neighborId] = {
                ...neighborSensor,
                smokeLevel: newSmoke,
                temperature: newTemp,
                oxygenLevel: newOxygen,
                visibility: newVisibility,
                carbonMonoxide: newCO,
              }
            }
          })
        }
      })
      
      // Update occupancy - people evacuate over time
      Object.keys(next).forEach(roomId => {
        const sensor = next[roomId]
        const room = rooms.find(r => r.id === roomId)
        
        if (room && room.type !== 'exit' && sensor.occupancyDensity > 0) {
          // Evacuation rate increases with danger
          const danger = calculateDangerScore(sensor)
          const evacuationRate = (0.05 + (danger / 100) * 0.1) * intensityMultiplier
          const newOccupancy = Math.max(sensor.occupancyDensity - evacuationRate, 0)
          
          next[roomId] = {
            ...sensor,
            occupancyDensity: newOccupancy,
            evacuationProgress: Math.min((sensor.evacuationProgress || 0) + evacuationRate * 100, 100),
          }
        }
        
        // Exits get more crowded as people arrive
        if (room && room.type === 'exit' && sensor.occupancyDensity < 0.85) {
          const arrivalRate = (0.02 + Math.random() * 0.06) * intensityMultiplier
          const newOccupancy = Math.min(sensor.occupancyDensity + arrivalRate, 0.9)
          
          next[roomId] = {
            ...sensor,
            occupancyDensity: newOccupancy,
          }
        }
      })
      
        return next
      })
      
      // Track history every 10 seconds
      const historyCheckTime = Math.floor(newTime / 10) * 10
      const prevHistoryTime = Math.floor(prevTime / 10) * 10
      if (historyCheckTime > prevHistoryTime) {
        // Schedule history update after sensor state is committed
        setTimeout(() => {
          setSensors(currentSensors => {
            const fireCount = Object.values(currentSensors).filter(s => s.fireDetected).length
            const avgDanger = Object.values(currentSensors).reduce((sum, s) => sum + calculateDangerScore(s), 0) / Object.keys(currentSensors).length
            setSimulationHistory(prevHistory => [
              ...prevHistory.slice(-11),
              {
                time: historyCheckTime,
                fireCount,
                avgDanger,
              }
            ])
            return currentSensors
          })
        }, 10)
      }
      
      return newTime
    })
    
    setTimeStep(prev => prev + 1)
  }, [connections, rooms, settings.simulationStepDuration, settings.totalSimulationTime])
  
  // Calculate routes (derived from current sensors – does not mutate sensor state)
  useEffect(() => {
    const sensorsWithDanger = {}
    Object.keys(sensors).forEach(roomId => {
      const sensor = sensors[roomId]
      sensorsWithDanger[roomId] = {
        ...sensor,
        dangerScore: calculateDangerScore(sensor),
      }
    })

    const newRoutes = findRoutes('R1', exits, connections, sensorsWithDanger, rooms)
    setRoutes(newRoutes)
    
    if (newRoutes.length > 0) {
      // Recommend safest route
      const passable = newRoutes.filter(r => r.risk.passable)
      const candidates = passable.length > 0 ? passable : newRoutes
      const best = candidates.reduce((best, route) => {
        const bestScore = best.risk.avgDanger + (best.risk.hasFire ? 100 : 0)
        const routeScore = route.risk.avgDanger + (route.risk.hasFire ? 100 : 0)
        return routeScore < bestScore ? route : best
      })
      
      // Check if route changed
      if (best && best.path) {
        if (previousPathRef.current && JSON.stringify(previousPathRef.current) !== JSON.stringify(best.path)) {
          setRouteChanged(true)
          setEvacuationProgress(0) // Reset progress when route changes
          setTimeout(() => setRouteChanged(false), 2000) // Flash for 2 seconds
        }
        previousPathRef.current = best.path
      }
      
      setRecommended(best)
    }
  }, [sensors, exits, connections, rooms])
  
  // Auto-step interval with speed control
  useEffect(() => {
    // Clear any existing interval first
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    
    if (autoStep && !paused) {
      // Adjust interval based on speed (faster speed = shorter interval)
      const adjustedInterval = Math.max(100, settings.updateInterval / settings.simulationSpeed) // Minimum 100ms
      intervalRef.current = setInterval(() => {
        updateSimulation()
      }, adjustedInterval)
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [autoStep, paused, updateSimulation, settings.updateInterval, settings.simulationSpeed])
  
  // Evacuation animation - move along recommended route
  useEffect(() => {
    if (!recommended || !recommended.path || recommended.path.length === 0) {
      setEvacuationProgress(0)
      return
    }
    
    // Reset progress when route changes
    if (routeChanged) {
      setEvacuationProgress(0)
    }
    
    // Animation speed based on settings
    const speedMap = {
      slow: 0.005,
      normal: 0.01,
      fast: 0.02
    }
    const progressPerFrame = speedMap[settings.animationSpeed] || 0.01
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    
    let currentProgress = routeChanged ? 0 : evacuationProgress
    let lastTime = performance.now()
    
    const animate = (currentTime) => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      
      if (paused) {
        animationRef.current = requestAnimationFrame(animate)
        return
      }
      
      const deltaTime = currentTime - lastTime
      lastTime = currentTime
      
      // Smooth progress increment based on frame rate
      currentProgress += progressPerFrame * (deltaTime / 16) // Normalize to 60fps
      
      // Loop animation - reset when reaching end
      if (currentProgress >= 1) {
        currentProgress = 0
      }
      
      setEvacuationProgress(currentProgress)
      animationRef.current = requestAnimationFrame(animate)
    }
    
    animationRef.current = requestAnimationFrame(animate)
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [recommended, paused, routeChanged, settings.animationSpeed])
  
  const handleReset = () => {
    setTimeStep(0)
    setSimulationTime(0)
    setSensors(initializeSensors(rooms))
    setRoutes([])
    setRecommended(null)
    setRouteChanged(false)
    setEvacuationProgress(0)
    setSimulationHistory([])
    previousPathRef.current = null
    
    // Re-initialize fire
    setTimeout(() => {
      setSensors(prev => ({
        ...prev,
        R2: {
          ...prev.R2,
          fireDetected: true,
          smokeLevel: 0.75,
          temperature: 160,
          oxygenLevel: 16,
          visibility: 25,
          carbonMonoxide: 120,
          structuralIntegrity: 95,
          timeSinceFireStart: 0,
          flashoverRisk: 0.3,
          panicLevel: 0.4,
        }
      }))
    }, 100)
  }
  
  const handleManualStep = () => {
    if (paused || !autoStep) {
      updateSimulation()
    }
  }
  
  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === ' ') {
        setPaused(prev => !prev)
      } else if (e.key === 'n' || e.key === 'N') {
        updateSimulation()
      } else if (e.key === 'a' || e.key === 'A') {
        setAutoStep(prev => !prev)
      }
    }
    
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [updateSimulation])
  
  const fireCount = Object.values(sensors).filter(s => s.fireDetected).length
  
  return (
    <div className="app">
      <Header
        timeStep={timeStep}
        simulationTime={simulationTime}
        fireCount={fireCount}
        paused={paused}
        autoStep={autoStep}
        onPause={() => setPaused(!paused)}
        onStep={handleManualStep}
        onToggleAuto={() => setAutoStep(!autoStep)}
        onReset={handleReset}
        onSettings={() => setShowSettings(true)}
        simulationSpeed={settings.simulationSpeed}
        onSpeedChange={(speed) => setSettings(prev => ({ ...prev, simulationSpeed: speed }))}
        totalSimulationTime={settings.totalSimulationTime}
      />
      
      <div className="main-container">
        <div className="canvas-wrapper">
          <FloorPlanCanvas
            rooms={rooms}
            connections={connections}
            sensors={sensors}
            routes={routes}
            recommended={recommended}
            routeChanged={routeChanged}
            settings={settings}
            evacuationProgress={evacuationProgress}
          />
          {routeChanged && (
            <div className="route-change-alert">
              <div className="alert-text">⚠️ ROUTE CHANGED!</div>
            </div>
          )}
        </div>
        
        <div className="sidebar">
          <StatisticsPanel
            sensors={sensors}
            routes={routes}
            recommended={recommended}
            timeStep={timeStep}
          />
          
          <TimeChart
            simulationHistory={simulationHistory}
            simulationTime={simulationTime}
          />
          
          <Legend />
          
        <InfoPanel
          timeStep={timeStep}
          simulationTime={simulationTime}
          fireCount={fireCount}
          routes={routes}
          recommended={recommended}
          paused={paused}
          autoStep={autoStep}
          routeChanged={routeChanged}
          evacuationProgress={evacuationProgress}
          simulationHistory={simulationHistory}
        />
        </div>
      </div>
      
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSettingsChange={setSettings}
      />
    </div>
  )
}

export default App

