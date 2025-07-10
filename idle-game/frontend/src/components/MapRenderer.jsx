// src/components/MapRenderer.jsx
import React from "react";

const MapRenderer = ({ mapData }) => {
  if (!mapData) return null;

  return (
    <svg
      width={mapData.width}
      height={mapData.height}
      className="border border-gray-400"
    >
      {/* Paths */}
      {mapData.paths?.lines?.map((line, i) => (
        <line
          key={`path-${i}`}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          stroke={line.color || "yellow"}
          strokeWidth="4"
        />
      ))}

      {/* Buildings */}
      {mapData.buildings?.map((b, i) => (
        <rect
          key={`building-${i}`}
          x={b.x}
          y={b.y}
          width={b.width}
          height={b.height}
          fill={b.color || "#8B4513"}
        />
      ))}

      {/* Trees */}
      {mapData.trees?.map((t, i) => (
        <circle
          key={`tree-${i}`}
          cx={t.x}
          cy={t.y}
          r={t.size}
          fill={t.color || "green"}
        />
      ))}
    </svg>
  );
};

export default MapRenderer;
