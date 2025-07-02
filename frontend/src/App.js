import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Accurate Bloxburg map data based on the provided detailed images
const LOCATIONS = {
  // Mountain Region
  'Peak Mountain': { x: 120, y: 150, type: 'landmark' },
  'Peak Camp': { x: 150, y: 190, type: 'landmark' },
  'Meh-Meh Falls': { x: 280, y: 180, type: 'landmark' },
  'Observatory Overlook': { x: 180, y: 420, type: 'landmark' },
  'Mountain Road Bus Stop': { x: 200, y: 320, type: 'transport' },
  
  // Central Lake Area
  'Lakeview Heights': { x: 450, y: 300, type: 'residential' },
  'Lakeview Heights Parking': { x: 470, y: 320, type: 'parking' },
  'Glider Spot': { x: 520, y: 350, type: 'landmark' },
  
  // Greenfield Plains
  'Greenfield Plains': { x: 650, y: 250, type: 'residential' },
  'Mountain Bike Stand': { x: 680, y: 280, type: 'landmark' },
  'Telecom Mast (Plains)': { x: 720, y: 220, type: 'infrastructure' },
  'Wind Turbines (Plains)': { x: 750, y: 200, type: 'infrastructure' },
  
  // Central Bloxburg Town
  'Bloxburg Town': { x: 550, y: 450, type: 'commercial' },
  'Pizza Place': { x: 570, y: 470, type: 'restaurant' },
  'Bloxburg Elementary': { x: 540, y: 430, type: 'school' },
  'City Hall': { x: 520, y: 460, type: 'government' },
  'Water Tower': { x: 560, y: 440, type: 'infrastructure' },
  'Bloxburg Town Exit': { x: 580, y: 480, type: 'transport' },
  
  // Riverside Estates
  'Riverside Estates': { x: 380, y: 520, type: 'residential' },
  'Riverside Estates Parking': { x: 400, y: 540, type: 'parking' },
  'Riverside Park': { x: 420, y: 480, type: 'park' },
  'Creepius St': { x: 360, y: 500, type: 'street' },
  
  // Bloxy Acres
  'Bloxy Acres': { x: 650, y: 450, type: 'residential' },
  'Bloxy Acres Parking 1': { x: 630, y: 470, type: 'parking' },
  'Bloxy Acres Parking 2': { x: 670, y: 470, type: 'parking' },
  'Bloxy Acres Parking 3': { x: 650, y: 490, type: 'parking' },
  'Bloxy Acres Parking 4': { x: 630, y: 510, type: 'parking' },
  'Billygoat St': { x: 620, y: 460, type: 'street' },
  
  // Sunset Pointe
  'Sunset Pointe': { x: 720, y: 580, type: 'residential' },
  'Sunset Pointe Parking 1': { x: 700, y: 600, type: 'parking' },
  'Sunset Pointe Parking 2': { x: 740, y: 600, type: 'parking' },
  'Ferris Wheel': { x: 740, y: 570, type: 'landmark' },
  'Pier Parking': { x: 720, y: 620, type: 'parking' },
  
  // Ocean Avenue Area
  'Ocean Avenue': { x: 520, y: 580, type: 'street' },
  'Ocean Avenue Bus Stop': { x: 500, y: 590, type: 'transport' },
  
  // Cape Beacon
  'Cape Beacon': { x: 200, y: 650, type: 'landmark' },
  'Cape Beacon Bus Stop': { x: 220, y: 630, type: 'transport' },
  
  // Highway and Major Roads
  'HWY Exit': { x: 350, y: 520, type: 'transport' },
  'Innerloop HWY (North)': { x: 400, y: 380, type: 'highway' },
  'Innerloop HWY (East)': { x: 620, y: 420, type: 'highway' },
  'Innerloop HWY (South)': { x: 500, y: 520, type: 'highway' },
  'Innerloop HWY (West)': { x: 320, y: 450, type: 'highway' },
  
  // Infrastructure
  'Telecom Mast (Central)': { x: 340, y: 420, type: 'infrastructure' },
  'Wind Turbines (West)': { x: 200, y: 450, type: 'infrastructure' },
  'Welcome to Bloxburg Sign': { x: 250, y: 550, type: 'landmark' },
  
  // Mountain Roads and Paths
  'Mountain Road': { x: 250, y: 300, type: 'street' },
  'Unnamed Road (Mountain)': { x: 300, y: 250, type: 'street' },
  'Pinewood Bypass': { x: 350, y: 200, type: 'street' },
  
  // Additional Roads
  'Hillside Road': { x: 480, y: 400, type: 'street' },
  'Country Road': { x: 750, y: 350, type: 'street' },
  'Unnamed Lake Road': { x: 520, y: 280, type: 'street' }
};

