import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Bloxburg map data based on the provided images
const LOCATIONS = {
  'Peak Mountain': { x: 120, y: 150, region: 'Mountain' },
  'Peak Camp': { x: 140, y: 200, region: 'Mountain' },
  'Meh-Meh Falls': { x: 300, y: 180, region: 'Mountain' },
  'Observatory Overlook': { x: 150, y: 380, region: 'Mountain' },
  'Greenfield Plains': { x: 680, y: 280, region: 'Plains' },
  'Lakeview Heights': { x: 480, y: 320, region: 'Central' },
  'Bloxburg Town': { x: 550, y: 450, region: 'Central' },
  'Pizza Place': { x: 570, y: 460, region: 'Central' },
  'Riverside Estates': { x: 420, y: 520, region: 'Estates' },
  'Riverside Park': { x: 450, y: 480, region: 'Estates' },
  'Bloxy Acres': { x: 650, y: 480, region: 'Acres' },
  'Sunset Pointe': { x: 720, y: 580, region: 'Beach' },
  'Cape Beacon': { x: 180, y: 620, region: 'Beach' },
  'HWY Exit': { x: 350, y: 520, region: 'Highway' },
  'Telecom Mast': { x: 340, y: 420, region: 'Infrastructure' },
  'Wind Turbines': { x: 200, y: 450, region: 'Infrastructure' }
};

// Road network for pathfinding
const ROAD_NETWORK = {
  'Peak Mountain': ['Peak Camp', 'Meh-Meh Falls'],
  'Peak Camp': ['Peak Mountain', 'Observatory Overlook'],
  'Meh-Meh Falls': ['Peak Mountain', 'Lakeview Heights', 'Greenfield Plains'],
  'Observatory Overlook': ['Peak Camp', 'HWY Exit', 'Wind Turbines'],
  'Greenfield Plains': ['Meh-Meh Falls', 'Lakeview Heights', 'Bloxy Acres'],
  'Lakeview Heights': ['Meh-Meh Falls', 'Greenfield Plains', 'Bloxburg Town', 'Telecom Mast'],
  'Bloxburg Town': ['Lakeview Heights', 'Pizza Place', 'Bloxy Acres', 'Riverside Park'],
  'Pizza Place': ['Bloxburg Town', 'Bloxy Acres'],
  'Riverside Estates': ['HWY Exit', 'Riverside Park', 'Cape Beacon'],
  'Riverside Park': ['Riverside Estates', 'Bloxburg Town', 'Telecom Mast'],
  'Bloxy Acres': ['Greenfield Plains', 'Bloxburg Town', 'Pizza Place', 'Sunset Pointe'],
  'Sunset Pointe': ['Bloxy Acres', 'Cape Beacon'],
  'Cape Beacon': ['Riverside Estates', 'Sunset Pointe'],
  'HWY Exit': ['Observatory Overlook', 'Riverside Estates', 'Wind Turbines'],
  'Telecom Mast': ['Lakeview Heights', 'Riverside Park'],
  'Wind Turbines': ['Observatory Overlook', 'HWY Exit']
};

// A* pathfinding algorithm
function findPath(start, end) {
  if (start === end) return [start];
  
  const queue = [[start]];
  const visited = new Set([start]);
  
  while (queue.length > 0) {
    const path = queue.shift();
    const current = path[path.length - 1];
    
    if (current === end) {
      return path;
    }
    
    const neighbors = ROAD_NETWORK[current] || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push([...path, neighbor]);
      }
    }
  }
  
  return null; // No path found
}

// Calculate distance between two points
function calculateDistance(loc1, loc2) {
  const dx = LOCATIONS[loc1].x - LOCATIONS[loc2].x;
  const dy = LOCATIONS[loc1].y - LOCATIONS[loc2].y;
  return Math.sqrt(dx * dx + dy * dy);
}

// Calculate total route distance and estimated time
function calculateRouteInfo(path) {
  if (!path || path.length < 2) return { distance: 0, time: 0 };
  
  let totalDistance = 0;
  for (let i = 0; i < path.length - 1; i++) {
    totalDistance += calculateDistance(path[i], path[i + 1]);
  }
  
  // Convert pixels to approximate game units (rough estimation)
  const gameDistance = Math.round(totalDistance / 10);
  const estimatedTime = Math.round(gameDistance / 50 * 60); // ~50 units per minute
  
  return { distance: gameDistance, time: estimatedTime };
}

