import React from 'react';
import './InputForm.css';
import { t } from "../i18n";

// Maps field key → { labelKey, unit, group }
const FIELD_META = {
  N:                 { labelKey: 'fieldN',           unit: 'kg/ha',  group: 'soil' },
  P:                 { labelKey: 'fieldP',            unit: 'kg/ha',  group: 'soil' },
  K:                 { labelKey: 'fieldK',            unit: 'kg/ha',  group: 'soil' },
  ph:                { labelKey: 'fieldPh',           unit: '',       group: 'soil' },
  Soil_OC:           { labelKey: 'fieldSoilOC',       unit: '%',      group: 'soil' },
  temperature:       { labelKey: 'fieldTemperature',  unit: '°C',     group: 'climate' },
  humidity:          { labelKey: 'fieldHumidity',     unit: '%',      group: 'climate' },
  rainfall:          { labelKey: 'fieldRainfall',     unit: 'mm',     group: 'climate' },
  Fertilizer_kg_ha:  { labelKey: 'fieldFertilizer',  unit: 'kg/ha',  group: 'farm' },
  Pest_Index:        { labelKey: 'fieldPestIndex',    unit: '',       group: 'farm' },
  Irrigation_mm:     { labelKey: 'fieldIrrigation',  unit: 'mm',     group: 'farm' },
};

const GROUP_META = {
  soil:    { icon: '🌍', labelKey: 'groupSoil' },
  climate: { icon: '🌤️',  labelKey: 'groupClimate' },
  farm:    { icon: '🚜',  labelKey: 'groupFarm' },
};

const InputForm = ({ inputs, onChange, onPredict, loading, error, lang = "en" }) => {
  const groups = ['soil', 'climate', 'farm'];

  return (
    <section className="input-form-section">
      <div className="section-header">
        <h2 className="section-title">{t(lang, "inputHeroTitle")}</h2>
        <p className="section-subtitle">{t(lang, "inputHeroSub")}</p>
      </div>

      <div className="input-groups">
        {groups.map(group => {
          const fields = Object.entries(FIELD_META).filter(([, m]) => m.group === group);
          const { icon, labelKey } = GROUP_META[group];
          return (
            <div key={group} className="input-group">
              <h3 className="group-label">{icon} {t(lang, labelKey)}</h3>
              <div className="fields-grid">
                {fields.map(([key, meta]) => (
                  <div key={key} className="field-wrap">
                    <label className="field-label">
                      {t(lang, meta.labelKey)}
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
            <><span className="spinner" /> {t(lang, "predictCta")}…</>
          ) : (
            <> {t(lang, "predictCta")}</>
          )}
        </button>
        {error && <p className="form-error">{error}</p>}
      </div>
    </section>
  );
};

export default InputForm;
