import React, { useState } from 'react';
import '../styles/Features.css';

function CropTimeline({ language }) {
  const [formData, setFormData] = useState({
    crop_name: 'Rice',
    region: 'Tamil Nadu'
  });
  
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGetTimeline = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/crop_advisory_timeline', {
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
        <h2>📅 Crop Advisory Timeline</h2>
        <p>Month-by-month guidance for your crop's entire season</p>
      </div>

      <div className="feature-content">
        <div className="input-section">
          <div className="form-grid">
            <div className="form-group">
              <label>Crop Name</label>
              <select name="crop_name" value={formData.crop_name} onChange={handleChange}>
                <option>Rice</option>
                <option>Wheat</option>
              </select>
            </div>

            <div className="form-group">
              <label>Your Region</label>
              <input type="text" name="region" value={formData.region} onChange={handleChange} />
            </div>
          </div>

          <button className="btn-primary" onClick={handleGetTimeline} disabled={loading}>
            {loading ? 'Loading...' : 'Get Timeline'}
          </button>
        </div>

        {result && (
          <div className="result-section">
            <h3>{result.crop} - {result.season_duration_months} Month Plan</h3>
            
            <div className="timeline">
              {Object.entries(result.timeline).map(([month, tasks], idx) => (
                <div key={idx} className="timeline-item">
                  <div className="timeline-marker">{idx + 1}</div>
                  <div className="timeline-content">
                    <h4>{month}</h4>
                    <ul>
                      {tasks.map((task, taskIdx) => (
                        <li key={taskIdx}>{task}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            <div className="notification-setup">
              <p>💡 {result.notification_preference}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CropTimeline;
