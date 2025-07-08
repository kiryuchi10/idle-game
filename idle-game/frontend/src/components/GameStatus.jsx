// components/GameStatus.jsx
import React from 'react';

const GameStatus = ({ mapData, characters, isLoading }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Game Status</h3>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <span>Map Size:</span>
          <span>{mapData ? `${mapData.width}x${mapData.height}` : 'Loading...'}</span>
        </div>
        
        <div className="flex justify-between">
          <span>Buildings:</span>
          <span>{mapData?.buildings?.length || 0}</span>
        </div>
        
        <div className="flex justify-between">
          <span>Trees:</span>
          <span>{mapData?.trees?.length || 0}</span>
        </div>
        
        <div className="flex justify-between">
          <span>Path Points:</span>
          <span>{mapData?.paths?.points?.length || 0}</span>
        </div>
        
        <div className="flex justify-between">
          <span>Characters:</span>
          <span>{characters.length}</span>
        </div>
        
        <div className="flex justify-between">
          <span>Status:</span>
          <span className={isLoading ? 'text-yellow-600' : 'text-green-600'}>
            {isLoading ? 'Loading...' : 'Ready'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default GameStatus;