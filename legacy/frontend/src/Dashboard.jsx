import React, { useState, useEffect } from 'react';

// Chart.js registration (must come before any chart import)
import './components/charts/chartSetup';

import { predictYield, recommendCrop } from './api';
import mockData from './crop_data.json';

import Header                  from './components/Header';
import InputForm               from './components/InputForm';
import SummaryCards            from './components/SummaryCards';
import WeatherWidget           from './components/WeatherWidget';
import CropRecommendationChart from './components/charts/CropRecommendationChart';
import NPKChart                from './components/charts/NPKChart';
import RainfallYieldChart      from './components/charts/RainfallYieldChart';
import RadarProfileChart       from './components/charts/RadarProfileChart';
import SoilOCChart             from './components/charts/SoilOCChart';
import PestIndexChart          from './components/charts/PestIndexChart';
import FertilizerChart         from './components/charts/FertilizerChart';

import './Dashboard.css';

// ── MSP price lookup (₹/quintal) ──────────────────────────────────
const CROP_PRICES = {
  rice: 2369, maize: 2400, chickpea: 5650, kidneybeans: 4400,
  pigeonpeas: 8000, mothbeans: 3010, mungbean: 8768, blackgram: 6950,
  'lentil(masur)': 6425, pomegranete: 7000, banana: 1500, mango: 1616,
  grapes: 7500, watermelon: 2326.47, muskmelon: 2000, apple: 4500,
  orange: 3170, papaya: 1200, coconut: 11582, cotton: 7710,
  jute: 5650, coffee: 23100,
};

// ── Helper: build dynamic chart data for top-k crops ──────────────
const buildDynamicData = (topCrops, key, label, colors) => {
  const names    = topCrops.map(c => c.crop.toLowerCase());
  const filtered = mockData.filter(d => names.includes(d.label.toLowerCase()));
  const labels   = [...new Set(filtered.map(d => d.label))];

  const avgs = labels.map(l => {
    const rows = filtered.filter(d => d.label.toLowerCase() === l.toLowerCase());
    return (rows.reduce((s, d) => s + d[key], 0) / rows.length).toFixed(2);
  });

  return {
    labels,
    datasets: [{
      label,
      data: avgs,
      backgroundColor: colors,
      borderColor: colors,
      borderWidth: 1,
    }],
  };
};

const DEFAULT_INPUTS = {
  N: 90, P: 35, K: 180,
  temperature: 24, humidity: 80, ph: 6.5, rainfall: 200,
  Soil_OC: 1.25, Fertilizer_kg_ha: 252, Pest_Index: 0.79, Irrigation_mm: 308,
};

// ──────────────────────────────────────────────────────────────────
const Dashboard = ({ theme, onToggleTheme }) => {
  const [inputs,       setInputs]       = useState(DEFAULT_INPUTS);
  const [yieldResult,  setYieldResult]  = useState(null);
  const [cropResult,   setCropResult]   = useState(null);
  const [grossRevenue, setGrossRevenue] = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState(null);
  const [weatherData,  setWeatherData]  = useState(null);

  // Dynamic chart data (updated after each prediction)
  const [dynSoilOC,     setDynSoilOC]     = useState(null);
  const [dynPestIndex,  setDynPestIndex]  = useState(null);
  const [dynFertilizer, setDynFertilizer] = useState(null);

  // ── Fetch live weather ─────────────────────────────────────────
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch('https://wttr.in/Kolkata?format=j1');
        if (!res.ok) return;
        setWeatherData(await res.json());
      } catch (_) {}
    };
    fetchWeather();
    const id = setInterval(fetchWeather, 600_000);
    return () => clearInterval(id);
  }, []);

  // ── Update dynamic charts when crop result changes ─────────────
  useEffect(() => {
    if (!cropResult?.top_crops?.length) return;
    const top = cropResult.top_crops.slice(0, 3);
    const c   = ['#9b59b6', '#e74c3c', '#f39c12'];

    setDynSoilOC(    buildDynamicData(top, 'Soil_OC',          'Soil OC (g/kg)',     c));
    setDynPestIndex( buildDynamicData(top, 'Pest_Index',       'Pest Index',         c[1]));
    setDynFertilizer(buildDynamicData(top, 'Fertilizer_kg_ha', 'Fertilizer (kg/ha)', c.map(x => x + 'b3')));
  }, [cropResult]);

  // ── Handle form input change ───────────────────────────────────
  const handleChange = e =>
    setInputs(prev => ({ ...prev, [e.target.name]: parseFloat(e.target.value) }));

  // ── Handle prediction ──────────────────────────────────────────
  const handlePredict = async () => {
    setLoading(true);
    setError(null);
    try {
      const [yieldData, cropData] = await Promise.all([
        predictYield(inputs),
        recommendCrop(inputs),
      ]);

      setYieldResult({ ...yieldData, timestamp: new Date() });
      setCropResult(cropData);

      if (yieldData && cropData?.top_crops?.length) {
        const price   = CROP_PRICES[cropData.top_crops[0].crop.toLowerCase()] || 0;
        const revenue = yieldData.predicted_yield_t_ha * 10 * price;
        setGrossRevenue(revenue.toFixed(2));
      }
    } catch (err) {
      setError('Prediction failed. Check your inputs or the API connection.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ────────────────────────────────────────────────────────────────
  return (
    <>
      <Header theme={theme} onToggleTheme={onToggleTheme} />

      <main className="dashboard-main">

        {/* ── Input ────────────────────────────────────────────── */}
        <InputForm
          inputs={inputs}
          onChange={handleChange}
          onPredict={handlePredict}
          loading={loading}
          error={error}
        />

        {/* ── Summary ──────────────────────────────────────────── */}
        <SummaryCards
          yieldResult={yieldResult}
          cropResult={cropResult}
          grossRevenue={grossRevenue}
        />

        {/* ── Weather ──────────────────────────────────────────── */}
        <WeatherWidget weatherData={weatherData} />

        {/* ── Charts row 1: Crop recommendation + NPK ──────────── */}
        <div className="chart-row-2">
          <CropRecommendationChart cropResult={cropResult} />
          <NPKChart inputs={inputs} />
        </div>

        {/* ── Charts row 2: Rainfall vs Yield + Radar ──────────── */}
        <div className="chart-row-2">
          <RainfallYieldChart />
          <RadarProfileChart inputs={inputs} />
        </div>

        {/* ── Charts row 3: Soil OC + Pest + Fertilizer ────────── */}
        <div className="chart-row-3">
          <SoilOCChart     dynamicData={dynSoilOC} />
          <PestIndexChart  dynamicData={dynPestIndex} />
          <FertilizerChart dynamicData={dynFertilizer} />
        </div>

      </main>
    </>
  );
};

export default Dashboard;
