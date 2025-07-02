import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Much simpler and faster - sparse grid every 50 pixels
function createSimpleRoadGrid() {
  const roads = {};
  let pointId = 0;
  
  // Sparse grid - every 50 pixels (only ~200 points total)
  for (let x = 50; x < 800; x += 50) {
    for (let y = 50; y < 600; y += 50) {
      const id = `r${pointId++}`;
      roads[id] = { x, y };
    }
  }
  
  return roads;
}

// Simple connections - only 4 directions (up, down, left, right)
function createSimpleNetwork(roadPoints) {
  const network = {};
  
  for (const [pointId, point] of Object.entries(roadPoints)) {
    network[pointId] = [];
    
    // Find direct neighbors (50px away in cardinal directions)
    for (const [otherId, otherPoint] of Object.entries(roadPoints)) {
      if (pointId !== otherId) {
        const dx = Math.abs(point.x - otherPoint.x);
        const dy = Math.abs(point.y - otherPoint.y);
        
        // Only connect to immediate neighbors (50px away)
        if ((dx === 50 && dy === 0) || (dx === 0 && dy === 50)) {
          network[pointId].push(otherId);
        }
      }
    }
  }
  
  return network;
}

const ROAD_POINTS = createSimpleRoadGrid();
const ROAD_NETWORK = createSimpleNetwork(ROAD_POINTS);

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

// Simple BFS pathfinding - much faster than A*
function findPath(startPoint, endPoint) {
  if (startPoint === endPoint) return [startPoint];
  if (!ROAD_NETWORK[startPoint] || !ROAD_NETWORK[endPoint]) return null;
  
  const queue = [[startPoint]];
  const visited = new Set([startPoint]);
  
  while (queue.length > 0) {
    const path = queue.shift();
    const current = path[path.length - 1];
    
    if (current === endPoint) {
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
  
  return null;
}

function BloxburgGPS() {
  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  const [startCoords, setStartCoords] = useState(null);
  const [endCoords, setEndCoords] = useState(null);
  const [route, setRoute] = useState([]);
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
      console.log('Start point:', closestRoadPoint, 'at', x.toFixed(0), y.toFixed(0));
    } else if (!endPoint) {
      setEndPoint(closestRoadPoint);
      setEndCoords({ x, y });
      console.log('End point:', closestRoadPoint, 'at', x.toFixed(0), y.toFixed(0));
    } else {
      // Reset
      setStartPoint(closestRoadPoint);
      setStartCoords({ x, y });
      setEndPoint(null);
      setEndCoords(null);
      setRoute([]);
      console.log('Reset - new start:', closestRoadPoint);
    }
  };

  const calculateRoute = () => {
    if (startPoint && endPoint) {
      setIsCalculating(true);
      console.log('Finding path from', startPoint, 'to', endPoint);
      
      // Very fast calculation
      const path = findPath(startPoint, endPoint);
      console.log('Path result:', path ? `${path.length} points` : 'No path');
      
      if (path) {
        setRoute(path);
        console.log('Route set with', path.length, 'points');
      } else {
        alert('No route found!');
      }
      
      setIsCalculating(false);
    }
  };

  const clearAll = () => {
    setStartPoint(null);
    setEndPoint(null);
    setStartCoords(null);
    setEndCoords(null);
    setRoute([]);
    console.log('Cleared all');
  };

  useEffect(() => {
    if (startPoint && endPoint) {
      console.log('Auto-calculating route...');
      calculateRoute();
    }
  }, [startPoint, endPoint]);

  return (
    <div className="h-screen w-screen bg-gray-100 relative overflow-hidden">
      {/* Top controls */}
      <div className="absolute top-4 left-4 right-4 z-20">
        <div className="bg-white rounded-lg shadow-lg p-4 max-w-md mx-auto">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm">
                {startCoords ? `Start: (${startCoords.x.toFixed(0)}, ${startCoords.y.toFixed(0)})` : 'Click for start'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm">
                {endCoords ? `End: (${endCoords.x.toFixed(0)}, ${endCoords.y.toFixed(0)})` : 'Click for end'}
              </span>
            </div>
            {route.length > 0 && (
              <div className="text-sm text-blue-600 font-medium">
                GPS Route: {route.length} waypoints
              </div>
            )}
            {isCalculating && (
              <div className="text-sm text-orange-600">
                Calculating route...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Side controls */}
      <div className="absolute top-4 right-4 z-20 space-y-2">
        <button
          onClick={() => setShowRoads(!showRoads)}
          className={`p-3 rounded-lg shadow-lg transition-colors ${
            showRoads ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'
          }`}
          title="Toggle road overlay"
        >
          🛣️
        </button>
        <button
          onClick={clearAll}
          className="p-3 bg-white rounded-lg shadow-lg text-gray-700"
          title="Clear route"
        >
          🗑️
        </button>
        <button
          onClick={calculateRoute}
          disabled={!startPoint || !endPoint}
          className="p-3 bg-green-600 text-white rounded-lg shadow-lg disabled:bg-gray-400"
          title="Recalculate route"
        >
          🧭
        </button>
      </div>

      {/* Instructions */}
      {!startPoint && (
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <div className="bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg text-center max-w-md mx-auto">
            Click anywhere to set START point
          </div>
        </div>
      )}

      {startPoint && !endPoint && (
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <div className="bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg text-center max-w-md mx-auto">
            Click anywhere to set END point
          </div>
        </div>
      )}

      {route.length > 0 && (
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <div className="bg-green-600 text-white px-4 py-2 rounded-lg text-center max-w-md mx-auto">
            GPS Route Active - {route.length} waypoints
          </div>
        </div>
      )}

      {/* FULL SCREEN MAP */}
      <div className="w-full h-full relative">
        <svg
          ref={mapRef}
          width="100%"
          height="100%"
          viewBox="0 0 800 600"
          className="w-full h-full cursor-crosshair absolute inset-0"
          onClick={handleMapClick}
        >
          {/* Background map */}
          <image
            href="https://preview.redd.it/unofficial-new-bloxburg-map-v0-3qpojfsgnz9f1.jpeg?width=1080&crop=smart&auto=webp&s=fabf35b7c84ae9c556fea6f67df59aa0067f1cb2"
            x="0"
            y="0"
            width="800"
            height="600"
          />

          {/* Your road map - perfect 1:1 scaling */}
          {showRoads && (
            <image
              href="https://i.imgur.com/ySLMbQS.png"
              x="0"
              y="0"
              width="800"
              height="600"
              opacity="0.7"
            />
          )}

          {/* Show road grid points when roads are visible */}
          {showRoads && Object.entries(ROAD_POINTS).map(([pointId, coords]) => (
            <circle
              key={pointId}
              cx={coords.x}
              cy={coords.y}
              r="2"
              fill="yellow"
              opacity="0.5"
            />
          ))}

          {/* GPS ROUTE - BIG BLUE LINE */}
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
                stroke="#0066FF"
                strokeWidth="8"
                strokeLinecap="round"
                opacity="0.8"
              />
            );
          })}

          {/* START MARKER - BIG GREEN */}
          {startCoords && (
            <circle
              cx={startCoords.x}
              cy={startCoords.y}
              r="12"
              fill="#00FF00"
              stroke="white"
              strokeWidth="3"
            />
          )}

          {/* END MARKER - BIG RED */}
          {endCoords && (
            <circle
              cx={endCoords.x}
              cy={endCoords.y}
              r="12"
              fill="#FF0000"
              stroke="white"
              strokeWidth="3"
            />
          )}
        </svg>
      </div>
    </div>
  );
}

function App() {
  return <BloxburgGPS />;
}

export default App;