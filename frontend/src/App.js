import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Road points traced from your actual hand-drawn map
const ROAD_POINTS = {
  // Main outer loop (red roads) - tracing your drawing clockwise from top-left
  'outer1': { x: 120, y: 180, type: 'road' },
  'outer2': { x: 160, y: 160, type: 'road' },
  'outer3': { x: 200, y: 140, type: 'road' },
  'outer4': { x: 250, y: 120, type: 'road' },
  'outer5': { x: 300, y: 110, type: 'road' },
  'outer6': { x: 350, y: 105, type: 'road' },
  'outer7': { x: 400, y: 100, type: 'road' },
  'outer8': { x: 450, y: 105, type: 'road' },
  'outer9': { x: 500, y: 110, type: 'road' },
  'outer10': { x: 550, y: 120, type: 'road' },
  'outer11': { x: 600, y: 135, type: 'road' },
  'outer12': { x: 640, y: 155, type: 'road' },
  'outer13': { x: 670, y: 180, type: 'road' },
  'outer14': { x: 690, y: 210, type: 'road' },
  'outer15': { x: 700, y: 250, type: 'road' },
  'outer16': { x: 705, y: 290, type: 'road' },
  'outer17': { x: 700, y: 330, type: 'road' },
  'outer18': { x: 690, y: 370, type: 'road' },
  'outer19': { x: 675, y: 400, type: 'road' },
  'outer20': { x: 650, y: 425, type: 'road' },
  'outer21': { x: 620, y: 445, type: 'road' },
  'outer22': { x: 580, y: 460, type: 'road' },
  'outer23': { x: 540, y: 470, type: 'road' },
  'outer24': { x: 500, y: 475, type: 'road' },
  'outer25': { x: 460, y: 480, type: 'road' },
  'outer26': { x: 420, y: 485, type: 'road' },
  'outer27': { x: 380, y: 490, type: 'road' },
  'outer28': { x: 340, y: 485, type: 'road' },
  'outer29': { x: 300, y: 480, type: 'road' },
  'outer30': { x: 260, y: 470, type: 'road' },
  'outer31': { x: 220, y: 455, type: 'road' },
  'outer32': { x: 185, y: 435, type: 'road' },
  'outer33': { x: 155, y: 410, type: 'road' },
  'outer34': { x: 130, y: 380, type: 'road' },
  'outer35': { x: 115, y: 345, type: 'road' },
  'outer36': { x: 105, y: 310, type: 'road' },
  'outer37': { x: 100, y: 275, type: 'road' },
  'outer38': { x: 105, y: 240, type: 'road' },
  'outer39': { x: 110, y: 205, type: 'road' },

  // Inner loop (red roads inside)
  'inner1': { x: 200, y: 220, type: 'road' },
  'inner2': { x: 250, y: 200, type: 'road' },
  'inner3': { x: 300, y: 190, type: 'road' },
  'inner4': { x: 350, y: 185, type: 'road' },
  'inner5': { x: 400, y: 180, type: 'road' },
  'inner6': { x: 450, y: 185, type: 'road' },
  'inner7': { x: 500, y: 195, type: 'road' },
  'inner8': { x: 540, y: 210, type: 'road' },
  'inner9': { x: 570, y: 235, type: 'road' },
  'inner10': { x: 590, y: 265, type: 'road' },
  'inner11': { x: 600, y: 300, type: 'road' },
  'inner12': { x: 595, y: 335, type: 'road' },
  'inner13': { x: 580, y: 365, type: 'road' },
  'inner14': { x: 555, y: 390, type: 'road' },
  'inner15': { x: 525, y: 410, type: 'road' },
  'inner16': { x: 490, y: 425, type: 'road' },
  'inner17': { x: 450, y: 435, type: 'road' },
  'inner18': { x: 410, y: 440, type: 'road' },
  'inner19': { x: 370, y: 435, type: 'road' },
  'inner20': { x: 330, y: 425, type: 'road' },
  'inner21': { x: 295, y: 410, type: 'road' },
  'inner22': { x: 265, y: 390, type: 'road' },
  'inner23': { x: 240, y: 365, type: 'road' },
  'inner24': { x: 220, y: 335, type: 'road' },
  'inner25': { x: 205, y: 300, type: 'road' },
  'inner26': { x: 195, y: 265, type: 'road' },
  'inner27': { x: 190, y: 230, type: 'road' },

  // Grid roads in central area (red)
  'grid1': { x: 280, y: 260, type: 'road' },
  'grid2': { x: 320, y: 250, type: 'road' },
  'grid3': { x: 360, y: 245, type: 'road' },
  'grid4': { x: 400, y: 240, type: 'road' },
  'grid5': { x: 440, y: 245, type: 'road' },
  'grid6': { x: 480, y: 255, type: 'road' },
  'grid7': { x: 280, y: 300, type: 'road' },
  'grid8': { x: 320, y: 295, type: 'road' },
  'grid9': { x: 360, y: 290, type: 'road' },
  'grid10': { x: 400, y: 285, type: 'road' },
  'grid11': { x: 440, y: 290, type: 'road' },
  'grid12': { x: 480, y: 300, type: 'road' },
  'grid13': { x: 280, y: 340, type: 'road' },
  'grid14': { x: 320, y: 335, type: 'road' },
  'grid15': { x: 360, y: 330, type: 'road' },
  'grid16': { x: 400, y: 325, type: 'road' },
  'grid17': { x: 440, y: 330, type: 'road' },
  'grid18': { x: 480, y: 340, type: 'road' },
  'grid19': { x: 280, y: 380, type: 'road' },
  'grid20': { x: 320, y: 375, type: 'road' },
  'grid21': { x: 360, y: 370, type: 'road' },
  'grid22': { x: 400, y: 365, type: 'road' },
  'grid23': { x: 440, y: 370, type: 'road' },
  'grid24': { x: 480, y: 380, type: 'road' },

  // Green dirt roads (northern area)
  'dirt1': { x: 140, y: 100, type: 'dirt' },
  'dirt2': { x: 180, y: 90, type: 'dirt' },
  'dirt3': { x: 220, y: 85, type: 'dirt' },
  'dirt4': { x: 260, y: 80, type: 'dirt' },
  'dirt5': { x: 300, y: 75, type: 'dirt' },
  'dirt6': { x: 340, y: 70, type: 'dirt' },
  'dirt7': { x: 160, y: 120, type: 'dirt' },
  'dirt8': { x: 200, y: 115, type: 'dirt' },
  'dirt9': { x: 240, y: 105, type: 'dirt' },
  'dirt10': { x: 280, y: 100, type: 'dirt' },
  'dirt11': { x: 120, y: 140, type: 'dirt' },
  'dirt12': { x: 140, y: 125, type: 'dirt' },

  // Blue bridge roads (#5698cf)
  'bridge1': { x: 350, y: 220, type: 'bridge' },
  'bridge2': { x: 390, y: 215, type: 'bridge' },
  'bridge3': { x: 430, y: 220, type: 'bridge' },
  'bridge4': { x: 470, y: 230, type: 'bridge' },
  'bridge5': { x: 480, y: 270, type: 'bridge' },
  'bridge6': { x: 470, y: 310, type: 'bridge' },
  'bridge7': { x: 430, y: 320, type: 'bridge' },
  'bridge8': { x: 390, y: 315, type: 'bridge' },
  'bridge9': { x: 350, y: 310, type: 'bridge' },
  'bridge10': { x: 320, y: 290, type: 'bridge' },
  'bridge11': { x: 320, y: 250, type: 'bridge' },

  // Bridge connectors (lime #bfff00 and purple #c800ea)
  'conn1': { x: 350, y: 240, type: 'connector' },
  'conn2': { x: 390, y: 235, type: 'connector' },
  'conn3': { x: 430, y: 240, type: 'connector' },
  'conn4': { x: 470, y: 250, type: 'connector' },
  'conn5': { x: 470, y: 290, type: 'connector' },
  'conn6': { x: 430, y: 300, type: 'connector' },
  'conn7': { x: 390, y: 295, type: 'connector' },
  'conn8': { x: 350, y: 290, type: 'connector' },

  // Extensions and connections to your drawing
  'ext1': { x: 80, y: 200, type: 'road' },
  'ext2': { x: 60, y: 250, type: 'road' },
  'ext3': { x: 70, y: 300, type: 'road' },
  'ext4': { x: 85, y: 350, type: 'road' },
  'ext5': { x: 720, y: 200, type: 'road' },
  'ext6': { x: 730, y: 250, type: 'road' },
  'ext7': { x: 725, y: 300, type: 'road' },
  'ext8': { x: 710, y: 350, type: 'road' },
  'ext9': { x: 200, y: 500, type: 'road' },
  'ext10': { x: 300, y: 510, type: 'road' },
  'ext11': { x: 400, y: 515, type: 'road' },
  'ext12': { x: 500, y: 510, type: 'road' },
  'ext13': { x: 600, y: 500, type: 'road' }
};

