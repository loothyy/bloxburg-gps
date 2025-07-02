import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Road network based on your hand-drawn map
// Each road point has x, y coordinates and connections to other points
const ROAD_POINTS = {
  // Main highway loop (red roads)
  'hw1': { x: 200, y: 300, type: 'highway' },
  'hw2': { x: 300, y: 280, type: 'highway' },
  'hw3': { x: 400, y: 270, type: 'highway' },
  'hw4': { x: 500, y: 260, type: 'highway' },
  'hw5': { x: 600, y: 270, type: 'highway' },
  'hw6': { x: 650, y: 320, type: 'highway' },
  'hw7': { x: 670, y: 380, type: 'highway' },
  'hw8': { x: 650, y: 440, type: 'highway' },
  'hw9': { x: 600, y: 480, type: 'highway' },
  'hw10': { x: 500, y: 500, type: 'highway' },
  'hw11': { x: 400, y: 490, type: 'highway' },
  'hw12': { x: 300, y: 480, type: 'highway' },
  'hw13': { x: 200, y: 460, type: 'highway' },
  'hw14': { x: 150, y: 400, type: 'highway' },
  'hw15': { x: 170, y: 350, type: 'highway' },

  // Inner roads (red roads inside the loop)
  'in1': { x: 250, y: 350, type: 'road' },
  'in2': { x: 300, y: 340, type: 'road' },
  'in3': { x: 350, y: 330, type: 'road' },
  'in4': { x: 400, y: 320, type: 'road' },
  'in5': { x: 450, y: 315, type: 'road' },
  'in6': { x: 500, y: 320, type: 'road' },
  'in7': { x: 550, y: 330, type: 'road' },
  'in8': { x: 580, y: 380, type: 'road' },
  'in9': { x: 570, y: 430, type: 'road' },
  'in10': { x: 520, y: 450, type: 'road' },
  'in11': { x: 470, y: 440, type: 'road' },
  'in12': { x: 420, y: 430, type: 'road' },
  'in13': { x: 370, y: 420, type: 'road' },
  'in14': { x: 320, y: 410, type: 'road' },
  'in15': { x: 270, y: 400, type: 'road' },

  // Grid roads in central area
  'gr1': { x: 350, y: 360, type: 'road' },
  'gr2': { x: 400, y: 360, type: 'road' },
  'gr3': { x: 450, y: 360, type: 'road' },
  'gr4': { x: 500, y: 360, type: 'road' },
  'gr5': { x: 350, y: 390, type: 'road' },
  'gr6': { x: 400, y: 390, type: 'road' },
  'gr7': { x: 450, y: 390, type: 'road' },
  'gr8': { x: 500, y: 390, type: 'road' },

  // Mountain/northern green roads (dirt roads)
  'mt1': { x: 150, y: 150, type: 'dirt' },
  'mt2': { x: 200, y: 140, type: 'dirt' },
  'mt3': { x: 250, y: 160, type: 'dirt' },
  'mt4': { x: 300, y: 180, type: 'dirt' },
  'mt5': { x: 320, y: 220, type: 'dirt' },
  'mt6': { x: 280, y: 240, type: 'dirt' },
  'mt7': { x: 240, y: 260, type: 'dirt' },
  'mt8': { x: 200, y: 280, type: 'dirt' },

  // Bridge roads (blue #5698cf)
  'br1': { x: 380, y: 280, type: 'bridge' },
  'br2': { x: 420, y: 275, type: 'bridge' },
  'br3': { x: 460, y: 280, type: 'bridge' },
  'br4': { x: 480, y: 320, type: 'bridge' },
  'br5': { x: 460, y: 360, type: 'bridge' },
  'br6': { x: 420, y: 365, type: 'bridge' },
  'br7': { x: 380, y: 360, type: 'bridge' },
  'br8': { x: 360, y: 320, type: 'bridge' },

  // Bridge connectors (lime #bfff00 and purple #c800ea)
  'bc1': { x: 380, y: 300, type: 'connector' }, // connects bridge to ground
  'bc2': { x: 440, y: 295, type: 'connector' },
  'bc3': { x: 480, y: 340, type: 'connector' },
  'bc4': { x: 440, y: 380, type: 'connector' },
  'bc5': { x: 380, y: 340, type: 'connector' },

  // Eastern area roads
  'e1': { x: 700, y: 200, type: 'road' },
  'e2': { x: 720, y: 250, type: 'road' },
  'e3': { x: 710, y: 300, type: 'road' },
  'e4': { x: 700, y: 350, type: 'road' },
  'e5': { x: 720, y: 400, type: 'road' },
  'e6': { x: 700, y: 450, type: 'road' },

  // Southern area roads
  's1': { x: 250, y: 520, type: 'road' },
  's2': { x: 300, y: 530, type: 'road' },
  's3': { x: 350, y: 520, type: 'road' },
  's4': { x: 400, y: 530, type: 'road' },
  's5': { x: 450, y: 520, type: 'road' },
  's6': { x: 500, y: 530, type: 'road' },

  // Western area roads
  'w1': { x: 100, y: 250, type: 'road' },
  'w2': { x: 80, y: 300, type: 'road' },
  'w3': { x: 90, y: 350, type: 'road' },
  'w4': { x: 100, y: 400, type: 'road' },
  'w5': { x: 120, y: 450, type: 'road' }
};

