import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Real Bloxburg map coordinates based on the actual uploaded images
// Using the simplified map as reference for accurate road network
const LOCATIONS = {
  // Mountain/Northern Region
  'Peak Mountain': { x: 120, y: 80, type: 'mountain' },
  'Peak Camp': { x: 160, y: 120, type: 'camping' },
  'Meh-Meh Falls': { x: 280, y: 140, type: 'waterfall' },
  'Observatory Overlook': { x: 140, y: 300, type: 'observatory' },
  'Bloxburg Cave': { x: 180, y: 180, type: 'cave' },
  
  // Greenfield Plains (Eastern area)
  'Greenfield Plains': { x: 620, y: 200, type: 'residential' },
  'Mountain Bike Stand': { x: 650, y: 230, type: 'recreation' },
  'Telecom Mast': { x: 680, y: 160, type: 'infrastructure' },
  'Wind Turbines': { x: 720, y: 140, type: 'infrastructure' },
  'Country Road': { x: 680, y: 280, type: 'road' },
  
  // Central Lake Area
  'Lakeview Heights': { x: 420, y: 260, type: 'residential' },
  'Glider Spot': { x: 460, y: 290, type: 'recreation' },
  'Innerloop HWY': { x: 480, y: 320, type: 'highway' },
  'Hillside Road': { x: 440, y: 330, type: 'road' },
  
  // Central Bloxburg Town
  'Bloxburg Town': { x: 480, y: 380, type: 'commercial' },
  'Pizza Place': { x: 500, y: 400, type: 'restaurant' },
  'Bloxburg Elementary': { x: 460, y: 370, type: 'school' },
  'City Hall': { x: 440, y: 390, type: 'government' },
  'Water Tower': { x: 520, y: 360, type: 'infrastructure' },
  'Bloxburg Blvd': { x: 480, y: 420, type: 'road' },
  
  // Riverside Estates (Southwest)
  'Riverside Estates': { x: 320, y: 420, type: 'residential' },
  'Riverside Park': { x: 360, y: 400, type: 'park' },
  'HWY Exit': { x: 280, y: 440, type: 'highway' },
  'Welcome to Bloxburg Sign': { x: 200, y: 480, type: 'landmark' },
  'Wind Turbines West': { x: 160, y: 380, type: 'infrastructure' },
  'Telecom Mast Central': { x: 280, y: 360, type: 'infrastructure' },
  
  // Bloxy Acres (Central-East)
  'Bloxy Acres': { x: 580, y: 380, type: 'residential' },
  'Bloxy Acres Main': { x: 560, y: 400, type: 'residential' },
  'Bloxy Acres North': { x: 600, y: 360, type: 'residential' },
  'Unnamed Lake': { x: 540, y: 420, type: 'water' },
  
  // Sunset Pointe (Southeast)
  'Sunset Pointe': { x: 680, y: 520, type: 'residential' },
  'Ferris Wheel': { x: 700, y: 540, type: 'amusement' },
  'Pier Parking': { x: 720, y: 560, type: 'parking' },
  'Sunset Pointe Beach': { x: 660, y: 580, type: 'beach' },
  
  // Ocean Avenue Area
  'Ocean Avenue': { x: 440, y: 520, type: 'road' },
  'Ocean Avenue Bridge': { x: 480, y: 540, type: 'bridge' },
  'Bus Stop Ocean': { x: 420, y: 540, type: 'transport' },
  
  // Cape Beacon (Southwest coast)
  'Cape Beacon': { x: 160, y: 580, type: 'lighthouse' },
  'Bus Stop Cape': { x: 180, y: 560, type: 'transport' },
  'Cape Beacon Beach': { x: 140, y: 600, type: 'beach' },
  
  // Additional Roads and Intersections
  'Mountain Road': { x: 220, y: 200, type: 'road' },
  'Pinewood Bypass': { x: 320, y: 180, type: 'road' },
  'Innerloop North': { x: 400, y: 280, type: 'highway' },
  'Innerloop East': { x: 580, y: 320, type: 'highway' },
  'Innerloop South': { x: 440, y: 480, type: 'highway' },
  'Innerloop West': { x: 280, y: 400, type: 'highway' },
  
  // Parking Areas (marked with P in original map)
  'Lakeview Heights Parking': { x: 440, y: 280, type: 'parking' },
  'Riverside Estates Parking': { x: 340, y: 440, type: 'parking' },
  'Bloxy Acres Parking 1': { x: 560, y: 420, type: 'parking' },
  'Bloxy Acres Parking 2': { x: 600, y: 420, type: 'parking' },
  'Bloxy Acres Parking 3': { x: 580, y: 440, type: 'parking' },
  'Bloxy Acres Parking 4': { x: 620, y: 440, type: 'parking' },
  'Sunset Pointe Parking 1': { x: 660, y: 540, type: 'parking' },
  'Sunset Pointe Parking 2': { x: 700, y: 520, type: 'parking' }
};