// Comprehensive road network based on actual map
const ROAD_NETWORK = {
  // Mountain area connections
  'Peak Mountain': ['Peak Camp', 'Meh-Meh Falls', 'Mountain Road'],
  'Peak Camp': ['Peak Mountain', 'Observatory Overlook', 'Mountain Road Bus Stop'],
  'Meh-Meh Falls': ['Peak Mountain', 'Pinewood Bypass', 'Unnamed Road (Mountain)', 'Lakeview Heights'],
  'Observatory Overlook': ['Peak Camp', 'Wind Turbines (West)', 'HWY Exit', 'Mountain Road Bus Stop'],
  'Mountain Road Bus Stop': ['Peak Camp', 'Observatory Overlook', 'Mountain Road'],
  'Mountain Road': ['Peak Mountain', 'Mountain Road Bus Stop', 'Unnamed Road (Mountain)'],
  'Unnamed Road (Mountain)': ['Meh-Meh Falls', 'Mountain Road', 'Pinewood Bypass'],
  'Pinewood Bypass': ['Meh-Meh Falls', 'Unnamed Road (Mountain)', 'Unnamed Lake Road'],
  
  // Lake and central connections
  'Lakeview Heights': ['Meh-Meh Falls', 'Lakeview Heights Parking', 'Glider Spot', 'Bloxburg Town', 'Unnamed Lake Road'],
  'Lakeview Heights Parking': ['Lakeview Heights', 'Glider Spot'],
  'Glider Spot': ['Lakeview Heights', 'Lakeview Heights Parking', 'Hillside Road', 'Bloxburg Town'],
  'Unnamed Lake Road': ['Pinewood Bypass', 'Lakeview Heights', 'Greenfield Plains'],
  
  // Greenfield Plains area
  'Greenfield Plains': ['Unnamed Lake Road', 'Mountain Bike Stand', 'Telecom Mast (Plains)', 'Innerloop HWY (East)', 'Bloxy Acres'],
  'Mountain Bike Stand': ['Greenfield Plains', 'Country Road'],
  'Telecom Mast (Plains)': ['Greenfield Plains', 'Wind Turbines (Plains)'],
  'Wind Turbines (Plains)': ['Telecom Mast (Plains)', 'Country Road'],
  'Country Road': ['Mountain Bike Stand', 'Wind Turbines (Plains)', 'Innerloop HWY (East)'],
  
  // Bloxburg Town central area
  'Bloxburg Town': ['Lakeview Heights', 'Glider Spot', 'Pizza Place', 'Bloxburg Elementary', 'City Hall', 'Water Tower', 'Bloxburg Town Exit', 'Hillside Road', 'Innerloop HWY (East)'],
  'Pizza Place': ['Bloxburg Town', 'Bloxy Acres', 'Billygoat St'],
  'Bloxburg Elementary': ['Bloxburg Town', 'City Hall'],
  'City Hall': ['Bloxburg Town', 'Bloxburg Elementary', 'Water Tower'],
  'Water Tower': ['Bloxburg Town', 'City Hall'],
  'Bloxburg Town Exit': ['Bloxburg Town', 'Innerloop HWY (South)'],
  'Hillside Road': ['Glider Spot', 'Bloxburg Town', 'Riverside Park', 'Innerloop HWY (North)'],
  
  // Innerloop Highway system
  'Innerloop HWY (North)': ['Hillside Road', 'Telecom Mast (Central)', 'Innerloop HWY (West)', 'Innerloop HWY (East)'],
  'Innerloop HWY (East)': ['Innerloop HWY (North)', 'Bloxburg Town', 'Greenfield Plains', 'Country Road', 'Bloxy Acres', 'Innerloop HWY (South)'],
  'Innerloop HWY (South)': ['Innerloop HWY (East)', 'Bloxburg Town Exit', 'Ocean Avenue', 'Sunset Pointe', 'Innerloop HWY (West)'],
  'Innerloop HWY (West)': ['Innerloop HWY (South)', 'HWY Exit', 'Wind Turbines (West)', 'Telecom Mast (Central)', 'Innerloop HWY (North)'],
  
  // Riverside area
  'Riverside Estates': ['Riverside Estates Parking', 'Riverside Park', 'HWY Exit', 'Creepius St'],
  'Riverside Estates Parking': ['Riverside Estates'],
  'Riverside Park': ['Riverside Estates', 'Hillside Road', 'Telecom Mast (Central)'],
  'Creepius St': ['Riverside Estates', 'HWY Exit'],
  
  // Bloxy Acres area
  'Bloxy Acres': ['Pizza Place', 'Greenfield Plains', 'Innerloop HWY (East)', 'Billygoat St', 'Bloxy Acres Parking 1', 'Bloxy Acres Parking 2', 'Bloxy Acres Parking 3', 'Bloxy Acres Parking 4'],
  'Bloxy Acres Parking 1': ['Bloxy Acres', 'Billygoat St'],
  'Bloxy Acres Parking 2': ['Bloxy Acres', 'Billygoat St'],
  'Bloxy Acres Parking 3': ['Bloxy Acres'],
  'Bloxy Acres Parking 4': ['Bloxy Acres'],
  'Billygoat St': ['Pizza Place', 'Bloxy Acres', 'Bloxy Acres Parking 1', 'Bloxy Acres Parking 2'],
  
  // Sunset Pointe area
  'Sunset Pointe': ['Innerloop HWY (South)', 'Ferris Wheel', 'Sunset Pointe Parking 1', 'Sunset Pointe Parking 2', 'Pier Parking'],
  'Sunset Pointe Parking 1': ['Sunset Pointe'],
  'Sunset Pointe Parking 2': ['Sunset Pointe', 'Ferris Wheel'],
  'Ferris Wheel': ['Sunset Pointe', 'Sunset Pointe Parking 2'],
  'Pier Parking': ['Sunset Pointe', 'Ocean Avenue'],
  
  // Ocean Avenue area
  'Ocean Avenue': ['Pier Parking', 'Ocean Avenue Bus Stop', 'Innerloop HWY (South)', 'Cape Beacon Bus Stop'],
  'Ocean Avenue Bus Stop': ['Ocean Avenue'],
  
  // Cape Beacon area
  'Cape Beacon': ['Cape Beacon Bus Stop', 'Welcome to Bloxburg Sign'],
  'Cape Beacon Bus Stop': ['Cape Beacon', 'Ocean Avenue'],
  'Welcome to Bloxburg Sign': ['Cape Beacon', 'HWY Exit'],
  
  // Infrastructure connections
  'HWY Exit': ['Observatory Overlook', 'Riverside Estates', 'Creepius St', 'Welcome to Bloxburg Sign', 'Wind Turbines (West)', 'Innerloop HWY (West)'],
  'Telecom Mast (Central)': ['Riverside Park', 'Innerloop HWY (North)', 'Innerloop HWY (West)'],
  'Wind Turbines (West)': ['Observatory Overlook', 'HWY Exit', 'Innerloop HWY (West)']
};

