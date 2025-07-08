// src/components/LoadingBar.jsx
import React, { useEffect, useState } from 'react';
import './LoadingBar.css';

const LoadingBar = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      fetch('http://localhost:5000/api/progress')
        .then(res => res.json())
        .then(data => {
          setProgress(data.progress);
          if (data.progress >= 100) clearInterval(interval);
        });
    }, 500); // Poll every 500ms

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="loading-container">
      <div className="loading-text">Loading: {progress}%</div>
      <div className="progress-bar">
        <div className="progress" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
};

export default LoadingBar;