// Accurate road network based on the simplified map's visible connections
const ROAD_NETWORK = {
  // Mountain region connections
  'Peak Mountain': ['Peak Camp', 'Bloxburg Cave', 'Mountain Road'],
  'Peak Camp': ['Peak Mountain', 'Meh-Meh Falls', 'Observatory Overlook'],
  'Meh-Meh Falls': ['Peak Camp', 'Pinewood Bypass', 'Lakeview Heights'],
  'Observatory Overlook': ['Peak Camp', 'Wind Turbines West', 'Telecom Mast Central'],
  'Bloxburg Cave': ['Peak Mountain', 'Mountain Road'],
  'Mountain Road': ['Peak Mountain', 'Bloxburg Cave', 'Pinewood Bypass'],
  'Pinewood Bypass': ['Meh-Meh Falls', 'Mountain Road', 'Innerloop North'],
  
  // Greenfield Plains connections
  'Greenfield Plains': ['Mountain Bike Stand', 'Telecom Mast', 'Innerloop East', 'Bloxy Acres North'],
  'Mountain Bike Stand': ['Greenfield Plains', 'Wind Turbines', 'Country Road'],
  'Telecom Mast': ['Greenfield Plains', 'Wind Turbines'],
  'Wind Turbines': ['Telecom Mast', 'Mountain Bike Stand', 'Country Road'],
  'Country Road': ['Mountain Bike Stand', 'Wind Turbines', 'Innerloop East'],
  
  // Lake area connections
  'Lakeview Heights': ['Meh-Meh Falls', 'Lakeview Heights Parking', 'Glider Spot', 'Bloxburg Town', 'Innerloop North'],
  'Lakeview Heights Parking': ['Lakeview Heights'],
  'Glider Spot': ['Lakeview Heights', 'Hillside Road', 'Bloxburg Town'],
  'Hillside Road': ['Glider Spot', 'Riverside Park', 'Innerloop North'],
  
  // Central town connections
  'Bloxburg Town': ['Lakeview Heights', 'Glider Spot', 'Pizza Place', 'Bloxburg Elementary', 'City Hall', 'Water Tower', 'Bloxburg Blvd', 'Innerloop East'],
  'Pizza Place': ['Bloxburg Town', 'Bloxy Acres', 'Bloxburg Blvd'],
  'Bloxburg Elementary': ['Bloxburg Town', 'City Hall'],
  'City Hall': ['Bloxburg Town', 'Bloxburg Elementary', 'Water Tower', 'Riverside Park'],
  'Water Tower': ['Bloxburg Town', 'City Hall'],
  'Bloxburg Blvd': ['Bloxburg Town', 'Pizza Place', 'Innerloop South'],
  
  // Innerloop Highway system (main highway ring)
  'Innerloop North': ['Pinewood Bypass', 'Lakeview Heights', 'Hillside Road', 'Telecom Mast Central', 'Innerloop West', 'Innerloop East'],
  'Innerloop East': ['Innerloop North', 'Greenfield Plains', 'Country Road', 'Bloxburg Town', 'Bloxy Acres', 'Innerloop South'],
  'Innerloop South': ['Innerloop East', 'Bloxburg Blvd', 'Ocean Avenue', 'Sunset Pointe', 'Innerloop West'],
  'Innerloop West': ['Innerloop South', 'HWY Exit', 'Wind Turbines West', 'Telecom Mast Central', 'Innerloop North'],
  
  // Riverside area
  'Riverside Estates': ['Riverside Estates Parking', 'Riverside Park', 'HWY Exit'],
  'Riverside Estates Parking': ['Riverside Estates'],
  'Riverside Park': ['Riverside Estates', 'City Hall', 'Hillside Road', 'Telecom Mast Central'],
  'HWY Exit': ['Riverside Estates', 'Welcome to Bloxburg Sign', 'Wind Turbines West', 'Innerloop West'],
  'Welcome to Bloxburg Sign': ['HWY Exit', 'Cape Beacon'],
  'Wind Turbines West': ['Observatory Overlook', 'HWY Exit', 'Innerloop West'],
  'Telecom Mast Central': ['Observatory Overlook', 'Riverside Park', 'Innerloop North', 'Innerloop West'],
  
  // Bloxy Acres area
  'Bloxy Acres': ['Pizza Place', 'Bloxy Acres Main', 'Bloxy Acres North', 'Bloxy Acres Parking 1', 'Bloxy Acres Parking 2', 'Innerloop East'],
  'Bloxy Acres Main': ['Bloxy Acres', 'Bloxy Acres Parking 3', 'Bloxy Acres Parking 4', 'Unnamed Lake'],
  'Bloxy Acres North': ['Bloxy Acres', 'Greenfield Plains'],
  'Bloxy Acres Parking 1': ['Bloxy Acres'],
  'Bloxy Acres Parking 2': ['Bloxy Acres'],
  'Bloxy Acres Parking 3': ['Bloxy Acres Main'],
  'Bloxy Acres Parking 4': ['Bloxy Acres Main'],
  'Unnamed Lake': ['Bloxy Acres Main', 'Ocean Avenue'],
  
  // Sunset Pointe area
  'Sunset Pointe': ['Ferris Wheel', 'Sunset Pointe Parking 1', 'Sunset Pointe Parking 2', 'Sunset Pointe Beach', 'Innerloop South'],
  'Ferris Wheel': ['Sunset Pointe', 'Pier Parking'],
  'Pier Parking': ['Ferris Wheel', 'Sunset Pointe Beach'],
  'Sunset Pointe Beach': ['Sunset Pointe', 'Pier Parking', 'Ocean Avenue Bridge'],
  'Sunset Pointe Parking 1': ['Sunset Pointe'],
  'Sunset Pointe Parking 2': ['Sunset Pointe'],
  
  // Ocean Avenue area
  'Ocean Avenue': ['Unnamed Lake', 'Ocean Avenue Bridge', 'Bus Stop Ocean', 'Innerloop South'],
  'Ocean Avenue Bridge': ['Ocean Avenue', 'Sunset Pointe Beach', 'Cape Beacon'],
  'Bus Stop Ocean': ['Ocean Avenue', 'Cape Beacon'],
  
  // Cape Beacon area
  'Cape Beacon': ['Ocean Avenue Bridge', 'Bus Stop Ocean', 'Bus Stop Cape', 'Cape Beacon Beach', 'Welcome to Bloxburg Sign'],
  'Bus Stop Cape': ['Cape Beacon'],
  'Cape Beacon Beach': ['Cape Beacon']
};

