// hooks/useIdleGame.js
import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:5000';

const useIdleGame = () => {
  const [mapData, setMapData] = useState(null);
  const [characters, setCharacters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCharId, setSelectedCharId] = useState(null);

  const fetchMapData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/map`);
      const data = await response.json();
      setMapData(data);

      const charactersResponse = await fetch(`${API_BASE_URL}/api/characters`);
      const charactersData = await charactersResponse.json();
      setCharacters(charactersData);
    } catch (err) {
      setError('Failed to fetch map or character data.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateCharacters = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/characters/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const updatedCharacters = await response.json();
      setCharacters(updatedCharacters);
    } catch (err) {
      console.error('Error updating characters:', err);
    }
  };

  const createCharacter = async (characterData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/characters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(characterData),
      });
      const newCharacter = await response.json();
      setCharacters(prev => [...prev, newCharacter]);
    } catch (err) {
      console.error('Error creating character:', err);
    }
  };

  const moveCharacter = async (characterId, targetX, targetY) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/characters/${characterId}/move`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_x: targetX, target_y: targetY }),
      });
      if (response.ok) {
        const updatedCharacter = await response.json();
        setCharacters(prev => prev.map(char => char.id === characterId ? updatedCharacter : char));
      }
    } catch (err) {
      console.error('Error moving character:', err);
    }
  };

  const handleCharacterClick = (char) => setSelectedCharId(char.id);

  const handleRandomMove = (characterId) => {
    if (mapData?.paths?.points?.length > 0) {
      const randomPoint = mapData.paths.points[Math.floor(Math.random() * mapData.paths.points.length)];
      moveCharacter(characterId, randomPoint.x, randomPoint.y);
    }
  };

  useEffect(() => {
    fetchMapData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (characters.length > 0) updateCharacters();
    }, 100);
    return () => clearInterval(interval);
  }, [characters.length]);

  return {
    mapData,
    characters,
    isLoading,
    error,
    createCharacter,
    moveCharacterRandomly: handleRandomMove,
    handleCharacterClick
  };
};

export default useIdleGame;
