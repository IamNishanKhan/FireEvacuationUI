import React, { useRef, useEffect } from 'react'
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
  const MAP_WIDTH = 1000
  const MAP_HEIGHT = 900
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Calculate scale
    const allPositions = rooms.map(r => r.position)
    const maxX = Math.max(...allPositions.map(p => p[0]))
    const maxY = Math.max(...allPositions.map(p => p[1]))
    const scaleX = (MAP_WIDTH - 100) / (maxX + 20)
    const scaleY = (MAP_HEIGHT - 100) / (maxY + 20)
    const scale = Math.min(scaleX, scaleY, 8)
    const offsetX = 50
    const offsetY = 50
    
    // Draw connections with better styling
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
    
    // Draw non-recommended routes with modern styling
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
    
    // Draw recommended route with beautiful styling
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
    
    // Draw evacuation indicator moving along recommended route
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
    
    // Draw rooms with beautiful styling
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
      
      // Fire indicator with icon style
      if (sensor.fireDetected) {
        ctx.save()
        const fireX = screenX + w / 2 - 22
        const fireY = screenY + h / 2 - 22
        
        // Fire badge background
        ctx.fillStyle = '#E53935'
        drawRoundedRect(ctx, fireX, fireY, 44, 20, 10)
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
        ctx.fillText('FIRE', screenX + w / 2, fireY + 10)
        ctx.restore()
      }
      
      // Oxygen cylinder warning with modern badge
      if (room.hasOxygenCylinder && room.type !== 'exit') {
        ctx.save()
        const o2X = screenX + w / 2 + w / 3 - 18
        const o2Y = screenY + h / 2 - 20
        
        ctx.fillStyle = '#FFD600'
        drawRoundedRect(ctx, o2X, o2Y, 36, 18, 9)
        ctx.fill()
        
        ctx.strokeStyle = '#F57F17'
        ctx.lineWidth = 1.5
        ctx.stroke()
        
        ctx.fillStyle = '#1a1a1a'
        ctx.font = 'bold 10px Arial, sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('O2', screenX + w / 2 + w / 3, o2Y + 9)
        ctx.restore()
      }
      
      // CO warning with modern badge
      if (sensor.carbonMonoxide > 50 && room.type !== 'exit') {
        ctx.save()
        const coX = screenX + w / 2 - w / 3 - 18
        const coY = screenY + h / 2 - 20
        
        ctx.fillStyle = '#C62828'
        drawRoundedRect(ctx, coX, coY, 36, 18, 9)
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
        ctx.fillText('CO!', screenX + w / 2 - w / 3, coY + 9)
        ctx.restore()
      }
      
      // Crowd density indicator
      if (sensor.occupancyDensity > 0.7 && room.type !== 'exit') {
        ctx.save()
        const crowdX = screenX + w / 2 - 28
        const crowdY = screenY + h / 2 + 22
        
        ctx.fillStyle = '#FF6D00'
        drawRoundedRect(ctx, crowdX, crowdY, 56, 16, 8)
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
        ctx.fillText('CROWD', screenX + w / 2, crowdY + 8)
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
    
    // Draw route labels with modern badges
    routes.forEach((route, idx) => {
      const endRoom = rooms.find(r => r.id === route.path[route.path.length - 1])
      if (endRoom) {
        const x = endRoom.position[0] * scale + offsetX
        const y = endRoom.position[1] * scale + offsetY - 30
        
        const isRec = recommended && recommended.path === route.path
        const labelColor = isRec ? '#00C853' : routeColors[idx % routeColors.length]
        const label = `Route ${idx + 1}: ${route.exit}${isRec ? ' ⭐ SAFEST' : ''}`
        
        ctx.save()
        
        // Badge background with shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)'
        ctx.shadowBlur = 4
        ctx.shadowOffsetY = 2
        ctx.fillStyle = '#FFFFFF'
        drawRoundedRect(ctx, x - 70, y - 12, 140, 24, 12)
        ctx.fill()
        
        // Badge border
        ctx.shadowBlur = 0
        ctx.strokeStyle = labelColor
        ctx.lineWidth = 2.5
        ctx.stroke()
        
        // Badge text
        ctx.fillStyle = labelColor
        ctx.font = isRec ? 'bold 12px Arial, sans-serif' : '600 11px Arial, sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.shadowColor = 'rgba(0, 0, 0, 0.1)'
        ctx.shadowBlur = 1
        ctx.fillText(label, x, y + 1)
        
        ctx.restore()
      }
    })
  }, [rooms, connections, sensors, routes, recommended, routeChanged, settings, evacuationProgress])
  
  return (
    <div className="canvas-container">
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

