import React, { useState } from 'react';
import '../styles/Features.css';

function WaterAudit({ language }) {
  const [formData, setFormData] = useState({
    water_used_mm: 400,
    crop_name: 'Rice',
    irrigation_method: 'Flood',
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

  const handleAudit = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/water_audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
      alert('Error performing audit.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="feature-container">
      <div className="feature-header">
        <h2>💦 Water Audit & Savings Report</h2>
        <p>Audit your water usage and discover savings opportunities</p>
      </div>

      <div className="feature-content">
        <div className="input-section">
          <h3>Water Usage Details</h3>
          
          <div className="form-grid">
            <div className="form-group">
              <label>Water Used (mm)</label>
              <input 
                type="number" 
                name="water_used_mm" 
                step="10"
                value={formData.water_used_mm}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Crop Name</label>
              <select name="crop_name" value={formData.crop_name} onChange={handleChange}>
                <option>Rice</option>
                <option>Wheat</option>
                <option>Corn</option>
                <option>Tomato</option>
                <option>Cotton</option>
              </select>
            </div>

            <div className="form-group">
              <label>Irrigation Method</label>
              <select name="irrigation_method" value={formData.irrigation_method} onChange={handleChange}>
                <option>Flood</option>
                <option>Sprinkler</option>
                <option>Drip</option>
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

          <button className="btn-primary" onClick={handleAudit} disabled={loading}>
            {loading ? 'Auditing...' : 'Perform Audit'}
          </button>
        </div>

        {result && (
          <div className="result-section">
            <h3>Water Audit Report</h3>
            
            <div className="audit-summary">
              <div className="audit-card">
                <h4>Water Used</h4>
                <p className="value">{result.water_used_mm} mm</p>
              </div>
              <div className="audit-card">
                <h4>Expected Usage</h4>
                <p className="value">{result.expected_water_mm} mm</p>
              </div>
              <div className="audit-card">
                <h4>Difference</h4>
                <p className={`value ${result.difference_mm > 0 ? 'excess' : 'optimal'}`}>
                  {result.difference_mm > 0 ? '+' : ''}{result.difference_mm} mm
                </p>
              </div>
              <div className="audit-card">
                <h4>Total Water Cost</h4>
                <p className="value">₹{result.total_water_cost}</p>
              </div>
            </div>

            <div className="efficiency-display">
              <h4>Irrigation Efficiency</h4>
              <div className="efficiency-meter">
                <div className="meter-fill" style={{width: `${result.efficiency_percent}%`}}></div>
              </div>
              <p className="efficiency-text">{result.efficiency_percent}% Efficient</p>
            </div>

            {result.recommendations.length > 0 && (
              <div className="recommendations">
                <h4>💧 Water Saving Recommendations</h4>
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

export default WaterAudit;
