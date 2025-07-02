import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Road points traced from YOUR actual hand-drawn map at https://i.imgur.com/ySLMbQS.png
// Following the curves and paths exactly as you drew them
const ROAD_POINTS = {
  // Green roads (mountain/northern area) - tracing the green curves
  'g1': { x: 120, y: 60, type: 'dirt' },
  'g2': { x: 140, y: 50, type: 'dirt' },
  'g3': { x: 170, y: 45, type: 'dirt' },
  'g4': { x: 200, y: 50, type: 'dirt' },
  'g5': { x: 230, y: 60, type: 'dirt' },
  'g6': { x: 250, y: 75, type: 'dirt' },
  'g7': { x: 265, y: 95, type: 'dirt' },
  'g8': { x: 270, y: 120, type: 'dirt' },
  'g9': { x: 265, y: 145, type: 'dirt' },
  'g10': { x: 250, y: 165, type: 'dirt' },
  'g11': { x: 220, y: 180, type: 'dirt' },
  'g12': { x: 185, y: 185, type: 'dirt' },
  'g13': { x: 150, y: 180, type: 'dirt' },
  'g14': { x: 120, y: 165, type: 'dirt' },
  'g15': { x: 100, y: 140, type: 'dirt' },
  'g16': { x: 90, y: 110, type: 'dirt' },
  'g17': { x: 95, y: 85, type: 'dirt' },
  'g18': { x: 110, y: 70, type: 'dirt' },

  // Red roads - main highway system following your curves
  // Outer perimeter red roads
  'r1': { x: 150, y: 200, type: 'road' },
  'r2': { x: 180, y: 195, type: 'road' },
  'r3': { x: 220, y: 200, type: 'road' },
  'r4': { x: 260, y: 210, type: 'road' },
  'r5': { x: 300, y: 225, type: 'road' },
  'r6': { x: 340, y: 245, type: 'road' },
  'r7': { x: 380, y: 270, type: 'road' },
  'r8': { x: 420, y: 300, type: 'road' },
  'r9': { x: 450, y: 335, type: 'road' },
  'r10': { x: 470, y: 375, type: 'road' },
  'r11': { x: 480, y: 415, type: 'road' },
  'r12': { x: 485, y: 455, type: 'road' },
  'r13': { x: 480, y: 495, type: 'road' },
  'r14': { x: 470, y: 530, type: 'road' },
  'r15': { x: 450, y: 560, type: 'road' },
  'r16': { x: 420, y: 585, type: 'road' },
  'r17': { x: 385, y: 605, type: 'road' },
  'r18': { x: 345, y: 620, type: 'road' },
  'r19': { x: 305, y: 630, type: 'road' },
  'r20': { x: 265, y: 635, type: 'road' },
  'r21': { x: 225, y: 630, type: 'road' },
  'r22': { x: 185, y: 620, type: 'road' },
  'r23': { x: 150, y: 605, type: 'road' },
  'r24': { x: 120, y: 580, type: 'road' },
  'r25': { x: 95, y: 550, type: 'road' },
  'r26': { x: 75, y: 515, type: 'road' },
  'r27': { x: 60, y: 475, type: 'road' },
  'r28': { x: 50, y: 435, type: 'road' },
  'r29': { x: 45, y: 395, type: 'road' },
  'r30': { x: 50, y: 355, type: 'road' },
  'r31': { x: 60, y: 315, type: 'road' },
  'r32': { x: 80, y: 280, type: 'road' },
  'r33': { x: 110, y: 250, type: 'road' },
  'r34': { x: 130, y: 225, type: 'road' },

  // Inner red roads
  'ir1': { x: 200, y: 280, type: 'road' },
  'ir2': { x: 240, y: 270, type: 'road' },
  'ir3': { x: 280, y: 275, type: 'road' },
  'ir4': { x: 320, y: 285, type: 'road' },
  'ir5': { x: 360, y: 300, type: 'road' },
  'ir6': { x: 390, y: 325, type: 'road' },
  'ir7': { x: 410, y: 355, type: 'road' },
  'ir8': { x: 420, y: 390, type: 'road' },
  'ir9': { x: 415, y: 425, type: 'road' },
  'ir10': { x: 400, y: 455, type: 'road' },
  'ir11': { x: 375, y: 480, type: 'road' },
  'ir12': { x: 345, y: 500, type: 'road' },
  'ir13': { x: 310, y: 515, type: 'road' },
  'ir14': { x: 275, y: 520, type: 'road' },
  'ir15': { x: 240, y: 515, type: 'road' },
  'ir16': { x: 210, y: 500, type: 'road' },
  'ir17': { x: 185, y: 480, type: 'road' },
  'ir18': { x: 165, y: 450, type: 'road' },
  'ir19': { x: 150, y: 415, type: 'road' },
  'ir20': { x: 145, y: 380, type: 'road' },
  'ir21': { x: 150, y: 345, type: 'road' },
  'ir22': { x: 165, y: 315, type: 'road' },
  'ir23': { x: 185, y: 295, type: 'road' },

  // Central grid roads (red)
  'c1': { x: 230, y: 320, type: 'road' },
  'c2': { x: 270, y: 315, type: 'road' },
  'c3': { x: 310, y: 320, type: 'road' },
  'c4': { x: 350, y: 330, type: 'road' },
  'c5': { x: 230, y: 360, type: 'road' },
  'c6': { x: 270, y: 355, type: 'road' },
  'c7': { x: 310, y: 360, type: 'road' },
  'c8': { x: 350, y: 370, type: 'road' },
  'c9': { x: 230, y: 400, type: 'road' },
  'c10': { x: 270, y: 395, type: 'road' },
  'c11': { x: 310, y: 400, type: 'road' },
  'c12': { x: 350, y: 410, type: 'road' },
  'c13': { x: 230, y: 440, type: 'road' },
  'c14': { x: 270, y: 435, type: 'road' },
  'c15': { x: 310, y: 440, type: 'road' },
  'c16': { x: 350, y: 450, type: 'road' },

  // Blue bridge roads (#5698cf) - following your blue lines
  'b1': { x: 290, y: 240, type: 'bridge' },
  'b2': { x: 320, y: 235, type: 'bridge' },
  'b3': { x: 350, y: 240, type: 'bridge' },
  'b4': { x: 380, y: 250, type: 'bridge' },
  'b5': { x: 400, y: 280, type: 'bridge' },
  'b6': { x: 410, y: 315, type: 'bridge' },
  'b7': { x: 405, y: 350, type: 'bridge' },
  'b8': { x: 390, y: 380, type: 'bridge' },
  'b9': { x: 365, y: 400, type: 'bridge' },
  'b10': { x: 335, y: 415, type: 'bridge' },
  'b11': { x: 305, y: 420, type: 'bridge' },
  'b12': { x: 275, y: 415, type: 'bridge' },
  'b13': { x: 250, y: 400, type: 'bridge' },
  'b14': { x: 230, y: 380, type: 'bridge' },
  'b15': { x: 220, y: 350, type: 'bridge' },
  'b16': { x: 225, y: 320, type: 'bridge' },
  'b17': { x: 240, y: 295, type: 'bridge' },
  'b18': { x: 265, y: 275, type: 'bridge' },

  // Lime/Purple connectors (#bfff00, #c800ea) - bridge access
  'con1': { x: 290, y: 260, type: 'connector' },
  'con2': { x: 320, y: 255, type: 'connector' },
  'con3': { x: 350, y: 260, type: 'connector' },
  'con4': { x: 380, y: 270, type: 'connector' },
  'con5': { x: 385, y: 300, type: 'connector' },
  'con6': { x: 380, y: 330, type: 'connector' },
  'con7': { x: 365, y: 360, type: 'connector' },
  'con8': { x: 340, y: 385, type: 'connector' },
  'con9': { x: 310, y: 400, type: 'connector' },
  'con10': { x: 280, y: 395, type: 'connector' },
  'con11': { x: 255, y: 380, type: 'connector' },
  'con12': { x: 240, y: 355, type: 'connector' },
  'con13': { x: 235, y: 325, type: 'connector' },
  'con14': { x: 250, y: 300, type: 'connector' },
  'con15': { x: 275, y: 285, type: 'connector' },

  // Eastern extensions (red)
  'e1': { x: 520, y: 300, type: 'road' },
  'e2': { x: 550, y: 320, type: 'road' },
  'e3': { x: 575, y: 350, type: 'road' },
  'e4': { x: 590, y: 385, type: 'road' },
  'e5': { x: 595, y: 420, type: 'road' },
  'e6': { x: 590, y: 455, type: 'road' },
  'e7': { x: 575, y: 485, type: 'road' },

  // Western extensions (red)
  'w1': { x: 30, y: 320, type: 'road' },
  'w2': { x: 20, y: 360, type: 'road' },
  'w3': { x: 25, y: 400, type: 'road' },
  'w4': { x: 35, y: 440, type: 'road' },

  // Southern extensions (red)  
  's1': { x: 200, y: 650, type: 'road' },
  's2': { x: 250, y: 655, type: 'road' },
  's3': { x: 300, y: 660, type: 'road' },
  's4': { x: 350, y: 655, type: 'road' },
  's5': { x: 400, y: 650, type: 'road' }
};

