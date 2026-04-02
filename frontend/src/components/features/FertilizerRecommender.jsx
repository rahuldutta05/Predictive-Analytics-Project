import React, { useState } from 'react';
import '../styles/Features.css';

function FertilizerRecommender({ language }) {
  const [formData, setFormData] = useState({
    N: 40,
    P: 15,
    K: 150,
    target_yield: 4,
    crop_name: 'Rice',
    land_area_ha: 1
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
      const response = await fetch('http://localhost:8000/fertilizer_recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          soil_analysis: { N: formData.N, P: formData.P, K: formData.K },
          target_yield: formData.target_yield,
          crop_name: formData.crop_name
        })
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
      alert('Error getting recommendations. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="feature-container">
      <div className="feature-header">
        <h2>🧪 Fertilizer Recommendation Engine</h2>
        <p>Get specific fertilizer recommendations based on soil deficiencies</p>
      </div>

      <div className="feature-content">
        <div className="input-section">
          <h3>Soil & Crop Details</h3>
          
          <div className="form-grid">
            <div className="form-group">
              <label>Nitrogen (N) mg/kg</label>
              <input 
                type="number" 
                name="N" 
                value={formData.N}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Phosphorus (P) mg/kg</label>
              <input 
                type="number" 
                name="P" 
                value={formData.P}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Potassium (K) mg/kg</label>
              <input 
                type="number" 
                name="K" 
                value={formData.K}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Target Yield (t/ha)</label>
              <input 
                type="number" 
                name="target_yield" 
                step="0.1"
                value={formData.target_yield}
                onChange={handleChange}
              />
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
              </select>
            </div>

            <div className="form-group">
              <label>Land Area (ha)</label>
              <input 
                type="number" 
                name="land_area_ha" 
                step="0.1"
                value={formData.land_area_ha}
                onChange={handleChange}
              />
            </div>
          </div>

          <button className="btn-primary" onClick={handleAnalyze} disabled={loading}>
            {loading ? 'Generating...' : 'Get Recommendations'}
          </button>
        </div>

        {result && (
          <div className="result-section">
            <h3>Fertilizer Recommendations</h3>
            
            <div className="cost-summary">
              <div className="cost-card">
                <h4>Estimated Cost</h4>
                <p className="cost-value">₹{result.total_estimated_cost}</p>
              </div>
              <div className="cost-card">
                <h4>Expected ROI</h4>
                <p className="cost-value">{result.estimated_roi_percent}%</p>
              </div>
            </div>

            {result.recommendations.length > 0 && (
              <div className="recommendations">
                <h4>📋 Fertilizer Schedule</h4>
                <div className="fertilizer-list">
                  {result.recommendations.map((rec, idx) => (
                    <div key={idx} className="fertilizer-card">
                      <div className="fert-header">
                        <span className="fert-name">{rec.fertilizer}</span>
                        <span className="nutrient-badge">{rec.nutrient}</span>
                      </div>
                      <div className="fert-details">
                        <p><strong>NPK Ratio:</strong> {rec.npk_ratio}</p>
                        <p><strong>Amount Needed:</strong> {rec.amount_needed_kg} kg</p>
                        <p><strong>Estimated Cost:</strong> ₹{rec.estimated_cost}</p>
                        <p><strong>Efficiency:</strong> <span className="efficiency">{rec.efficiency}</span></p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="note-box">
              <p>💡 {result.note}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FertilizerRecommender;
