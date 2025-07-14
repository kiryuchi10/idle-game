// src/components/GameMap.jsx
import React, { useEffect, useRef } from 'react';

const GameMap = ({ mapData }) => {
  const canvasRef = useRef();

  useEffect(() => {
    if (!mapData) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    mapData.buildings.forEach(b => {
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(b.x, b.y, b.width, b.height);
    });

    mapData.trees.forEach(t => {
      ctx.fillStyle = '#2ecc71';
      ctx.beginPath();
      ctx.arc(t.x, t.y, 6, 0, Math.PI * 2);
      ctx.fill();
    });

    const pathLines = mapData?.paths?.lines || [];
    const pathPoints = mapData?.paths?.points || [];
    pathLines.forEach(p => {
      ctx.fillStyle = '#f1c40f';
      ctx.fillRect(p.x, p.y, 4, 4);
    });

  }, [mapData]);

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      style={{ border: '2px solid #ccc', backgroundColor: '#f9f9f9' }}
    />
  );
};

export default GameMap;
