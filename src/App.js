import React, { useState, useEffect } from 'react';
import './App.css';
import { Clock, MapPin, Timer, Zap } from 'lucide-react';

// Pure Frontend Nebula Relics Spawn Tracker
// All spawn calculations run in the browser - perfect for GitHub Pages!

const LOCATION_CYCLE = ['Arkeum Post', 'Orc Village', 'Sanctuary Seal', 'Shrine of Devotion'];
const SPAWN_TYPES = ['Chest', 'Ore'];
const COLOR_SETS = ['blue', 'green', 'orange'];

// Reference point: 9:00 PM EST on [date], Sanctuary Seal = Chest, Shrine of Devotion = Ore
const REFERENCE_TIME = new Date('2025-01-16T21:00:00-05:00'); // 9:00 PM EST

const LOCATION_MAPS = {
  'Arkeum Post': 'https://customer-assets.emergentagent.com/job_77f18dde-01c0-4d56-8de3-e0dc7f018ba0/artifacts/tdeko8xu_image.png',
  'Orc Village': 'https://customer-assets.emergentagent.com/job_77f18dde-01c0-4d56-8de3-e0dc7f018ba0/artifacts/j32lrfoa_image.png',
  'Shrine of Devotion': 'https://customer-assets.emergentagent.com/job_77f18dde-01c0-4d56-8de3-e0dc7f018ba0/artifacts/tnj05qp1_image.png',
  'Sanctuary Seal': 'https://customer-assets.emergentagent.com/job_77f18dde-01c0-4d56-8de3-e0dc7f018ba0/artifacts/yyhablso_image.png'
};

const SPAWN_COORDINATES = {
  'Arkeum Post': {
    blue: [
      { x: 85, y: 45, type: 'chest' },
      { x: 92, y: 75, type: 'ore' }
    ],
    green: [
      { x: 70, y: 80, type: 'chest' },
      { x: 75, y: 60, type: 'ore' }
    ],
    orange: [
      { x: 45, y: 70, type: 'chest' },
      { x: 88, y: 55, type: 'ore' }
    ]
  },
  'Orc Village': {
    blue: [
      { x: 15, y: 25, type: 'chest' },
      { x: 15, y: 65, type: 'ore' }
    ],
    green: [
      { x: 40, y: 50, type: 'chest' },
      { x: 25, y: 85, type: 'ore' }
    ],
    orange: [
      { x: 85, y: 40, type: 'chest' },
      { x: 65, y: 70, type: 'ore' }
    ]
  },
  'Shrine of Devotion': {
    blue: [
      { x: 55, y: 65, type: 'chest' },
      { x: 75, y: 85, type: 'ore' }
    ],
    green: [
      { x: 50, y: 25, type: 'chest' },
      { x: 75, y: 55, type: 'ore' }
    ],
    orange: [
      { x: 75, y: 30, type: 'chest' },
      { x: 55, y: 45, type: 'ore' }
    ]
  },
  'Sanctuary Seal': {
    blue: [
      { x: 45, y: 55, type: 'chest' },
      { x: 55, y: 55, type: 'ore' },
      { x: 65, y: 55, type: 'chest' }
    ],
    green: [
      { x: 25, y: 25, type: 'chest' },
      { x: 45, y: 25, type: 'ore' },
      { x: 65, y: 25, type: 'chest' },
      { x: 75, y: 25, type: 'ore' }
    ],
    orange: [
      { x: 35, y: 85, type: 'chest' },
      { x: 45, y: 85, type: 'ore' },
      { x: 55, y: 85, type: 'chest' }
    ]
  }
};

