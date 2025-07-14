import React, { useState, useEffect } from 'react';
import CharacterControls from './CharacterControls';
import GameMap from './GameMap';
import LoadingPage from './LoadingPage';
import './Dashboard.css';

const Dashboard = () => {
  const [loading, setLoading]       = useState(true);
  const [name, setName]             = useState('');
  const [role, setRole]             = useState('');
  const [color, setColor]           = useState('#3498db');
  const [mapData, setMapData]       = useState(null);
  const [characters, setCharacters] = useState([]);
  const [selectedChar, setSelectedChar] = useState(null);
  const [status, setStatus]         = useState({
    trees: 0, buildings: 0, pathPoints: 0, characters: 0, status: 'Loading...'
  });

  // Fetch map and characters
  const fetchAll = async () => {
    try {
      const [mapRes, charRes] = await Promise.all([
        fetch('http://localhost:5000/api/map'),
        fetch('http://localhost:5000/api/characters')
      ]);
      const mapJson  = await mapRes.json();
      const charsJson = await charRes.json();

      setMapData(mapJson);
      setCharacters(charsJson);
      setStatus({
        trees: mapJson.trees?.length || 0,
        buildings: mapJson.buildings?.length || 0,
        pathPoints: mapJson.paths?.points?.length || 0,
        characters: charsJson.length,
        status: 'Ready'
      });
    } catch (err) {
      console.error('Error fetching data:', err);
      setStatus(prev => ({ ...prev, status: 'Error' }));
    }
  };

  // Create new character
  const handleCreateCharacter = async () => {
    const res = await fetch('http://localhost:5000/api/characters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, role, color })
    });
    const newChar = await res.json();
    setCharacters(chars => [...chars, newChar]);
    setStatus(prev => ({ ...prev, characters: prev.characters + 1 }));
  };

  // Regenerate map
  const handleRegenerateMap = async () => {
    const res = await fetch('http://localhost:5000/api/map/generate', { method: 'POST' });
    const newMap = await res.json();
    setMapData(newMap);
    setStatus(prev => ({
      ...prev,
      trees: newMap.trees?.length || 0,
      buildings: newMap.buildings?.length || 0,
      pathPoints: newMap.paths?.points?.length || 0
    }));
  };

  // Move a character (optimistic + backend)
  const moveCharacter = async (id, { x, y }) => {
    setCharacters(chars =>
      chars.map(c => (c.id === id ? { ...c, x, y } : c))
    );
    if (!id) return;
    await fetch(`http://localhost:5000/api/characters/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ x, y })
    });
  };

  // Handle clicks on map (character or path point)
  const handleCharacterClick = (char, clickPos) => {
    if (char) {
      setSelectedChar(char);
    } else if (selectedChar) {
      moveCharacter(selectedChar.id, clickPos);
    }
  };

  // Arrow-key navigation
  useEffect(() => {
    const onKey = e => {
      if (!selectedChar) return;
      const MOVE = 20;
      let dx = 0, dy = 0;
      if (e.key === 'ArrowUp')    dy = -MOVE;
      if (e.key === 'ArrowDown')  dy = +MOVE;
      if (e.key === 'ArrowLeft')  dx = -MOVE;
      if (e.key === 'ArrowRight') dx = +MOVE;
      if (dx || dy) {
        e.preventDefault();
        moveCharacter(selectedChar.id, {
          x: selectedChar.x + dx,
          y: selectedChar.y + dy
        });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedChar]);

  // Initial load
  useEffect(() => {
    fetchAll().finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingPage />;

  return (
    <div className="dashboard">
      <h2>Idle Game – Stardew Valley Style</h2>

      <div className="panel">
        <h4>Game Map</h4>
        <GameMap
          mapData={mapData}
          characters={characters}
          onCharacterClick={handleCharacterClick}
        />
      </div>

      <div className="panel">
        <h4>Character Controls</h4>
        <CharacterControls
          name={name} setName={setName}
          role={role} setRole={setRole}
          color={color} setColor={setColor}
          handleCreateCharacter={handleCreateCharacter}
        />
      </div>

      <div className="panel">
        <h4>Selected Character</h4>
        {selectedChar
          ? <div>
              <strong>{selectedChar.name}</strong> ({selectedChar.role})<br/>
              Position: {selectedChar.x}, {selectedChar.y}
            </div>
          : <p>Click a character to select</p>
        }
      </div>

      <div className="panel">
        <h4>Game Status</h4>
        <div className="status-grid">
          <div>Map Size: {mapData.width} x {mapData.height}</div>
          <div>Buildings: {status.buildings}</div>
          <div>Trees: {status.trees}</div>
          <div>Path Points: {status.pathPoints}</div>
          <div>Characters: {status.characters}</div>
          <div>Status: {status.status}</div>
        </div>
      </div>

      <div className="panel">
        <h4>Map Controls</h4>
        <button className="btn-purple" onClick={handleRegenerateMap}>
          Regenerate Map
        </button>
        <button className="btn-green" onClick={fetchAll}>
          Force Update
        </button>
      </div>

      <div className="panel">
        <h4>Debug Info</h4>
        <div className="debug-info">
          <div>API: http://localhost:5000</div>
          <div>Last Update: {new Date().toLocaleTimeString()}</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
