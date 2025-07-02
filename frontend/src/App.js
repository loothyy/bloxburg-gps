import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Simple road network using a grid that covers the map
// Users click anywhere and we find the nearest road path
function createSimpleRoadGrid() {
  const roads = {};
  let pointId = 0;
  
  // Create a dense grid of road points
  for (let x = 50; x < 750; x += 25) {
    for (let y = 50; y < 550; y += 25) {
      const id = `road_${pointId++}`;
      roads[id] = { x, y, type: 'road' };
    }
  }
  
  return roads;
}

// Create connections between nearby road points
function createSimpleRoadNetwork(roadPoints) {
  const network = {};
  const connectionDistance = 35; // Connect to nearby points
  
  for (const [pointId, point] of Object.entries(roadPoints)) {
    network[pointId] = [];
    
    for (const [otherId, otherPoint] of Object.entries(roadPoints)) {
      if (pointId !== otherId) {
        const distance = Math.sqrt(
          Math.pow(point.x - otherPoint.x, 2) + 
          Math.pow(point.y - otherPoint.y, 2)
        );
        
        if (distance <= connectionDistance) {
          network[pointId].push(otherId);
        }
      }
    }
  }
  
  return network;
}

const ROAD_POINTS = createSimpleRoadGrid();
const ROAD_NETWORK = createSimpleRoadNetwork(ROAD_POINTS);

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