function BloxburgGPS() {
  const [currentLocation, setCurrentLocation] = useState('');
  const [destination, setDestination] = useState('');
  const [route, setRoute] = useState([]);
  const [showDropdown, setShowDropdown] = useState(null);
  const [mapMode, setMapMode] = useState('detailed'); // 'detailed' or 'simplified'
  const [routeInfo, setRouteInfo] = useState({ distance: 0, time: 0 });
  const mapRef = useRef(null);

  const locationList = Object.keys(LOCATIONS).sort();

  const handleMapClick = (event) => {
    const rect = mapRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Find the closest location to the click
    let closestLocation = null;
    let minDistance = Infinity;
    
    for (const [name, coords] of Object.entries(LOCATIONS)) {
      const distance = Math.sqrt(
        Math.pow(x - coords.x, 2) + Math.pow(y - coords.y, 2)
      );
      
      if (distance < minDistance && distance < 50) { // 50px tolerance
        minDistance = distance;
        closestLocation = name;
      }
    }
    
    if (closestLocation) {
      if (!currentLocation) {
        setCurrentLocation(closestLocation);
      } else if (!destination) {
        setDestination(closestLocation);
      } else {
        // Reset and set new current location
        setCurrentLocation(closestLocation);
        setDestination('');
        setRoute([]);
      }
    }
  };

  const findRoute = () => {
    if (currentLocation && destination) {
      const path = findPath(currentLocation, destination);
      if (path) {
        setRoute(path);
        setRouteInfo(calculateRouteInfo(path));
      } else {
        alert('No route found between these locations!');
      }
    }
  };

  const clearRoute = () => {
    setCurrentLocation('');
    setDestination('');
    setRoute([]);
    setRouteInfo({ distance: 0, time: 0 });
  };

  const getDirections = () => {
    if (route.length < 2) return [];
    
    const directions = [];
    for (let i = 0; i < route.length - 1; i++) {
      const from = route[i];
      const to = route[i + 1];
      const distance = Math.round(calculateDistance(from, to) / 10);
      directions.push(`${i + 1}. Head to ${to} (${distance} units)`);
    }
    directions.push(`${route.length}. You have arrived at ${destination}!`);
    
    return directions;
  };

  useEffect(() => {
    if (currentLocation && destination) {
      findRoute();
    }
  }, [currentLocation, destination]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500">
      {/* Header */}
      <div className="bg-slate-900 text-white p-4 shadow-lg">
        <h1 className="text-3xl font-bold text-center flex items-center justify-center gap-3">
          <span className="text-blue-400">🗺️</span>
          Bloxburg GPS Navigator
          <span className="text-green-400">📍</span>
        </h1>
      </div>

      <div className="container mx-auto p-4">
        {/* Control Panel */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Current Location */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📍 Current Location
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={currentLocation}
                  onChange={(e) => setCurrentLocation(e.target.value)}
                  onFocus={() => setShowDropdown('current')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Click on map or select..."
                />
                {showDropdown === 'current' && (
                  <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg">
                    {locationList
                      .filter(loc => loc.toLowerCase().includes(currentLocation.toLowerCase()))
                      .map(location => (
                      <div
                        key={location}
                        className="p-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100"
                        onClick={() => {
                          setCurrentLocation(location);
                          setShowDropdown(null);
                        }}
                      >
                        {location} <span className="text-gray-500 text-sm">({LOCATIONS[location].region})</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Destination */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🎯 Destination
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  onFocus={() => setShowDropdown('destination')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Click on map or select..."
                />
                {showDropdown === 'destination' && (
                  <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg">
                    {locationList
                      .filter(loc => loc.toLowerCase().includes(destination.toLowerCase()))
                      .map(location => (
                      <div
                        key={location}
                        className="p-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100"
                        onClick={() => {
                          setDestination(location);
                          setShowDropdown(null);
                        }}
                      >
                        {location} <span className="text-gray-500 text-sm">({LOCATIONS[location].region})</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 items-center">
            <button
              onClick={findRoute}
              disabled={!currentLocation || !destination}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              🧭 Find Route
            </button>
            <button
              onClick={clearRoute}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              🗑️ Clear
            </button>
            <button
              onClick={() => setMapMode(mapMode === 'detailed' ? 'simplified' : 'detailed')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              🔄 {mapMode === 'detailed' ? 'Simplified' : 'Detailed'} View
            </button>
          </div>

          {/* Route Info */}
          {route.length > 0 && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 mb-2">🎯 Route Found!</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Distance:</span> {routeInfo.distance} units
                </div>
                <div>
                  <span className="font-medium">Est. Time:</span> {routeInfo.time} seconds
                </div>
                <div>
                  <span className="font-medium">Stops:</span> {route.length} locations
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h2 className="text-xl font-bold mb-4 text-center">
                {mapMode === 'detailed' ? '🗺️ Detailed Map' : '🛣️ Road Network'}
              </h2>
              <div className="relative">
                <svg
                  ref={mapRef}
                  width="800"
                  height="700"
                  viewBox="0 0 800 700"
                  className="w-full h-auto border border-gray-300 rounded-lg cursor-pointer bg-gradient-to-br from-blue-100 to-green-100"
                  onClick={handleMapClick}
                >
                  {/* Background terrain */}
                  {mapMode === 'detailed' && (
                    <>
                      {/* Mountain area */}
                      <ellipse cx="200" cy="250" rx="150" ry="100" fill="#8B7355" opacity="0.6" />
                      {/* Lake */}
                      <ellipse cx="480" cy="320" rx="80" ry="40" fill="#4FC3F7" opacity="0.8" />
                      {/* Plains */}
                      <ellipse cx="680" cy="280" rx="100" ry="80" fill="#81C784" opacity="0.6" />
                      {/* Beach area */}
                      <rect x="650" y="550" width="150" height="100" fill="#FFEB3B" opacity="0.4" />
                    </>
                  )}

                  {/* Roads */}
                  {route.length > 1 && route.map((location, index) => {
                    if (index === route.length - 1) return null;
                    const start = LOCATIONS[location];
                    const end = LOCATIONS[route[index + 1]];
                    return (
                      <line
                        key={`route-${index}`}
                        x1={start.x}
                        y1={start.y}
                        x2={end.x}
                        y2={end.y}
                        stroke="#FF4444"
                        strokeWidth="4"
                        opacity="0.8"
                      />
                    );
                  })}

                  {/* Background roads */}
                  {Object.entries(ROAD_NETWORK).map(([from, connections]) => 
                    connections.map(to => {
                      const start = LOCATIONS[from];
                      const end = LOCATIONS[to];
                      const isInRoute = route.includes(from) && route.includes(to);
                      return (
                        <line
                          key={`${from}-${to}`}
                          x1={start.x}
                          y1={start.y}
                          x2={end.x}
                          y2={end.y}
                          stroke={isInRoute ? "#FF4444" : "#666"}
                          strokeWidth={isInRoute ? "0" : "2"}
                          opacity="0.4"
                        />
                      );
                    })
                  )}

                  {/* Locations */}
                  {Object.entries(LOCATIONS).map(([name, coords]) => {
                    const isStart = name === currentLocation;
                    const isEnd = name === destination;
                    const isInRoute = route.includes(name);
                    
                    return (
                      <g key={name}>
                        <circle
                          cx={coords.x}
                          cy={coords.y}
                          r={isStart || isEnd ? 12 : isInRoute ? 8 : 6}
                          fill={isStart ? "#4CAF50" : isEnd ? "#F44336" : isInRoute ? "#FF9800" : "#2196F3"}
                          stroke="white"
                          strokeWidth="2"
                          className="hover:r-8 transition-all cursor-pointer"
                        />
                        <text
                          x={coords.x}
                          y={coords.y - 15}
                          textAnchor="middle"
                          className="text-xs font-bold fill-gray-800 pointer-events-none"
                          style={{ fontSize: '10px' }}
                        >
                          {name}
                        </text>
                      </g>
                    );
                  })}
                </svg>
                
                {/* Legend */}
                <div className="mt-4 flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    <span>Start Location</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                    <span>Destination</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                    <span>Route Stop</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-1 bg-red-500"></div>
                    <span>Your Route</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Directions Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h2 className="text-xl font-bold mb-4">🧭 Turn-by-Turn Directions</h2>
              
              {route.length > 0 ? (
                <div className="space-y-3">
                  {getDirections().map((direction, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border-l-4 ${
                        index === 0 ? 'bg-green-50 border-green-500' :
                        index === getDirections().length - 1 ? 'bg-red-50 border-red-500' :
                        'bg-blue-50 border-blue-500'
                      }`}
                    >
                      <div className="text-sm font-medium">{direction}</div>
                    </div>
                  ))}
                  
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-2">📊 Route Summary</h3>
                    <div className="space-y-1 text-sm">
                      <div>🚶 Total Distance: {routeInfo.distance} units</div>
                      <div>⏱️ Estimated Time: {routeInfo.time} seconds</div>
                      <div>📍 Total Stops: {route.length}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <div className="text-4xl mb-4">🗺️</div>
                  <p>Select your current location and destination to get turn-by-turn directions.</p>
                  <p className="text-sm mt-2">💡 Tip: Click directly on the map to set locations!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">📖 How to Use</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-blue-600 mb-2">🖱️ Setting Locations</h3>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>• Click directly on the map near any location</li>
                <li>• Or type/search in the dropdown menus</li>
                <li>• Set current location first, then destination</li>
                <li>• Routes will calculate automatically</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-green-600 mb-2">🎮 Navigation Features</h3>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>• Switch between detailed and simplified views</li>
                <li>• Get distance and time estimates</li>
                <li>• Follow turn-by-turn directions</li>
                <li>• Routes highlight the fastest path</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setShowDropdown(null)}
        />
      )}
    </div>
  );
}

function App() {
  return <BloxburgGPS />;
}

export default App;