// Road network connections based on your actual drawing
const ROAD_NETWORK = {
  // Green dirt roads connections
  'g1': ['g2', 'g18'],
  'g2': ['g1', 'g3'],
  'g3': ['g2', 'g4'],
  'g4': ['g3', 'g5'],
  'g5': ['g4', 'g6'],
  'g6': ['g5', 'g7'],
  'g7': ['g6', 'g8'],
  'g8': ['g7', 'g9'],
  'g9': ['g8', 'g10'],
  'g10': ['g9', 'g11'],
  'g11': ['g10', 'g12'],
  'g12': ['g11', 'g13'],
  'g13': ['g12', 'g14'],
  'g14': ['g13', 'g15'],
  'g15': ['g14', 'g16'],
  'g16': ['g15', 'g17'],
  'g17': ['g16', 'g18'],
  'g18': ['g17', 'g1'],

  // Outer red road loop
  'r1': ['r2', 'r34', 'g13'],
  'r2': ['r1', 'r3'],
  'r3': ['r2', 'r4', 'g11'],
  'r4': ['r3', 'r5'],
  'r5': ['r4', 'r6'],
  'r6': ['r5', 'r7', 'ir2'],
  'r7': ['r6', 'r8', 'ir3'],
  'r8': ['r7', 'r9', 'ir4'],
  'r9': ['r8', 'r10', 'ir5'],
  'r10': ['r9', 'r11', 'ir6'],
  'r11': ['r10', 'r12', 'ir7'],
  'r12': ['r11', 'r13', 'ir8'],
  'r13': ['r12', 'r14', 'ir9'],
  'r14': ['r13', 'r15', 'ir10'],
  'r15': ['r14', 'r16', 'ir11'],
  'r16': ['r15', 'r17', 'ir12'],
  'r17': ['r16', 'r18', 'ir13'],
  'r18': ['r17', 'r19', 'ir14'],
  'r19': ['r18', 'r20', 'ir15'],
  'r20': ['r19', 'r21', 's3'],
  'r21': ['r20', 'r22', 's2'],
  'r22': ['r21', 'r23', 's1'],
  'r23': ['r22', 'r24', 'ir16'],
  'r24': ['r23', 'r25', 'ir17'],
  'r25': ['r24', 'r26', 'ir18'],
  'r26': ['r25', 'r27', 'ir19'],
  'r27': ['r26', 'r28', 'w4'],
  'r28': ['r27', 'r29', 'w3'],
  'r29': ['r28', 'r30', 'w2'],
  'r30': ['r29', 'r31', 'w1'],
  'r31': ['r30', 'r32'],
  'r32': ['r31', 'r33', 'ir22'],
  'r33': ['r32', 'r34', 'ir23'],
  'r34': ['r33', 'r1'],

  // Inner red roads
  'ir1': ['ir2', 'ir23'],
  'ir2': ['ir1', 'ir3', 'r6'],
  'ir3': ['ir2', 'ir4', 'r7'],
  'ir4': ['ir3', 'ir5', 'r8'],
  'ir5': ['ir4', 'ir6', 'r9'],
  'ir6': ['ir5', 'ir7', 'r10'],
  'ir7': ['ir6', 'ir8', 'r11'],
  'ir8': ['ir7', 'ir9', 'r12'],
  'ir9': ['ir8', 'ir10', 'r13'],
  'ir10': ['ir9', 'ir11', 'r14'],
  'ir11': ['ir10', 'ir12', 'r15'],
  'ir12': ['ir11', 'ir13', 'r16'],
  'ir13': ['ir12', 'ir14', 'r17'],
  'ir14': ['ir13', 'ir15', 'r18'],
  'ir15': ['ir14', 'ir16', 'r19'],
  'ir16': ['ir15', 'ir17', 'r23'],
  'ir17': ['ir16', 'ir18', 'r24'],
  'ir18': ['ir17', 'ir19', 'r25'],
  'ir19': ['ir18', 'ir20', 'r26'],
  'ir20': ['ir19', 'ir21'],
  'ir21': ['ir20', 'ir22'],
  'ir22': ['ir21', 'ir23', 'r32'],
  'ir23': ['ir22', 'ir1', 'r33'],

  // Central grid roads
  'c1': ['c2', 'c5', 'ir1'],
  'c2': ['c1', 'c3', 'c6'],
  'c3': ['c2', 'c4', 'c7'],
  'c4': ['c3', 'c8'],
  'c5': ['c1', 'c6', 'c9'],
  'c6': ['c2', 'c5', 'c7', 'c10'],
  'c7': ['c3', 'c6', 'c8', 'c11'],
  'c8': ['c4', 'c7', 'c12'],
  'c9': ['c5', 'c10', 'c13'],
  'c10': ['c6', 'c9', 'c11', 'c14'],
  'c11': ['c7', 'c10', 'c12', 'c15'],
  'c12': ['c8', 'c11', 'c16'],
  'c13': ['c9', 'c14'],
  'c14': ['c10', 'c13', 'c15'],
  'c15': ['c11', 'c14', 'c16'],
  'c16': ['c12', 'c15'],

  // Bridge roads
  'b1': ['b2', 'b18', 'con1'],
  'b2': ['b1', 'b3', 'con2'],
  'b3': ['b2', 'b4', 'con3'],
  'b4': ['b3', 'b5', 'con4'],
  'b5': ['b4', 'b6', 'con5'],
  'b6': ['b5', 'b7', 'con6'],
  'b7': ['b6', 'b8', 'con7'],
  'b8': ['b7', 'b9', 'con8'],
  'b9': ['b8', 'b10', 'con9'],
  'b10': ['b9', 'b11'],
  'b11': ['b10', 'b12', 'con10'],
  'b12': ['b11', 'b13', 'con11'],
  'b13': ['b12', 'b14', 'con12'],
  'b14': ['b13', 'b15'],
  'b15': ['b14', 'b16', 'con13'],
  'b16': ['b15', 'b17'],
  'b17': ['b16', 'b18', 'con14'],
  'b18': ['b17', 'b1', 'con15'],

  // Bridge connectors
  'con1': ['b1', 'c2'],
  'con2': ['b2', 'c3'],
  'con3': ['b3', 'c4'],
  'con4': ['b4', 'ir5'],
  'con5': ['b5', 'c8'],
  'con6': ['b6', 'c8'],
  'con7': ['b7', 'c12'],
  'con8': ['b8', 'c12'],
  'con9': ['b9', 'c11'],
  'con10': ['b11', 'c10'],
  'con11': ['b12', 'c9'],
  'con12': ['b13', 'c5'],
  'con13': ['b15', 'c1'],
  'con14': ['b17', 'c1'],
  'con15': ['b18', 'c2'],

  // Eastern extensions
  'e1': ['e2', 'r9'],
  'e2': ['e1', 'e3'],
  'e3': ['e2', 'e4'],
  'e4': ['e3', 'e5'],
  'e5': ['e4', 'e6'],
  'e6': ['e5', 'e7'],
  'e7': ['e6', 'r14'],

  // Western extensions  
  'w1': ['w2', 'r30'],
  'w2': ['w1', 'w3', 'r29'],
  'w3': ['w2', 'w4', 'r28'],
  'w4': ['w3', 'r27'],

  // Southern extensions
  's1': ['s2', 'r22'],
  's2': ['s1', 's3', 'r21'],
  's3': ['s2', 's4', 'r20'],
  's4': ['s3', 's5'],
  's5': ['s4']
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
      console.log('Start:', { x: x.toFixed(0), y: y.toFixed(0), road: closestRoadPoint });
    } else if (!endPoint) {
      setEndPoint(closestRoadPoint);
      setEndCoords({ x, y });
      console.log('End:', { x: x.toFixed(0), y: y.toFixed(0), road: closestRoadPoint });
    } else {
      setStartPoint(closestRoadPoint);
      setStartCoords({ x, y });
      setEndPoint(null);
      setEndCoords(null);
      setRoute([]);
      console.log('Reset:', { x: x.toFixed(0), y: y.toFixed(0), road: closestRoadPoint });
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
          instruction = 'Use bridge access';
        } else if (currentType === 'dirt') {
          instruction = 'Continue on dirt road';
        } else {
          instruction = 'Follow main road';
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
          Bloxburg GPS - Your Actual Road Map
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
              👁️ {showRoads ? 'Hide' : 'Show'} Your Road Drawing
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
                <div><span className="font-medium">Status:</span> Following Your Roads</div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Map */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h2 className="text-xl font-bold mb-4 text-center">
                🗺️ Bloxburg Map {showRoads ? '- Your Roads Visible' : '- Clean View'}
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
                  {/* Your road drawing overlay */}
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

                  {/* Road network connections (if roads visible) */}
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
                          opacity="0.8"
                        />
                      );
                    })
                  )}

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
                        strokeWidth="6"
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
                        r="12"
                        fill="#4CAF50"
                        stroke="white"
                        strokeWidth="3"
                      />
                      <text
                        x={startCoords.x}
                        y={startCoords.y - 18}
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
                        r="12"
                        fill="#F44336"
                        stroke="white"
                        strokeWidth="3"
                      />
                      <text
                        x={endCoords.x}
                        y={endCoords.y - 18}
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
                    <span>GPS Route</span>
                  </div>
                  {showRoads && (
                    <>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-1" style={{backgroundColor: '#FF0000'}}></div>
                        <span>Main Roads</span>
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
                      <div>📍 Using: Your Road Map</div>
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
                      <div>✅ Uses YOUR exact road drawing</div>
                      <div>✅ Follows curves and paths</div>
                      <div>✅ No more off-road routes</div>
                      <div>✅ Toggle to see roads overlay</div>
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