import React, { useEffect, useState } from 'react';
import './LoadingPage.css';

const LoadingPage = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Optionally trigger backend process start
    fetch('http://localhost:5000/api/start-process').catch(console.error);

    const interval = setInterval(() => {
      fetch('http://localhost:5000/api/progress')
        .then((res) => res.json())
        .then((data) => {
          setProgress(data.progress || 0);
          if (data.progress >= 100) clearInterval(interval);
        })
        .catch(console.error);
    }, 500); // poll every 500ms

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="loading-window">
      <div className="loading-header">Loading Game...</div>
      <div className="loading-bar">
        <div className="loading-progress" style={{ width: `${progress}%` }} />
      </div>
      <div className="loading-percent">{progress}%</div>
    </div>
  );
};

export default LoadingPage;
