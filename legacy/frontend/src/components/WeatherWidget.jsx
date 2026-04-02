import React from 'react';
import './WeatherWidget.css';

const WeatherItem = ({ icon, label, value }) => (
  <div className="weather-item">
    <span className="weather-icon">{icon}</span>
    <div>
      <span className="weather-label">{label}</span>
      <span className="weather-value">{value}</span>
    </div>
  </div>
);

const WeatherWidget = ({ weatherData }) => {
  const c = weatherData?.current_condition?.[0];

  return (
    <section className="weather-section">
      <div className="weather-header">
        <h2 className="weather-title">📡 Live Conditions</h2>
        {c && (
          <span className="weather-desc">{c.weatherDesc[0].value}</span>
        )}
      </div>
      <div className="weather-grid">
        <WeatherItem icon="🌡️" label="Temperature" value={c ? `${c.temp_C}°C` : '—'} />
        <WeatherItem icon="💧" label="Humidity"    value={c ? `${c.humidity}%` : '—'} />
        <WeatherItem icon="🌧️" label="Rainfall 24h" value={c ? `${c.precipMM} mm` : '0 mm'} />
        <WeatherItem icon="💨" label="Wind Speed"  value={c ? `${c.windspeedKmph} km/h` : '—'} />
        <WeatherItem icon="👁️" label="Visibility"  value={c ? `${c.visibility} km` : '—'} />
      </div>
    </section>
  );
};

export default WeatherWidget;
