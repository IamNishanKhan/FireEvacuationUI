# Fire Evacuation System - Web UI

React + Vite web interface for the Fire Evacuation System.

## Setup

1. Install dependencies:
```bash
cd web-ui
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Open browser to `http://localhost:3000`

## Features

- **Real-time floor plan visualization** using HTML5 Canvas
- **Interactive simulation controls** (Space: Pause, N: Next Step, A: Toggle Auto)
- **Automatic risk-based route recommendations** using pathfinding algorithm
- **Dynamic fire spread visualization** with realistic fire propagation
- **Route highlighting** - recommended route shown in bright green
- **Danger indicators** - Fire, CO, oxygen hazards, crowd density warnings
- **Detailed route information** - danger scores, path length, hazards
- **Visual feedback** - color-coded rooms by danger level, exit indicators

## UI Features

The UI focuses on clear visualization and user experience:

- **Canvas-based rendering** for smooth performance
- **Color-coded danger levels** (Blue: Safe, Yellow: Moderate, Orange: High, Red: Critical)
- **Real-time updates** every 2 seconds (configurable)
- **Route comparison** - see all available routes with their risk scores
- **Visual indicators** for fires, toxic gases, blocked exits, and crowd density
- **Responsive layout** with fixed info panel and scrollable route list

## Controls

- **SPACE**: Pause/Resume simulation
- **N**: Manually advance one step
- **A**: Toggle auto-step mode
- **ESC**: Exit (close browser tab)