// Road connections - which points connect to which
const ROAD_NETWORK = {
  // Main highway loop connections
  'hw1': ['hw2', 'hw15', 'mt8', 'in1'],
  'hw2': ['hw1', 'hw3', 'mt6', 'in2'],
  'hw3': ['hw2', 'hw4', 'mt5', 'in3', 'br1'],
  'hw4': ['hw3', 'hw5', 'in4', 'br2'],
  'hw5': ['hw4', 'hw6', 'in5', 'br3'],
  'hw6': ['hw5', 'hw7', 'in7', 'e2', 'e3'],
  'hw7': ['hw6', 'hw8', 'in8', 'e4', 'e5'],
  'hw8': ['hw7', 'hw9', 'in9', 'e5', 'e6'],
  'hw9': ['hw8', 'hw10', 'in10', 's6'],
  'hw10': ['hw9', 'hw11', 'in11', 's5', 's6'],
  'hw11': ['hw10', 'hw12', 'in12', 's4', 's5'],
  'hw12': ['hw11', 'hw13', 'in13', 's3', 's4'],
  'hw13': ['hw12', 'hw14', 'in14', 's2', 's3'],
  'hw14': ['hw13', 'hw15', 'in15', 'w4', 'w5'],
  'hw15': ['hw14', 'hw1', 'in1', 'w3', 'w4'],

  // Inner road connections
  'in1': ['hw1', 'hw15', 'in2', 'in15'],
  'in2': ['hw2', 'in1', 'in3', 'gr1'],
  'in3': ['hw3', 'in2', 'in4', 'gr1', 'gr2'],
  'in4': ['hw4', 'in3', 'in5', 'gr2', 'gr3'],
  'in5': ['hw5', 'in4', 'in6', 'gr3', 'gr4'],
  'in6': ['in5', 'in7', 'gr4'],
  'in7': ['hw6', 'in6', 'in8'],
  'in8': ['hw7', 'in7', 'in9'],
  'in9': ['hw8', 'in8', 'in10'],
  'in10': ['hw9', 'in9', 'in11', 'gr8'],
  'in11': ['hw10', 'in10', 'in12', 'gr7', 'gr8'],
  'in12': ['hw11', 'in11', 'in13', 'gr6', 'gr7'],
  'in13': ['hw12', 'in12', 'in14', 'gr5', 'gr6'],
  'in14': ['hw13', 'in13', 'in15', 'gr5'],
  'in15': ['hw14', 'in14', 'in1'],

  // Grid connections
  'gr1': ['in2', 'in3', 'gr2', 'gr5', 'bc1'],
  'gr2': ['in3', 'in4', 'gr1', 'gr3', 'gr5', 'gr6', 'bc2'],
  'gr3': ['in4', 'in5', 'gr2', 'gr4', 'gr6', 'gr7', 'bc3'],
  'gr4': ['in5', 'in6', 'gr3', 'gr7', 'gr8'],
  'gr5': ['in13', 'in14', 'gr1', 'gr2', 'gr6', 'bc5'],
  'gr6': ['in12', 'in13', 'gr2', 'gr3', 'gr5', 'gr7', 'bc4'],
  'gr7': ['in11', 'in12', 'gr3', 'gr4', 'gr6', 'gr8'],
  'gr8': ['in10', 'in11', 'gr4', 'gr7'],

  // Mountain/dirt road connections
  'mt1': ['mt2', 'w1'],
  'mt2': ['mt1', 'mt3'],
  'mt3': ['mt2', 'mt4'],
  'mt4': ['mt3', 'mt5'],
  'mt5': ['mt4', 'mt6', 'hw3'],
  'mt6': ['mt5', 'mt7', 'hw2'],
  'mt7': ['mt6', 'mt8'],
  'mt8': ['mt7', 'hw1'],

  // Bridge connections
  'br1': ['hw3', 'br2', 'br8', 'bc1'],
  'br2': ['hw4', 'br1', 'br3', 'bc2'],
  'br3': ['hw5', 'br2', 'br4', 'bc3'],
  'br4': ['br3', 'br5', 'bc3'],
  'br5': ['br4', 'br6', 'bc4'],
  'br6': ['br5', 'br7', 'bc4'],
  'br7': ['br6', 'br8', 'bc5'],
  'br8': ['br7', 'br1', 'bc1', 'bc5'],

  // Bridge connectors
  'bc1': ['br1', 'br8', 'gr1'],
  'bc2': ['br2', 'gr2'],
  'bc3': ['br3', 'br4', 'gr3'],
  'bc4': ['br5', 'br6', 'gr6'],
  'bc5': ['br7', 'br8', 'gr5'],

  // Eastern roads
  'e1': ['e2'],
  'e2': ['e1', 'e3', 'hw6'],
  'e3': ['e2', 'e4', 'hw6'],
  'e4': ['e3', 'e5', 'hw7'],
  'e5': ['e4', 'e6', 'hw7', 'hw8'],
  'e6': ['e5', 'hw8'],

  // Southern roads
  's1': ['s2'],
  's2': ['s1', 's3', 'hw13'],
  's3': ['s2', 's4', 'hw12', 'hw13'],
  's4': ['s3', 's5', 'hw11', 'hw12'],
  's5': ['s4', 's6', 'hw10', 'hw11'],
  's6': ['s5', 'hw9', 'hw10'],

  // Western roads
  'w1': ['w2', 'mt1'],
  'w2': ['w1', 'w3'],
  'w3': ['w2', 'w4', 'hw15'],
  'w4': ['w3', 'w5', 'hw14', 'hw15'],
  'w5': ['w4', 'hw14']
};

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

