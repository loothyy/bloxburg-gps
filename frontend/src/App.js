import React, { useState, useRef } from 'react';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Simple pathfinding - just draw a direct route for now
function createDirectRoute(start, end) {
  const points = [];
  const steps = 20; // Number of intermediate points
  
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = start.x + (end.x - start.x) * t;
    const y = start.y + (end.y - start.y) * t;
    points.push({ x, y });
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
    const rect = mapRef.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (800 / rect.width);
    const y = (event.clientY - rect.top) * (600 / rect.height);
    
    if (!startCoords) {
      setStartCoords({ x, y });
      setRoute([]);
    } else if (!endCoords) {
      setEndCoords({ x, y });
      // Create route immediately
      const newRoute = createDirectRoute(startCoords, { x, y });
      setRoute(newRoute);
    } else {
      // Reset
      setStartCoords({ x, y });
      setEndCoords(null);
      setRoute([]);
    }
  };

  const clearAll = () => {
    setStartCoords(null);
    setEndCoords(null);
    setRoute([]);
    setDirectionsVisible(false);
  };

  const distance = startCoords && endCoords ? 
    Math.round(Math.sqrt(Math.pow(endCoords.x - startCoords.x, 2) + Math.pow(endCoords.y - startCoords.y, 2))) : 0;

  return (
    <div className="h-screen w-screen bg-white relative">
      {/* Google Maps style search bar */}
      <div className="absolute top-5 left-5 right-5 z-30">
        <div className="bg-white rounded-lg shadow-xl border max-w-md mx-auto">
          <div className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <input
                type="text"
                placeholder="Your location"
                value={startCoords ? `${startCoords.x.toFixed(0)}, ${startCoords.y.toFixed(0)}` : ''}
                className="flex-1 text-sm outline-none"
                readOnly
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <input
                type="text"
                placeholder="Choose destination"
                value={endCoords ? `${endCoords.x.toFixed(0)}, ${endCoords.y.toFixed(0)}` : ''}
                className="flex-1 text-sm outline-none"
                readOnly
              />
            </div>
          </div>
        </div>
      </div>

      {/* Google Maps style controls */}
      <div className="absolute top-5 right-5 z-30 space-y-3">
        <button
          onClick={() => setShowRoads(!showRoads)}
          className={`w-10 h-10 rounded-lg shadow-lg border flex items-center justify-center text-lg transition-all ${
            showRoads ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
          title="Toggle roads"
        >
          🛣
        </button>
        <button
          onClick={clearAll}
          className="w-10 h-10 bg-white rounded-lg shadow-lg border flex items-center justify-center text-lg text-gray-700 hover:bg-gray-50 transition-all"
          title="Clear"
        >
          ✕
        </button>
      </div>

      {/* Route card (Google Maps style) */}
      {route.length > 0 && (
        <div className="absolute bottom-5 left-5 right-5 z-30">
          <div className="bg-white rounded-lg shadow-xl border max-w-md mx-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  <div>
                    <div className="font-semibold text-lg">{Math.round(distance / 10)} min</div>
                    <div className="text-sm text-gray-500">{distance} units</div>
                  </div>
                </div>
                <button
                  onClick={() => setDirectionsVisible(!directionsVisible)}
                  className="text-blue-500 text-sm font-medium"
                >
                  {directionsVisible ? 'Hide' : 'Show'} steps
                </button>
              </div>
              
              {directionsVisible && (
                <div className="border-t pt-3 mt-3 space-y-2">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">1</div>
                    <span>Head toward destination</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">2</div>
                    <span>Continue straight</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">3</div>
                    <span>Arrive at destination</span>
                  </div>
                </div>
              )}
            </div>
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
              opacity="0.6"
              style={{ mixBlendMode: 'multiply' }}
            />
          )}

          {/* GPS Route line */}
          {route.length > 1 && (
            <path
              d={`M ${route.map(point => `${point.x},${point.y}`).join(' L ')}`}
              stroke="#4285f4"
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.9"
              style={{ filter: 'drop-shadow(0 2px 4px rgba(66, 133, 244, 0.3))' }}
            />
          )}

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
              <circle
                cx={startCoords.x}
                cy={startCoords.y}
                r="3"
                fill="white"
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
              <circle
                cx={endCoords.x}
                cy={endCoords.y}
                r="3"
                fill="white"
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