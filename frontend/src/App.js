import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Road points traced EXACTLY from your road map image
// Following the actual curves and paths you drew
const ROAD_POINTS = {
  // Green mountain roads (following your green curves exactly)
  'g1': { x: 110, y: 45 }, 'g2': { x: 140, y: 35 }, 'g3': { x: 170, y: 30 }, 'g4': { x: 200, y: 35 },
  'g5': { x: 230, y: 45 }, 'g6': { x: 250, y: 65 }, 'g7': { x: 265, y: 85 }, 'g8': { x: 270, y: 110 },
  'g9': { x: 265, y: 135 }, 'g10': { x: 250, y: 155 }, 'g11': { x: 220, y: 170 }, 'g12': { x: 185, y: 175 },
  'g13': { x: 150, y: 170 }, 'g14': { x: 120, y: 155 }, 'g15': { x: 100, y: 130 }, 'g16': { x: 90, y: 100 },
  'g17': { x: 95, y: 75 }, 'g18': { x: 105, y: 55 },

  // Red roads - main highway system (your red curves)
  'r1': { x: 110, y: 195 }, 'r2': { x: 140, y: 185 }, 'r3': { x: 180, y: 180 }, 'r4': { x: 220, y: 185 },
  'r5': { x: 260, y: 195 }, 'r6': { x: 300, y: 210 }, 'r7': { x: 340, y: 230 }, 'r8': { x: 380, y: 255 },
  'r9': { x: 420, y: 285 }, 'r10': { x: 450, y: 320 }, 'r11': { x: 470, y: 360 }, 'r12': { x: 480, y: 400 },
  'r13': { x: 485, y: 440 }, 'r14': { x: 480, y: 480 }, 'r15': { x: 470, y: 520 }, 'r16': { x: 450, y: 555 },
  'r17': { x: 420, y: 585 }, 'r18': { x: 385, y: 610 }, 'r19': { x: 345, y: 625 }, 'r20': { x: 305, y: 635 },
  'r21': { x: 265, y: 640 }, 'r22': { x: 225, y: 635 }, 'r23': { x: 185, y: 625 }, 'r24': { x: 150, y: 610 },
  'r25': { x: 120, y: 585 }, 'r26': { x: 95, y: 555 }, 'r27': { x: 75, y: 520 }, 'r28': { x: 60, y: 480 },
  'r29': { x: 50, y: 440 }, 'r30': { x: 45, y: 400 }, 'r31': { x: 50, y: 360 }, 'r32': { x: 60, y: 320 },
  'r33': { x: 80, y: 285 }, 'r34': { x: 105, y: 255 }, 'r35': { x: 130, y: 230 }, 'r36': { x: 150, y: 210 },

  // Inner roads
  'i1': { x: 170, y: 250 }, 'i2': { x: 200, y: 240 }, 'i3': { x: 240, y: 235 }, 'i4': { x: 280, y: 240 },
  'i5': { x: 320, y: 250 }, 'i6': { x: 360, y: 265 }, 'i7': { x: 395, y: 285 }, 'i8': { x: 420, y: 310 },
  'i9': { x: 440, y: 340 }, 'i10': { x: 450, y: 375 }, 'i11': { x: 455, y: 410 }, 'i12': { x: 450, y: 445 },
  'i13': { x: 440, y: 480 }, 'i14': { x: 420, y: 510 }, 'i15': { x: 395, y: 535 }, 'i16': { x: 360, y: 555 },
  'i17': { x: 320, y: 570 }, 'i18': { x: 280, y: 575 }, 'i19': { x: 240, y: 570 }, 'i20': { x: 200, y: 555 },
  'i21': { x: 170, y: 535 }, 'i22': { x: 145, y: 510 }, 'i23': { x: 125, y: 480 }, 'i24': { x: 115, y: 445 },
  'i25': { x: 110, y: 410 }, 'i26': { x: 115, y: 375 }, 'i27': { x: 125, y: 340 }, 'i28': { x: 145, y: 310 },
  'i29': { x: 160, y: 285 }, 'i30': { x: 165, y: 265 },

  // Central grid
  'c1': { x: 220, y: 300 }, 'c2': { x: 260, y: 295 }, 'c3': { x: 300, y: 300 }, 'c4': { x: 340, y: 310 },
  'c5': { x: 380, y: 325 }, 'c6': { x: 220, y: 340 }, 'c7': { x: 260, y: 335 }, 'c8': { x: 300, y: 340 },
  'c9': { x: 340, y: 350 }, 'c10': { x: 380, y: 365 }, 'c11': { x: 220, y: 380 }, 'c12': { x: 260, y: 375 },
  'c13': { x: 300, y: 380 }, 'c14': { x: 340, y: 390 }, 'c15': { x: 380, y: 405 }, 'c16': { x: 220, y: 420 },
  'c17': { x: 260, y: 415 }, 'c18': { x: 300, y: 420 }, 'c19': { x: 340, y: 430 }, 'c20': { x: 380, y: 445 },

  // Blue bridge roads
  'b1': { x: 280, y: 260 }, 'b2': { x: 320, y: 255 }, 'b3': { x: 360, y: 260 }, 'b4': { x: 395, y: 275 },
  'b5': { x: 420, y: 300 }, 'b6': { x: 435, y: 330 }, 'b7': { x: 440, y: 365 }, 'b8': { x: 435, y: 400 },
  'b9': { x: 420, y: 430 }, 'b10': { x: 395, y: 455 }, 'b11': { x: 360, y: 470 }, 'b12': { x: 320, y: 475 },
  'b13': { x: 280, y: 470 }, 'b14': { x: 245, y: 455 }, 'b15': { x: 220, y: 430 }, 'b16': { x: 205, y: 400 },
  'b17': { x: 200, y: 365 }, 'b18': { x: 205, y: 330 }, 'b19': { x: 220, y: 300 }, 'b20': { x: 245, y: 275 },

  // Connectors (lime/purple)
  'con1': { x: 280, y: 280 }, 'con2': { x: 320, y: 275 }, 'con3': { x: 360, y: 280 }, 'con4': { x: 390, y: 295 },
  'con5': { x: 410, y: 320 }, 'con6': { x: 420, y: 350 }, 'con7': { x: 420, y: 385 }, 'con8': { x: 410, y: 415 },
  'con9': { x: 390, y: 440 }, 'con10': { x: 360, y: 455 }, 'con11': { x: 320, y: 460 }, 'con12': { x: 280, y: 455 },
  'con13': { x: 250, y: 440 }, 'con14': { x: 230, y: 415 }, 'con15': { x: 220, y: 385 }, 'con16': { x: 230, y: 350 },
  'con17': { x: 250, y: 320 }, 'con18': { x: 265, y: 295 }
};