// A* pathfinding algorithm
function findPath(startPoint, endPoint) {
  if (startPoint === endPoint) return [startPoint];
  if (!ROAD_NETWORK[startPoint] || !ROAD_NETWORK[endPoint]) return null;
  
  const openSet = [startPoint];
  const cameFrom = {};
  const gScore = { [startPoint]: 0 };
  const fScore = { [startPoint]: calculateDistance(startPoint, endPoint) };
  
  while (openSet.length > 0) {
    let current = openSet.reduce((a, b) => 
      (fScore[a] || Infinity) < (fScore[b] || Infinity) ? a : b
    );
    
    if (current === endPoint) {
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
        fScore[neighbor] = gScore[neighbor] + calculateDistance(neighbor, endPoint);
        
        if (!openSet.includes(neighbor)) {
          openSet.push(neighbor);
        }
      }
    }
  }
  
  return null;
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
  
  const gameDistance = Math.round(totalDistance / 2);
  const estimatedTime = Math.round(gameDistance / 20 * 60);
  
  return { distance: gameDistance, time: estimatedTime };
}

function BloxburgGPS() {
  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  const [startCoords, setStartCoords] = useState(null);
  const [endCoords, setEndCoords] = useState(null);
  const [route, setRoute] = useState([]);
  const [routeInfo, setRouteInfo] = useState({ distance: 0, time: 0 });
  const [mapMode, setMapMode] = useState('detailed');
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
    } else if (!endPoint) {
      // Set end point
      setEndPoint(closestRoadPoint);
      setEndCoords({ x, y });
    } else {
      // Reset and set new start point
      setStartPoint(closestRoadPoint);
      setStartCoords({ x, y });
      setEndPoint(null);
      setEndCoords(null);
      setRoute([]);
    }
  };

  const findRoute = () => {
    if (startPoint && endPoint) {
      const path = findPath(startPoint, endPoint);
      if (path) {
        setRoute(path);
        setRouteInfo(calculateRouteInfo(path));
      } else {
        alert('No route found! The road network might not connect these points.');
      }
    }
  };

  const clearRoute = () => {
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
    let totalSteps = 0;
    
    for (let i = 0; i < route.length - 1; i++) {
      const from = route[i];
      const to = route[i + 1];
      const distance = Math.round(calculateDistance(from, to) / 2);
      const fromType = ROAD_POINTS[from].type;
      const toType = ROAD_POINTS[to].type;
      
      let instruction = '';
      if (toType === 'bridge') {
        instruction = `Take bridge route`;
      } else if (toType === 'connector') {
        instruction = `Use bridge connector`;
      } else if (toType === 'highway') {
        instruction = `Continue on highway`;
      } else if (toType === 'dirt') {
        instruction = `Take dirt road`;
      } else {
        instruction = `Continue on road`;
      }
      
      totalSteps++;
      directions.push(`${totalSteps}. ${instruction} (${distance} units)`);
    }
    
    directions.push(`${totalSteps + 1}. You have arrived at your destination!`);
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
              <span className="text-sm">
                Start: {startPoint ? `Road Point (${startCoords?.x.toFixed(0)}, ${startCoords?.y.toFixed(0)})` : 'Click on map'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <span className="text-sm">
                End: {endPoint ? `Road Point (${endCoords?.x.toFixed(0)}, ${endCoords?.y.toFixed(0)})` : 'Click on map'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <button
              onClick={clearRoute}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              🗑️ Clear All
            </button>
            <button
              onClick={() => setMapMode(mapMode === 'detailed' ? 'roads' : 'detailed')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              🔄 {mapMode === 'detailed' ? 'Show Roads Only' : 'Show Map + Roads'}
            </button>
          </div>

          {route.length > 0 && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 mb-2">🎯 Route Found!</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div><span className="font-medium">Distance:</span> {routeInfo.distance} units</div>
                <div><span className="font-medium">Est. Time:</span> {Math.floor(routeInfo.time / 60)}m {routeInfo.time % 60}s</div>
                <div><span className="font-medium">Road Points:</span> {route.length}</div>
                <div><span className="font-medium">Status:</span> Optimal Route</div>
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
                <svg
                  ref={mapRef}
                  width="800"
                  height="600"
                  viewBox="0 0 800 600"
                  className="w-full h-auto border-2 border-gray-300 rounded-lg cursor-crosshair"
                  style={{
                    backgroundImage: mapMode === 'detailed' 
                      ? `url(https://preview.redd.it/unofficial-new-bloxburg-map-v0-3qpojfsgnz9f1.jpeg?width=1080&crop=smart&auto=webp&s=fabf35b7c84ae9c556fea6f67df59aa0067f1cb2)`
                      : 'linear-gradient(135deg, #f0f8ff 0%, #f5f5dc 100%)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                  onClick={handleMapClick}
                >
                  {/* Road network visualization */}
                  {Object.entries(ROAD_NETWORK).map(([from, connections]) => 
                    connections.map(to => {
                      if (!ROAD_POINTS[from] || !ROAD_POINTS[to]) return null;
                      const start = ROAD_POINTS[from];
                      const end = ROAD_POINTS[to];
                      const isInRoute = route.includes(from) && route.includes(to) && 
                        Math.abs(route.indexOf(from) - route.indexOf(to)) === 1;
                      
                      let strokeColor = '#888';
                      if (start.type === 'highway' || end.type === 'highway') strokeColor = '#333';
                      if (start.type === 'bridge' || end.type === 'bridge') strokeColor = '#5698cf';
                      if (start.type === 'dirt' || end.type === 'dirt') strokeColor = '#8B4513';
                      if (start.type === 'connector' || end.type === 'connector') strokeColor = '#bfff00';
                      
                      if (isInRoute) strokeColor = '#FF0000';
                      
                      return (
                        <line
                          key={`${from}-${to}`}
                          x1={start.x}
                          y1={start.y}
                          x2={end.x}
                          y2={end.y}
                          stroke={strokeColor}
                          strokeWidth={isInRoute ? "4" : "2"}
                          opacity={isInRoute ? "1" : "0.6"}
                        />
                      );
                    })
                  )}

                  {/* Road points (only visible in roads mode) */}
                  {mapMode === 'roads' && Object.entries(ROAD_POINTS).map(([pointId, coords]) => {
                    let color = '#2196F3';
                    if (coords.type === 'highway') color = '#333';
                    if (coords.type === 'bridge') color = '#5698cf';
                    if (coords.type === 'dirt') color = '#8B4513';
                    if (coords.type === 'connector') color = '#bfff00';
                    
                    return (
                      <circle
                        key={pointId}
                        cx={coords.x}
                        cy={coords.y}
                        r="2"
                        fill={color}
                        opacity="0.8"
                      />
                    );
                  })}

                  {/* Start point */}
                  {startCoords && (
                    <g>
                      <circle
                        cx={startCoords.x}
                        cy={startCoords.y}
                        r="8"
                        fill="#4CAF50"
                        stroke="white"
                        strokeWidth="2"
                      />
                      <text
                        x={startCoords.x}
                        y={startCoords.y - 12}
                        textAnchor="middle"
                        className="text-xs font-bold fill-green-600"
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
                        r="8"
                        fill="#F44336"
                        stroke="white"
                        strokeWidth="2"
                      />
                      <text
                        x={endCoords.x}
                        y={endCoords.y - 12}
                        textAnchor="middle"
                        className="text-xs font-bold fill-red-600"
                      >
                        END
                      </text>
                    </g>
                  )}
                </svg>
                
                {/* Legend */}
                <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-1 bg-gray-600"></div>
                    <span>Roads</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-1 bg-gray-900"></div>
                    <span>Highway</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-1" style={{backgroundColor: '#5698cf'}}></div>
                    <span>Bridge</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-1" style={{backgroundColor: '#8B4513'}}></div>
                    <span>Dirt Road</span>
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
                      Following {route.length} road segments
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
                      <div>🛣️ Road Segments: {route.length}</div>
                      <div>📍 Route Type: Shortest Path</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <div className="text-4xl mb-4">🗺️</div>
                  <p className="mb-2">Click anywhere on the map to start navigation</p>
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg text-left">
                    <h4 className="font-semibold text-blue-800 mb-2">How to use:</h4>
                    <div className="space-y-1 text-xs">
                      <div>1. Click anywhere for START point</div>
                      <div>2. Click anywhere for END point</div>
                      <div>3. GPS finds closest roads automatically</div>
                      <div>4. Follow the red route!</div>
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