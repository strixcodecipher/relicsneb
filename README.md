# Nebula Relics Spawn Tracker

A real-time spawn tracker for Nebula Relics with interactive maps and accurate predictions.

## Features

- ✅ **Real-time spawn tracking** with 1-second precision updates
- ✅ **Interactive game maps** showing exact spawn locations  
- ✅ **Accurate spawn predictions** based on confirmed game rotation
- ✅ **Color set rotation tracking** (blue/green/orange) every 20 minutes
- ✅ **Mobile-responsive design** for on-the-go gaming
- ✅ **Pure frontend** - runs entirely in browser (perfect for GitHub Pages)

## Game Mechanics

- **Spawns occur every 20 minutes** (3 times per hour)
- **Same locations repeat** for each hour with different color sets
- **Location rotation** changes every hour
- **4 locations**: Arkeum Post, Orc Village, Sanctuary Seal, Shrine of Devotion

## Confirmed Rotation Pattern

Based on actual game observations:

1. **9:00-9:40 PM**: Sanctuary Seal (Ore) + Orc Village (Chest)
2. **10:00-10:40 PM**: Sanctuary Seal (Chest) + Shrine of Devotion (Ore)
3. **11:00-11:40 PM**: Orc Village (Ore) + Arkeum Post (Chest)
4. **12:00-12:40 AM**: Orc Village (Chest) + Sanctuary Seal (Ore)

## Installation

```bash
npm install
npm start
```

## Build for Production

```bash
npm run build
```

## Deploy to GitHub Pages

```bash
npm run deploy
```

## Technology Stack

- **React** - Frontend framework
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Pure JavaScript** - All spawn calculations (no backend needed)

## Contributing

Feel free to contribute with pull requests for additional features or bug fixes.

## License

MIT License - feel free to use for your gaming community!