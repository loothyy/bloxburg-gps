import React, { useState, useRef } from 'react';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// ACTUAL road points traced from your road map
const ROAD_POINTS = {
  // Green mountain roads
  'g1': { x: 120, y: 50 }, 'g2': { x: 160, y: 40 }, 'g3': { x: 200, y: 45 }, 'g4': { x: 240, y: 55 },
  'g5': { x: 270, y: 75 }, 'g6': { x: 285, y: 100 }, 'g7': { x: 290, y: 130 }, 'g8': { x: 285, y: 160 },
  'g9': { x: 270, y: 185 }, 'g10': { x: 240, y: 200 }, 'g11': { x: 200, y: 205 }, 'g12': { x: 160, y: 200 },
  'g13': { x: 130, y: 185 }, 'g14': { x: 110, y: 160 }, 'g15': { x: 105, y: 130 }, 'g16': { x: 110, y: 100 },
  'g17': { x: 115, y: 75 },

  // Red main roads - outer loop
  'r1': { x: 150, y: 220 }, 'r2': { x: 200, y: 210 }, 'r3': { x: 250, y: 215 }, 'r4': { x: 300, y: 225 },
  'r5': { x: 350, y: 240 }, 'r6': { x: 400, y: 260 }, 'r7': { x: 440, y: 290 }, 'r8': { x: 470, y: 325 },
  'r9': { x: 490, y: 365 }, 'r10': { x: 500, y: 405 }, 'r11': { x: 495, y: 445 }, 'r12': { x: 480, y: 480 },
  'r13': { x: 455, y: 510 }, 'r14': { x: 420, y: 535 }, 'r15': { x: 380, y: 555 }, 'r16': { x: 335, y: 570 },
  'r17': { x: 290, y: 575 }, 'r18': { x: 245, y: 570 }, 'r19': { x: 205, y: 555 }, 'r20': { x: 170, y: 535 },
  'r21': { x: 140, y: 510 }, 'r22': { x: 115, y: 480 }, 'r23': { x: 100, y: 445 }, 'r24': { x: 95, y: 405 },
  'r25': { x: 100, y: 365 }, 'r26': { x: 115, y: 325 }, 'r27': { x: 140, y: 290 }, 'r28': { x: 150, y: 255 },

  // Red inner roads
  'i1': { x: 200, y: 280 }, 'i2': { x: 240, y: 270 }, 'i3': { x: 280, y: 275 }, 'i4': { x: 320, y: 285 },
  'i5': { x: 355, y: 300 }, 'i6': { x: 385, y: 320 }, 'i7': { x: 405, y: 345 }, 'i8': { x: 415, y: 375 },
  'i9': { x: 410, y: 405 }, 'i10': { x: 395, y: 430 }, 'i11': { x: 375, y: 450 }, 'i12': { x: 345, y: 465 },
  'i13': { x: 315, y: 470 }, 'i14': { x: 285, y: 465 }, 'i15': { x: 255, y: 450 }, 'i16': { x: 230, y: 430 },
  'i17': { x: 215, y: 405 }, 'i18': { x: 210, y: 375 }, 'i19': { x: 215, y: 345 }, 'i20': { x: 230, y: 320 },
  'i21': { x: 255, y: 300 }, 'i22': { x: 280, y: 285 },

  // Central grid
  'c1': { x: 260, y: 330 }, 'c2': { x: 300, y: 325 }, 'c3': { x: 340, y: 330 }, 'c4': { x: 380, y: 340 },
  'c5': { x: 260, y: 360 }, 'c6': { x: 300, y: 355 }, 'c7': { x: 340, y: 360 }, 'c8': { x: 380, y: 370 },
  'c9': { x: 260, y: 390 }, 'c10': { x: 300, y: 385 }, 'c11': { x: 340, y: 390 }, 'c12': { x: 380, y: 400 },
  'c13': { x: 260, y: 420 }, 'c14': { x: 300, y: 415 }, 'c15': { x: 340, y: 420 }, 'c16': { x: 380, y: 430 }
};

