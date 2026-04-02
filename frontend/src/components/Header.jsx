import React, { useEffect, useState } from "react";
import './Header.css';
import { LANGUAGES } from "../i18n";

const LeafIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <path d="M6 22C6 22 8 10 20 6C20 6 20 18 8 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M6 22L14 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const Header = ({ theme, onToggleTheme, lang, onChangeLang }) => {
  const [langOpen, setLangOpen] = useState(false);

  useEffect(() => {
    if (!langOpen) return;
    const onDocClick = () => setLangOpen(false);
    window.addEventListener("click", onDocClick);
    return () => window.removeEventListener("click", onDocClick);
  }, [langOpen]);

  return (
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
          <div className="lang-picker" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="lang-trigger"
              onClick={() => setLangOpen((v) => !v)}
              aria-haspopup="listbox"
              aria-expanded={langOpen}
            >
              🌐 {LANGUAGES[lang] || LANGUAGES.en}
            </button>
            {langOpen && (
              <div className="lang-dropdown" role="listbox" aria-label="Language picker">
                {Object.entries(LANGUAGES).map(([code, label]) => (
                  <button
                    key={code}
                    type="button"
                    className={`lang-option${lang === code ? " active" : ""}`}
                    onClick={() => {
                      if (onChangeLang) onChangeLang(code);
                      setLangOpen(false);
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            className="theme-toggle"
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
