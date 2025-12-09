import React, { useRef, useEffect, useState } from 'react'
import { calculateDangerScore } from '../utils/simulation'
import './FloorPlanCanvas.css'

const COLORS = {
  WHITE: '#FFFFFF',
  BLACK: '#1a1a1a',
  RED: '#FF4444',
  GREEN: '#00C853',
  BLUE: '#448AFF',
  YELLOW: '#FFD600',
  ORANGE: '#FF6D00',
  LIGHT_BLUE: '#E3F2FD',
  LIGHT_YELLOW: '#FFF9C4',
  DARK_RED: '#C62828',
  GRAY: '#9E9E9E',
  LIGHT_GRAY: '#F5F5F5',
  DARK_GREEN: '#2E7D32',
  LIME: '#66BB6A',
  PURPLE: '#7B1FA2',
  BROWN: '#8D6E63',
  // Modern color palette
  SAFE: '#E8F5E9',
  MODERATE: '#FFF9C4',
  HIGH: '#FFE0B2',
  CRITICAL: '#FFCDD2',
  EXIT_BG: '#C8E6C9',
  CORRIDOR_BG: '#F5F5F5',
  ROOM_BG: '#FAFAFA',
}

const getDangerColor = (danger) => {
  if (danger < 20) return COLORS.SAFE
  if (danger < 40) return COLORS.MODERATE
  if (danger < 60) return COLORS.HIGH
  return COLORS.CRITICAL
}

const getDangerBorderColor = (danger) => {
  if (danger < 20) return '#81C784'
  if (danger < 40) return '#FFD54F'
  if (danger < 60) return '#FF9800'
  return '#E53935'
}

const drawRoundedRect = (ctx, x, y, w, h, radius) => {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + w - radius, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius)
  ctx.lineTo(x + w, y + h - radius)
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h)
  ctx.lineTo(x + radius, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}