// Define the exact rotation pattern based on ACTUAL game observations
// 9PM hour: Sanctuary Seal (Ore) + Orc Village (Chest) 
// 10PM hour: Sanctuary Seal (Chest) + Shrine of Devotion (Ore) [ACTUAL]
// 11PM hour: Orc Village (Ore) + Arkeum Post (Chest) [ACTUAL 11:20 PM]
// 12AM hour: Orc Village (Chest) + Sanctuary Seal (Ore) [ACTUAL 12:00 AM]
const ROTATION_PATTERN = [
  { location1: 'Sanctuary Seal', type1: 'Ore', location2: 'Orc Village', type2: 'Chest' },         // 9PM hour
  { location1: 'Sanctuary Seal', type1: 'Chest', location2: 'Shrine of Devotion', type2: 'Ore' }, // 10PM hour [ACTUAL]
  { location1: 'Orc Village', type1: 'Ore', location2: 'Arkeum Post', type2: 'Chest' },           // 11PM hour [ACTUAL 11:20 PM]
  { location1: 'Orc Village', type1: 'Chest', location2: 'Sanctuary Seal', type2: 'Ore' }         // 12AM hour [ACTUAL 12:00 AM]
];

function NebulaTracker() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentSpawns, setCurrentSpawns] = useState([]);
  const [nextSpawns, setNextSpawns] = useState([]);
  const [timeToNext, setTimeToNext] = useState(0);
  const [currentColorSet, setCurrentColorSet] = useState('blue');

  const calculateSpawnData = (time) => {
    const timeDiff = time.getTime() - REFERENCE_TIME.getTime();
    const totalMinutesSinceRef = Math.floor(timeDiff / (1000 * 60));
    
    // Adjust to ensure 10 PM shows Arkeum Post (Ore) + Shrine of Devotion (Chest)
    // We want the 10 PM spawn (next hour) to be pattern index 1 (Arkeum + Shrine)
    const adjustedHours = Math.floor(totalMinutesSinceRef / 60) + 1; // Offset by 1 to get correct next pattern
    const rotationIndex = adjustedHours % ROTATION_PATTERN.length;
    
    // Within each hour, spawns happen every 20 minutes with different color sets
    const spawnCycle = Math.floor((totalMinutesSinceRef % 60) / 20);
    const colorSet = COLOR_SETS[spawnCycle % COLOR_SETS.length];
    
    // Minutes until next spawn (0-19 minutes into each 20-minute cycle)
    const minutesInCurrentCycle = (totalMinutesSinceRef % 20);
    const minutesToNext = 20 - minutesInCurrentCycle;
    
    const currentRotation = ROTATION_PATTERN[rotationIndex];
    
    const current = [
      {
        location: currentRotation.location1,
        type: currentRotation.type1,
        colorSet: colorSet
      },
      {
        location: currentRotation.location2,
        type: currentRotation.type2,
        colorSet: colorSet
      }
    ];
    
    return {
      current,
      minutesToNext,
      colorSet,
      rotationIndex
    };
  };

  const calculateFutureSpawns = (currentTime, minutesAhead1, minutesAhead2) => {
    const nextTime = new Date(currentTime.getTime() + minutesAhead1 * 60 * 1000);
    const afterNextTime = new Date(currentTime.getTime() + minutesAhead2 * 60 * 1000);
    
    const nextData = calculateSpawnData(nextTime);
    const afterNextData = calculateSpawnData(afterNextTime);
    
    return [
      ...nextData.current,
      ...afterNextData.current
    ];
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      
      const spawnData = calculateSpawnData(now);
      const futureSpawns = calculateFutureSpawns(now, spawnData.minutesToNext, spawnData.minutesToNext + 20);
      
      setCurrentSpawns(spawnData.current);
      setNextSpawns(futureSpawns);
      setTimeToNext(spawnData.minutesToNext);
      setCurrentColorSet(spawnData.colorSet);
    }, 1000);

    // Initialize immediately
    const now = new Date();
    const spawnData = calculateSpawnData(now);
    const futureSpawns = calculateFutureSpawns(now, spawnData.minutesToNext, spawnData.minutesToNext + 20);
    setCurrentTime(now);
    setCurrentSpawns(spawnData.current);
    setNextSpawns(futureSpawns);
    setTimeToNext(spawnData.minutesToNext);
    setCurrentColorSet(spawnData.colorSet);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      timeZone: 'America/New_York',
      hour12: true,
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getNextSpawnTime = (minutesAhead) => {
    const nextTime = new Date(currentTime.getTime() + minutesAhead * 60 * 1000);
    return formatTime(nextTime);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-8 h-8 text-purple-400" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Nebula Relics Tracker
            </h1>
          </div>
          <div className="flex items-center gap-6 text-gray-300">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span>Server Time (EDT): {formatTime(currentTime)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Timer className="w-5 h-5 text-green-400" />
              <span>Next Spawn: {timeToNext}m {(60 - currentTime.getSeconds()) % 60}s</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Current Spawns */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-green-400" />
            Current Active Spawns
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {currentSpawns.map((spawn, index) => (
              <div key={index} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                <div className="p-4 bg-gray-750 border-b border-gray-700">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold">{spawn.location}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        spawn.type === 'Chest' 
                          ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' 
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}>
                        {spawn.type}
                      </span>
                      <span className={`w-3 h-3 rounded-full ${
                        currentColorSet === 'blue' ? 'bg-blue-500' :
                        currentColorSet === 'green' ? 'bg-green-500' : 'bg-orange-500'
                      }`}></span>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <img 
                    src={LOCATION_MAPS[spawn.location]} 
                    alt={spawn.location}
                    className="w-full h-64 object-cover"
                  />
                  {/* Spawn point overlays */}
                  <div className="absolute inset-0">
                    {SPAWN_COORDINATES[spawn.location] && 
                     SPAWN_COORDINATES[spawn.location][currentColorSet] && 
                     SPAWN_COORDINATES[spawn.location][currentColorSet].map((point, i) => (
                      <div
                        key={i}
                        className={`absolute w-4 h-4 rounded-full border-2 border-white animate-pulse ${
                          point.type === 'chest' ? 'bg-yellow-500' : 'bg-blue-500'
                        }`}
                        style={{
                          left: `${point.x}%`,
                          top: `${point.y}%`,
                          transform: 'translate(-50%, -50%)'
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Next Spawns Prediction */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Timer className="w-6 h-6 text-orange-400" />
            Upcoming Spawns
          </h2>
          <div className="space-y-6">
            {[
              { spawns: nextSpawns.slice(0, 2), time: getNextSpawnTime(timeToNext), label: 'Next Spawn' },
              { spawns: nextSpawns.slice(2, 4), time: getNextSpawnTime(timeToNext + 20), label: 'Following Spawn' }
            ].map((group, groupIndex) => (
              <div key={groupIndex} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                <div className="p-4 bg-gray-750 border-b border-gray-700">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-200">{group.label}</h3>
                    <span className="text-purple-400 font-medium">{group.time}</span>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6 p-4">
                  {group.spawns.map((spawn, index) => (
                    <div key={index} className="bg-gray-750 rounded-xl border border-gray-600 overflow-hidden">
                      <div className="p-3 bg-gray-700 border-b border-gray-600">
                        <div className="flex items-center justify-between">
                          <h4 className="text-lg font-medium">{spawn.location}</h4>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            spawn.type === 'Chest' 
                              ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' 
                              : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          }`}>
                            {spawn.type}
                          </span>
                        </div>
                      </div>
                      <div className="relative">
                        <img 
                          src={LOCATION_MAPS[spawn.location]} 
                          alt={spawn.location}
                          className="w-full h-48 object-cover"
                        />
                        {/* Future spawn point overlays - showing predicted color set */}
                        <div className="absolute inset-0">
                          {SPAWN_COORDINATES[spawn.location] && 
                           SPAWN_COORDINATES[spawn.location][spawn.colorSet] && 
                           SPAWN_COORDINATES[spawn.location][spawn.colorSet].map((point, i) => (
                            <div
                              key={i}
                              className={`absolute w-3 h-3 rounded-full border-2 border-white opacity-75 ${
                                point.type === 'chest' ? 'bg-yellow-500' : 'bg-blue-500'
                              }`}
                              style={{
                                left: `${point.x}%`,
                                top: `${point.y}%`,
                                transform: 'translate(-50%, -50%)'
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-8 bg-gray-800 rounded-xl p-4 border border-gray-700">
          <h3 className="text-lg font-semibold mb-3">Legend</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                <span>Chest Spawn Points</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <span>Ore Spawn Points</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span>Color Set Rotation (20min cycles)</span>
              </div>
              <div className="text-gray-400">
                Spawns occur every 20 minutes • Locations rotate hourly
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <NebulaTracker />
    </div>
  );
}

export default App;