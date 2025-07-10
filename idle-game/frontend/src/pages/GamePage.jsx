import React, { useState } from "react";
import MapPanel from "../components/MapPanel";

const GamePage = () => {
  const [mapData, setMapData] = useState(null);
  const [userConfirmedMap, setUserConfirmedMap] = useState(false);

  return (
    <div style={{ padding: "1rem", color: "white" }}>
      <h2>Idle Game Map</h2>
      {!userConfirmedMap ? (
        <MapPanel
          mapData={mapData}
          setMapData={setMapData}
          setUserConfirmedMap={setUserConfirmedMap}
        />
      ) : (
        <div>Game Starts Here!</div>
      )}
    </div>
  );
};

export default GamePage;