// Calculate distance between two locations
function calculateDistance(loc1, loc2) {
  if (!LOCATIONS[loc1] || !LOCATIONS[loc2]) return Infinity;
  const dx = LOCATIONS[loc1].x - LOCATIONS[loc2].x;
  const dy = LOCATIONS[loc1].y - LOCATIONS[loc2].y;
  return Math.sqrt(dx * dx + dy * dy);
}

// A* pathfinding algorithm
function findPath(start, end) {
  if (start === end) return [start];
  if (!ROAD_NETWORK[start] || !ROAD_NETWORK[end]) return null;
  
  const openSet = [start];
  const cameFrom = {};
  const gScore = { [start]: 0 };
  const fScore = { [start]: calculateDistance(start, end) };
  
  while (openSet.length > 0) {
    let current = openSet.reduce((a, b) => 
      (fScore[a] || Infinity) < (fScore[b] || Infinity) ? a : b
    );
    
    if (current === end) {
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
  
  return null;
}

// Calculate route info
function calculateRouteInfo(path) {
  if (!path || path.length < 2) return { distance: 0, time: 0 };
  
  let totalDistance = 0;
  for (let i = 0; i < path.length - 1; i++) {
    totalDistance += calculateDistance(path[i], path[i + 1]);
  }
  
  const gameDistance = Math.round(totalDistance / 3);
  const estimatedTime = Math.round(gameDistance / 25 * 60);
  
  return { distance: gameDistance, time: estimatedTime };
}

// Get icon for location type
function getLocationIcon(type) {
  const icons = {
    'mountain': '🏔️', 'camping': '🏕️', 'waterfall': '💧', 'observatory': '🔭', 'cave': '🕳️',
    'residential': '🏘️', 'recreation': '🎮', 'infrastructure': '📡', 'road': '🛣️',
    'commercial': '🏪', 'restaurant': '🍕', 'school': '🏫', 'government': '🏛️',
    'park': '🌳', 'highway': '🛣️', 'landmark': '📍', 'water': '🌊',
    'amusement': '🎡', 'parking': '🅿️', 'beach': '🏖️', 'transport': '🚌',
    'lighthouse': '🗼', 'bridge': '🌉'
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
    const y = (event.clientY - rect.top) * (650 / rect.height);
    
    let closestLocation = null;
    let minDistance = Infinity;
    
    for (const [name, coords] of Object.entries(LOCATIONS)) {
      const distance = Math.sqrt(
        Math.pow(x - coords.x, 2) + Math.pow(y - coords.y, 2)
      );
      
      if (distance < minDistance && distance < 25) {
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
        alert('No route found! Try selecting locations connected by roads.');
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
      const distance = Math.round(calculateDistance(from, to) / 3);
      const toType = LOCATIONS[to].type;
      
      let instruction = '';
      if (toType === 'highway') {
        instruction = `Take highway to ${to}`;
      } else if (toType === 'parking') {
        instruction = `Park at ${to}`;
      } else if (toType === 'transport') {
        instruction = `Head to bus stop: ${to}`;
      } else if (toType === 'road') {
        instruction = `Continue on ${to}`;
      } else {
        instruction = `Navigate to ${to}`;
      }
      
      directions.push(`${i + 1}. ${instruction} (${distance} units)`);
    }
    directions.push(`${route.length}. Arrived at ${destination}! ${getLocationIcon(LOCATIONS[destination].type)}`);
    
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
          Bloxburg GPS Navigator - Real Map Edition
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
                <option value="residential">🏘️ Residential</option>
                <option value="commercial">🏪 Commercial</option>
                <option value="restaurant">🍕 Restaurant</option>
                <option value="highway">🛣️ Highways</option>
                <option value="parking">🅿️ Parking</option>
                <option value="recreation">🎮 Recreation</option>
                <option value="transport">🚌 Transport</option>
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
              onClick={() => setMapMode(mapMode === 'detailed' ? 'roads' : 'detailed')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              🔄 {mapMode === 'detailed' ? 'Roads Only' : 'Detailed'} View
            </button>
          </div>

          {/* Route Info */}
          {route.length > 0 && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 mb-2">🎯 Route Found!</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div><span className="font-medium">Distance:</span> {routeInfo.distance} units</div>
                <div><span className="font-medium">Est. Time:</span> {Math.floor(routeInfo.time / 60)}m {routeInfo.time % 60}s</div>
                <div><span className="font-medium">Stops:</span> {route.length} locations</div>
                <div><span className="font-medium">Type:</span> Optimal Path</div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Map */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h2 className="text-xl font-bold mb-4 text-center">
                🗺️ Real Bloxburg Map - {mapMode === 'detailed' ? 'Full View' : 'Roads Only'}
              </h2>
              <div className="relative">
                <svg
                  ref={mapRef}
                  width="800"
                  height="650"
                  viewBox="0 0 800 650"
                  className="w-full h-auto border-2 border-gray-300 rounded-lg cursor-pointer"
                  style={{
                    backgroundImage: mapMode === 'detailed' 
                      ? `url(https://preview.redd.it/unofficial-new-bloxburg-map-v0-3qpojfsgnz9f1.jpeg?width=1080&crop=smart&auto=webp&s=fabf35b7c84ae9c556fea6f67df59aa0067f1cb2)`
                      : 'linear-gradient(135deg, #e3f2fd 0%, #e8f5e8 100%)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                  onClick={handleMapClick}
                >
                  {/* Road network */}
                  {Object.entries(ROAD_NETWORK).map(([from, connections]) => 
                    connections.map(to => {
                      if (!LOCATIONS[from] || !LOCATIONS[to]) return null;
                      const start = LOCATIONS[from];
                      const end = LOCATIONS[to];
                      const isHighway = from.includes('Innerloop') || to.includes('Innerloop') || from.includes('HWY') || to.includes('HWY');
                      const isInRoute = route.includes(from) && route.includes(to) && 
                        Math.abs(route.indexOf(from) - route.indexOf(to)) === 1;
                      
                      return (
                        <line
                          key={`${from}-${to}`}
                          x1={start.x}
                          y1={start.y}
                          x2={end.x}
                          y2={end.y}
                          stroke={isInRoute ? "#FF0000" : isHighway ? "#444" : "#666"}
                          strokeWidth={isInRoute ? "6" : isHighway ? "4" : "2"}
                          strokeDasharray={isHighway && !isInRoute ? "6,3" : "none"}
                          opacity={isInRoute ? "1" : "0.7"}
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
                      markerSize = 10;
                    } else if (isEnd) {
                      markerColor = '#F44336';
                      markerSize = 10;
                    } else if (isInRoute) {
                      markerColor = '#FF9800';
                      markerSize = 6;
                    } else if (type === 'highway') {
                      markerColor = '#9C27B0';
                      markerSize = 3;
                    } else if (type === 'parking') {
                      markerColor = '#607D8B';
                      markerSize = 3;
                    } else if (type === 'restaurant') {
                      markerColor = '#FF5722';
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
                          strokeWidth="2"
                          className="hover:r-8 transition-all cursor-pointer"
                        />
                        {(isStart || isEnd || isInRoute || type === 'restaurant' || type === 'school' || type === 'amusement') && (
                          <text
                            x={coords.x}
                            y={coords.y - markerSize - 2}
                            textAnchor="middle"
                            className="text-xs font-bold fill-gray-900 pointer-events-none"
                            style={{ 
                              fontSize: `${Math.max(7, markerSize)}px`,
                              textShadow: '1px 1px 2px rgba(255,255,255,0.8)'
                            }}
                          >
                            {name.length > 12 ? name.substring(0, 10) + '...' : name}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </svg>
                
                {/* Legend */}
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    <span>Start</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                    <span>Destination</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-1 bg-red-500"></div>
                    <span>Route</span>
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
                    <div className="text-sm font-medium">📍 Route: {route[0]} → {route[route.length - 1]}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      Via {route.length - 2} waypoints
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
                      <div>📍 Stops: {route.length}</div>
                      <div>🛣️ Highways: {route.filter(loc => LOCATIONS[loc]?.type === 'highway').length}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <div className="text-4xl mb-4">🗺️</div>
                  <p className="mb-2">Click locations on the map to navigate</p>
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg text-left">
                    <h4 className="font-semibold text-blue-800 mb-2">Popular Destinations:</h4>
                    <div className="space-y-1 text-xs">
                      <div>🍕 Pizza Place</div>
                      <div>🏫 Bloxburg Elementary</div>
                      <div>🎡 Ferris Wheel</div>
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