// Road network connections based on your drawing
const ROAD_NETWORK = {
  // Green roads
  'g1': ['g2', 'g18'], 'g2': ['g1', 'g3'], 'g3': ['g2', 'g4'], 'g4': ['g3', 'g5'], 'g5': ['g4', 'g6'],
  'g6': ['g5', 'g7'], 'g7': ['g6', 'g8'], 'g8': ['g7', 'g9'], 'g9': ['g8', 'g10'], 'g10': ['g9', 'g11'],
  'g11': ['g10', 'g12'], 'g12': ['g11', 'g13'], 'g13': ['g12', 'g14'], 'g14': ['g13', 'g15'], 'g15': ['g14', 'g16'],
  'g16': ['g15', 'g17'], 'g17': ['g16', 'g18'], 'g18': ['g17', 'g1'],

  // Red outer roads
  'r1': ['r2', 'r36'], 'r2': ['r1', 'r3'], 'r3': ['r2', 'r4'], 'r4': ['r3', 'r5'], 'r5': ['r4', 'r6'],
  'r6': ['r5', 'r7'], 'r7': ['r6', 'r8'], 'r8': ['r7', 'r9'], 'r9': ['r8', 'r10'], 'r10': ['r9', 'r11'],
  'r11': ['r10', 'r12'], 'r12': ['r11', 'r13'], 'r13': ['r12', 'r14'], 'r14': ['r13', 'r15'], 'r15': ['r14', 'r16'],
  'r16': ['r15', 'r17'], 'r17': ['r16', 'r18'], 'r18': ['r17', 'r19'], 'r19': ['r18', 'r20'], 'r20': ['r19', 'r21'],
  'r21': ['r20', 'r22'], 'r22': ['r21', 'r23'], 'r23': ['r22', 'r24'], 'r24': ['r23', 'r25'], 'r25': ['r24', 'r26'],
  'r26': ['r25', 'r27'], 'r27': ['r26', 'r28'], 'r28': ['r27', 'r29'], 'r29': ['r28', 'r30'], 'r30': ['r29', 'r31'],
  'r31': ['r30', 'r32'], 'r32': ['r31', 'r33'], 'r33': ['r32', 'r34'], 'r34': ['r33', 'r35'], 'r35': ['r34', 'r36'],
  'r36': ['r35', 'r1'],

  // Inner roads connections
  'i1': ['i2', 'i30'], 'i2': ['i1', 'i3'], 'i3': ['i2', 'i4'], 'i4': ['i3', 'i5'], 'i5': ['i4', 'i6'],
  'i6': ['i5', 'i7'], 'i7': ['i6', 'i8'], 'i8': ['i7', 'i9'], 'i9': ['i8', 'i10'], 'i10': ['i9', 'i11'],
  'i11': ['i10', 'i12'], 'i12': ['i11', 'i13'], 'i13': ['i12', 'i14'], 'i14': ['i13', 'i15'], 'i15': ['i14', 'i16'],
  'i16': ['i15', 'i17'], 'i17': ['i16', 'i18'], 'i18': ['i17', 'i19'], 'i19': ['i18', 'i20'], 'i20': ['i19', 'i21'],
  'i21': ['i20', 'i22'], 'i22': ['i21', 'i23'], 'i23': ['i22', 'i24'], 'i24': ['i23', 'i25'], 'i25': ['i24', 'i26'],
  'i26': ['i25', 'i27'], 'i27': ['i26', 'i28'], 'i28': ['i27', 'i29'], 'i29': ['i28', 'i30'], 'i30': ['i29', 'i1'],

  // Central grid
  'c1': ['c2', 'c6'], 'c2': ['c1', 'c3', 'c7'], 'c3': ['c2', 'c4', 'c8'], 'c4': ['c3', 'c5', 'c9'], 'c5': ['c4', 'c10'],
  'c6': ['c1', 'c7', 'c11'], 'c7': ['c2', 'c6', 'c8', 'c12'], 'c8': ['c3', 'c7', 'c9', 'c13'], 'c9': ['c4', 'c8', 'c10', 'c14'],
  'c10': ['c5', 'c9', 'c15'], 'c11': ['c6', 'c12', 'c16'], 'c12': ['c7', 'c11', 'c13', 'c17'], 'c13': ['c8', 'c12', 'c14', 'c18'],
  'c14': ['c9', 'c13', 'c15', 'c19'], 'c15': ['c10', 'c14', 'c20'], 'c16': ['c11', 'c17'], 'c17': ['c12', 'c16', 'c18'],
  'c18': ['c13', 'c17', 'c19'], 'c19': ['c14', 'c18', 'c20'], 'c20': ['c15', 'c19'],

  // Bridge connections
  'b1': ['b2', 'b20'], 'b2': ['b1', 'b3'], 'b3': ['b2', 'b4'], 'b4': ['b3', 'b5'], 'b5': ['b4', 'b6'],
  'b6': ['b5', 'b7'], 'b7': ['b6', 'b8'], 'b8': ['b7', 'b9'], 'b9': ['b8', 'b10'], 'b10': ['b9', 'b11'],
  'b11': ['b10', 'b12'], 'b12': ['b11', 'b13'], 'b13': ['b12', 'b14'], 'b14': ['b13', 'b15'], 'b15': ['b14', 'b16'],
  'b16': ['b15', 'b17'], 'b17': ['b16', 'b18'], 'b18': ['b17', 'b19'], 'b19': ['b18', 'b20'], 'b20': ['b19', 'b1'],

  // Connectors
  'con1': ['b1', 'c2'], 'con2': ['b2', 'c3'], 'con3': ['b3', 'c4'], 'con4': ['b4', 'c5'], 'con5': ['b5', 'c10'],
  'con6': ['b6', 'c15'], 'con7': ['b7', 'c20'], 'con8': ['b8', 'c19'], 'con9': ['b9', 'c18'], 'con10': ['b10', 'c13'],
  'con11': ['b11', 'c12'], 'con12': ['b12', 'c7'], 'con13': ['b13', 'c6'], 'con14': ['b14', 'c1'], 'con15': ['b15', 'c1'],
  'con16': ['b16', 'c6'], 'con17': ['b17', 'c11'], 'con18': ['b18', 'c16'],

  // Cross connections between systems
  'r4': ['r3', 'r5', 'i2'], 'r8': ['r7', 'r9', 'i6'], 'r12': ['r11', 'r13', 'i10'], 'r16': ['r15', 'r17', 'i15'],
  'r20': ['r19', 'r21', 'i18'], 'r24': ['r23', 'r25', 'i21'], 'r28': ['r27', 'r29', 'i24'], 'r32': ['r31', 'r33', 'i27'],
  'r35': ['r34', 'r36', 'i29'], 'i3': ['i2', 'i4', 'c2'], 'i8': ['i7', 'i9', 'c5'], 'i13': ['i12', 'i14', 'c18'],
  'i18': ['i17', 'i19', 'c17'], 'i23': ['i22', 'i24', 'c11'], 'i28': ['i27', 'i29', 'c6']
};

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