// A* pathfinding algorithm with improved heuristics
function findPath(start, end) {
  if (start === end) return [start];
  if (!ROAD_NETWORK[start] || !ROAD_NETWORK[end]) return null;
  
  const openSet = [start];
  const cameFrom = {};
  const gScore = { [start]: 0 };
  const fScore = { [start]: calculateDistance(start, end) };
  
  while (openSet.length > 0) {
    // Find the node with lowest fScore
    let current = openSet.reduce((a, b) => 
      (fScore[a] || Infinity) < (fScore[b] || Infinity) ? a : b
    );
    
    if (current === end) {
      // Reconstruct path
      const path = [current];
      while (cameFrom[current]) {
        current = cameFrom[current];
        path.unshift(current);
      }
      return path;
    }
    
    openSet.splice(openSet.indexOf(current), 1);
    const neighbors = ROAD_NETWORK[current] || [];
    
    for (const neighbor of neighbors) {
      const tentativeGScore = gScore[current] + calculateDistance(current, neighbor);
      
      if (tentativeGScore < (gScore[neighbor] || Infinity)) {
        cameFrom[neighbor] = current;
        gScore[neighbor] = tentativeGScore;
        fScore[neighbor] = gScore[neighbor] + calculateDistance(neighbor, end);
        
        if (!openSet.includes(neighbor)) {
          openSet.push(neighbor);
        }
      }
    }
  }
  
  return null; // No path found
}