const FloorPlanCanvas = ({ rooms, connections, sensors, routes, recommended, routeChanged, settings, evacuationProgress = 0 }) => {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const MAP_WIDTH = 1000
  const MAP_HEIGHT = 900
  
  // Pan and zoom state
  const [zoom, setZoom] = useState(1.0)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const panStartRef = useRef({ mouseX: 0, mouseY: 0, panX: 0, panY: 0 })
  
  // Touch gesture state
  const touchStateRef = useRef({
    touches: [],
    initialDistance: 0,
    initialZoom: 1.0,
    initialPan: { x: 0, y: 0 },
    center: { x: 0, y: 0 }
  })
  
  // Pan and zoom event handlers (mouse + touch)
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    
    const handleWheel = (e) => {
      e.preventDefault()
      const delta = e.deltaY > 0 ? 0.9 : 1.1
      const newZoom = Math.max(0.5, Math.min(3.0, zoom * delta))
      
      // Zoom towards mouse position
      const rect = container.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top
      
      // Calculate zoom point in canvas coordinates
      const zoomPointX = (mouseX - pan.x) / zoom
      const zoomPointY = (mouseY - pan.y) / zoom
      
      // Adjust pan to keep zoom point under mouse
      const newPanX = mouseX - zoomPointX * newZoom
      const newPanY = mouseY - zoomPointY * newZoom
      
      setZoom(newZoom)
      setPan({ x: newPanX, y: newPanY })
    }
    
    const handleMouseDown = (e) => {
      if (e.button === 0) { // Left mouse button
        setIsPanning(true)
        const rect = container.getBoundingClientRect()
        panStartRef.current = {
          mouseX: e.clientX - rect.left,
          mouseY: e.clientY - rect.top,
          panX: pan.x,
          panY: pan.y
        }
        container.style.cursor = 'grabbing'
      }
    }
    
    const handleMouseMove = (e) => {
      if (isPanning) {
        const rect = container.getBoundingClientRect()
        const mouseX = e.clientX - rect.left
        const mouseY = e.clientY - rect.top
        const deltaX = mouseX - panStartRef.current.mouseX
        const deltaY = mouseY - panStartRef.current.mouseY
        setPan({
          x: panStartRef.current.panX + deltaX,
          y: panStartRef.current.panY + deltaY
        })
      }
    }
    
    const handleMouseUp = () => {
      setIsPanning(false)
      container.style.cursor = 'grab'
    }
    
    const handleMouseLeave = () => {
      setIsPanning(false)
      container.style.cursor = 'grab'
    }
    
    // Touch event handlers for mobile
    const getDistance = (touch1, touch2) => {
      const dx = touch2.clientX - touch1.clientX
      const dy = touch2.clientY - touch1.clientY
      return Math.sqrt(dx * dx + dy * dy)
    }
    
    const getCenter = (touch1, touch2) => {
      const rect = container.getBoundingClientRect()
      return {
        x: ((touch1.clientX + touch2.clientX) / 2) - rect.left,
        y: ((touch1.clientY + touch2.clientY) / 2) - rect.top
      }
    }
    
    const handleTouchStart = (e) => {
      e.preventDefault()
      const touches = Array.from(e.touches)
      touchStateRef.current.touches = touches
      
      if (touches.length === 1) {
        // Single touch - pan
        const rect = container.getBoundingClientRect()
        const touch = touches[0]
        panStartRef.current = {
          mouseX: touch.clientX - rect.left,
          mouseY: touch.clientY - rect.top,
          panX: pan.x,
          panY: pan.y
        }
        setIsPanning(true)
      } else if (touches.length === 2) {
        // Two touches - pinch to zoom
        setIsPanning(false)
        const distance = getDistance(touches[0], touches[1])
        const center = getCenter(touches[0], touches[1])
        touchStateRef.current.initialDistance = distance
        touchStateRef.current.initialZoom = zoom
        touchStateRef.current.initialPan = { ...pan }
        touchStateRef.current.center = center
      }
    }
    
    const handleTouchMove = (e) => {
      e.preventDefault()
      const touches = Array.from(e.touches)
      touchStateRef.current.touches = touches
      
      if (touches.length === 1 && isPanning) {
        // Single touch pan
        const rect = container.getBoundingClientRect()
        const touch = touches[0]
        const mouseX = touch.clientX - rect.left
        const mouseY = touch.clientY - rect.top
        const deltaX = mouseX - panStartRef.current.mouseX
        const deltaY = mouseY - panStartRef.current.mouseY
        setPan({
          x: panStartRef.current.panX + deltaX,
          y: panStartRef.current.panY + deltaY
        })
      } else if (touches.length === 2) {
        // Pinch to zoom
        const distance = getDistance(touches[0], touches[1])
        const scale = distance / touchStateRef.current.initialDistance
        const newZoom = Math.max(0.5, Math.min(3.0, touchStateRef.current.initialZoom * scale))
        
        // Calculate zoom point in canvas coordinates
        const center = touchStateRef.current.center
        const zoomPointX = (center.x - touchStateRef.current.initialPan.x) / touchStateRef.current.initialZoom
        const zoomPointY = (center.y - touchStateRef.current.initialPan.y) / touchStateRef.current.initialZoom
        
        // Adjust pan to keep zoom point under center
        const newPanX = center.x - zoomPointX * newZoom
        const newPanY = center.y - zoomPointY * newZoom
        
        setZoom(newZoom)
        setPan({ x: newPanX, y: newPanY })
      }
    }
    
    const handleTouchEnd = (e) => {
      e.preventDefault()
      const touches = Array.from(e.touches)
      touchStateRef.current.touches = touches
      
      if (touches.length === 0) {
        setIsPanning(false)
      } else if (touches.length === 1) {
        // Switch from zoom to pan
        const rect = container.getBoundingClientRect()
        const touch = touches[0]
        panStartRef.current = {
          mouseX: touch.clientX - rect.left,
          mouseY: touch.clientY - rect.top,
          panX: pan.x,
          panY: pan.y
        }
        setIsPanning(true)
      }
    }
    
    // Mouse events
    container.addEventListener('wheel', handleWheel, { passive: false })
    container.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    container.addEventListener('mouseleave', handleMouseLeave)
    
    // Touch events
    container.addEventListener('touchstart', handleTouchStart, { passive: false })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', handleTouchEnd, { passive: false })
    container.addEventListener('touchcancel', handleTouchEnd, { passive: false })
    
    return () => {
      container.removeEventListener('wheel', handleWheel)
      container.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      container.removeEventListener('mouseleave', handleMouseLeave)
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
      container.removeEventListener('touchcancel', handleTouchEnd)
    }
  }, [zoom, pan, isPanning])
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')

    // Improve sharpness on high-DPI screens by matching devicePixelRatio
    const dpr = window.devicePixelRatio || 1
    const displayWidth = MAP_WIDTH
    const displayHeight = MAP_HEIGHT

    if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
      canvas.width = displayWidth * dpr
      canvas.height = displayHeight * dpr
      canvas.style.width = `${displayWidth}px`
      canvas.style.height = `${displayHeight}px`
    }

    // Reset transform then scale so all drawing uses logical coordinates
    // Apply DPR, then zoom and pan transforms
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, displayWidth, displayHeight)
    
    // Apply zoom and pan transforms
    ctx.save()
    ctx.translate(pan.x, pan.y)
    ctx.scale(zoom, zoom)
    
    // Calculate scale so the floorplan fills the canvas with minimal padding
    const allPositions = rooms.map(r => r.position)
    const maxX = Math.max(...allPositions.map(p => p[0]))
    const maxY = Math.max(...allPositions.map(p => p[1]))
    const paddingTopBottom = 10  // small visual padding only on top/bottom
    const paddingLeftRight = 0   // no padding on left/right as requested
    const scaleX = (MAP_WIDTH - paddingLeftRight * 2) / (maxX + 10)
    const scaleY = (MAP_HEIGHT - paddingTopBottom * 2) / (maxY + 10)
    const scale = Math.min(scaleX, scaleY, 8)
    const offsetX = paddingLeftRight
    const offsetY = paddingTopBottom
    
    // Draw connections with better styling (base layer)
    connections.forEach(([id1, id2]) => {
      const room1 = rooms.find(r => r.id === id1)
      const room2 = rooms.find(r => r.id === id2)
      if (room1 && room2) {
        const x1 = room1.position[0] * scale + offsetX
        const y1 = room1.position[1] * scale + offsetY
        const x2 = room2.position[0] * scale + offsetX
        const y2 = room2.position[1] * scale + offsetY
        
        // Check if either room has fire for connection color
        const sensor1 = sensors[room1.id] || {}
        const sensor2 = sensors[room2.id] || {}
        const hasFire = sensor1.fireDetected || sensor2.fireDetected
        
        ctx.save()
        ctx.strokeStyle = hasFire ? 'rgba(229, 57, 53, 0.3)' : '#E0E0E0'
        ctx.lineWidth = hasFire ? 2 : 1.5
        ctx.setLineDash(hasFire ? [5, 5] : [])
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()
        ctx.restore()
      }
    })
    
    // Draw rooms and hazard badges (second layer)
    rooms.forEach(room => {
      const sensor = sensors[room.id] || {}
      const danger = sensor.dangerScore !== undefined ? sensor.dangerScore : calculateDangerScore(sensor)
      const x = room.position[0] * scale + offsetX
      const y = room.position[1] * scale + offsetY
      let w = room.size[0] * scale
      let h = room.size[1] * scale
      
      // Make exits bigger and more prominent
      if (room.type === 'exit') {
        w *= 1.6
        h *= 1.6
      }
      
      const screenX = x - (room.type === 'exit' ? w / 2 - room.size[0] * scale / 2 : 0)
      const screenY = y - (room.type === 'exit' ? h / 2 - room.size[1] * scale / 2 : 0)
      const radius = room.type === 'exit' ? 8 : room.type === 'corridor' ? 4 : 6
      
      // Determine colors based on room type and danger
      let fillColor, borderColor, shadowColor
      
      if (room.type === 'exit') {
        // Beautiful exit styling with gradient effect
        fillColor = '#4CAF50'
        borderColor = '#2E7D32'
        shadowColor = 'rgba(76, 175, 80, 0.4)'
      } else if (room.type === 'corridor') {
        fillColor = danger < 20 ? '#F5F5F5' : getDangerColor(danger)
        borderColor = danger < 20 ? '#E0E0E0' : getDangerBorderColor(danger)
        shadowColor = 'rgba(0, 0, 0, 0.1)'
      } else {
        fillColor = getDangerColor(danger)
        borderColor = getDangerBorderColor(danger)
        shadowColor = danger > 40 ? 'rgba(255, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.1)'
      }
      
      // Draw shadow for depth
      ctx.save()
      ctx.shadowColor = shadowColor
      ctx.shadowBlur = room.type === 'exit' ? 12 : 6
      ctx.shadowOffsetX = 2
      ctx.shadowOffsetY = 2
      
      // Draw room with rounded corners
      drawRoundedRect(ctx, screenX, screenY, w, h, radius)
      ctx.fillStyle = fillColor
      ctx.fill()
      
      // Draw border with gradient effect
      ctx.strokeStyle = borderColor
      ctx.lineWidth = room.type === 'exit' ? 3 : room.type === 'corridor' ? 1.5 : 2.5
      ctx.stroke()
      
      ctx.restore()
      
      // Add subtle inner highlight for exits
      if (room.type === 'exit') {
        ctx.save()
        drawRoundedRect(ctx, screenX + 2, screenY + 2, w - 4, h - 4, radius - 1)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
        ctx.lineWidth = 1
        ctx.stroke()
        ctx.restore()
      }
      
      // Beautiful exit glow effect
      if (room.type === 'exit') {
        ctx.save()
        ctx.strokeStyle = '#66BB6A'
        ctx.lineWidth = 3
        ctx.shadowColor = 'rgba(76, 175, 80, 0.6)'
        ctx.shadowBlur = 8
        drawRoundedRect(ctx, screenX - 4, screenY - 4, w + 8, h + 8, radius + 2)
        ctx.stroke()
        ctx.restore()
      }
      
      // Labels with better typography
      if (settings?.showLabels !== false) {
        const label = room.type !== 'corridor' ? room.name : room.id
        
        ctx.save()
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        
        if (room.type === 'exit') {
          // Exit labels - white text with shadow
          ctx.font = 'bold 13px Arial, sans-serif'
          ctx.shadowColor = 'rgba(0, 0, 0, 0.7)'
          ctx.shadowBlur = 4
          ctx.shadowOffsetX = 1
          ctx.shadowOffsetY = 1
          ctx.fillStyle = '#FFFFFF'
          ctx.fillText(label, screenX + w / 2, screenY + h / 2)
        } else {
          // Room/Corridor labels - adaptive color
          const textColor = danger > 50 ? '#FFFFFF' : '#1a1a1a'
          ctx.font = room.type === 'corridor' ? '11px Arial, sans-serif' : 'bold 12px Arial, sans-serif'
          
          // Draw text shadow for contrast
          if (danger > 50) {
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
            ctx.shadowBlur = 3
            ctx.shadowOffsetX = 1
            ctx.shadowOffsetY = 1
          } else {
            ctx.shadowColor = 'rgba(255, 255, 255, 0.9)'
            ctx.shadowBlur = 2
            ctx.shadowOffsetX = 0.5
            ctx.shadowOffsetY = 0.5
          }
          
          ctx.fillStyle = textColor
          ctx.fillText(label, screenX + w / 2, screenY + h / 2)
        }
        
        ctx.restore()
      }
      
      // Danger score with badge style
      if (settings?.showDangerScores !== false && danger > 10 && room.type !== 'exit') {
        const dangerText = Math.round(danger).toString()
        ctx.save()
        
        // Badge background
        const textMetrics = ctx.measureText(dangerText)
        const badgeWidth = textMetrics.width + 8
        const badgeHeight = 16
        const badgeX = screenX + w / 2 - badgeWidth / 2
        const badgeY = screenY + h / 2 + 18
        
        // Rounded badge
        ctx.fillStyle = danger > 60 ? '#E53935' : danger > 40 ? '#FF6D00' : '#FFA726'
        drawRoundedRect(ctx, badgeX, badgeY, badgeWidth, badgeHeight, 8)
        ctx.fill()
        
        // Badge border
        ctx.strokeStyle = danger > 60 ? '#C62828' : danger > 40 ? '#E65100' : '#F57C00'
        ctx.lineWidth = 1
        ctx.stroke()
        
        // Badge text
        ctx.fillStyle = '#FFFFFF'
        ctx.font = 'bold 10px Arial, sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
        ctx.shadowBlur = 1
        ctx.fillText(dangerText, screenX + w / 2, badgeY + badgeHeight / 2)
        ctx.restore()
      }
      
      // Fire indicator with icon style (skip exits to avoid clutter on exit tiles)
      if (sensor.fireDetected && room.type !== 'exit') {
        ctx.save()
        // Position near top-center, slightly outside the main room body
        const fireWidth = 44
        const fireHeight = 20
        const fireX = screenX + w / 2 - fireWidth / 2
        const fireY = screenY - fireHeight - 4
        
        // Fire badge background
        ctx.fillStyle = '#E53935'
        drawRoundedRect(ctx, fireX, fireY, fireWidth, fireHeight, 10)
        ctx.fill()
        
        // Fire badge border
        ctx.strokeStyle = '#C62828'
        ctx.lineWidth = 1.5
        ctx.stroke()
        
        // Fire icon and text
        ctx.fillStyle = '#FFFFFF'
        ctx.font = 'bold 11px Arial, sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
        ctx.shadowBlur = 2
        ctx.fillText('FIRE', screenX + w / 2, fireY + fireHeight / 2)
        ctx.restore()
      }
      
      // Oxygen cylinder warning with modern badge
      if (room.hasOxygenCylinder && room.type !== 'exit') {
        ctx.save()
        const badgeWidth = 36
        const badgeHeight = 18
        // Top-right outside the room
        const o2X = screenX + w - badgeWidth + 4
        const o2Y = screenY - badgeHeight - 2
        
        ctx.fillStyle = '#FFD600'
        drawRoundedRect(ctx, o2X, o2Y, badgeWidth, badgeHeight, 9)
        ctx.fill()
        
        ctx.strokeStyle = '#F57F17'
        ctx.lineWidth = 1.5
        ctx.stroke()
        
        ctx.fillStyle = '#1a1a1a'
        ctx.font = 'bold 10px Arial, sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('O2', o2X + badgeWidth / 2, o2Y + badgeHeight / 2)
        ctx.restore()
      }
      
      // CO warning with modern badge
      if (sensor.carbonMonoxide > 50 && room.type !== 'exit') {
        ctx.save()
        const badgeWidth = 36
        const badgeHeight = 18
        // Left side, vertically centered outside the room to avoid FIRE badge
        const coX = screenX - badgeWidth - 6
        const coY = screenY + h / 2 - badgeHeight / 2
        
        ctx.fillStyle = '#C62828'
        drawRoundedRect(ctx, coX, coY, badgeWidth, badgeHeight, 9)
        ctx.fill()
        
        ctx.strokeStyle = '#B71C1C'
        ctx.lineWidth = 1.5
        ctx.stroke()
        
        ctx.fillStyle = '#FFFFFF'
        ctx.font = 'bold 10px Arial, sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
        ctx.shadowBlur = 1
        ctx.fillText('CO!', coX + badgeWidth / 2, coY + badgeHeight / 2)
        ctx.restore()
      }
      
      // Crowd density indicator
      if (sensor.occupancyDensity > 0.7 && room.type !== 'exit') {
        ctx.save()
        const badgeWidth = 56
        const badgeHeight = 16
        // Bottom-center outside the room
        const crowdX = screenX + w / 2 - badgeWidth / 2
        const crowdY = screenY + h + 4
        
        ctx.fillStyle = '#FF6D00'
        drawRoundedRect(ctx, crowdX, crowdY, badgeWidth, badgeHeight, 8)
        ctx.fill()
        
        ctx.strokeStyle = '#E65100'
        ctx.lineWidth = 1.5
        ctx.stroke()
        
        ctx.fillStyle = '#FFFFFF'
        ctx.font = 'bold 10px Arial, sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
        ctx.shadowBlur = 1
        ctx.fillText('CROWD', crowdX + badgeWidth / 2, crowdY + badgeHeight / 2)
        ctx.restore()
      }
      
      // Blocked exit with overlay
      if (!sensor.exitAccessible && room.type === 'exit') {
        ctx.save()
        // Red overlay
        ctx.fillStyle = 'rgba(229, 57, 53, 0.9)'
        drawRoundedRect(ctx, screenX, screenY, w, h, radius)
        ctx.fill()
        
        // Diagonal stripe pattern
        ctx.strokeStyle = 'rgba(198, 40, 40, 0.8)'
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.moveTo(screenX, screenY)
        ctx.lineTo(screenX + w, screenY + h)
        ctx.moveTo(screenX + w, screenY)
        ctx.lineTo(screenX, screenY + h)
        ctx.stroke()
        
        // Blocked text
        ctx.fillStyle = '#FFFFFF'
        ctx.font = 'bold 14px Arial, sans-serif'
        ctx.shadowColor = 'rgba(0, 0, 0, 0.7)'
        ctx.shadowBlur = 4
        ctx.shadowOffsetX = 1
        ctx.shadowOffsetY = 1
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('BLOCKED', screenX + w / 2, screenY + h / 2)
        ctx.restore()
      }
    })
    
    // After rooms are drawn, render routes and indicators on top for maximum clarity
    
    // Draw non-recommended routes with modern styling (third layer)
    const routeColors = ['#448AFF', '#7B1FA2', '#8D6E63', '#FF6D00', '#64B5F6']
    routes.forEach((route, idx) => {
      const isRec = recommended && recommended.path === route.path
      if (!isRec && route.path.length > 1) {
        ctx.save()
        const routeColor = routeColors[idx % routeColors.length]
        ctx.strokeStyle = routeColor
        ctx.lineWidth = 3
        ctx.shadowColor = routeColor + '40'
        ctx.shadowBlur = 4
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.beginPath()
        route.path.forEach((roomId, i) => {
          const room = rooms.find(r => r.id === roomId)
          if (room) {
            const x = room.position[0] * scale + offsetX
            const y = room.position[1] * scale + offsetY
            if (i === 0) ctx.moveTo(x, y)
            else ctx.lineTo(x, y)
          }
        })
        ctx.stroke()
        ctx.restore()
      }
    })
    
    // Draw recommended route with beautiful styling (fourth layer)
    if (recommended && recommended.path.length > 1) {
      ctx.save()
      
      // Flash effect if route changed
      if (routeChanged) {
        ctx.strokeStyle = '#FFD600'
        ctx.lineWidth = 8
        ctx.shadowColor = 'rgba(255, 214, 0, 0.6)'
        ctx.shadowBlur = 8
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.beginPath()
        recommended.path.forEach((roomId, i) => {
          const room = rooms.find(r => r.id === roomId)
          if (room) {
            const x = room.position[0] * scale + offsetX
            const y = room.position[1] * scale + offsetY
            if (i === 0) ctx.moveTo(x, y)
            else ctx.lineTo(x, y)
          }
        })
        ctx.stroke()
      }
      
      // Main recommended route line with gradient effect
      ctx.strokeStyle = '#00C853'
      ctx.lineWidth = 6
      ctx.shadowColor = 'rgba(0, 200, 83, 0.5)'
      ctx.shadowBlur = 6
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.beginPath()
      recommended.path.forEach((roomId, i) => {
        const room = rooms.find(r => r.id === roomId)
        if (room) {
          const x = room.position[0] * scale + offsetX
          const y = room.position[1] * scale + offsetY
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
      })
      ctx.stroke()
      
      // Draw beautiful arrow markers
      recommended.path.forEach((roomId, i) => {
        if (i < recommended.path.length - 1) {
          const room1 = rooms.find(r => r.id === roomId)
          const room2 = rooms.find(r => r.id === recommended.path[i + 1])
          if (room1 && room2) {
            const x1 = room1.position[0] * scale + offsetX
            const y1 = room1.position[1] * scale + offsetY
            const x2 = room2.position[0] * scale + offsetX
            const y2 = room2.position[1] * scale + offsetY
            const midX = (x1 + x2) / 2
            const midY = (y1 + y2) / 2
            
            // Outer glow circle
            ctx.fillStyle = '#00C853'
            ctx.shadowColor = 'rgba(0, 200, 83, 0.6)'
            ctx.shadowBlur = 8
            ctx.beginPath()
            ctx.arc(midX, midY, 14, 0, Math.PI * 2)
            ctx.fill()
            
            // Inner white circle
            ctx.shadowBlur = 0
            ctx.fillStyle = '#FFFFFF'
            ctx.beginPath()
            ctx.arc(midX, midY, 8, 0, Math.PI * 2)
            ctx.fill()
            
            // Arrow icon
            ctx.fillStyle = '#00C853'
            ctx.font = 'bold 12px Arial, sans-serif'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText('→', midX, midY)
          }
        }
      })
      
      ctx.restore()
    }
    
    // Draw evacuation indicator moving along recommended route (top-most for the path)
    if (recommended && recommended.path && recommended.path.length > 1 && evacuationProgress > 0) {
      ctx.save()
      
      const totalSegments = recommended.path.length - 1
      const currentSegment = Math.floor(evacuationProgress * totalSegments)
      const segmentProgress = (evacuationProgress * totalSegments) % 1
      
      if (currentSegment < totalSegments) {
        const room1Id = recommended.path[currentSegment]
        const room2Id = recommended.path[currentSegment + 1]
        const room1 = rooms.find(r => r.id === room1Id)
        const room2 = rooms.find(r => r.id === room2Id)
        
        if (room1 && room2) {
          const x1 = room1.position[0] * scale + offsetX
          const y1 = room1.position[1] * scale + offsetY
          const x2 = room2.position[0] * scale + offsetX
          const y2 = room2.position[1] * scale + offsetY
          
          // Interpolate position along the segment
          const currentX = x1 + (x2 - x1) * segmentProgress
          const currentY = y1 + (y2 - y1) * segmentProgress
          
          // Draw animated evacuation indicator (person/icon)
          // Outer glow
          ctx.shadowColor = 'rgba(0, 200, 83, 0.8)'
          ctx.shadowBlur = 12
          ctx.fillStyle = '#00C853'
          ctx.beginPath()
          ctx.arc(currentX, currentY, 16, 0, Math.PI * 2)
          ctx.fill()
          
          // Inner circle
          ctx.shadowBlur = 0
          ctx.fillStyle = '#FFFFFF'
          ctx.beginPath()
          ctx.arc(currentX, currentY, 12, 0, Math.PI * 2)
          ctx.fill()
          
          // Person icon (simple stick figure)
          ctx.strokeStyle = '#00C853'
          ctx.lineWidth = 2.5
          ctx.lineCap = 'round'
          
          // Head
          ctx.beginPath()
          ctx.arc(currentX, currentY - 4, 3, 0, Math.PI * 2)
          ctx.stroke()
          
          // Body
          ctx.beginPath()
          ctx.moveTo(currentX, currentY - 1)
          ctx.lineTo(currentX, currentY + 5)
          ctx.stroke()
          
          // Arms
          ctx.beginPath()
          ctx.moveTo(currentX - 3, currentY + 1)
          ctx.lineTo(currentX + 3, currentY + 1)
          ctx.stroke()
          
          // Legs
          ctx.beginPath()
          ctx.moveTo(currentX, currentY + 5)
          ctx.lineTo(currentX - 3, currentY + 8)
          ctx.moveTo(currentX, currentY + 5)
          ctx.lineTo(currentX + 3, currentY + 8)
          ctx.stroke()
          
          // Progress indicator trail
          if (segmentProgress > 0.1) {
            ctx.strokeStyle = 'rgba(0, 200, 83, 0.3)'
            ctx.lineWidth = 4
            ctx.lineCap = 'round'
            ctx.beginPath()
            ctx.moveTo(x1, y1)
            ctx.lineTo(currentX, currentY)
            ctx.stroke()
          }
        }
      }
      
      ctx.restore()
    }
    
    // Finally, draw route labels with modern badges
    routes.forEach((route, idx) => {
      const endRoom = rooms.find(r => r.id === route.path[route.path.length - 1])
      if (endRoom) {
        const x = endRoom.position[0] * scale + offsetX
        // Lift labels higher above the exit to avoid overlapping important tiles
        const y = endRoom.position[1] * scale + offsetY - 50
        
        const isRec = recommended && recommended.path === route.path
        const labelColor = isRec ? '#00C853' : routeColors[idx % routeColors.length]
        const label = `Route ${idx + 1}: ${route.exit}${isRec ? ' ⭐ SAFEST' : ''}`
        
        ctx.save()
        
        // Measure text to size badge dynamically
        ctx.font = isRec ? 'bold 12px Arial, sans-serif' : '600 11px Arial, sans-serif'
        const textMetrics = ctx.measureText(label)
        const paddingX = 12
        const badgeWidth = textMetrics.width + paddingX * 2
        const badgeHeight = 24
        const badgeX = x - badgeWidth / 2
        const badgeY = y - badgeHeight / 2

        // Badge background with shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)'
        ctx.shadowBlur = 4
        ctx.shadowOffsetY = 2
        ctx.fillStyle = '#FFFFFF'
        drawRoundedRect(ctx, badgeX, badgeY, badgeWidth, badgeHeight, 12)
        ctx.fill()
        
        // Badge border
        ctx.shadowBlur = 0
        ctx.strokeStyle = labelColor
        ctx.lineWidth = 2.5
        ctx.stroke()
        
        // Badge text
        ctx.fillStyle = labelColor
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.shadowColor = 'rgba(0, 0, 0, 0.1)'
        ctx.shadowBlur = 1
        ctx.fillText(label, x, y + 1)
        
        ctx.restore()
      }
    })
    
    // Restore transform after all drawing
    ctx.restore()
  }, [rooms, connections, sensors, routes, recommended, routeChanged, settings, evacuationProgress, zoom, pan])
  
  return (
    <div 
      ref={containerRef}
      className="canvas-container"
      style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
    >
      <canvas
        ref={canvasRef}
        width={MAP_WIDTH}
        height={MAP_HEIGHT}
        style={{ 
          display: 'block',
          background: '#fafafa'
        }}
      />
    </div>
  )
}

export default FloorPlanCanvas

