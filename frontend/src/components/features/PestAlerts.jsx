import React, { useState } from 'react';
import '../styles/Features.css';

function PestAlerts({ language }) {
  const [formData, setFormData] = useState({
    region: 'Tamil Nadu',
    crop_name: 'Rice',
    season: 'monsoon',
    temperature: 28,
    humidity: 75,
    rainfall: 100
  });
  
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: isNaN(value) ? value : parseFloat(value)
    }));
  };

  const handleGetAlerts = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/pest_alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level) => {
    switch(level) {
      case 'High': return '#e74c3c';
      case 'Medium': return '#f39c12';
      case 'Low': return '#2ecc71';
      default: return '#95a5a6';
    }
  };

  return (
    <div className="feature-container">
      <div className="feature-header">
        <h2>🐛 Pest & Weed Alert System</h2>
        <p>Get early warnings about potential pest and weed issues</p>
      </div>

      <div className="feature-content">
        <div className="input-section">
          <h3>Environmental Conditions</h3>
          
          <div className="form-grid">
            <div className="form-group">
              <label>Region</label>
              <input type="text" name="region" value={formData.region} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Crop</label>
              <select name="crop_name" value={formData.crop_name} onChange={handleChange}>
                <option>Rice</option>
                <option>Wheat</option>
                <option>Corn</option>
              </select>
            </div>

            <div className="form-group">
              <label>Season</label>
              <select name="season" value={formData.season} onChange={handleChange}>
                <option value="monsoon">Monsoon</option>
                <option value="spring">Spring</option>
                <option value="summer">Summer</option>
                <option value="winter">Winter</option>
              </select>
            </div>

            <div className="form-group">
              <label>Temperature (°C)</label>
              <input type="number" name="temperature" step="0.1" value={formData.temperature} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Humidity (%)</label>
              <input type="number" name="humidity" value={formData.humidity} onChange={handleChange} min="0" max="100" />
            </div>

            <div className="form-group">
              <label>Rainfall (mm)</label>
              <input type="number" name="rainfall" step="0.1" value={formData.rainfall} onChange={handleChange} />
            </div>
          </div>

          <button className="btn-primary" onClick={handleGetAlerts} disabled={loading}>
            {loading ? 'Analyzing...' : 'Check Alerts'}
          </button>
        </div>

        {result && (
          <div className="result-section">
            <h3>Pest & Weed Alerts</h3>
            
            <div className="alerts-grid">
              {result.alerts.map((alert, idx) => (
                <div key={idx} className="alert-card" style={{borderLeftColor: getRiskColor(alert.risk_level)}}>
                  <div className="alert-header">
                    <h4>{alert.type}</h4>
                    <span className="risk-badge" style={{backgroundColor: getRiskColor(alert.risk_level)}}>
                      {alert.risk_level} Risk
                    </span>
                  </div>

                  {alert.pests && (
                    <div className="alert-items">
                      <strong>Pests Found:</strong>
                      <div className="items-list">
                        {alert.pests.map((pest, i) => (
                          <span key={i} className="item-tag">{pest}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {alert.weeds && (
                    <div className="alert-items">
                      <strong>Weeds Detected:</strong>
                      <div className="items-list">
                        {alert.weeds.map((weed, i) => (
                          <span key={i} className="item-tag">{weed}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="recommendations">
                    <strong>Actions to Take:</strong>
                    <ul>
                      {alert.recommendations.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            <div className="next-alert">
              <p>⏰ Next alert check in: {result.next_alert_in}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PestAlerts;
