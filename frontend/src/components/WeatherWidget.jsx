import React from 'react';
import './WeatherWidget.css';
import { t } from "../i18n";

const WeatherItem = ({ icon, label, value }) => (
  <div className="weather-item">
    <span className="weather-icon">{icon}</span>
    <div>
      <span className="weather-label">{label}</span>
      <span className="weather-value">{value}</span>
    </div>
  </div>
);

const WeatherWidget = ({ weatherData, lang = "en" }) => {
  const c = weatherData?.current_condition?.[0];

  return (
    <section className="weather-section">
      <div className="weather-header">
        <h2 className="weather-title">{t(lang, "weatherTitle")}</h2>
        {c && (
          <span className="weather-desc">{c.weatherDesc[0].value}</span>
        )}
      </div>
      <div className="weather-grid">
        <WeatherItem icon="🌡️" label={t(lang, "weatherTemperature")} value={c ? `${c.temp_C}°C` : '—'} />
        <WeatherItem icon="💧" label={t(lang, "weatherHumidity")}    value={c ? `${c.humidity}%` : '—'} />
        <WeatherItem icon="🌧️" label={t(lang, "weatherRainfall")} value={c ? `${c.precipMM} mm` : '0 mm'} />
        <WeatherItem icon="💨" label={t(lang, "weatherWind")}  value={c ? `${c.windspeedKmph} km/h` : '—'} />
        <WeatherItem icon="👁️" label={t(lang, "weatherVisibility")}  value={c ? `${c.visibility} km` : '—'} />
      </div>
    </section>
  );
};

export default WeatherWidget;