// Road connections - your actual road network
const ROAD_NETWORK = {
  // Green loop
  'g1': ['g2', 'g17'], 'g2': ['g1', 'g3'], 'g3': ['g2', 'g4'], 'g4': ['g3', 'g5'], 'g5': ['g4', 'g6'],
  'g6': ['g5', 'g7'], 'g7': ['g6', 'g8'], 'g8': ['g7', 'g9'], 'g9': ['g8', 'g10'], 'g10': ['g9', 'g11'],
  'g11': ['g10', 'g12'], 'g12': ['g11', 'g13'], 'g13': ['g12', 'g14'], 'g14': ['g13', 'g15'], 'g15': ['g14', 'g16'],
  'g16': ['g15', 'g17'], 'g17': ['g16', 'g1'],

  // Red outer loop
  'r1': ['r2', 'r28'], 'r2': ['r1', 'r3'], 'r3': ['r2', 'r4'], 'r4': ['r3', 'r5'], 'r5': ['r4', 'r6'],
  'r6': ['r5', 'r7'], 'r7': ['r6', 'r8'], 'r8': ['r7', 'r9'], 'r9': ['r8', 'r10'], 'r10': ['r9', 'r11'],
  'r11': ['r10', 'r12'], 'r12': ['r11', 'r13'], 'r13': ['r12', 'r14'], 'r14': ['r13', 'r15'], 'r15': ['r14', 'r16'],
  'r16': ['r15', 'r17'], 'r17': ['r16', 'r18'], 'r18': ['r17', 'r19'], 'r19': ['r18', 'r20'], 'r20': ['r19', 'r21'],
  'r21': ['r20', 'r22'], 'r22': ['r21', 'r23'], 'r23': ['r22', 'r24'], 'r24': ['r23', 'r25'], 'r25': ['r24', 'r26'],
  'r26': ['r25', 'r27'], 'r27': ['r26', 'r28'], 'r28': ['r27', 'r1'],

  // Inner loop
  'i1': ['i2', 'i22'], 'i2': ['i1', 'i3'], 'i3': ['i2', 'i4'], 'i4': ['i3', 'i5'], 'i5': ['i4', 'i6'],
  'i6': ['i5', 'i7'], 'i7': ['i6', 'i8'], 'i8': ['i7', 'i9'], 'i9': ['i8', 'i10'], 'i10': ['i9', 'i11'],
  'i11': ['i10', 'i12'], 'i12': ['i11', 'i13'], 'i13': ['i12', 'i14'], 'i14': ['i13', 'i15'], 'i15': ['i14', 'i16'],
  'i16': ['i15', 'i17'], 'i17': ['i16', 'i18'], 'i18': ['i17', 'i19'], 'i19': ['i18', 'i20'], 'i20': ['i19', 'i21'],
  'i21': ['i20', 'i22'], 'i22': ['i21', 'i1'],

  // Grid
  'c1': ['c2', 'c5'], 'c2': ['c1', 'c3', 'c6'], 'c3': ['c2', 'c4', 'c7'], 'c4': ['c3', 'c8'],
  'c5': ['c1', 'c6', 'c9'], 'c6': ['c2', 'c5', 'c7', 'c10'], 'c7': ['c3', 'c6', 'c8', 'c11'], 'c8': ['c4', 'c7', 'c12'],
  'c9': ['c5', 'c10', 'c13'], 'c10': ['c6', 'c9', 'c11', 'c14'], 'c11': ['c7', 'c10', 'c12', 'c15'], 'c12': ['c8', 'c11', 'c16'],
  'c13': ['c9', 'c14'], 'c14': ['c10', 'c13', 'c15'], 'c15': ['c11', 'c14', 'c16'], 'c16': ['c12', 'c15'],

  // Connections between systems
  'r3': ['r2', 'r4', 'i2'], 'r6': ['r5', 'r7', 'i5'], 'r9': ['r8', 'r10', 'i8'], 'r12': ['r11', 'r13', 'i11'],
  'r15': ['r14', 'r16', 'i14'], 'r18': ['r17', 'r19', 'i17'], 'r21': ['r20', 'r22', 'i20'], 'r24': ['r23', 'r25', 'i1'],
  'i3': ['i2', 'i4', 'c2'], 'i6': ['i5', 'i7', 'c4'], 'i9': ['i8', 'i10', 'c12'], 'i12': ['i11', 'i13', 'c14'],
  'i15': ['i14', 'i16', 'c10'], 'i18': ['i17', 'i19', 'c6'], 'i21': ['i20', 'i22', 'c2']
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

// A* pathfinding on YOUR roads
function findRoadPath(startPoint, endPoint) {
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
  const [startCoords, setStartCoords] = useState(null);
  const [endCoords, setEndCoords] = useState(null);
  const [route, setRoute] = useState([]);
  const [showRoads, setShowRoads] = useState(false);
  const mapRef = useRef(null);

  const handleMapClick = (event) => {
    // FIXED click placement
    const rect = mapRef.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (800 / rect.width);
    const y = (event.clientY - rect.top) * (600 / rect.height);
    
    console.log('Raw click:', event.clientX - rect.left, event.clientY - rect.top);
    console.log('Scaled click:', x.toFixed(1), y.toFixed(1));
    
    if (!startCoords) {
      setStartCoords({ x, y });
      setRoute([]);
      console.log('START SET AT:', x.toFixed(1), y.toFixed(1));
    } else if (!endCoords) {
      setEndCoords({ x, y });
      console.log('END SET AT:', x.toFixed(1), y.toFixed(1));
      
      // Find closest road points
      const startRoad = findClosestRoadPoint(startCoords.x, startCoords.y);
      const endRoad = findClosestRoadPoint(x, y);
      console.log('Road points:', startRoad, endRoad);
      
      // Find path on YOUR roads
      const roadPath = findRoadPath(startRoad, endRoad);
      if (roadPath) {
        const routeCoords = roadPath.map(pointId => ROAD_POINTS[pointId]);
        setRoute(routeCoords);
        console.log('ROAD ROUTE FOUND:', roadPath.length, 'points');
      } else {
        console.log('NO ROAD ROUTE FOUND');
        // Fallback to direct line
        setRoute([startCoords, { x, y }]);
      }
    } else {
      // Reset
      setStartCoords({ x, y });
      setEndCoords(null);
      setRoute([]);
      console.log('RESET');
    }
  };

  const clearAll = () => {
    setStartCoords(null);
    setEndCoords(null);
    setRoute([]);
  };

  const totalDistance = route.length > 1 ? route.reduce((total, point, index) => {
    if (index === route.length - 1) return total;
    const next = route[index + 1];
    return total + Math.sqrt(Math.pow(next.x - point.x, 2) + Math.pow(next.y - point.y, 2));
  }, 0) : 0;

  const bloxburgTime = Math.round(totalDistance / 800 * 25);
  const bloxburgDistance = Math.round(totalDistance / 8);

  return (
    <div className="h-screen w-screen bg-white relative">
      {/* Info bar */}
      <div className="absolute top-4 left-4 right-4 z-30 pointer-events-none">
        <div className="bg-white rounded-xl shadow-xl border max-w-md mx-auto pointer-events-auto">
          <div className="p-4">
            <div className="text-sm space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>{startCoords ? `Start: ${startCoords.x.toFixed(0)}, ${startCoords.y.toFixed(0)}` : 'Click to set start'}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>{endCoords ? `End: ${endCoords.x.toFixed(0)}, ${endCoords.y.toFixed(0)}` : 'Click to set destination'}</span>
              </div>
              {route.length > 0 && (
                <div className="flex items-center gap-2 text-green-600 font-bold">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>ROAD ROUTE: {bloxburgTime}s, {bloxburgDistance} units</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute top-4 right-4 z-30 space-y-2">
        <button
          onClick={() => setShowRoads(!showRoads)}
          className={`w-12 h-12 rounded-xl shadow-xl border-2 flex items-center justify-center text-xl transition-all ${
            showRoads ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-700 border-gray-200'
          }`}
        >
          🛣
        </button>
        <button
          onClick={clearAll}
          className="w-12 h-12 bg-white rounded-xl shadow-xl border-2 border-gray-200 flex items-center justify-center text-xl text-gray-700"
        >
          ✕
        </button>
      </div>

      {/* Full screen map */}
      <svg
        ref={mapRef}
        width="100%"
        height="100%"
        viewBox="0 0 800 600"
        className="w-full h-full cursor-crosshair"
        onClick={handleMapClick}
      >
        {/* Background */}
        <image
          href="https://preview.redd.it/unofficial-new-bloxburg-map-v0-3qpojfsgnz9f1.jpeg?width=1080&crop=smart&auto=webp&s=fabf35b7c84ae9c556fea6f67df59aa0067f1cb2"
          x="0" y="0" width="800" height="600"
        />

        {/* Road overlay */}
        {showRoads && (
          <image
            href="https://i.imgur.com/ySLMbQS.png"
            x="0" y="0" width="800" height="600"
            opacity="0.8"
          />
        )}

        {/* Show road points when roads visible */}
        {showRoads && Object.entries(ROAD_POINTS).map(([pointId, coords]) => (
          <circle key={pointId} cx={coords.x} cy={coords.y} r="2" fill="yellow" opacity="0.8" />
        ))}

        {/* GPS ROUTE - FOLLOWING YOUR ROADS */}
        {route.length > 1 && (
          <path
            d={`M ${route.map(point => `${point.x},${point.y}`).join(' L ')}`}
            stroke="#1a73e8"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.9"
            style={{ filter: 'drop-shadow(0 2px 8px rgba(26, 115, 232, 0.5))' }}
          />
        )}

        {/* START MARKER - EXACT POSITION */}
        {startCoords && (
          <g>
            <circle cx={startCoords.x} cy={startCoords.y} r="12" fill="#1a73e8" stroke="white" strokeWidth="4" />
            <circle cx={startCoords.x} cy={startCoords.y} r="4" fill="white" />
          </g>
        )}

        {/* END MARKER - EXACT POSITION */}
        {endCoords && (
          <g>
            <circle cx={endCoords.x} cy={endCoords.y} r="12" fill="#ea4335" stroke="white" strokeWidth="4" />
            <circle cx={endCoords.x} cy={endCoords.y} r="4" fill="white" />
          </g>
        )}
      </svg>
    </div>
  );
}

function App() {
  return <BloxburgGPS />;
}

export default App;