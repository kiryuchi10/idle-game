import React, { useState, useEffect } from 'react';
import CharacterControls from './CharacterControls';
import GameMap from './GameMap';
import LoadingPage from './LoadingPage';
import './Dashboard.css';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [color, setColor] = useState('#3498db');
  const [mapData, setMapData] = useState(null);
  const [status, setStatus] = useState({
    trees: 0,
    buildings: 0,
    pathPoints: 0,
    characters: 0,
    status: 'Loading...'
  });

  const fetchMap = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/map');
      const data = await res.json();
      setMapData(data);
      setStatus(prev => ({
        ...prev,
        trees: data.trees?.length || 0,
        buildings: data.buildings?.length || 0,
        pathPoints: data.paths?.length || 0,
        status: 'Ready'
      }));
    } catch (err) {
      console.error('Error fetching map:', err);
    }
  };

  const handleCreateCharacter = async () => {
    const res = await fetch('http://localhost:5000/api/characters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, role, color })
    });
    const data = await res.json();
    console.log('Character created:', data);
    setStatus(prev => ({ ...prev, characters: prev.characters + 1 }));
  };

  const handleRegenerateMap = async () => {
    const res = await fetch('http://localhost:5000/api/map/generate', { method: 'POST' });
    const newMap = await res.json();
    setMapData(newMap);
    setStatus(prev => ({
      ...prev,
      trees: newMap.trees?.length || 0,
      buildings: newMap.buildings?.length || 0,
      pathPoints: newMap.paths?.length || 0
    }));
  };

  useEffect(() => {
    fetchMap();
    setTimeout(() => setLoading(false), 1000);
  }, []);

  if (loading) return <LoadingPage />;

  return (
    <div className="dashboard">
      <h2>Idle Game - Stardew Valley Style</h2>

      <div className="panel">
        <h4>Game Map</h4>
        <GameMap mapData={mapData} />
      </div>

      <div className="panel">
        <h4>Character Controls</h4>
        <CharacterControls {...{ name, setName, role, setRole, color, setColor, handleCreateCharacter }} />
      </div>

      <div className="panel">
        <h4>Game Status</h4>
        <div className="status-grid">
          <div>Map Size: {mapData ? `${mapData.width} x ${mapData.height}` : 'Loading...'}</div>
          <div>Buildings: {status.buildings}</div>
          <div>Trees: {status.trees}</div>
          <div>Path Points: {status.pathPoints}</div>
          <div>Characters: {status.characters}</div>
          <div>Status: {status.status}</div>
        </div>
      </div>

      <div className="panel">
        <h4>Map Controls</h4>
        <button className="btn-purple" onClick={handleRegenerateMap}>Regenerate Map</button>
        <button className="btn-green" onClick={fetchMap}>Force Update</button>
      </div>

      <div className="panel">
        <h4>Debug Information</h4>
        <div className="debug-info">
          <div>API Base URL: http://localhost:5000</div>
          <div>Map Data: {mapData ? 'Loaded' : 'Loading...'}</div>
          <div>Characters Count: {status.characters}</div>
          <div>Buildings: {status.buildings}</div>
          <div>Trees: {status.trees}</div>
          <div>Path Points: {status.pathPoints}</div>
          <div>Last Update: {new Date().toLocaleTimeString()}</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
