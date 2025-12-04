// Shared simulation utilities

// Calculate danger score for a single sensor snapshot
export const calculateDangerScore = (sensor = {}) => {
  let score = 0

  if (sensor.fireDetected) score += 40

  const smokeLevel = sensor.smokeLevel ?? 0
  score += smokeLevel * 20

  const temperature = sensor.temperature ?? 20
  if (temperature > 60) {
    score += Math.min((temperature - 60) / 2, 20)
  }

  const oxygenLevel = sensor.oxygenLevel ?? 21
  if (oxygenLevel < 19.5) {
    score += (19.5 - oxygenLevel) * 5
  }

  const visibility = sensor.visibility ?? 100
  score += (100 - visibility) * 0.1

  const carbonMonoxide = sensor.carbonMonoxide ?? 0
  if (carbonMonoxide > 50) {
    score += Math.min(carbonMonoxide / 5, 30)
  }

  const occupancyDensity = sensor.occupancyDensity ?? 0
  if (occupancyDensity > 0.8) {
    score += (occupancyDensity - 0.8) * 75
  }

  if (sensor.exitAccessible === false) score += 20
  if (sensor.emergencyLighting === false) score += 5

  return Math.min(score, 100)
}


