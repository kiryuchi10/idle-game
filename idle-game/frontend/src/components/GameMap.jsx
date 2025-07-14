import React, { useEffect, useRef } from 'react';

const GameMap = ({ mapData, characters = [], onCharacterClick }) => {
  const canvasRef = useRef();

  useEffect(() => {
    if (!mapData || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw buildings
    (mapData.buildings || []).forEach(b => {
      ctx.fillStyle = b.color || '#8B4513';
      ctx.fillRect(b.x, b.y, b.width, b.height);
    });

    // Draw trees
    (mapData.trees || []).forEach(t => {
      ctx.fillStyle = t.color || '#228B22';
      ctx.beginPath();
      ctx.arc(t.x, t.y, t.size || 6, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw path lines
    ctx.lineWidth = 4;
    (mapData.paths?.lines || []).forEach(p => {
      ctx.strokeStyle = p.color || '#FFD700';
      ctx.beginPath();
      ctx.moveTo(p.x1, p.y1);
      ctx.lineTo(p.x2, p.y2);
      ctx.stroke();
    });

    // Draw path points
    ctx.fillStyle = '#FFA500';
    (mapData.paths?.points || []).forEach(pt => {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw characters
    characters.forEach(char => {
      // body
      ctx.fillStyle = char.color || '#3498db';
      ctx.beginPath();
      ctx.arc(char.x, char.y, 15, 0, Math.PI * 2);
      ctx.fill();

      // border
      ctx.strokeStyle = '#2980b9';
      ctx.lineWidth = 2;
      ctx.stroke();

      // name & role
      ctx.fillStyle = '#000';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(char.name, char.x, char.y - 20);
      ctx.font = '10px Arial';
      ctx.fillText(char.role, char.x, char.y + 25);
    });
  }, [mapData, characters]);

  const handleCanvasClick = e => {
    if (!canvasRef.current) return;
    const { left, top } = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;

    // find first character clicked
    for (let char of characters) {
      const dist = Math.hypot(x - char.x, y - char.y);
      if (dist <= 15) {
        return onCharacterClick?.(char, { x, y });
      }
    }

    // otherwise see if they clicked a path point
    for (let pt of mapData.paths?.points || []) {
      const dist = Math.hypot(x - pt.x, y - pt.y);
      if (dist <= 6) {
        return onCharacterClick?.(null, { x: pt.x, y: pt.y });
      }
    }
  };

  return (
    <canvas
      ref={canvasRef}
      width={mapData?.width || 800}
      height={mapData?.height || 600}
      style={{ border: '2px solid #ccc', backgroundColor: '#f9f9f9', cursor: 'pointer' }}
      onClick={handleCanvasClick}
    />
  );
};

export default GameMap;
