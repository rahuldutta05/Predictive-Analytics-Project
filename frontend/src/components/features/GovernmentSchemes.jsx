import React, { useState, useEffect } from 'react';
import '../styles/Features.css';

function GovernmentSchemes({ language }) {
  const [state, setState] = useState('Tamil Nadu');
  const [schemes, setSchemes] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFetchSchemes = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/government_schemes?state=${state}`);
      const data = await response.json();
      setSchemes(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="feature-container">
      <div className="feature-header">
        <h2>📜 Government Schemes & Subsidies</h2>
        <p>Find applicable government schemes to increase your income</p>
      </div>

      <div className="feature-content">
        <div className="input-section">
          <div className="form-group">
            <label>Select Your State</label>
            <select value={state} onChange={(e) => setState(e.target.value)}>
              <option>Tamil Nadu</option>
              <option>Karnataka</option>
              <option>Maharashtra</option>
              <option>Punjab</option>
              <option>Haryana</option>
              <option>Rajasthan</option>
            </select>
          </div>

          <button className="btn-primary" onClick={handleFetchSchemes} disabled={loading}>
            {loading ? 'Loading...' : 'Find Schemes'}
          </button>
        </div>

        {schemes && (
          <div className="result-section">
            <h3>Available Government Schemes</h3>
            
            <div className="schemes-list">
              {schemes.schemes.map((scheme, idx) => (
                <div key={idx} className="scheme-card">
                  <h4>{scheme.name}</h4>
                  <p className="description">{scheme.description}</p>
                  <div className="scheme-details">
                    <p><strong>Benefit:</strong> {scheme.benefit}</p>
                    <p><strong>Eligibility:</strong> {scheme.eligibility}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="helpful-links">
              <h4>Helpful Resources</h4>
              <ul>
                {schemes.helpful_links.map((link, idx) => (
                  <li key={idx}>
                    <a href={link} target="_blank" rel="noopener noreferrer">{link}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="note-box">
              <p>💡 {schemes.message}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default GovernmentSchemes;
