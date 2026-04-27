import React, { useEffect, useState } from 'react';
import './ThemeToggle.css';

const ThemeToggle = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <button 
      className={`theme-toggle-btn ${theme}`} 
      onClick={toggleTheme}
      aria-label="Téma váltása"
    >
      <span className="material-symbols-outlined track-icon sun-bg">light_mode</span>
      <span className="material-symbols-outlined track-icon moon-bg">dark_mode</span>

      <div className="toggle-thumb">
        <span className="material-symbols-outlined sun">light_mode</span>
        <span className="material-symbols-outlined moon">dark_mode</span>
      </div>
    </button>
  );
};

export default ThemeToggle;