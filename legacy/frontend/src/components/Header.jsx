import React from 'react';
import './Header.css';

const LeafIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <path d="M6 22C6 22 8 10 20 6C20 6 20 18 8 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M6 22L14 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const Header = ({ theme, onToggleTheme }) => (
  <header className="site-header">
    <div className="header-inner">
      <div className="header-brand">
        <span className="header-icon"><LeafIcon /></span>
        <div>
          <span className="header-wordmark">Agri<em>Sense</em></span>
          <span className="header-tagline">Intelligent Agriculture Platform</span>
        </div>
      </div>

      <div className="header-actions">
        <button
          className="theme-toggle"
          onClick={onToggleTheme}
          aria-label="Toggle theme"
          title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </div>
    </div>
  </header>
);

export default Header;
