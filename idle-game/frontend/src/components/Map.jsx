// components/Map.jsx
import React, { useRef, useEffect } from 'react';

// Map Component
const Map = ({ mapData, characters, onCharacterClick }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!mapData || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw buildings (rectangles)
    mapData.buildings?.forEach(building => {
      ctx.fillStyle = building.color || '#8B4513';
      ctx.fillRect(building.x, building.y, building.width, building.height);
      
      // Add border
      ctx.strokeStyle = '#654321';
      ctx.lineWidth = 2;
      ctx.strokeRect(building.x, building.y, building.width, building.height);
    });
    
    // Draw trees (triangles)
    mapData.trees?.forEach(tree => {
      ctx.fillStyle = tree.color || '#228B22';
      ctx.beginPath();
      ctx.moveTo(tree.x, tree.y - tree.size);
      ctx.lineTo(tree.x - tree.size, tree.y + tree.size);
      ctx.lineTo(tree.x + tree.size, tree.y + tree.size);
      ctx.closePath();
      ctx.fill();
      
      // Add border
      ctx.strokeStyle = '#006400';
      ctx.lineWidth = 1;
      ctx.stroke();
    });
    
    // Draw paths (yellow lines)
    if (mapData.paths?.lines) {
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 8;
      mapData.paths.lines.forEach(line => {
        ctx.beginPath();
        ctx.moveTo(line.x1, line.y1);
        ctx.lineTo(line.x2, line.y2);
        ctx.stroke();
      });
    }
    
    // Draw path points (for debugging)
    if (mapData.paths?.points) {
      ctx.fillStyle = '#FFA500';
      mapData.paths.points.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        ctx.fill();
      });
    }
    
    // Draw characters
    characters.forEach(character => {
      // Draw character circle
      ctx.fillStyle = character.color || '#3498db';
      ctx.beginPath();
      ctx.arc(character.x, character.y, 15, 0, 2 * Math.PI);
      ctx.fill();
      
      // Draw character border
      ctx.strokeStyle = '#2980b9';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw character name
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(character.name, character.x, character.y - 2);
      
      // Draw character role
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '8px Arial';
      ctx.fillText(character.role, character.x, character.y + 6);
      
      // Draw target indicator
      if (character.target_x !== character.x || character.target_y !== character.y) {
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(character.target_x, character.target_y, 8, 0, 2 * Math.PI);
        ctx.stroke();
      }
    });
    
  }, [mapData, characters]);

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if clicked on a character
    characters.forEach(character => {
      const distance = Math.sqrt((x - character.x)**2 + (y - character.y)**2);
      if (distance <= 15) {
        onCharacterClick(character, x, y);
      }
    });
  };

  return (
    <div className="border-2 border-gray-300 rounded-lg">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        onClick={handleCanvasClick}
        className="cursor-pointer"
      />
    </div>
  );
};

export default Map;
