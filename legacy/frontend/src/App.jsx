import React, { useState } from 'react';
import Dashboard from './Dashboard';
import './index.css';

function App() {
  const [theme, setTheme] = useState('light');

  const toggleTheme = () =>
    setTheme(t => (t === 'light' ? 'dark' : 'light'));

  return (
    <div data-theme={theme} style={{ minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
      <Dashboard theme={theme} onToggleTheme={toggleTheme} />
    </div>
  );
}

export default App;
