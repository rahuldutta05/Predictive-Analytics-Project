import React, { useState } from 'react';
import '../styles/Features.css';

function IrrigationScheduler({ language }) {
  const [formData, setFormData] = useState({
    crop_name: 'Rice',
    soil_type: 'Loamy',
    irrigation_method: 'Drip',
    rainfall_expected: 30,
    growth_stage: 'vegetative'
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

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/irrigation_schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
      alert('Error generating schedule.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="feature-container">
      <div className="feature-header">
        <h2>💧 Irrigation Scheduler</h2>
        <p>Get a weekly irrigation schedule tailored to your crop and soil</p>
      </div>

      <div className="feature-content">
        <div className="input-section">
          <h3>Schedule Details</h3>
          
          <div className="form-grid">
            <div className="form-group">
              <label>Crop Name</label>
              <select name="crop_name" value={formData.crop_name} onChange={handleChange}>
                <option>Rice</option>
                <option>Wheat</option>
                <option>Corn</option>
                <option>Tomato</option>
              </select>
            </div>

            <div className="form-group">
              <label>Soil Type</label>
              <select name="soil_type" value={formData.soil_type} onChange={handleChange}>
                <option>Sandy</option>
                <option>Loamy</option>
                <option>Clay</option>
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
              <label>Rainfall Expected (mm)</label>
              <input type="number" name="rainfall_expected" step="0.1" value={formData.rainfall_expected} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Growth Stage</label>
              <select name="growth_stage" value={formData.growth_stage} onChange={handleChange}>
                <option value="seedling">Seedling</option>
                <option value="vegetative">Vegetative</option>
                <option value="flowering">Flowering</option>
                <option value="fruiting">Fruiting</option>
                <option value="maturity">Maturity</option>
              </select>
            </div>
          </div>

          <button className="btn-primary" onClick={handleGenerate} disabled={loading}>
            {loading ? 'Generating...' : 'Generate Schedule'}
          </button>
        </div>

        {result && (
          <div className="result-section">
            <h3>Weekly Irrigation Schedule</h3>
            
            <div className="schedule-summary">
              <div className="summary-card">
                <h4>Weekly Requirement</h4>
                <p className="value">{result.weekly_requirement_mm} mm</p>
                <p className="label">for {result.crop}</p>
              </div>
              <div className="summary-card">
                <h4>Method</h4>
                <p className="value">{result.irrigation_method}</p>
                <p className="label">Efficiency & Timing</p>
              </div>
            </div>

            <div className="schedule-table">
              <h4>Monthly Schedule</h4>
              <table>
                <thead>
                  <tr>
                    <th>Period</th>
                    <th>Water Needed (mm)</th>
                    <th>Timing</th>
                  </tr>
                </thead>
                <tbody>
                  {result.schedule.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.day}</td>
                      <td>{item.irrigation_mm}</td>
                      <td>{item.timing}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {result.notes && (
              <div className="notes-section">
                <h4>💡 Important Notes</h4>
                <ul>
                  {result.notes.map((note, idx) => (
                    <li key={idx}>{note}</li>
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

export default IrrigationScheduler;
