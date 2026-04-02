import React, { useState } from 'react';
import '../styles/Features.css';

function CropRotationGuide({ language }) {
  const [formData, setFormData] = useState({
    current_crop: 'Rice',
    region: 'Tamil Nadu'
  });
  
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGetRecommendation = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/crop_rotation', {
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

  return (
    <div className="feature-container">
      <div className="feature-header">
        <h2>🔄 Crop Rotation Guide</h2>
        <p>Plan your crop rotation for sustainable farming</p>
      </div>

      <div className="feature-content">
        <div className="input-section">
          <div className="form-grid">
            <div className="form-group">
              <label>Current Crop</label>
              <select name="current_crop" value={formData.current_crop} onChange={handleChange}>
                <option>Rice</option>
                <option>Wheat</option>
                <option>Corn</option>
                <option>Cotton</option>
                <option>Sugarcane</option>
                <option>Pulses</option>
              </select>
            </div>

            <div className="form-group">
              <label>Your Region</label>
              <input type="text" name="region" value={formData.region} onChange={handleChange} />
            </div>
          </div>

          <button className="btn-primary" onClick={handleGetRecommendation} disabled={loading}>
            {loading ? 'Recommending...' : 'Get Recommendation'}
          </button>
        </div>

        {result && (
          <div className="result-section">
            <h3>Crop Rotation Plan</h3>
            
            <div className="rotation-diagram">
              <div className="rotation-step current">
                <h4>Current</h4>
                <p>{result.current_crop}</p>
              </div>
              <div className="arrow">→</div>
              <div className="rotation-step next">
                <h4>Next Season</h4>
                <div className="crop-options">
                  {result.recommended_next_crops.map((crop, idx) => (
                    <div key={idx} className="crop-option">{crop}</div>
                  ))}
                </div>
              </div>
            </div>

            <div className="benefits-section">
              <h4>Benefits of Crop Rotation</h4>
              <ul>
                {Object.entries(result.benefits).map(([key, value], idx) => (
                  <li key={idx}><strong>{key}:</strong> {value}</li>
                ))}
              </ul>
            </div>

            <div className="note-box">
              <p>💡 {result.next_season_timing}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CropRotationGuide;
