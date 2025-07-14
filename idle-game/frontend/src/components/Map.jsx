// src/components/Map.jsx
import React, { useRef, useEffect, useState } from 'react';

const Map = ({ mapData, characters, onCharacterClick }) => {
  const canvasRef = useRef(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    try {
      setError(false);
      if (!mapData || !canvasRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // --- Draw buildings (solid brown rectangles) ---
      (mapData.buildings || []).forEach(b => {
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(b.x, b.y, b.width, b.height);
      });

      // --- Draw trees (green circles) ---
      (mapData.trees || []).forEach(t => {
        ctx.fillStyle = '#2ecc71';
        ctx.beginPath();
        ctx.arc(t.x, t.y, t.size || 6, 0, Math.PI * 2);
        ctx.fill();
      });

      // --- Draw path lines as small yellow squares ---
      const pathLines = mapData.paths?.lines || [];
      ctx.fillStyle = '#f1c40f';
      pathLines.forEach(p => {
        ctx.fillRect(p.x, p.y, p.width || 4, p.height || 4);
      });

      // --- Draw path points (orange dots) ---
      (mapData.paths?.points || []).forEach(pt => {
        ctx.fillStyle = '#FFA500';
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 3, 0, 2 * Math.PI);
        ctx.fill();
      });

      // --- Draw characters on top ---
      characters.forEach(char => {
        // circle
        ctx.fillStyle = char.color || '#3498db';
        ctx.beginPath();
        ctx.arc(char.x, char.y, 15, 0, 2 * Math.PI);
        ctx.fill();

        // border
        ctx.strokeStyle = '#2980b9';
        ctx.lineWidth = 2;
        ctx.stroke();

        // name
        ctx.fillStyle = '#000';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(char.name, char.x, char.y - 18);

        // role
        ctx.font = '10px Arial';
        ctx.fillText(char.role, char.x, char.y + 25);

        // target indicator
        if (char.target_x !== char.x || char.target_y !== char.y) {
          ctx.strokeStyle = '#e74c3c';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(char.target_x, char.target_y, 8, 0, 2 * Math.PI);
          ctx.stroke();
        }
      });
    } catch (e) {
      console.error(e);
      setError(true);
    }
  }, [mapData, characters]);

  const handleCanvasClick = e => {
    const { left, top } = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;

    characters.forEach(char => {
      const dx = x - char.x;
      const dy = y - char.y;
      if (Math.hypot(dx, dy) <= 15) {
        onCharacterClick(char, x, y);
      }
    });
  };

  if (error) {
    return (
      <div
        style={{
          width: 800,
          height: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f8d7da',
          border: '2px solid #f5c6cb'
        }}
      >
        <span style={{ color: '#721c24', fontWeight: 'bold' }}>
          Map failed to load. Please check your map data.
        </span>
      </div>
    );
  }

  return (
    <div className="border-2 border-gray-300 rounded-lg">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        onClick={handleCanvasClick}
        className="cursor-pointer bg-gray-50"
      />
    </div>
  );
};

export default Map;