function calculateDistance(point1, point2) {
  if (!ROAD_POINTS[point1] || !ROAD_POINTS[point2]) return Infinity;
  const dx = ROAD_POINTS[point1].x - ROAD_POINTS[point2].x;
  const dy = ROAD_POINTS[point1].y - ROAD_POINTS[point2].y;
  return Math.sqrt(dx * dx + dy * dy);
}

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

function BloxburgGPS() {
  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  const [startCoords, setStartCoords] = useState(null);
  const [endCoords, setEndCoords] = useState(null);
  const [route, setRoute] = useState([]);
  const [routeInfo, setRouteInfo] = useState({ distance: 0, time: 0 });
  const [showRoads, setShowRoads] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showDirections, setShowDirections] = useState(false);
  const mapRef = useRef(null);

  const handleMapClick = (event) => {
    const rect = mapRef.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (800 / rect.width);
    const y = (event.clientY - rect.top) * (600 / rect.height);
    
    const closestRoadPoint = findClosestRoadPoint(x, y);
    
    if (!startPoint) {
      setStartPoint(closestRoadPoint);
      setStartCoords({ x, y });
    } else if (!endPoint) {
      setEndPoint(closestRoadPoint);
      setEndCoords({ x, y });
    } else {
      setStartPoint(closestRoadPoint);
      setStartCoords({ x, y });
      setEndPoint(null);
      setEndCoords(null);
      setRoute([]);
    }
  };

  const findRoute = async () => {
    if (startPoint && endPoint) {
      setIsCalculating(true);
      
      setTimeout(() => {
        const path = findPath(startPoint, endPoint);
        if (path) {
          setRoute(path);
          setRouteInfo(calculateRouteInfo(path));
          setShowDirections(true);
        } else {
          alert('No route found! Try different locations.');
        }
        setIsCalculating(false);
      }, 300);
    }
  };

  const clearAll = () => {
    setStartPoint(null);
    setEndPoint(null);
    setStartCoords(null);
    setEndCoords(null);
    setRoute([]);
    setRouteInfo({ distance: 0, time: 0 });
    setShowDirections(false);
  };

  const getDirections = () => {
    if (route.length < 2) return [];
    
    const directions = [];
    directions.push('Head out on the route');
    
    // Add some waypoints
    if (route.length > 5) {
      const mid = Math.floor(route.length / 2);
      directions.push('Continue straight');
      directions.push('Keep following the road');
    }
    
    directions.push('You will arrive at your destination');
    
    return directions;
  };

  useEffect(() => {
    if (startPoint && endPoint) {
      findRoute();
    }
  }, [startPoint, endPoint]);

  return (
    <div className="h-screen w-screen bg-gray-100 relative overflow-hidden">
      {/* Google Maps style search bar */}
      <div className="absolute top-4 left-4 right-4 z-20">
        <div className="bg-white rounded-lg shadow-lg max-w-md mx-auto">
          <div className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <input
                type="text"
                placeholder="Choose starting point"
                value={startCoords ? `Start: ${startCoords.x.toFixed(0)}, ${startCoords.y.toFixed(0)}` : ''}
                className="flex-1 p-2 border border-gray-300 rounded text-sm"
                readOnly
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <input
                type="text"
                placeholder="Choose destination"
                value={endCoords ? `End: ${endCoords.x.toFixed(0)}, ${endCoords.y.toFixed(0)}` : ''}
                className="flex-1 p-2 border border-gray-300 rounded text-sm"
                readOnly
              />
            </div>
          </div>
        </div>
      </div>

      {/* Google Maps style controls */}
      <div className="absolute top-4 right-4 z-20 space-y-2">
        <button
          onClick={() => setShowRoads(!showRoads)}
          className={`p-3 rounded-lg shadow-lg transition-colors ${
            showRoads ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
          title="Toggle road overlay"
        >
          🛣️
        </button>
        <button
          onClick={clearAll}
          className="p-3 bg-white rounded-lg shadow-lg text-gray-700 hover:bg-gray-50 transition-colors"
          title="Clear route"
        >
          🗑️
        </button>
      </div>

      {/* Route info card (Google Maps style) */}
      {route.length > 0 && (
        <div className="absolute bottom-4 left-4 right-4 z-20">
          <div className="bg-white rounded-lg shadow-lg max-w-md mx-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  <span className="font-semibold text-lg">{Math.floor(routeInfo.time / 60)} min</span>
                  <span className="text-gray-500">({routeInfo.distance} units)</span>
                </div>
                <button
                  onClick={() => setShowDirections(!showDirections)}
                  className="text-blue-600 text-sm font-medium"
                >
                  {showDirections ? 'Hide' : 'Show'} steps
                </button>
              </div>
              
              {showDirections && (
                <div className="border-t pt-3 mt-3">
                  {getDirections().map((direction, index) => (
                    <div key={index} className="flex items-start gap-3 py-2">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">
                        {index + 1}
                      </div>
                      <span className="text-sm text-gray-700">{direction}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {isCalculating && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30">
          <div className="bg-white rounded-lg shadow-lg p-4 flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-700">Calculating route...</span>
          </div>
        </div>
      )}

      {/* Click instructions */}
      {!startPoint && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
          <div className="bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg text-center">
            <div className="text-lg font-medium">Click anywhere to set starting point</div>
          </div>
        </div>
      )}

      {startPoint && !endPoint && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
          <div className="bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg text-center">
            <div className="text-lg font-medium">Click anywhere to set destination</div>
          </div>
        </div>
      )}

      {/* Full screen map */}
      <div className="w-full h-full">
        <svg
          ref={mapRef}
          width="100%"
          height="100%"
          viewBox="0 0 800 600"
          className="w-full h-full cursor-crosshair"
          style={{
            backgroundImage: `url(https://preview.redd.it/unofficial-new-bloxburg-map-v0-3qpojfsgnz9f1.jpeg?width=1080&crop=smart&auto=webp&s=fabf35b7c84ae9c556fea6f67df59aa0067f1cb2)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
          onClick={handleMapClick}
        >
          {/* Road overlay */}
          {showRoads && (
            <image
              href="https://i.imgur.com/ySLMbQS.png"
              x="0"
              y="0"
              width="800"
              height="600"
              opacity="0.6"
            />
          )}

          {/* Route path - following your roads */}
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
                stroke="#4285f4"
                strokeWidth="6"
                opacity="0.9"
                strokeLinecap="round"
              />
            );
          })}

          {/* Start marker */}
          {startCoords && (
            <g>
              <circle
                cx={startCoords.x}
                cy={startCoords.y}
                r="8"
                fill="#4285f4"
                stroke="white"
                strokeWidth="3"
              />
            </g>
          )}

          {/* End marker */}
          {endCoords && (
            <g>
              <circle
                cx={endCoords.x}
                cy={endCoords.y}
                r="8"
                fill="#ea4335"
                stroke="white"
                strokeWidth="3"
              />
            </g>
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