// Calculate distance between two points
function calculateDistance(loc1, loc2) {
  if (!LOCATIONS[loc1] || !LOCATIONS[loc2]) return Infinity;
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
  
  // Convert pixels to approximate game units (more realistic scaling)
  const gameDistance = Math.round(totalDistance / 5);
  const estimatedTime = Math.round(gameDistance / 30 * 60); // ~30 units per minute
  
  return { distance: gameDistance, time: estimatedTime };
}

// Get location type icon
function getLocationIcon(type) {
  const icons = {
    'landmark': '🏔️',
    'residential': '🏘️',
    'commercial': '🏪',
    'restaurant': '🍕',
    'school': '🏫',
    'government': '🏛️',
    'infrastructure': '📡',
    'transport': '🚌',
    'parking': '🅿️',
    'park': '🌳',
    'street': '🛣️',
    'highway': '🛣️'
  };
  return icons[type] || '📍';
}

function BloxburgGPS() {
  const [currentLocation, setCurrentLocation] = useState('');
  const [destination, setDestination] = useState('');
  const [route, setRoute] = useState([]);
  const [showDropdown, setShowDropdown] = useState(null);
  const [mapMode, setMapMode] = useState('detailed');
  const [routeInfo, setRouteInfo] = useState({ distance: 0, time: 0 });
  const [selectedCategory, setSelectedCategory] = useState('all');
  const mapRef = useRef(null);

  const locationList = Object.keys(LOCATIONS).sort();
  
  // Group locations by type
  const locationsByType = locationList.reduce((acc, location) => {
    const type = LOCATIONS[location].type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(location);
    return acc;
  }, {});

  const filteredLocations = selectedCategory === 'all' 
    ? locationList 
    : locationsByType[selectedCategory] || [];

  const handleMapClick = (event) => {
    const rect = mapRef.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (800 / rect.width);
    const y = (event.clientY - rect.top) * (700 / rect.height);
    
    // Find the closest location to the click
    let closestLocation = null;
    let minDistance = Infinity;
    
    for (const [name, coords] of Object.entries(LOCATIONS)) {
      const distance = Math.sqrt(
        Math.pow(x - coords.x, 2) + Math.pow(y - coords.y, 2)
      );
      
      if (distance < minDistance && distance < 30) { // 30px tolerance
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
      const distance = Math.round(calculateDistance(from, to) / 5);
      const fromType = LOCATIONS[from].type;
      const toType = LOCATIONS[to].type;
      
      let instruction = '';
      if (fromType === 'highway' || toType === 'highway') {
        instruction = `Take highway to ${to}`;
      } else if (toType === 'parking') {
        instruction = `Park at ${to}`;
      } else if (toType === 'transport') {
        instruction = `Head to ${to}`;
      } else {
        instruction = `Continue to ${to}`;
      }
      
      directions.push(`${i + 1}. ${instruction} (${distance} units)`);
    }
    directions.push(`${route.length}. You have arrived at ${destination}! ${getLocationIcon(LOCATIONS[destination].type)}`);
    
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

      <div className="container mx-auto p-4 max-w-7xl">
        {/* Control Panel */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
                  placeholder="Click on map or search..."
                />
                {showDropdown === 'current' && (
                  <div className="absolute z-20 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-64 overflow-y-auto shadow-lg">
                    {filteredLocations
                      .filter(loc => loc.toLowerCase().includes(currentLocation.toLowerCase()))
                      .map(location => (
                      <div
                        key={location}
                        className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 flex items-center gap-2"
                        onClick={() => {
                          setCurrentLocation(location);
                          setShowDropdown(null);
                        }}
                      >
                        <span>{getLocationIcon(LOCATIONS[location].type)}</span>
                        <div>
                          <div className="font-medium">{location}</div>
                          <div className="text-xs text-gray-500">{LOCATIONS[location].type}</div>
                        </div>
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
                  placeholder="Click on map or search..."
                />
                {showDropdown === 'destination' && (
                  <div className="absolute z-20 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-64 overflow-y-auto shadow-lg">
                    {filteredLocations
                      .filter(loc => loc.toLowerCase().includes(destination.toLowerCase()))
                      .map(location => (
                      <div
                        key={location}
                        className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 flex items-center gap-2"
                        onClick={() => {
                          setDestination(location);
                          setShowDropdown(null);
                        }}
                      >
                        <span>{getLocationIcon(LOCATIONS[location].type)}</span>
                        <div>
                          <div className="font-medium">{location}</div>
                          <div className="text-xs text-gray-500">{LOCATIONS[location].type}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Location Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🏷️ Filter by Type
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Locations</option>
                <option value="landmark">🏔️ Landmarks</option>
                <option value="residential">🏘️ Residential</option>
                <option value="commercial">🏪 Commercial</option>
                <option value="restaurant">🍕 Restaurants</option>
                <option value="transport">🚌 Transport</option>
                <option value="parking">🅿️ Parking</option>
                <option value="highway">🛣️ Highways</option>
              </select>
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium">Distance:</span> {routeInfo.distance} units
                </div>
                <div>
                  <span className="font-medium">Est. Time:</span> {Math.floor(routeInfo.time / 60)}m {routeInfo.time % 60}s
                </div>
                <div>
                  <span className="font-medium">Stops:</span> {route.length} locations
                </div>
                <div>
                  <span className="font-medium">Route Type:</span> Optimal
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Map */}
          <div className="xl:col-span-3">
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h2 className="text-xl font-bold mb-4 text-center">
                {mapMode === 'detailed' ? '🗺️ Detailed Bloxburg Map' : '🛣️ Road Network View'}
              </h2>
              <div className="relative">
                <svg
                  ref={mapRef}
                  width="800"
                  height="700"
                  viewBox="0 0 800 700"
                  className="w-full h-auto border-2 border-gray-300 rounded-lg cursor-pointer bg-gradient-to-br from-blue-50 to-green-50"
                  onClick={handleMapClick}
                >
                  {/* Detailed terrain features */}
                  {mapMode === 'detailed' && (
                    <>
                      {/* Mountain ranges */}
                      <path d="M 50 100 Q 200 50 350 150 Q 250 200 150 180 Q 100 150 50 100" fill="#8B7355" opacity="0.7" />
                      <path d="M 100 120 Q 180 80 280 130 Q 220 160 160 150 Q 130 135 100 120" fill="#A0522D" opacity="0.6" />
                      
                      {/* Lake with more realistic shape */}
                      <ellipse cx="480" cy="320" rx="90" ry="50" fill="#4FC3F7" opacity="0.8" />
                      <ellipse cx="490" cy="310" rx="70" ry="35" fill="#29B6F6" opacity="0.6" />
                      
                      {/* Greenfield Plains */}
                      <ellipse cx="680" cy="280" rx="120" ry="90" fill="#81C784" opacity="0.7" />
                      <ellipse cx="690" cy="270" rx="100" ry="70" fill="#66BB6A" opacity="0.5" />
                      
                      {/* Beach and coastal areas */}
                      <path d="M 650 550 Q 750 530 800 580 L 800 700 L 650 700 Z" fill="#FFEB3B" opacity="0.5" />
                      <path d="M 150 600 Q 250 580 350 620 Q 300 650 200 640 Q 175 620 150 600" fill="#FFEB3B" opacity="0.4" />
                      
                      {/* Forest areas */}
                      <circle cx="200" cy="400" r="60" fill="#4CAF50" opacity="0.4" />
                      <circle cx="320" cy="380" r="40" fill="#388E3C" opacity="0.4" />
                    </>
                  )}

                  {/* Road network */}
                  {Object.entries(ROAD_NETWORK).map(([from, connections]) => 
                    connections.map(to => {
                      if (!LOCATIONS[from] || !LOCATIONS[to]) return null;
                      const start = LOCATIONS[from];
                      const end = LOCATIONS[to];
                      const isHighway = from.includes('HWY') || to.includes('HWY') || from.includes('Innerloop') || to.includes('Innerloop');
                      const isInRoute = route.includes(from) && route.includes(to) && 
                        Math.abs(route.indexOf(from) - route.indexOf(to)) === 1;
                      
                      return (
                        <line
                          key={`${from}-${to}`}
                          x1={start.x}
                          y1={start.y}
                          x2={end.x}
                          y2={end.y}
                          stroke={isInRoute ? "#FF4444" : isHighway ? "#666" : "#999"}
                          strokeWidth={isInRoute ? "6" : isHighway ? "4" : "2"}
                          strokeDasharray={isHighway && !isInRoute ? "8,4" : "none"}
                          opacity={isInRoute ? "1" : "0.6"}
                        />
                      );
                    })
                  )}

                  {/* Location markers */}
                  {Object.entries(LOCATIONS).map(([name, coords]) => {
                    const isStart = name === currentLocation;
                    const isEnd = name === destination;
                    const isInRoute = route.includes(name);
                    const type = coords.type;
                    
                    let markerColor = '#2196F3';
                    let markerSize = 4;
                    
                    if (isStart) {
                      markerColor = '#4CAF50';
                      markerSize = 8;
                    } else if (isEnd) {
                      markerColor = '#F44336';
                      markerSize = 8;
                    } else if (isInRoute) {
                      markerColor = '#FF9800';
                      markerSize = 6;
                    } else if (type === 'highway') {
                      markerColor = '#9C27B0';
                      markerSize = 3;
                    } else if (type === 'parking') {
                      markerColor = '#607D8B';
                      markerSize = 3;
                    } else if (type === 'landmark') {
                      markerColor = '#795548';
                      markerSize = 5;
                    }
                    
                    return (
                      <g key={name}>
                        <circle
                          cx={coords.x}
                          cy={coords.y}
                          r={markerSize}
                          fill={markerColor}
                          stroke="white"
                          strokeWidth="1"
                          className="hover:r-6 transition-all cursor-pointer"
                        />
                        {(isStart || isEnd || isInRoute || type === 'landmark' || type === 'restaurant') && (
                          <text
                            x={coords.x}
                            y={coords.y - markerSize - 3}
                            textAnchor="middle"
                            className="text-xs font-bold fill-gray-800 pointer-events-none"
                            style={{ fontSize: `${Math.max(8, markerSize)}px` }}
                          >
                            {name.length > 15 ? name.substring(0, 12) + '...' : name}
                          </text>
                        )}
                        {isStart && (
                          <text x={coords.x} y={coords.y + 20} textAnchor="middle" className="text-xs font-bold fill-green-600">START</text>
                        )}
                        {isEnd && (
                          <text x={coords.x} y={coords.y + 20} textAnchor="middle" className="text-xs font-bold fill-red-600">END</text>
                        )}
                      </g>
                    );
                  })}
                </svg>
                
                {/* Enhanced Legend */}
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    <span>Start Location</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                    <span>Destination</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-1 bg-red-500"></div>
                    <span>Active Route</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-1 bg-gray-600" style={{borderTop: '2px dashed'}}></div>
                    <span>Highway</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Directions Panel */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-4 h-fit">
              <h2 className="text-xl font-bold mb-4">🧭 Navigation</h2>
              
              {route.length > 0 ? (
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                    <div className="text-sm font-medium">📍 Route Overview</div>
                    <div className="text-xs text-gray-600 mt-1">
                      {route[0]} → {route[route.length - 1]}
                    </div>
                  </div>
                  
                  {getDirections().map((direction, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border-l-4 ${
                        index === 0 ? 'bg-green-50 border-green-500' :
                        index === getDirections().length - 1 ? 'bg-red-50 border-red-500' :
                        'bg-gray-50 border-gray-400'
                      }`}
                    >
                      <div className="text-sm font-medium">{direction}</div>
                      {route[index] && (
                        <div className="text-xs text-gray-500 mt-1">
                          {getLocationIcon(LOCATIONS[route[index]]?.type)} {LOCATIONS[route[index]]?.type}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-2">📊 Trip Summary</h3>
                    <div className="space-y-1 text-sm">
                      <div>🚶 Distance: {routeInfo.distance} units</div>
                      <div>⏱️ Time: {Math.floor(routeInfo.time / 60)}m {routeInfo.time % 60}s</div>
                      <div>📍 Waypoints: {route.length}</div>
                      <div>🛣️ Via: {route.filter(loc => LOCATIONS[loc]?.type === 'highway').length} highways</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <div className="text-4xl mb-4">🗺️</div>
                  <p className="mb-2">Select locations to navigate</p>
                  <p className="text-sm">💡 Click on the map or use the search above</p>
                  
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg text-left">
                    <h4 className="font-semibold text-blue-800 mb-2">Quick Destinations:</h4>
                    <div className="space-y-1 text-xs">
                      <div>🍕 Pizza Place (Central)</div>
                      <div>🏫 Bloxburg Elementary</div>
                      <div>🎡 Ferris Wheel (Sunset Pointe)</div>
                      <div>🏔️ Peak Mountain</div>
                      <div>🌳 Riverside Park</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-10"
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