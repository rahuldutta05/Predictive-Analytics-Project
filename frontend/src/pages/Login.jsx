import React, { useState } from "react";
import "../styles/LoginPage.css";
import Header from "../components/Header";
import { t } from "../i18n";

export default function Login({ onLogin, theme, onToggleTheme, lang, onChangeLang }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      // Simple, offline login for UI. If you later add backend auth,
      // replace this with real API calls.
      if (!fullName.trim() || !email.trim() || password.length < 4) {
        throw new Error("Please enter your name, email, and a valid password.");
      }

      localStorage.setItem("token", "demo_token");
      localStorage.setItem("full_name", fullName.trim());
      localStorage.setItem("user_email", email.trim());
      if (onLogin) onLogin();
    } catch (e) {
      setError(e?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Header theme={theme} onToggleTheme={onToggleTheme} lang={lang} onChangeLang={onChangeLang} />

      <div className="auth-hero">
        <div className="auth-card">
          <div className="auth-brand">
            <div className="auth-logo-icon" aria-hidden="true">
              🌾
            </div>
            <div>
              <h1 className="auth-title">{t(lang, "loginTitle")}</h1>
              <p className="auth-subtitle">{t(lang, "loginSubtitle")}</p>
            </div>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <div className="auth-form">
            <label className="auth-label">
              {t(lang, "loginFullName")}
              <input
                className="auth-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                type="text"
                placeholder="Ravi Kumar"
              />
            </label>

            <label className="auth-label">
              {t(lang, "loginEmail")}
              <input
                className="auth-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="you@example.com"
              />
            </label>

            <label className="auth-label">
              {t(lang, "loginPassword")}
              <input
                className="auth-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="••••"
              />
            </label>

            <button className="auth-btn" onClick={handleSubmit} disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>

          <p className="auth-footnote">
            {t(lang, "loginTip")}
          </p>
        </div>
      </div>
    </div>
  );
}

