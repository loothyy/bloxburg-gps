import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// ACTUAL road points traced from YOUR drawing at https://i.imgur.com/ySLMbQS.png
const ROAD_POINTS = {
  // Green roads (northern mountains) - tracing your green curves
  'g1': { x: 120, y: 50 }, 'g2': { x: 150, y: 45 }, 'g3': { x: 180, y: 40 }, 'g4': { x: 210, y: 45 },
  'g5': { x: 240, y: 55 }, 'g6': { x: 260, y: 70 }, 'g7': { x: 275, y: 90 }, 'g8': { x: 280, y: 115 },
  'g9': { x: 275, y: 140 }, 'g10': { x: 260, y: 160 }, 'g11': { x: 240, y: 175 }, 'g12': { x: 210, y: 180 },
  'g13': { x: 180, y: 175 }, 'g14': { x: 150, y: 160 }, 'g15': { x: 130, y: 140 }, 'g16': { x: 115, y: 115 },
  'g17': { x: 110, y: 90 }, 'g18': { x: 115, y: 70 },

  // Red roads - main highway loop (tracing your red outer loop)
  'r1': { x: 150, y: 200 }, 'r2': { x: 180, y: 195 }, 'r3': { x: 210, y: 200 }, 'r4': { x: 250, y: 210 },
  'r5': { x: 290, y: 225 }, 'r6': { x: 330, y: 245 }, 'r7': { x: 370, y: 270 }, 'r8': { x: 410, y: 300 },
  'r9': { x: 440, y: 335 }, 'r10': { x: 460, y: 375 }, 'r11': { x: 470, y: 415 }, 'r12': { x: 475, y: 455 },
  'r13': { x: 470, y: 495 }, 'r14': { x: 460, y: 535 }, 'r15': { x: 440, y: 570 }, 'r16': { x: 410, y: 600 },
  'r17': { x: 370, y: 620 }, 'r18': { x: 330, y: 635 }, 'r19': { x: 290, y: 645 }, 'r20': { x: 250, y: 650 },
  'r21': { x: 210, y: 645 }, 'r22': { x: 180, y: 635 }, 'r23': { x: 150, y: 620 }, 'r24': { x: 120, y: 600 },
  'r25': { x: 95, y: 570 }, 'r26': { x: 75, y: 535 }, 'r27': { x: 60, y: 495 }, 'r28': { x: 55, y: 455 },
  'r29': { x: 60, y: 415 }, 'r30': { x: 75, y: 375 }, 'r31': { x: 95, y: 335 }, 'r32': { x: 120, y: 300 },
  'r33': { x: 150, y: 270 }, 'r34': { x: 150, y: 235 },

  // Inner red roads (your inner loop)
  'i1': { x: 200, y: 280 }, 'i2': { x: 230, y: 270 }, 'i3': { x: 270, y: 275 }, 'i4': { x: 310, y: 285 },
  'i5': { x: 350, y: 300 }, 'i6': { x: 380, y: 325 }, 'i7': { x: 400, y: 355 }, 'i8': { x: 410, y: 390 },
  'i9': { x: 405, y: 425 }, 'i10': { x: 390, y: 455 }, 'i11': { x: 365, y: 480 }, 'i12': { x: 335, y: 500 },
  'i13': { x: 300, y: 515 }, 'i14': { x: 265, y: 520 }, 'i15': { x: 230, y: 515 }, 'i16': { x: 200, y: 500 },
  'i17': { x: 175, y: 480 }, 'i18': { x: 155, y: 455 }, 'i19': { x: 145, y: 425 }, 'i20': { x: 150, y: 390 },
  'i21': { x: 165, y: 355 }, 'i22': { x: 185, y: 325 }, 'i23': { x: 200, y: 300 },

  // Central grid (red roads in middle)
  'c1': { x: 240, y: 340 }, 'c2': { x: 280, y: 335 }, 'c3': { x: 320, y: 340 }, 'c4': { x: 360, y: 350 },
  'c5': { x: 240, y: 380 }, 'c6': { x: 280, y: 375 }, 'c7': { x: 320, y: 380 }, 'c8': { x: 360, y: 390 },
  'c9': { x: 240, y: 420 }, 'c10': { x: 280, y: 415 }, 'c11': { x: 320, y: 420 }, 'c12': { x: 360, y: 430 },
  'c13': { x: 240, y: 460 }, 'c14': { x: 280, y: 455 }, 'c15': { x: 320, y: 460 }, 'c16': { x: 360, y: 470 },

  // Blue bridge roads (following your blue lines)
  'b1': { x: 290, y: 240 }, 'b2': { x: 320, y: 235 }, 'b3': { x: 350, y: 240 }, 'b4': { x: 380, y: 250 },
  'b5': { x: 400, y: 280 }, 'b6': { x: 410, y: 315 }, 'b7': { x: 405, y: 350 }, 'b8': { x: 390, y: 380 },
  'b9': { x: 365, y: 405 }, 'b10': { x: 335, y: 420 }, 'b11': { x: 305, y: 425 }, 'b12': { x: 275, y: 420 },
  'b13': { x: 250, y: 405 }, 'b14': { x: 230, y: 380 }, 'b15': { x: 225, y: 350 }, 'b16': { x: 230, y: 315 },
  'b17': { x: 250, y: 280 }, 'b18': { x: 275, y: 260 },

  // Bridge connectors (lime/purple - connecting bridge to ground)
  'con1': { x: 290, y: 260 }, 'con2': { x: 320, y: 255 }, 'con3': { x: 350, y: 260 }, 'con4': { x: 380, y: 270 },
  'con5': { x: 385, y: 300 }, 'con6': { x: 380, y: 330 }, 'con7': { x: 365, y: 360 }, 'con8': { x: 340, y: 385 },
  'con9': { x: 310, y: 405 }, 'con10': { x: 280, y: 400 }, 'con11': { x: 255, y: 385 }, 'con12': { x: 240, y: 360 },
  'con13': { x: 235, y: 330 }, 'con14': { x: 240, y: 300 }, 'con15': { x: 255, y: 280 }
};

