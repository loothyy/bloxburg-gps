import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Simplified approach - just use a grid of road points that cover the entire map
// Users can click anywhere and we'll route them through available paths
function createRoadGrid() {
  const roads = {};
  const gridSize = 40; // Points every 40 pixels
  let pointId = 0;
  
  // Create a grid of potential road points
  for (let x = 40; x < 760; x += gridSize) {
    for (let y = 40; y < 560; y += gridSize) {
      const id = `road_${pointId++}`;
      roads[id] = { x, y, type: 'road' };
    }
  }
  
  return roads;
}

// Create road network where each point connects to nearby points
function createRoadNetwork(roadPoints) {
  const network = {};
  const maxDistance = 60; // Max connection distance
  
  for (const [pointId, point] of Object.entries(roadPoints)) {
    network[pointId] = [];
    
    // Connect to nearby points
    for (const [otherId, otherPoint] of Object.entries(roadPoints)) {
      if (pointId !== otherId) {
        const distance = Math.sqrt(
          Math.pow(point.x - otherPoint.x, 2) + 
          Math.pow(point.y - otherPoint.y, 2)
        );
        
        if (distance <= maxDistance) {
          network[pointId].push(otherId);
        }
      }
    }
  }
  
  return network;
}

const ROAD_POINTS = createRoadGrid();
const ROAD_NETWORK = createRoadNetwork(ROAD_POINTS);

// Find the closest road point to any x,y coordinate
function findClosestRoadPoint(x, y) {
  let closestPoint = null;
  let minDistance = Infinity;
  
  for (const [pointId, coords] of Object.entries(ROAD_POINTS)) {
    const distance = Math.sqrt(
      Math.pow(x - coords.x, 2) + Math.pow(y - coords.y, 2)
    );
    
    if (distance < minDistance) {
      minDistance = distance;
      closestPoint = pointId;
    }
  }
  
  return closestPoint;
}

// Simple pathfinding - Dijkstra's algorithm
function findPath(startPoint, endPoint) {
  if (startPoint === endPoint) return [startPoint];
  if (!ROAD_NETWORK[startPoint] || !ROAD_NETWORK[endPoint]) return null;
  
  const distances = {};
  const previous = {};
  const unvisited = new Set(Object.keys(ROAD_POINTS));
  
  // Initialize distances
  for (const point of unvisited) {
    distances[point] = point === startPoint ? 0 : Infinity;
  }
  
  while (unvisited.size > 0) {
    // Find unvisited point with minimum distance
    let current = null;
    for (const point of unvisited) {
      if (!current || distances[point] < distances[current]) {
        current = point;
      }
    }
    
    if (distances[current] === Infinity) break;
    if (current === endPoint) break;
    
    unvisited.delete(current);
    
    // Check neighbors
    for (const neighbor of ROAD_NETWORK[current] || []) {
      if (!unvisited.has(neighbor)) continue;
      
      const distance = calculateDistance(current, neighbor);
      const newDistance = distances[current] + distance;
      
      if (newDistance < distances[neighbor]) {
        distances[neighbor] = newDistance;
        previous[neighbor] = current;
      }
    }
  }
  
  // Reconstruct path
  if (distances[endPoint] === Infinity) return null;
  
  const path = [];
  let current = endPoint;
  while (current) {
    path.unshift(current);
    current = previous[current];
  }
  
  return path;
}