// Road connections based on your drawing
const ROAD_NETWORK = {
  // Outer loop connections
  'outer1': ['outer2', 'outer39', 'dirt11', 'ext1'],
  'outer2': ['outer1', 'outer3', 'dirt7'],
  'outer3': ['outer2', 'outer4', 'dirt8'],
  'outer4': ['outer3', 'outer5', 'dirt9'],
  'outer5': ['outer4', 'outer6', 'dirt10'],
  'outer6': ['outer5', 'outer7', 'dirt6'],
  'outer7': ['outer6', 'outer8', 'inner5'],
  'outer8': ['outer7', 'outer9', 'inner6'],
  'outer9': ['outer8', 'outer10', 'inner7'],
  'outer10': ['outer9', 'outer11', 'inner8'],
  'outer11': ['outer10', 'outer12', 'inner9'],
  'outer12': ['outer11', 'outer13', 'ext5'],
  'outer13': ['outer12', 'outer14', 'ext6'],
  'outer14': ['outer13', 'outer15'],
  'outer15': ['outer14', 'outer16', 'ext7'],
  'outer16': ['outer15', 'outer17'],
  'outer17': ['outer16', 'outer18', 'inner11'],
  'outer18': ['outer17', 'outer19', 'inner12'],
  'outer19': ['outer18', 'outer20', 'inner13'],
  'outer20': ['outer19', 'outer21', 'inner14'],
  'outer21': ['outer20', 'outer22', 'inner15'],
  'outer22': ['outer21', 'outer23', 'inner16'],
  'outer23': ['outer22', 'outer24', 'inner17'],
  'outer24': ['outer23', 'outer25', 'inner18'],
  'outer25': ['outer24', 'outer26', 'inner19'],
  'outer26': ['outer25', 'outer27', 'ext11'],
  'outer27': ['outer26', 'outer28'],
  'outer28': ['outer27', 'outer29', 'inner20'],
  'outer29': ['outer28', 'outer30', 'inner21'],
  'outer30': ['outer29', 'outer31', 'ext10'],
  'outer31': ['outer30', 'outer32', 'inner22'],
  'outer32': ['outer31', 'outer33', 'inner23'],
  'outer33': ['outer32', 'outer34', 'inner24'],
  'outer34': ['outer33', 'outer35', 'inner25'],
  'outer35': ['outer34', 'outer36', 'ext4'],
  'outer36': ['outer35', 'outer37', 'ext3'],
  'outer37': ['outer36', 'outer38', 'ext2'],
  'outer38': ['outer37', 'outer39', 'inner26'],
  'outer39': ['outer38', 'outer1', 'inner27'],

  // Inner loop connections
  'inner1': ['inner2', 'inner27', 'grid1'],
  'inner2': ['inner1', 'inner3', 'grid2'],
  'inner3': ['inner2', 'inner4', 'grid3'],
  'inner4': ['inner3', 'inner5', 'grid4'],
  'inner5': ['inner4', 'inner6', 'outer7', 'grid5'],
  'inner6': ['inner5', 'inner7', 'outer8', 'grid6'],
  'inner7': ['inner6', 'inner8', 'outer9'],
  'inner8': ['inner7', 'inner9', 'outer10'],
  'inner9': ['inner8', 'inner10', 'outer11'],
  'inner10': ['inner9', 'inner11'],
  'inner11': ['inner10', 'inner12', 'outer17'],
  'inner12': ['inner11', 'inner13', 'outer18'],
  'inner13': ['inner12', 'inner14', 'outer19'],
  'inner14': ['inner13', 'inner15', 'outer20'],
  'inner15': ['inner14', 'inner16', 'outer21'],
  'inner16': ['inner15', 'inner17', 'outer22'],
  'inner17': ['inner16', 'inner18', 'outer23'],
  'inner18': ['inner17', 'inner19', 'outer24'],
  'inner19': ['inner18', 'inner20', 'outer25'],
  'inner20': ['inner19', 'inner21', 'outer28'],
  'inner21': ['inner20', 'inner22', 'outer29'],
  'inner22': ['inner21', 'inner23', 'outer31'],
  'inner23': ['inner22', 'inner24', 'outer32'],
  'inner24': ['inner23', 'inner25', 'outer33'],
  'inner25': ['inner24', 'inner26', 'outer34'],
  'inner26': ['inner25', 'inner27', 'outer38'],
  'inner27': ['inner26', 'inner1', 'outer39'],

  // Grid connections (horizontal)
  'grid1': ['inner1', 'grid2', 'grid7'],
  'grid2': ['inner2', 'grid1', 'grid3', 'grid8'],
  'grid3': ['inner3', 'grid2', 'grid4', 'grid9'],
  'grid4': ['inner4', 'grid3', 'grid5', 'grid10'],
  'grid5': ['inner5', 'grid4', 'grid6', 'grid11'],
  'grid6': ['inner6', 'grid5', 'grid12'],
  'grid7': ['grid1', 'grid8', 'grid13'],
  'grid8': ['grid2', 'grid7', 'grid9', 'grid14'],
  'grid9': ['grid3', 'grid8', 'grid10', 'grid15'],
  'grid10': ['grid4', 'grid9', 'grid11', 'grid16'],
  'grid11': ['grid5', 'grid10', 'grid12', 'grid17'],
  'grid12': ['grid6', 'grid11', 'grid18'],
  'grid13': ['grid7', 'grid14', 'grid19'],
  'grid14': ['grid8', 'grid13', 'grid15', 'grid20'],
  'grid15': ['grid9', 'grid14', 'grid16', 'grid21'],
  'grid16': ['grid10', 'grid15', 'grid17', 'grid22'],
  'grid17': ['grid11', 'grid16', 'grid18', 'grid23'],
  'grid18': ['grid12', 'grid17', 'grid24'],
  'grid19': ['grid13', 'grid20'],
  'grid20': ['grid14', 'grid19', 'grid21'],
  'grid21': ['grid15', 'grid20', 'grid22'],
  'grid22': ['grid16', 'grid21', 'grid23'],
  'grid23': ['grid17', 'grid22', 'grid24'],
  'grid24': ['grid18', 'grid23'],

  // Dirt road connections
  'dirt1': ['dirt2', 'dirt7'],
  'dirt2': ['dirt1', 'dirt3', 'dirt8'],
  'dirt3': ['dirt2', 'dirt4', 'dirt9'],
  'dirt4': ['dirt3', 'dirt5', 'dirt10'],
  'dirt5': ['dirt4', 'dirt6'],
  'dirt6': ['dirt5', 'outer6'],
  'dirt7': ['dirt1', 'dirt8', 'dirt12', 'outer2'],
  'dirt8': ['dirt2', 'dirt7', 'dirt9', 'outer3'],
  'dirt9': ['dirt3', 'dirt8', 'dirt10', 'outer4'],
  'dirt10': ['dirt4', 'dirt9', 'outer5'],
  'dirt11': ['dirt12', 'outer1'],
  'dirt12': ['dirt11', 'dirt7'],

  // Bridge connections
  'bridge1': ['bridge2', 'bridge11', 'conn1'],
  'bridge2': ['bridge1', 'bridge3', 'conn2'],
  'bridge3': ['bridge2', 'bridge4', 'conn3'],
  'bridge4': ['bridge3', 'bridge5', 'conn4'],
  'bridge5': ['bridge4', 'bridge6', 'conn5'],
  'bridge6': ['bridge5', 'bridge7'],
  'bridge7': ['bridge6', 'bridge8', 'conn6'],
  'bridge8': ['bridge7', 'bridge9', 'conn7'],
  'bridge9': ['bridge8', 'bridge10', 'conn8'],
  'bridge10': ['bridge9', 'bridge11'],
  'bridge11': ['bridge10', 'bridge1'],

  // Bridge connectors
  'conn1': ['bridge1', 'grid3'],
  'conn2': ['bridge2', 'grid4'],
  'conn3': ['bridge3', 'grid5'],
  'conn4': ['bridge4', 'grid6'],
  'conn5': ['bridge5', 'grid12'],
  'conn6': ['bridge7', 'grid17'],
  'conn7': ['bridge8', 'grid16'],
  'conn8': ['bridge9', 'grid15'],

  // Extensions
  'ext1': ['outer1', 'ext2'],
  'ext2': ['ext1', 'ext3', 'outer37'],
  'ext3': ['ext2', 'ext4', 'outer36'],
  'ext4': ['ext3', 'outer35'],
  'ext5': ['outer12', 'ext6'],
  'ext6': ['ext5', 'ext7', 'outer13'],
  'ext7': ['ext6', 'ext8', 'outer15'],
  'ext8': ['ext7'],
  'ext9': ['ext10'],
  'ext10': ['ext9', 'ext11', 'outer30'],
  'ext11': ['ext10', 'ext12', 'outer26'],
  'ext12': ['ext11', 'ext13'],
  'ext13': ['ext12']
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
  const mapRef = useRef(null);

  const handleMapClick = (event) => {
    const rect = mapRef.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (800 / rect.width);
    const y = (event.clientY - rect.top) * (600 / rect.height);
    
    const closestRoadPoint = findClosestRoadPoint(x, y);
    
    if (!startPoint) {
      setStartPoint(closestRoadPoint);
      setStartCoords({ x, y });
      console.log('Start point set:', { x: x.toFixed(0), y: y.toFixed(0), road: closestRoadPoint });
    } else if (!endPoint) {
      setEndPoint(closestRoadPoint);
      setEndCoords({ x, y });
      console.log('End point set:', { x: x.toFixed(0), y: y.toFixed(0), road: closestRoadPoint });
    } else {
      setStartPoint(closestRoadPoint);
      setStartCoords({ x, y });
      setEndPoint(null);
      setEndCoords(null);
      setRoute([]);
      console.log('Reset - new start:', { x: x.toFixed(0), y: y.toFixed(0), road: closestRoadPoint });
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
          console.log('Route found:', path.length, 'points');
        } else {
          alert('No route found between these points!');
          console.log('No route found');
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
    
    let stepCount = 2;
    let lastType = ROAD_POINTS[route[0]]?.type;
    
    for (let i = 1; i < route.length; i++) {
      const currentType = ROAD_POINTS[route[i]]?.type;
      
      if (currentType !== lastType || i === route.length - 1) {
        let instruction = '';
        
        if (currentType === 'bridge') {
          instruction = 'Take the bridge';
        } else if (currentType === 'connector') {
          instruction = 'Use bridge connector';
        } else if (currentType === 'dirt') {
          instruction = 'Continue on dirt road';
        } else {
          instruction = 'Continue on main road';
        }
        
        if (i === route.length - 1) {
          instruction = 'You have arrived!';
        }
        
        directions.push(`${stepCount++}. ${instruction}`);
        lastType = currentType;
      }
    }
    
    return directions;
  };

  useEffect(() => {
    if (startPoint && endPoint) {
      findRoute();
    }
  }, [startPoint, endPoint]);

  // Get road color by type
  const getRoadColor = (type) => {
    switch (type) {
      case 'road': return '#FF0000';
      case 'dirt': return '#00FF00';
      case 'bridge': return '#5698cf';
      case 'connector': return '#bfff00';
      default: return '#FF0000';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500">
      {/* Header */}
      <div className="bg-slate-900 text-white p-4 shadow-lg">
        <h1 className="text-3xl font-bold text-center flex items-center justify-center gap-3">
          <span className="text-blue-400">🗺️</span>
          Bloxburg GPS - Following Your Road Map
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
              👁️ {showRoads ? 'Hide' : 'Show'} Road Network
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
                <div><span className="font-medium">Road Points:</span> {route.length}</div>
                <div><span className="font-medium">Status:</span> Following Roads</div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Map */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h2 className="text-xl font-bold mb-4 text-center">
                🗺️ Bloxburg Map {showRoads ? '- Roads Visible' : '- Clean View'}
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
                  {/* Road network visualization (if enabled) */}
                  {showRoads && Object.entries(ROAD_NETWORK).map(([from, connections]) => 
                    connections.map(to => {
                      if (!ROAD_POINTS[from] || !ROAD_POINTS[to]) return null;
                      const start = ROAD_POINTS[from];
                      const end = ROAD_POINTS[to];
                      
                      return (
                        <line
                          key={`${from}-${to}`}
                          x1={start.x}
                          y1={start.y}
                          x2={end.x}
                          y2={end.y}
                          stroke={getRoadColor(start.type)}
                          strokeWidth="2"
                          opacity="0.7"
                        />
                      );
                    })
                  )}

                  {/* Road points (if roads are visible) */}
                  {showRoads && Object.entries(ROAD_POINTS).map(([pointId, coords]) => (
                    <circle
                      key={pointId}
                      cx={coords.x}
                      cy={coords.y}
                      r="2"
                      fill={getRoadColor(coords.type)}
                      opacity="0.8"
                    />
                  ))}

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
                        strokeWidth="5"
                        opacity="0.9"
                        strokeLinecap="round"
                      />
                    );
                  })}

                  {/* Start point */}
                  {startCoords && (
                    <g>
                      <circle
                        cx={startCoords.x}
                        cy={startCoords.y}
                        r="10"
                        fill="#4CAF50"
                        stroke="white"
                        strokeWidth="3"
                      />
                      <text
                        x={startCoords.x}
                        y={startCoords.y - 15}
                        textAnchor="middle"
                        className="text-sm font-bold fill-green-700"
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
                        r="10"
                        fill="#F44336"
                        stroke="white"
                        strokeWidth="3"
                      />
                      <text
                        x={endCoords.x}
                        y={endCoords.y - 15}
                        textAnchor="middle"
                        className="text-sm font-bold fill-red-700"
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
                      className="text-lg font-bold fill-blue-600 opacity-50"
                    >
                      Click anywhere to set START point
                    </text>
                  )}
                  {startPoint && !endPoint && (
                    <text
                      x="400"
                      y="300"
                      textAnchor="middle"
                      className="text-lg font-bold fill-red-600 opacity-50"
                    >
                      Click anywhere to set END point
                    </text>
                  )}
                </svg>
                
                {/* Legend */}
                <div className="mt-4 grid grid-cols-2 md:grid-cols-6 gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    <span>Start</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                    <span>End</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-1" style={{backgroundColor: '#FFD700'}}></div>
                    <span>Your Route</span>
                  </div>
                  {showRoads && (
                    <>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-1" style={{backgroundColor: '#FF0000'}}></div>
                        <span>Roads</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-1" style={{backgroundColor: '#00FF00'}}></div>
                        <span>Dirt Roads</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-1" style={{backgroundColor: '#5698cf'}}></div>
                        <span>Bridges</span>
                      </div>
                    </>
                  )}
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
                      Following your hand-drawn roads
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
                      <div>🚶 Distance: {routeInfo.distance} units</div>
                      <div>⏱️ Time: {Math.floor(routeInfo.time / 60)}m {routeInfo.time % 60}s</div>
                      <div>🛣️ Road Points: {route.length}</div>
                      <div>📍 Following: Your Road Map</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <div className="text-4xl mb-4">🗺️</div>
                  <p className="mb-2">Click anywhere to start GPS</p>
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg text-left">
                    <h4 className="font-semibold text-blue-800 mb-2">GPS Features:</h4>
                    <div className="space-y-1 text-xs">
                      <div>✅ Follows your exact road drawing</div>
                      <div>✅ Click anywhere navigation</div>
                      <div>✅ Toggle to see road network</div>
                      <div>✅ Optimal pathfinding</div>
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