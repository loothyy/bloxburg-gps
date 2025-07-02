import React, { useState, useRef, useEffect } from 'react';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function BloxburgGPS() {
  const [startCoords, setStartCoords] = useState(null);
  const [endCoords, setEndCoords] = useState(null);
  const [route, setRoute] = useState([]);
  const [showRoads, setShowRoads] = useState(true);
  const [roadImageData, setRoadImageData] = useState(null);
  const mapRef = useRef(null);
  const canvasRef = useRef(null);

  // Load road map image and get pixel data for collision detection
  useEffect(() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      canvas.width = 800;
      canvas.height = 600;
      ctx.drawImage(img, 0, 0, 800, 600);
      
      try {
        const imageData = ctx.getImageData(0, 0, 800, 600);
        setRoadImageData(imageData);
        console.log('Road map loaded for collision detection');
      } catch (e) {
        console.log('Could not load road data, using fallback');
      }
    };
    
    img.src = 'https://i.imgur.com/ySLMbQS.png';
  }, []);

  // Check if a pixel is on a road (not white/transparent)
  const isOnRoad = (x, y) => {
    if (!roadImageData) return true; // Fallback - allow clicks everywhere
    
    const pixelX = Math.floor(x);
    const pixelY = Math.floor(y);
    
    if (pixelX < 0 || pixelX >= 800 || pixelY < 0 || pixelY >= 600) return false;
    
    const index = (pixelY * 800 + pixelX) * 4;
    const r = roadImageData.data[index];
    const g = roadImageData.data[index + 1];
    const b = roadImageData.data[index + 2];
    const a = roadImageData.data[index + 3];
    
    // Check if pixel is not white/transparent (meaning it's a road)
    const isWhite = r > 240 && g > 240 && b > 240;
    const isTransparent = a < 50;
    
    return !isWhite && !isTransparent;
  };

  // Simple pathfinding that follows road pixels
  const findRoadPath = (start, end) => {
    const path = [];
    const steps = 100;
    
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = start.x + (end.x - start.x) * t;
      const y = start.y + (end.y - start.y) * t;
      
      // Try to snap to nearby roads
      let bestX = x, bestY = y;
      let minDist = Infinity;
      
      // Check nearby pixels for roads
      for (let dx = -10; dx <= 10; dx += 2) {
        for (let dy = -10; dy <= 10; dy += 2) {
          const checkX = x + dx;
          const checkY = y + dy;
          
          if (isOnRoad(checkX, checkY)) {
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < minDist) {
              minDist = dist;
              bestX = checkX;
              bestY = checkY;
            }
          }
        }
      }
      
      path.push({ x: bestX, y: bestY });
    }
    
    return path;
  };

  const handleMapClick = (event) => {
    event.preventDefault();
    
    const rect = mapRef.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (800 / rect.width);
    const y = (event.clientY - rect.top) * (600 / rect.height);
    
    console.log('Click at:', x.toFixed(1), y.toFixed(1));
    
    // Check if click is on a road
    if (!isOnRoad(x, y)) {
      console.log('Not on road - click ignored');
      return;
    }
    
    console.log('On road - click accepted');
    
    if (!startCoords) {
      setStartCoords({ x, y });
      setRoute([]);
      console.log('START set at:', x.toFixed(1), y.toFixed(1));
    } else if (!endCoords) {
      setEndCoords({ x, y });
      console.log('END set at:', x.toFixed(1), y.toFixed(1));
      
      // Create road-following route
      const roadPath = findRoadPath(startCoords, { x, y });
      setRoute(roadPath);
      console.log('ROAD ROUTE created with', roadPath.length, 'points');
    } else {
      // Reset
      setStartCoords({ x, y });
      setEndCoords(null);
      setRoute([]);
      console.log('RESET to new start');
    }
  };

  const clearAll = () => {
    setStartCoords(null);
    setEndCoords(null);
    setRoute([]);
  };

  const routeDistance = route.length > 1 ? route.reduce((total, point, index) => {
    if (index === route.length - 1) return total;
    const next = route[index + 1];
    return total + Math.sqrt(Math.pow(next.x - point.x, 2) + Math.pow(next.y - point.y, 2));
  }, 0) : 0;

  const bloxburgTime = Math.round(routeDistance / 800 * 20);
  const bloxburgDistance = Math.round(routeDistance / 6);

  return (
    <div className="h-screen w-screen bg-gray-900 relative">
      {/* Info panel */}
      <div className="absolute top-4 left-4 right-4 z-30 pointer-events-none">
        <div className="bg-black bg-opacity-80 text-white rounded-lg p-4 max-w-md mx-auto pointer-events-auto">
          <div className="text-sm space-y-2">
            <div className="text-green-400 font-bold">🛣️ ROAD-ONLY GPS</div>
            <div>{startCoords ? `✅ Start: (${startCoords.x.toFixed(0)}, ${startCoords.y.toFixed(0)})` : '❌ Click on a ROAD to set start'}</div>
            <div>{endCoords ? `✅ End: (${endCoords.x.toFixed(0)}, ${endCoords.y.toFixed(0)})` : '❌ Click on a ROAD to set destination'}</div>
            {route.length > 0 && (
              <div className="text-blue-400 font-bold">
                🚗 ROUTE: {bloxburgTime}s • {bloxburgDistance} units
              </div>
            )}
            <div className="text-yellow-400 text-xs">
              💡 Only clicks on roads work!
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute top-4 right-4 z-30 space-y-2">
        <button
          onClick={() => setShowRoads(!showRoads)}
          className={`w-12 h-12 rounded-lg shadow-lg border-2 flex items-center justify-center text-xl transition-all ${
            showRoads ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-800 text-white border-gray-600'
          }`}
        >
          🛣
        </button>
        <button
          onClick={clearAll}
          className="w-12 h-12 bg-red-600 rounded-lg shadow-lg border-2 border-red-600 flex items-center justify-center text-xl text-white"
        >
          ✕
        </button>
      </div>

      {/* Status */}
      {!roadImageData && (
        <div className="absolute bottom-4 left-4 right-4 z-30">
          <div className="bg-yellow-600 text-white p-3 rounded-lg text-center max-w-sm mx-auto">
            Loading road detection...
          </div>
        </div>
      )}

      {/* Full screen map */}
      <svg
        ref={mapRef}
        width="100%"
        height="100%"
        viewBox="0 0 800 600"
        className="w-full h-full cursor-crosshair"
        onClick={handleMapClick}
        style={{ backgroundColor: '#000' }}
      >
        {/* Background map */}
        <image
          href="https://preview.redd.it/unofficial-new-bloxburg-map-v0-3qpojfsgnz9f1.jpeg?width=1080&crop=smart&auto=webp&s=fabf35b7c84ae9c556fea6f67df59aa0067f1cb2"
          x="0" y="0" width="800" height="600"
        />

        {/* Road overlay - always visible for road detection */}
        <image
          href="https://i.imgur.com/ySLMbQS.png"
          x="0" y="0" width="800" height="600"
          opacity={showRoads ? "0.8" : "0"}
          style={{ mixBlendMode: 'multiply' }}
        />

        {/* GPS route - thick blue line following roads */}
        {route.length > 1 && (
          <path
            d={`M ${route.map(point => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(' L ')}`}
            stroke="#00aaff"
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.9"
            style={{ 
              filter: 'drop-shadow(0 0 10px rgba(0, 170, 255, 0.6))',
              strokeDasharray: '20,10',
              animation: 'dash 3s linear infinite'
            }}
          />
        )}

        {/* Start marker */}
        {startCoords && (
          <g>
            <circle
              cx={startCoords.x}
              cy={startCoords.y}
              r="15"
              fill="#00ff00"
              stroke="#000"
              strokeWidth="3"
            />
            <circle
              cx={startCoords.x}
              cy={startCoords.y}
              r="6"
              fill="#000"
            />
          </g>
        )}

        {/* End marker */}
        {endCoords && (
          <g>
            <circle
              cx={endCoords.x}
              cy={endCoords.y}
              r="15"
              fill="#ff0000"
              stroke="#000"
              strokeWidth="3"
            />
            <circle
              cx={endCoords.x}
              cy={endCoords.y}
              r="6"
              fill="#000"
            />
          </g>
        )}
      </svg>

      {/* Hidden canvas for road detection */}
      <canvas
        ref={canvasRef}
        width="800"
        height="600"
        style={{ display: 'none' }}
      />

      <style jsx>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -30;
          }
        }
      `}</style>
    </div>
  );
}

function App() {
  return <BloxburgGPS />;
}

export default App;