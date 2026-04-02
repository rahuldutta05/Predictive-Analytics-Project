import React, { useState } from 'react';
import '../styles/Features.css';

function WeatherAdvisories({ language }) {
  const [formData, setFormData] = useState({
    temperature: 30,
    humidity: 70,
    rainfall_forecast: 50,
    crop_name: 'Rice',
    growth_stage: 'vegetative',
    region: 'Tamil Nadu'
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

  const handleGetAdvisory = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/weather_advisory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
      alert('Error fetching advisory.');
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (temp) => {
    if (temp < 0) return '❄️';
    if (temp > 35) return '🔥';
    return '⛅';
  };

  return (
    <div className="feature-container">
      <div className="feature-header">
        <h2>⛅ Weather-Based Advisories</h2>
        <p>Get actionable farming advice based on weather conditions</p>
      </div>

      <div className="feature-content">
        <div className="input-section">
          <h3>Current Weather Data</h3>
          
          <div className="form-grid">
            <div className="form-group">
              <label>Temperature (°C)</label>
              <input type="number" name="temperature" step="0.1" value={formData.temperature} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Humidity (%)</label>
              <input type="number" name="humidity" value={formData.humidity} onChange={handleChange} min="0" max="100" />
            </div>

            <div className="form-group">
              <label>Rainfall Forecast (mm)</label>
              <input type="number" name="rainfall_forecast" step="0.1" value={formData.rainfall_forecast} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Crop Name</label>
              <select name="crop_name" value={formData.crop_name} onChange={handleChange}>
                <option>Rice</option>
                <option>Wheat</option>
                <option>Corn</option>
              </select>
            </div>

            <div className="form-group">
              <label>Growth Stage</label>
              <select name="growth_stage" value={formData.growth_stage} onChange={handleChange}>
                <option value="seedling">Seedling</option>
                <option value="vegetative">Vegetative</option>
                <option value="flowering">Flowering</option>
                <option value="maturity">Maturity</option>
              </select>
            </div>

            <div className="form-group">
              <label>Region</label>
              <input type="text" name="region" value={formData.region} onChange={handleChange} />
            </div>
          </div>

          <button className="btn-primary" onClick={handleGetAdvisory} disabled={loading}>
            {loading ? 'Analyzing...' : 'Get Advisory'}
          </button>
        </div>

        {result && (
          <div className="result-section">
            <h3>Weather Advisory</h3>
            
            <div className="weather-display">
              <div className="weather-item">
                <span className="weather-icon">{getWeatherIcon(result.weather_conditions.temperature)}</span>
                <span>{result.weather_conditions.temperature}°C</span>
              </div>
              <div className="weather-item">
                <span className="weather-icon">💨</span>
                <span>{result.weather_conditions.humidity}% Humidity</span>
              </div>
              <div className="weather-item">
                <span className="weather-icon">🌧️</span>
                <span>{result.weather_conditions.rainfall_forecast_mm}mm Rain</span>
              </div>
            </div>

            {result.advisories.length > 0 && (
              <div className="advisories-section">
                {result.advisories.map((advisory, idx) => (
                  <div key={idx} className="advisory-card">
                    <h4>{advisory.type} - {advisory.risk_level} Risk</h4>
                    {advisory.pests && (
                      <p><strong>Pests:</strong> {advisory.pests.join(', ')}</p>
                    )}
                    {advisory.weeds && (
                      <p><strong>Weeds:</strong> {advisory.weeds.join(', ')}</p>
                    )}
                    <div className="recommendations">
                      <strong>Actions:</strong>
                      <ul>
                        {advisory.recommendations.map((rec, i) => (
                          <li key={i}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {result.stage_specific_advice && (
              <div className="stage-advice">
                <h4>Stage-Specific Tip</h4>
                <p>{result.stage_specific_advice.tip}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default WeatherAdvisories;
