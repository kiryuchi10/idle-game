import React, { useState, useEffect } from "react";

const MapPanel = () => {
  const [mapData, setMapData] = useState(null);
  const [previewing, setPreviewing] = useState(false);

  const fetchMap = async () => {
    try {
      const res = await fetch("/api/map");
      const data = await res.json();
      setMapData(data);
    } catch (err) {
      console.error("❌ Error fetching map:", err);
    }
  };

  const regenerateMap = async () => {
    try {
      setPreviewing(true);
      const res = await fetch("/api/map/generate", { method: "POST" });
      const data = await res.json();
      setMapData(data);
    } catch (err) {
      console.error("❌ Error generating map:", err);
    }
  };

  useEffect(() => {
    fetchMap(); // Load existing map initially
  }, []);

  const confirmMap = () => {
    alert("✅ Map confirmed. You can now create characters.");
    setPreviewing(false);
  };

  const renderMapCanvas = () => {
    if (!mapData) return <p>Loading...</p>;

    return (
      <svg
        width={mapData.width}
        height={mapData.height}
        style={{ border: "2px solid #555" }}
      >
        {/* Buildings */}
        {mapData.buildings?.map((b, i) => (
          <rect
            key={`b-${i}`}
            x={b.x}
            y={b.y}
            width={b.width}
            height={b.height}
            fill={b.color || "#8B4513"}
          />
        ))}

        {/* Trees */}
        {mapData.trees?.map((t, i) => (
          <polygon
            key={`t-${i}`}
            points={`${t.x},${t.y - t.size} ${t.x - t.size},${t.y + t.size} ${
              t.x + t.size
            },${t.y + t.size}`}
            fill={t.color || "#228B22"}
          />
        ))}

        {/* Paths */}
        {mapData.paths?.lines?.map((line, i) => (
          <line
            key={`p-${i}`}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke={line.color || "#FFD700"}
            strokeWidth="4"
          />
        ))}
      </svg>
    );
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>🗺️ Map Panel</h2>
      <div style={{ marginBottom: "1rem" }}>
        <button onClick={regenerateMap} style={{ marginRight: "1rem" }}>
          🔄 Generate New Map
        </button>
        {previewing && <button onClick={confirmMap}>✅ Use This Map</button>}
      </div>
      {renderMapCanvas()}
    </div>
  );
};

export default MapPanel;