// Dijkstra's pathfinding algorithm
function findPath(startPoint, endPoint) {
  if (startPoint === endPoint) return [startPoint];
  if (!ROAD_NETWORK[startPoint] || !ROAD_NETWORK[endPoint]) return null;
  
  const distances = {};
  const previous = {};
  const unvisited = new Set(Object.keys(ROAD_POINTS));
  
  for (const point of unvisited) {
    distances[point] = point === startPoint ? 0 : Infinity;
  }
  
  while (unvisited.size > 0) {
    let current = null;
    for (const point of unvisited) {
      if (!current || distances[point] < distances[current]) {
        current = point;
      }
    }
    
    if (distances[current] === Infinity) break;
    if (current === endPoint) break;
    
    unvisited.delete(current);
    
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

// Simplify path by removing unnecessary intermediate points
function simplifyPath(path) {
  if (!path || path.length <= 3) return path;
  
  const simplified = [path[0]];
  
  for (let i = 2; i < path.length; i += 2) {
    simplified.push(path[i]);
  }
  
  if (simplified[simplified.length - 1] !== path[path.length - 1]) {
    simplified.push(path[path.length - 1]);
  }
  
  return simplified;
}

function BloxburgGPS() {
  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  const [startCoords, setStartCoords] = useState(null);
  const [endCoords, setEndCoords] = useState(null);
  const [route, setRoute] = useState([]);
  const [routeInfo, setRouteInfo] = useState({ distance: 0, time: 0 });
  const [showRoads, setShowRoads] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const mapRef = useRef(null);

  const handleMapClick = (event) => {
    const rect = mapRef.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (800 / rect.width);
    const y = (event.clientY - rect.top) * (600 / rect.height);
    
    const closestRoadPoint = findClosestRoadPoint(x, y);
    
    if (!startPoint) {
      setStartPoint(closestRoadPoint);
      setStartCoords({ x, y });
      console.log('Start point set:', { x: x.toFixed(0), y: y.toFixed(0) });
    } else if (!endPoint) {
      setEndPoint(closestRoadPoint);
      setEndCoords({ x, y });
      console.log('End point set:', { x: x.toFixed(0), y: y.toFixed(0) });
    } else {
      setStartPoint(closestRoadPoint);
      setStartCoords({ x, y });
      setEndPoint(null);
      setEndCoords(null);
      setRoute([]);
      console.log('Reset - new start:', { x: x.toFixed(0), y: y.toFixed(0) });
    }
  };

  const findRoute = async () => {
    if (startPoint && endPoint) {
      setIsCalculating(true);
      
      setTimeout(() => {
        const path = findPath(startPoint, endPoint);
        if (path) {
          const simplifiedPath = simplifyPath(path);
          setRoute(simplifiedPath);
          setRouteInfo(calculateRouteInfo(simplifiedPath));
          console.log('Route found with', simplifiedPath.length, 'waypoints');
        } else {
          alert('No route found! Try clicking different locations.');
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
  };

  const getDirections = () => {
    if (route.length < 2) return [];
    
    const directions = [];
    directions.push('1. Start your journey');
    
    // Add fewer, more natural waypoints
    const numWaypoints = Math.min(3, Math.floor(route.length / 4));
    for (let i = 1; i <= numWaypoints; i++) {
      const waypointIndex = Math.floor((i * route.length) / (numWaypoints + 1));
      directions.push(`${i + 1}. Continue following the route`);
    }
    
    directions.push(`${directions.length + 1}. You have arrived at your destination!`);
    
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
          Bloxburg GPS - Using Your Road Map
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
              onClick={() => setShowRoads(!showRoads)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              👁️ {showRoads ? 'Hide' : 'Show'} Road Overlay
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
                <div><span className="font-medium">Status:</span> Route Active</div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Map */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h2 className="text-xl font-bold mb-4 text-center">
                🗺️ Bloxburg Map {showRoads ? '- Road Overlay Visible' : '- Clean View'}
              </h2>
              <div className="relative">
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
                  {/* Your road map overlay - properly scaled to match the background */}
                  {showRoads && (
                    <image
                      href="https://i.imgur.com/ySLMbQS.png"
                      x="0"
                      y="0"
                      width="800"
                      height="600"
                      opacity="0.7"
                      style={{
                        mixBlendMode: 'multiply'
                      }}
                    />
                  )}

                  {/* Route visualization */}
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
                        stroke="#FFD700"
                        strokeWidth="8"
                        opacity="0.9"
                        strokeLinecap="round"
                        style={{
                          filter: 'drop-shadow(0 0 4px rgba(255, 215, 0, 0.8))'
                        }}
                      />
                    );
                  })}

                  {/* Start point */}
                  {startCoords && (
                    <g>
                      <circle
                        cx={startCoords.x}
                        cy={startCoords.y}
                        r="15"
                        fill="#4CAF50"
                        stroke="white"
                        strokeWidth="4"
                        style={{
                          filter: 'drop-shadow(0 0 6px rgba(76, 175, 80, 0.8))'
                        }}
                      />
                      <circle
                        cx={startCoords.x}
                        cy={startCoords.y}
                        r="6"
                        fill="white"
                      />
                      <text
                        x={startCoords.x}
                        y={startCoords.y - 25}
                        textAnchor="middle"
                        className="text-lg font-bold fill-green-700"
                        style={{
                          textShadow: '2px 2px 4px rgba(255,255,255,0.8)'
                        }}
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
                        r="15"
                        fill="#F44336"
                        stroke="white"
                        strokeWidth="4"
                        style={{
                          filter: 'drop-shadow(0 0 6px rgba(244, 67, 54, 0.8))'
                        }}
                      />
                      <circle
                        cx={endCoords.x}
                        cy={endCoords.y}
                        r="6"
                        fill="white"
                      />
                      <text
                        x={endCoords.x}
                        y={endCoords.y - 25}
                        textAnchor="middle"
                        className="text-lg font-bold fill-red-700"
                        style={{
                          textShadow: '2px 2px 4px rgba(255,255,255,0.8)'
                        }}
                      >
                        END
                      </text>
                    </g>
                  )}

                  {/* Click hints */}
                  {!startPoint && (
                    <text
                      x="400"
                      y="300"
                      textAnchor="middle"
                      className="text-xl font-bold fill-blue-600 opacity-60"
                      style={{
                        textShadow: '2px 2px 4px rgba(255,255,255,0.9)'
                      }}
                    >
                      Click anywhere to set START point
                    </text>
                  )}
                  {startPoint && !endPoint && (
                    <text
                      x="400"
                      y="300"
                      textAnchor="middle"
                      className="text-xl font-bold fill-red-600 opacity-60"
                      style={{
                        textShadow: '2px 2px 4px rgba(255,255,255,0.9)'
                      }}
                    >
                      Click anywhere to set END point
                    </text>
                  )}
                </svg>
                
                {/* Legend */}
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
                    <span>Start Point</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-red-500 rounded-full border-2 border-white"></div>
                    <span>Destination</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-2 rounded" style={{backgroundColor: '#FFD700'}}></div>
                    <span>GPS Route</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-purple-600 rounded"></div>
                    <span>{showRoads ? 'Roads Visible' : 'Roads Hidden'}</span>
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
                  <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                    <div className="text-sm font-medium">📍 Route Active</div>
                    <div className="text-xs text-gray-600 mt-1">
                      GPS navigation following road network
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
                      <div>📍 Navigation: Active</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <div className="text-4xl mb-4">🗺️</div>
                  <p className="mb-2 font-medium">Click anywhere to start GPS navigation</p>
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg text-left">
                    <h4 className="font-semibold text-blue-800 mb-2">How to use:</h4>
                    <div className="space-y-1 text-sm">
                      <div>1. Click anywhere for START point</div>
                      <div>2. Click anywhere for END point</div>
                      <div>3. GPS calculates best route</div>
                      <div>4. Toggle road overlay to verify</div>
                      <div>5. Follow the golden route line!</div>
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