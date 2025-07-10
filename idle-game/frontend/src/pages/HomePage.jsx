// src/pages/HomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-gray-900">
      <h1 className="text-4xl font-bold mb-6">Idle Game Dashboard</h1>

      <div className="space-x-4">
        <Link to="/dashboard">
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700">
            Game Dashboard
          </button>
        </Link>

        <Link to="/game">
          <button className="px-6 py-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700">
            Play Game
          </button>
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