// Calculate distance between two road points
function calculateDistance(point1, point2) {
  if (!ROAD_POINTS[point1] || !ROAD_POINTS[point2]) return Infinity;
  const dx = ROAD_POINTS[point1].x - ROAD_POINTS[point2].x;
  const dy = ROAD_POINTS[point1].y - ROAD_POINTS[point2].y;
  return Math.sqrt(dx * dx + dy * dy);
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

// Simplify path by removing unnecessary waypoints
function simplifyPath(path) {
  if (!path || path.length <= 2) return path;
  
  const simplified = [path[0]];
  
  for (let i = 1; i < path.length - 1; i++) {
    const prev = ROAD_POINTS[path[i - 1]];
    const curr = ROAD_POINTS[path[i]];
    const next = ROAD_POINTS[path[i + 1]];
    
    // Calculate angle change
    const angle1 = Math.atan2(curr.y - prev.y, curr.x - prev.x);
    const angle2 = Math.atan2(next.y - curr.y, next.x - curr.x);
    const angleDiff = Math.abs(angle1 - angle2);
    
    // Keep point if there's a significant direction change
    if (angleDiff > 0.3) {
      simplified.push(path[i]);
    }
  }
  
  simplified.push(path[path.length - 1]);
  return simplified;
}

function BloxburgGPS() {
  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  const [startCoords, setStartCoords] = useState(null);
  const [endCoords, setEndCoords] = useState(null);
  const [route, setRoute] = useState([]);
  const [routeInfo, setRouteInfo] = useState({ distance: 0, time: 0 });
  const [isCalculating, setIsCalculating] = useState(false);
  const mapRef = useRef(null);

  const handleMapClick = (event) => {
    const rect = mapRef.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (800 / rect.width);
    const y = (event.clientY - rect.top) * (600 / rect.height);
    
    const closestRoadPoint = findClosestRoadPoint(x, y);
    
    if (!startPoint) {
      // Set start point
      setStartPoint(closestRoadPoint);
      setStartCoords({ x, y });
      console.log('Start point set:', { x: x.toFixed(0), y: y.toFixed(0) });
    } else if (!endPoint) {
      // Set end point
      setEndPoint(closestRoadPoint);
      setEndCoords({ x, y });
      console.log('End point set:', { x: x.toFixed(0), y: y.toFixed(0) });
    } else {
      // Reset and set new start point
      setStartPoint(closestRoadPoint);
      setStartCoords({ x, y });
      setEndPoint(null);
      setEndCoords(null);
      setRoute([]);
      console.log('Reset - new start point:', { x: x.toFixed(0), y: y.toFixed(0) });
    }
  };

  const findRoute = async () => {
    if (startPoint && endPoint) {
      setIsCalculating(true);
      
      // Use setTimeout to show loading state
      setTimeout(() => {
        const path = findPath(startPoint, endPoint);
        if (path) {
          const simplifiedPath = simplifyPath(path);
          setRoute(simplifiedPath);
          setRouteInfo(calculateRouteInfo(simplifiedPath));
          console.log('Route found with', simplifiedPath.length, 'waypoints');
        } else {
          alert('No route found! Try clicking closer to roads or different locations.');
          console.log('No route found between points');
        }
        setIsCalculating(false);
      }, 100);
    }
  };

  const clearAll = () => {
    setStartPoint(null);
    setEndPoint(null);
    setStartCoords(null);
    setEndCoords(null);
    setRoute([]);
    setRouteInfo({ distance: 0, time: 0 });
    console.log('All points cleared');
  };

  const getDirections = () => {
    if (route.length < 2) return [];
    
    const directions = [];
    let stepCount = 1;
    
    // Add starting instruction
    directions.push(`${stepCount++}. Start your journey`);
    
    // Add waypoint instructions (simplified)
    const waypoints = Math.floor(route.length / 3); // Show fewer waypoints
    for (let i = 0; i < waypoints; i++) {
      const waypointIndex = Math.floor((i + 1) * route.length / (waypoints + 1));
      if (waypointIndex < route.length) {
        directions.push(`${stepCount++}. Continue straight`);
      }
    }
    
    // Add final instruction
    directions.push(`${stepCount}. You have arrived at your destination!`);
    
    return directions;
  };

  useEffect(() => {
    if (startPoint && endPoint) {
      findRoute();
    }
  }, [startPoint, endPoint]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500">
      {/* Header */}
      <div className="bg-slate-900 text-white p-4 shadow-lg">
        <h1 className="text-3xl font-bold text-center flex items-center justify-center gap-3">
          <span className="text-blue-400">🗺️</span>
          Bloxburg GPS - Click Anywhere Navigation
          <span className="text-green-400">📍</span>
        </h1>
      </div>

      <div className="container mx-auto p-4 max-w-7xl">
        {/* Control Panel */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center mb-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium">
                Start: {startCoords ? `(${startCoords.x.toFixed(0)}, ${startCoords.y.toFixed(0)})` : 'Click anywhere on map'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <span className="text-sm font-medium">
                End: {endCoords ? `(${endCoords.x.toFixed(0)}, ${endCoords.y.toFixed(0)})` : startPoint ? 'Click for destination' : 'Set start point first'}
              </span>
            </div>
            {isCalculating && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm">Calculating route...</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <button
              onClick={clearAll}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              🗑️ Clear All
            </button>
            <button
              onClick={findRoute}
              disabled={!startPoint || !endPoint || isCalculating}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              🧭 Recalculate Route
            </button>
          </div>

          {route.length > 0 && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 mb-2">🎯 Route Found!</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div><span className="font-medium">Distance:</span> {routeInfo.distance} units</div>
                <div><span className="font-medium">Est. Time:</span> {Math.floor(routeInfo.time / 60)}m {routeInfo.time % 60}s</div>
                <div><span className="font-medium">Waypoints:</span> {route.length}</div>
                <div><span className="font-medium">Status:</span> Active Route</div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Map */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h2 className="text-xl font-bold mb-4 text-center">
                🗺️ Bloxburg Map - Click Anywhere to Navigate
              </h2>
              <div className="relative">
                {/* Your hand-drawn roads as invisible overlay */}
                <div 
                  className="absolute inset-0 opacity-0 pointer-events-none"
                  style={{
                    backgroundImage: 'url(data:image/svg+xml;base64,your-road-drawing-here)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                />
                
                <svg
                  ref={mapRef}
                  width="800"
                  height="600"
                  viewBox="0 0 800 600"
                  className="w-full h-auto border-2 border-gray-300 rounded-lg cursor-crosshair"
                  style={{
                    backgroundImage: `url(https://preview.redd.it/unofficial-new-bloxburg-map-v0-3qpojfsgnz9f1.jpeg?width=1080&crop=smart&auto=webp&s=fabf35b7c84ae9c556fea6f67df59aa0067f1cb2)`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                  onClick={handleMapClick}
                >
                  {/* Route visualization - only show the main path */}
                  {route.length > 1 && route.map((pointId, index) => {
                    if (index === route.length - 1) return null;
                    const start = ROAD_POINTS[pointId];
                    const end = ROAD_POINTS[route[index + 1]];
                    
                    return (
                      <line
                        key={`route-${index}`}
                        x1={start.x}
                        y1={start.y}
                        x2={end.x}
                        y2={end.y}
                        stroke="#FF0000"
                        strokeWidth="4"
                        opacity="0.8"
                        strokeLinecap="round"
                      />
                    );
                  })}

                  {/* Start point */}
                  {startCoords && (
                    <g>
                      <circle
                        cx={startCoords.x}
                        cy={startCoords.y}
                        r="10"
                        fill="#4CAF50"
                        stroke="white"
                        strokeWidth="3"
                      />
                      <text
                        x={startCoords.x}
                        y={startCoords.y - 15}
                        textAnchor="middle"
                        className="text-sm font-bold fill-green-700"
                      >
                        START
                      </text>
                    </g>
                  )}

                  {/* End point */}
                  {endCoords && (
                    <g>
                      <circle
                        cx={endCoords.x}
                        cy={endCoords.y}
                        r="10"
                        fill="#F44336"
                        stroke="white"
                        strokeWidth="3"
                      />
                      <text
                        x={endCoords.x}
                        y={endCoords.y - 15}
                        textAnchor="middle"
                        className="text-sm font-bold fill-red-700"
                      >
                        END
                      </text>
                    </g>
                  )}

                  {/* Click hint */}
                  {!startPoint && (
                    <text
                      x="400"
                      y="300"
                      textAnchor="middle"
                      className="text-lg font-bold fill-blue-600 opacity-50"
                    >
                      Click anywhere to set START point
                    </text>
                  )}
                  {startPoint && !endPoint && (
                    <text
                      x="400"
                      y="300"
                      textAnchor="middle"
                      className="text-lg font-bold fill-red-600 opacity-50"
                    >
                      Click anywhere to set END point
                    </text>
                  )}
                </svg>
                
                {/* Legend */}
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    <span>Start Point</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                    <span>Destination</span>
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
          <div className="xl:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-4 h-fit">
              <h2 className="text-xl font-bold mb-4">🧭 Navigation</h2>
              
              {route.length > 0 ? (
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                    <div className="text-sm font-medium">📍 Route Active</div>
                    <div className="text-xs text-gray-600 mt-1">
                      GPS navigation in progress
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
                    </div>
                  ))}
                  
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-2">📊 Trip Summary</h3>
                    <div className="space-y-1 text-sm">
                      <div>🚶 Total Distance: {routeInfo.distance} units</div>
                      <div>⏱️ Estimated Time: {Math.floor(routeInfo.time / 60)}m {routeInfo.time % 60}s</div>
                      <div>🛣️ Route Points: {route.length}</div>
                      <div>📍 Route Type: Optimal Path</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <div className="text-4xl mb-4">🗺️</div>
                  <p className="mb-2">Click anywhere on the map to start</p>
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg text-left">
                    <h4 className="font-semibold text-blue-800 mb-2">Simple GPS:</h4>
                    <div className="space-y-1 text-xs">
                      <div>1. Click anywhere for START</div>
                      <div>2. Click anywhere for END</div>
                      <div>3. GPS calculates best route</div>
                      <div>4. Follow the red line!</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return <BloxburgGPS />;
}

export default App;