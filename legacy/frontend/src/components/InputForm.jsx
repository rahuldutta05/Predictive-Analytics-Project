import React from 'react';
import './InputForm.css';

const FIELD_META = {
  N:                 { label: 'Nitrogen (N)',       unit: 'kg/ha',  group: 'soil' },
  P:                 { label: 'Phosphorus (P)',      unit: 'kg/ha',  group: 'soil' },
  K:                 { label: 'Potassium (K)',        unit: 'kg/ha',  group: 'soil' },
  ph:                { label: 'Soil pH',              unit: '',       group: 'soil' },
  Soil_OC:           { label: 'Soil Organic Carbon',  unit: '%',      group: 'soil' },
  temperature:       { label: 'Temperature',          unit: '°C',     group: 'climate' },
  humidity:          { label: 'Humidity',             unit: '%',      group: 'climate' },
  rainfall:          { label: 'Rainfall',             unit: 'mm',     group: 'climate' },
  Fertilizer_kg_ha:  { label: 'Fertilizer Applied',  unit: 'kg/ha',  group: 'farm' },
  Pest_Index:        { label: 'Pest Index',           unit: '',       group: 'farm' },
  Irrigation_mm:     { label: 'Irrigation',           unit: 'mm',     group: 'farm' },
};

const GROUP_LABELS = {
  soil:    { icon: '🌍', title: 'Soil Parameters' },
  climate: { icon: '🌤️',  title: 'Climate Data' },
  farm:    { icon: '🚜',  title: 'Farm Inputs' },
};

const InputForm = ({ inputs, onChange, onPredict, loading, error }) => {
  const groups = ['soil', 'climate', 'farm'];

  return (
    <section className="input-form-section">
      <div className="section-header">
        <h2 className="section-title">Enter Field Data</h2>
        <p className="section-subtitle">
          Provide soil, climate, and farm parameters for AI-powered predictions
        </p>
      </div>

      <div className="input-groups">
        {groups.map(group => {
          const fields = Object.entries(FIELD_META).filter(([, m]) => m.group === group);
          const { icon, title } = GROUP_LABELS[group];
          return (
            <div key={group} className="input-group">
              <h3 className="group-label">{icon} {title}</h3>
              <div className="fields-grid">
                {fields.map(([key, meta]) => (
                  <div key={key} className="field-wrap">
                    <label className="field-label">
                      {meta.label}
                      {meta.unit && <span className="field-unit">{meta.unit}</span>}
                    </label>
                    <input
                      type="number"
                      name={key}
                      value={inputs[key]}
                      onChange={onChange}
                      className="field-input"
                      step="any"
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="form-footer">
        <button
          className="predict-btn"
          onClick={onPredict}
          disabled={loading}
        >
          {loading ? (
            <><span className="spinner" /> Analysing…</>
          ) : (
            <> Get AI Predictions</>
          )}
        </button>
        {error && <p className="form-error">{error}</p>}
      </div>
    </section>
  );
};

export default InputForm;
