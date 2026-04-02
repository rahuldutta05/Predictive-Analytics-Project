import React, { useState } from 'react';
import '../styles/Features.css';

function SoilHealthDashboard({ language }) {
  const [formData, setFormData] = useState({
    N: 40,
    P: 15,
    K: 150,
    ph: 6.5,
    organic_matter: 2.5,
    microbial_count: 100,
    crop_name: 'Rice'
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

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/soil_analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
      alert('Error analyzing soil. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="feature-container">
      <div className="feature-header">
        <h2>🌱 Soil Health Dashboard</h2>
        <p>Analyze your soil composition and get personalized recommendations</p>
      </div>

      <div className="feature-content">
        <div className="input-section">
          <h3>Enter Soil Test Results</h3>
          
          <div className="form-grid">
            <div className="form-group">
              <label>Nitrogen (N) mg/kg</label>
              <input 
                type="number" 
                name="N" 
                value={formData.N}
                onChange={handleChange}
                placeholder="Enter N value"
              />
              <small>Optimal: 30-60</small>
            </div>

            <div className="form-group">
              <label>Phosphorus (P) mg/kg</label>
              <input 
                type="number" 
                name="P" 
                value={formData.P}
                onChange={handleChange}
                placeholder="Enter P value"
              />
              <small>Optimal: 15-30</small>
            </div>

            <div className="form-group">
              <label>Potassium (K) mg/kg</label>
              <input 
                type="number" 
                name="K" 
                value={formData.K}
                onChange={handleChange}
                placeholder="Enter K value"
              />
              <small>Optimal: 150-300</small>
            </div>

            <div className="form-group">
              <label>pH Level</label>
              <input 
                type="number" 
                name="ph" 
                step="0.1"
                value={formData.ph}
                onChange={handleChange}
                placeholder="Enter pH"
              />
              <small>Optimal: 6.0-7.5</small>
            </div>

            <div className="form-group">
              <label>Organic Matter (%)</label>
              <input 
                type="number" 
                name="organic_matter" 
                step="0.1"
                value={formData.organic_matter}
                onChange={handleChange}
                placeholder="Enter %"
              />
              <small>Target: ≥2.0%</small>
            </div>

            <div className="form-group">
              <label>Microbial Count (CFU/g)</label>
              <input 
                type="number" 
                name="microbial_count" 
                value={formData.microbial_count}
                onChange={handleChange}
                placeholder="Enter count"
              />
              <small>Healthy: ≥100</small>
            </div>

            <div className="form-group">
              <label>Crop Name</label>
              <select 
                name="crop_name" 
                value={formData.crop_name}
                onChange={handleChange}
              >
                <option>Rice</option>
                <option>Wheat</option>
                <option>Corn</option>
                <option>Tomato</option>
                <option>Pulses</option>
              </select>
            </div>
          </div>

          <button className="btn-primary" onClick={handleAnalyze} disabled={loading}>
            {loading ? 'Analyzing...' : 'Analyze Soil'}
          </button>
        </div>

        {result && (
          <div className="result-section">
            <h3>Soil Analysis Results</h3>
            
            <div className="score-card">
              <div className="score-display">
                <div className="score-circle">
                  <span className="score-value">{result.soil_score}</span>
                  <span className="score-max">/100</span>
                </div>
              </div>
              <p className="score-label">Overall Soil Health Score</p>
            </div>

            <div className="npk-status">
              <h4>NPK Status</h4>
              <div className="status-grid">
                {Object.entries(result.npk_status).map(([nutrient, status]) => (
                  <div key={nutrient} className={`status-card ${status.toLowerCase()}`}>
                    <span className="nutrient-name">{nutrient}</span>
                    <span className="status-badge">{status}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="ph-organic">
              <div className="info-card">
                <h4>pH Status</h4>
                <p className="status-text">{result.ph_status}</p>
              </div>
              <div className="info-card">
                <h4>Organic Matter</h4>
                <p className="status-text">{result.organic_matter_status}</p>
              </div>
            </div>

            {result.recommendations.length > 0 && (
              <div className="recommendations">
                <h4>📋 Recommendations</h4>
                <ul>
                  {result.recommendations.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default SoilHealthDashboard;
