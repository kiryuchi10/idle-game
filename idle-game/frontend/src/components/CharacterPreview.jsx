// src/components/CharacterPreview.jsx
import React from 'react';
import './CharacterPreview.css';

const CharacterPreview = ({ name, role, color }) => {
  return (
    <div className="character-card" style={{ borderColor: color }}>
      <div className="character-sprite" style={{ color }}>
        🧑‍🌾
      </div>
      <div className="character-info">
        <div className="character-name" style={{ color }}>{name || 'Preview'}</div>
        <div className="character-role" style={{ color }}>{role || 'Role'}</div>
      </div>
    </div>
  );
};

export default CharacterPreview;