// Road connections based on YOUR drawing - following your exact paths
const ROAD_NETWORK = {
  // Green mountain roads (your green loop)
  'g1': ['g2', 'g18'], 'g2': ['g1', 'g3'], 'g3': ['g2', 'g4'], 'g4': ['g3', 'g5'], 'g5': ['g4', 'g6'],
  'g6': ['g5', 'g7'], 'g7': ['g6', 'g8'], 'g8': ['g7', 'g9'], 'g9': ['g8', 'g10'], 'g10': ['g9', 'g11'],
  'g11': ['g10', 'g12'], 'g12': ['g11', 'g13'], 'g13': ['g12', 'g14'], 'g14': ['g13', 'g15'], 'g15': ['g14', 'g16'],
  'g16': ['g15', 'g17'], 'g17': ['g16', 'g18'], 'g18': ['g17', 'g1'],

  // Red outer loop (your main red highway)
  'r1': ['r2', 'r34'], 'r2': ['r1', 'r3'], 'r3': ['r2', 'r4'], 'r4': ['r3', 'r5'], 'r5': ['r4', 'r6'],
  'r6': ['r5', 'r7'], 'r7': ['r6', 'r8'], 'r8': ['r7', 'r9'], 'r9': ['r8', 'r10'], 'r10': ['r9', 'r11'],
  'r11': ['r10', 'r12'], 'r12': ['r11', 'r13'], 'r13': ['r12', 'r14'], 'r14': ['r13', 'r15'], 'r15': ['r14', 'r16'],
  'r16': ['r15', 'r17'], 'r17': ['r16', 'r18'], 'r18': ['r17', 'r19'], 'r19': ['r18', 'r20'], 'r20': ['r19', 'r21'],
  'r21': ['r20', 'r22'], 'r22': ['r21', 'r23'], 'r23': ['r22', 'r24'], 'r24': ['r23', 'r25'], 'r25': ['r24', 'r26'],
  'r26': ['r25', 'r27'], 'r27': ['r26', 'r28'], 'r28': ['r27', 'r29'], 'r29': ['r28', 'r30'], 'r30': ['r29', 'r31'],
  'r31': ['r30', 'r32'], 'r32': ['r31', 'r33'], 'r33': ['r32', 'r34'], 'r34': ['r33', 'r1'],

  // Inner red loop
  'i1': ['i2', 'i23'], 'i2': ['i1', 'i3'], 'i3': ['i2', 'i4'], 'i4': ['i3', 'i5'], 'i5': ['i4', 'i6'],
  'i6': ['i5', 'i7'], 'i7': ['i6', 'i8'], 'i8': ['i7', 'i9'], 'i9': ['i8', 'i10'], 'i10': ['i9', 'i11'],
  'i11': ['i10', 'i12'], 'i12': ['i11', 'i13'], 'i13': ['i12', 'i14'], 'i14': ['i13', 'i15'], 'i15': ['i14', 'i16'],
  'i16': ['i15', 'i17'], 'i17': ['i16', 'i18'], 'i18': ['i17', 'i19'], 'i19': ['i18', 'i20'], 'i20': ['i19', 'i21'],
  'i21': ['i20', 'i22'], 'i22': ['i21', 'i23'], 'i23': ['i22', 'i1'],

  // Central grid (your red grid roads)
  'c1': ['c2', 'c5'], 'c2': ['c1', 'c3', 'c6'], 'c3': ['c2', 'c4', 'c7'], 'c4': ['c3', 'c8'],
  'c5': ['c1', 'c6', 'c9'], 'c6': ['c2', 'c5', 'c7', 'c10'], 'c7': ['c3', 'c6', 'c8', 'c11'], 'c8': ['c4', 'c7', 'c12'],
  'c9': ['c5', 'c10', 'c13'], 'c10': ['c6', 'c9', 'c11', 'c14'], 'c11': ['c7', 'c10', 'c12', 'c15'], 'c12': ['c8', 'c11', 'c16'],
  'c13': ['c9', 'c14'], 'c14': ['c10', 'c13', 'c15'], 'c15': ['c11', 'c14', 'c16'], 'c16': ['c12', 'c15'],

  // Blue bridges (your blue loop)
  'b1': ['b2', 'b18'], 'b2': ['b1', 'b3'], 'b3': ['b2', 'b4'], 'b4': ['b3', 'b5'], 'b5': ['b4', 'b6'],
  'b6': ['b5', 'b7'], 'b7': ['b6', 'b8'], 'b8': ['b7', 'b9'], 'b9': ['b8', 'b10'], 'b10': ['b9', 'b11'],
  'b11': ['b10', 'b12'], 'b12': ['b11', 'b13'], 'b13': ['b12', 'b14'], 'b14': ['b13', 'b15'], 'b15': ['b14', 'b16'],
  'b16': ['b15', 'b17'], 'b17': ['b16', 'b18'], 'b18': ['b17', 'b1'],

  // Bridge connectors (connecting bridge to ground level)
  'con1': ['b1', 'c2'], 'con2': ['b2', 'c3'], 'con3': ['b3', 'c4'], 'con4': ['b4', 'i5'],
  'con5': ['b5', 'i6'], 'con6': ['b6', 'i7'], 'con7': ['b7', 'c8'], 'con8': ['b8', 'c12'],
  'con9': ['b9', 'c11'], 'con10': ['b10', 'c10'], 'con11': ['b11', 'c9'], 'con12': ['b12', 'c5'],
  'con13': ['b13', 'c1'], 'con14': ['b14', 'i21'], 'con15': ['b15', 'i22'],

  // Cross connections between loops (following your connection lines)
  'r4': ['r3', 'r5', 'i2'], 'r8': ['r7', 'r9', 'i5'], 'r12': ['r11', 'r13', 'i9'], 'r16': ['r15', 'r17', 'i12'],
  'r20': ['r19', 'r21', 'i14'], 'r24': ['r23', 'r25', 'i17'], 'r28': ['r27', 'r29', 'i19'], 'r32': ['r31', 'r33', 'i22'],
  'i3': ['i2', 'i4', 'c2'], 'i6': ['i5', 'i7', 'c4'], 'i10': ['i9', 'i11', 'c11'], 'i15': ['i14', 'i16', 'c14'],
  'i20': ['i19', 'i21', 'c5'], 'g12': ['g11', 'g13', 'r3'], 'g16': ['g15', 'g17', 'r32']
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

// BFS pathfinding to follow YOUR roads
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
  const mapRef = useRef(null);

  const handleMapClick = (event) => {
    const rect = mapRef.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (800 / rect.width);
    const y = (event.clientY - rect.top) * (600 / rect.height);
    
    const closestRoadPoint = findClosestRoadPoint(x, y);
    
    if (!startPoint) {
      setStartPoint(closestRoadPoint);
      setStartCoords({ x, y });
      console.log('START:', closestRoadPoint, 'at', x.toFixed(0), y.toFixed(0));
    } else if (!endPoint) {
      setEndPoint(closestRoadPoint);
      setEndCoords({ x, y });
      console.log('END:', closestRoadPoint, 'at', x.toFixed(0), y.toFixed(0));
      
      // Calculate route immediately
      const path = findPath(closestRoadPoint, startPoint);
      if (path) {
        setRoute(path.reverse()); // Reverse to go from start to end
        console.log('ROUTE FOUND:', path.length, 'points');
      } else {
        console.log('NO ROUTE FOUND');
        alert('No route found on the road network!');
      }
    } else {
      // Reset
      setStartPoint(closestRoadPoint);
      setStartCoords({ x, y });
      setEndPoint(null);
      setEndCoords(null);
      setRoute([]);
      console.log('RESET - new start:', closestRoadPoint);
    }
  };

  const clearAll = () => {
    setStartPoint(null);
    setEndPoint(null);
    setStartCoords(null);
    setEndCoords(null);
    setRoute([]);
  };

  return (
    <div className="h-screen w-screen bg-gray-100 relative overflow-hidden">
      {/* Top info */}
      <div className="absolute top-4 left-4 right-4 z-20">
        <div className="bg-white rounded-lg shadow-lg p-4 max-w-md mx-auto">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm">
                {startPoint ? `Start: ${startPoint} (${startCoords?.x.toFixed(0)}, ${startCoords?.y.toFixed(0)})` : 'Click for start'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm">
                {endPoint ? `End: ${endPoint} (${endCoords?.x.toFixed(0)}, ${endCoords?.y.toFixed(0)})` : 'Click for end'}
              </span>
            </div>
            {route.length > 0 && (
              <div className="text-sm text-blue-600 font-bold">
                🛣️ GPS ROUTE: {route.length} road points - FOLLOWING YOUR ROADS!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute top-4 right-4 z-20 space-y-2">
        <button
          onClick={() => setShowRoads(!showRoads)}
          className={`p-3 rounded-lg shadow-lg ${showRoads ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
        >
          🛣️
        </button>
        <button onClick={clearAll} className="p-3 bg-white rounded-lg shadow-lg text-gray-700">🗑️</button>
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

      {/* FULL SCREEN MAP */}
      <div className="w-full h-full relative">
        <svg
          ref={mapRef}
          width="100%"
          height="100%"
          viewBox="0 0 800 600"
          className="w-full h-full cursor-crosshair"
          onClick={handleMapClick}
        >
          {/* Background map */}
          <image
            href="https://preview.redd.it/unofficial-new-bloxburg-map-v0-3qpojfsgnz9f1.jpeg?width=1080&crop=smart&auto=webp&s=fabf35b7c84ae9c556fea6f67df59aa0067f1cb2"
            x="0" y="0" width="800" height="600"
          />

          {/* YOUR road overlay - perfectly scaled */}
          {showRoads && (
            <image
              href="https://i.imgur.com/ySLMbQS.png"
              x="0" y="0" width="800" height="600"
              opacity="0.7"
            />
          )}

          {/* Show road points when overlay is on */}
          {showRoads && Object.entries(ROAD_POINTS).map(([pointId, coords]) => (
            <circle key={pointId} cx={coords.x} cy={coords.y} r="3" fill="yellow" opacity="0.8" />
          ))}

          {/* GPS ROUTE - THICK BLUE LINE FOLLOWING YOUR ROADS */}
          {route.length > 1 && route.map((pointId, index) => {
            if (index === route.length - 1) return null;
            const start = ROAD_POINTS[pointId];
            const end = ROAD_POINTS[route[index + 1]];
            
            return (
              <line
                key={`route-${index}`}
                x1={start.x} y1={start.y}
                x2={end.x} y2={end.y}
                stroke="#0066FF"
                strokeWidth="8"
                strokeLinecap="round"
                opacity="0.9"
              />
            );
          })}

          {/* START MARKER */}
          {startCoords && (
            <circle cx={startCoords.x} cy={startCoords.y} r="15" fill="#00FF00" stroke="white" strokeWidth="4" />
          )}

          {/* END MARKER */}
          {endCoords && (
            <circle cx={endCoords.x} cy={endCoords.y} r="15" fill="#FF0000" stroke="white" strokeWidth="4" />
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