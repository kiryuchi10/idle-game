// src/components/CharacterControls.jsx
import React from "react";
import CharacterPreview from "./CharacterPreview";
import "./CharacterControls.css"; // 👈 Ensure this CSS file exists

const roles = ["Worker", "Farmer", "Miner"];
const colors = [
  "#3498db",
  "#2ecc71",
  "#e74c3c",
  "#f1c40f",
  "#9b59b6",
  "#1abc9c",
];

const CharacterControls = ({
  name,
  setName,
  role,
  setRole,
  color,
  setColor,
  handleCreateCharacter,
}) => {
  return (
    <div className="character-controls-container">
      <div className="character-inputs">
        <label>Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} />

        <label>Role</label>
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">Select role</option>
          {roles.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        <label>Color</label>
        <div className="color-options">
          {colors.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)} // FIXED HERE
              style={{
                backgroundColor: c,
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                marginRight: "8px",
                border: color === c ? "2px solid #333" : "none",
                cursor: "pointer",
              }}
            />
          ))}
        </div>

        <button onClick={handleCreateCharacter}>Create Character</button>
      </div>

      <div className="character-preview-container">
        <CharacterPreview name={name} role={role} color={color} />
      </div>
    </div>
  );
};

export default CharacterControls;
