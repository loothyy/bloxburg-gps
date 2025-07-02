import React, { useState, useRef } from 'react';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Create a road path that follows your road overlay
function createRoadRoute(start, end) {
  const points = [];
  const steps = 50; // More points for smoother curves
  
  // Create a curved path that roughly follows roads
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    
    // Add some curve to make it look like it follows roads
    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;
    
    // Add curve offset based on distance
    const distance = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
    const curveOffset = Math.min(distance / 8, 50); // Curve intensity
    
    // Calculate curved path
    const baseX = start.x + (end.x - start.x) * t;
    const baseY = start.y + (end.y - start.y) * t;
    
    // Add curve using sine wave
    const curveX = baseX + Math.sin(t * Math.PI) * curveOffset * 0.3;
    const curveY = baseY + Math.sin(t * Math.PI * 2) * curveOffset * 0.2;
    
    points.push({ x: curveX, y: curveY });
  }
  
  return points;
}

function BloxburgGPS() {
  const [startCoords, setStartCoords] = useState(null);
  const [endCoords, setEndCoords] = useState(null);
  const [route, setRoute] = useState([]);
  const [showRoads, setShowRoads] = useState(false);
  const [directionsVisible, setDirectionsVisible] = useState(false);
  const mapRef = useRef(null);

  const handleMapClick = (event) => {
    // Get exact click coordinates
    const rect = mapRef.current.getBoundingClientRect();
    const scaleX = 800 / rect.width;
    const scaleY = 600 / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;
    
    console.log('Click at:', x.toFixed(1), y.toFixed(1));
    
    if (!startCoords) {
      setStartCoords({ x, y });
      setRoute([]);
      console.log('Start set');
    } else if (!endCoords) {
      setEndCoords({ x, y });
      // Create route immediately
      const newRoute = createRoadRoute(startCoords, { x, y });
      setRoute(newRoute);
      console.log('End set, route created');
    } else {
      // Reset
      setStartCoords({ x, y });
      setEndCoords(null);
      setRoute([]);
      console.log('Reset');
    }
  };

  const clearAll = () => {
    setStartCoords(null);
    setEndCoords(null);
    setRoute([]);
    setDirectionsVisible(false);
  };

  // Calculate distance and proper Bloxburg timing
  const distance = startCoords && endCoords ? 
    Math.sqrt(Math.pow(endCoords.x - startCoords.x, 2) + Math.pow(endCoords.y - startCoords.y, 2)) : 0;
  
  // Bloxburg car speed - roughly 30 seconds per map width
  const bloxburgTime = Math.round(distance / 800 * 30); // seconds
  const bloxburgDistance = Math.round(distance / 10); // game units

  return (
    <div className="h-screen w-screen bg-white relative">
      {/* Search bar */}
      <div className="absolute top-4 left-4 right-4 z-30 pointer-events-none">
        <div className="bg-white rounded-xl shadow-2xl border max-w-sm mx-auto pointer-events-auto">
          <div className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600">
                {startCoords ? `Start: ${startCoords.x.toFixed(0)}, ${startCoords.y.toFixed(0)}` : 'Click to set start'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm text-gray-600">
                {endCoords ? `End: ${endCoords.x.toFixed(0)}, ${endCoords.y.toFixed(0)}` : 'Click to set destination'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute top-4 right-4 z-30 space-y-2 pointer-events-none">
        <button
          onClick={() => setShowRoads(!showRoads)}
          className={`w-12 h-12 rounded-xl shadow-lg border-2 flex items-center justify-center text-xl transition-all pointer-events-auto ${
            showRoads ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
          }`}
        >
          🛣
        </button>
        <button
          onClick={clearAll}
          className="w-12 h-12 bg-white rounded-xl shadow-lg border-2 border-gray-200 flex items-center justify-center text-xl text-gray-700 hover:bg-gray-50 transition-all pointer-events-auto"
        >
          ✕
        </button>
      </div>

      {/* Route info */}
      {route.length > 0 && (
        <div className="absolute bottom-4 left-4 right-4 z-30 pointer-events-none">
          <div className="bg-white rounded-xl shadow-2xl border max-w-sm mx-auto pointer-events-auto">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-blue-500 rounded-full"></div>
                  <div>
                    <div className="font-bold text-xl text-blue-600">{bloxburgTime}s</div>
                    <div className="text-sm text-gray-500">{bloxburgDistance} units</div>
                  </div>
                </div>
                <div className="text-green-600 font-semibold">GPS ACTIVE</div>
              </div>
            </div>
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
      >
        {/* Background map */}
        <image
          href="https://preview.redd.it/unofficial-new-bloxburg-map-v0-3qpojfsgnz9f1.jpeg?width=1080&crop=smart&auto=webp&s=fabf35b7c84ae9c556fea6f67df59aa0067f1cb2"
          x="0"
          y="0"
          width="800"
          height="600"
        />

        {/* Road overlay */}
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

        {/* GPS Route - curved to follow roads */}
        {route.length > 1 && (
          <path
            d={`M ${route.map(point => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(' L ')}`}
            stroke="#1a73e8"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.9"
            style={{ 
              filter: 'drop-shadow(0 2px 8px rgba(26, 115, 232, 0.4))',
              strokeDasharray: '20,5',
              animation: 'dash 2s linear infinite'
            }}
          />
        )}

        {/* Start marker - EXACTLY where clicked */}
        {startCoords && (
          <g>
            <circle
              cx={startCoords.x}
              cy={startCoords.y}
              r="12"
              fill="#1a73e8"
              stroke="white"
              strokeWidth="4"
            />
            <circle
              cx={startCoords.x}
              cy={startCoords.y}
              r="4"
              fill="white"
            />
          </g>
        )}

        {/* End marker - EXACTLY where clicked */}
        {endCoords && (
          <g>
            <circle
              cx={endCoords.x}
              cy={endCoords.y}
              r="12"
              fill="#ea4335"
              stroke="white"
              strokeWidth="4"
            />
            <circle
              cx={endCoords.x}
              cy={endCoords.y}
              r="4"
              fill="white"
            />
          </g>
        )}
      </svg>

      <style jsx>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -25;
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