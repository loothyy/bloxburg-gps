import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Create a dense grid of road points covering the entire map
function createRoadGrid() {
  const roads = {};
  let pointId = 0;
  
  // Dense grid - every 20 pixels
  for (let x = 20; x < 780; x += 20) {
    for (let y = 20; y < 580; y += 20) {
      const id = `road_${pointId++}`;
      roads[id] = { x, y };
    }
  }
  
  return roads;
}

// Connect nearby road points
function createRoadNetwork(roadPoints) {
  const network = {};
  const maxDistance = 28; // Connect to nearby points
  
  for (const [pointId, point] of Object.entries(roadPoints)) {
    network[pointId] = [];
    
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

function findPath(startPoint, endPoint) {
  if (startPoint === endPoint) return [startPoint];
  if (!ROAD_NETWORK[startPoint] || !ROAD_NETWORK[endPoint]) return null;
  
  const openSet = [startPoint];
  const cameFrom = {};
  const gScore = { [startPoint]: 0 };
  const fScore = { [startPoint]: heuristic(startPoint, endPoint) };
  
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
      const tentativeGScore = gScore[current] + distance(current, neighbor);
      
      if (tentativeGScore < (gScore[neighbor] || Infinity)) {
        cameFrom[neighbor] = current;
        gScore[neighbor] = tentativeGScore;
        fScore[neighbor] = gScore[neighbor] + heuristic(neighbor, endPoint);
        
        if (!openSet.includes(neighbor)) {
          openSet.push(neighbor);
        }
      }
    }
  }
  
  return null;
}

function distance(point1, point2) {
  if (!ROAD_POINTS[point1] || !ROAD_POINTS[point2]) return Infinity;
  const dx = ROAD_POINTS[point1].x - ROAD_POINTS[point2].x;
  const dy = ROAD_POINTS[point1].y - ROAD_POINTS[point2].y;
  return Math.sqrt(dx * dx + dy * dy);
}

function heuristic(point1, point2) {
  return distance(point1, point2);
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
      console.log('Start:', x, y);
    } else if (!endPoint) {
      setEndPoint(closestRoadPoint);
      setEndCoords({ x, y });
      console.log('End:', x, y);
    } else {
      setStartPoint(closestRoadPoint);
      setStartCoords({ x, y });
      setEndPoint(null);
      setEndCoords(null);
      setRoute([]);
      console.log('Reset:', x, y);
    }
  };

  const calculateRoute = async () => {
    if (startPoint && endPoint) {
      setIsCalculating(true);
      console.log('Calculating route from', startPoint, 'to', endPoint);
      
      setTimeout(() => {
        const path = findPath(startPoint, endPoint);
        console.log('Path found:', path ? path.length : 'null');
        if (path) {
          setRoute(path);
        } else {
          alert('No route found!');
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
  };

  useEffect(() => {
    if (startPoint && endPoint) {
      calculateRoute();
    }
  }, [startPoint, endPoint]);

  const routeDistance = route.length > 1 ? route.reduce((total, pointId, index) => {
    if (index === route.length - 1) return total;
    return total + distance(pointId, route[index + 1]);
  }, 0) : 0;

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
                Route: {route.length} points, {Math.round(routeDistance)} units
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
        >
          🛣️
        </button>
        <button
          onClick={clearAll}
          className="p-3 bg-white rounded-lg shadow-lg text-gray-700"
        >
          🗑️
        </button>
      </div>

      {/* Loading */}
      {isCalculating && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30">
          <div className="bg-white rounded-lg shadow-lg p-4 flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span>Calculating...</span>
          </div>
        </div>
      )}

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

          {/* YOUR ROAD MAP - EXACT SAME SIZE */}
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

          {/* GPS ROUTE - THICK BLUE LINE */}
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
                stroke="#1E90FF"
                strokeWidth="6"
                strokeLinecap="round"
                opacity="0.8"
              />
            );
          })}

          {/* START MARKER */}
          {startCoords && (
            <circle
              cx={startCoords.x}
              cy={startCoords.y}
              r="10"
              fill="#00FF00"
              stroke="white"
              strokeWidth="3"
            />
          )}

          {/* END MARKER */}
          {endCoords && (
            <circle
              cx={endCoords.x}
              cy={endCoords.y}
              r="10"
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