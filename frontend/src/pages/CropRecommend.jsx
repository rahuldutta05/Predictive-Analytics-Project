import React, { useEffect, useMemo, useState } from "react";
import { predictYield, recommendCrop } from "../api";

import InputForm       from "../components/InputForm";
import SummaryCards    from "../components/SummaryCards";
import WeatherWidget   from "../components/WeatherWidget";
import CropDetailCards from "../components/charts/CropDetailCards";

import CropRecommendationChart from "../components/charts/CropRecommendationChart";
import NPKChart                from "../components/charts/NPKChart";
import RadarProfileChart       from "../components/charts/RadarProfileChart";
import RainfallYieldChart      from "../components/charts/RainfallYieldChart";
import SoilOCChart             from "../components/charts/SoilOCChart";
import PestIndexChart          from "../components/charts/PestIndexChart";
import FertilizerChart         from "../components/charts/FertilizerChart";

import { pushHistoryEntry } from "../utils/history";
import { t }                from "../i18n";

import "../components/charts/chartSetup";
import "./CropRecommend.css";

/* ── Price table ─────────────────────────────────────────── */
const CROP_PRICES = {
  rice: 2369, maize: 2400, chickpea: 5650, kidneybeans: 4400,
  pigeonpeas: 8000, mothbeans: 3010, mungbean: 8768, blackgram: 6950,
  "lentil(masur)": 6425, pomegranate: 7000, banana: 1500, mango: 1616,
  grapes: 7500, watermelon: 2326.47, muskmelon: 2000, apple: 4500,
  orange: 3170, papaya: 1200, coconut: 11582, cotton: 7710, jute: 5650,
  coffee: 23100,
};

const DEFAULT_INPUTS = {
  N: 90, P: 35, K: 180, temperature: 24, humidity: 80,
  ph: 6.5, rainfall: 200, Soil_OC: 1.25,
  Fertilizer_kg_ha: 252, Pest_Index: 0.79, Irrigation_mm: 308,
};

/* ── Section label helper ────────────────────────────────── */
const SectionLabel = ({ children }) => (
  <p className="cr-section-label">{children}</p>
);

/* ═════════════════════════════════════════════════════════
   Main Page
═════════════════════════════════════════════════════════ */
export default function CropRecommend({
  theme = "light", lang = "en",
  onHistorySaved, onCropResultChange,
}) {
  const [inputs,       setInputs]       = useState(DEFAULT_INPUTS);
  const [yieldResult,  setYieldResult]  = useState(null);
  const [cropResult,   setCropResult]   = useState(null);
  const [grossRevenue, setGrossRevenue] = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState(null);
  const [weatherData,  setWeatherData]  = useState(null);
  const [predicted,    setPredicted]    = useState(false);  // true after first run

  /* Weather fetch */
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch("https://wttr.in/Kolkata?format=j1");
        if (!res.ok) return;
        setWeatherData(await res.json());
      } catch (_) {}
    };
    fetchWeather();
    const id = setInterval(fetchWeather, 600_000);
    return () => clearInterval(id);
  }, []);

  const handleChange = (e) =>
    setInputs((prev) => ({ ...prev, [e.target.name]: parseFloat(e.target.value) }));

  /* ── Prediction handler ─────────────────────────────── */
  const handlePredict = async () => {
    setLoading(true);
    setError(null);
    try {
      const [yieldData, recData] = await Promise.all([
        predictYield(inputs), recommendCrop(inputs),
      ]);

      setYieldResult({ ...yieldData, timestamp: new Date() });
      setCropResult(recData);
      setPredicted(true);

      let revenue = null;
      if (yieldData && recData?.top_crops?.length) {
        const price = CROP_PRICES[recData.top_crops[0].crop.toLowerCase()] || 0;
        revenue = yieldData.predicted_yield_t_ha * 10 * price;
        setGrossRevenue(revenue.toFixed(2));
      } else {
        setGrossRevenue(null);
      }

      // Notify App.jsx so FarmerTools can react
      if (onCropResultChange) onCropResultChange(recData);

      const entry = {
        createdAt: new Date().toISOString(),
        page: "crop_recommend",
        inputs, yieldResult: yieldData, cropResult: recData, grossRevenue: revenue,
      };
      pushHistoryEntry(entry);
      if (onHistorySaved) onHistorySaved(entry);
    } catch (err) {
      setError("Prediction failed. Check your inputs or the API connection.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const heroSubtitle = useMemo(() => {
    const top = cropResult?.top_crops?.[0];
    if (!top) return t(lang, "heroCropSub");
    return `Top match: ${top.crop.charAt(0).toUpperCase() + top.crop.slice(1)} (${top.probability.toFixed(1)}% confidence) — scroll down for growing tips.`;
  }, [cropResult, lang]);

  /* Build dynamic chart data (SoilOC, PestIndex, Fertilizer filtered to top crops) */
  const topCropLabels = cropResult?.top_crops?.map(c => c.crop) || null;

  return (
    <div>
      {/* ── Hero ── */}
      <section className="page-hero">
        <div className="page-hero-inner">
          <h1 className="page-hero-title">{t(lang, "heroCropTitle")}</h1>
          <p className="page-hero-sub">{heroSubtitle}</p>
        </div>
      </section>

      <main className="page-main cr-main">

        {/* ══ Row 1: Input + Weather ══ */}
        <div className="cr-row cr-row-top">
          <div className="cr-input-col">
            <InputForm
              inputs={inputs}
              onChange={handleChange}
              onPredict={handlePredict}
              loading={loading}
              error={error}
              lang={lang}
            />
          </div>
          <div className="cr-side-col">
            <SummaryCards
              yieldResult={yieldResult}
              cropResult={cropResult}
              grossRevenue={grossRevenue}
              lang={lang}
            />
            <WeatherWidget weatherData={weatherData} lang={lang} />
          </div>
        </div>

        {/* ══ Row 2: Crop Chart + NPK — always visible, responsive to prediction ══ */}
        <SectionLabel>{predicted ? `📊 ${t(lang, "cropAnalyticsLabel")}` : `📊 ${t(lang, "cropOverviewLabel")}`}</SectionLabel>
        <div className="chart-row-2">
          <CropRecommendationChart cropResult={cropResult} theme={theme} lang={lang} />
          <NPKChart inputs={inputs} theme={theme} lang={lang} />
        </div>

        {/* ══ Row 3: Radar + Rainfall ══ */}
        <div className="chart-row-2" style={{ marginTop: "1.5rem" }}>
          <RadarProfileChart inputs={inputs} theme={theme} lang={lang} />
          <RainfallYieldChart theme={theme} lang={lang} />
        </div>

        {/* ══ Row 4: Dataset-level charts (filtered if prediction available) ══ */}
        <SectionLabel>
          {topCropLabels
            ? `🌍 ${t(lang, "cropDatasetLabel")} (${t(lang, "cropCardTitle")})`
            : `🌍 ${t(lang, "cropDatasetLabel")}`}
        </SectionLabel>
        <div className="chart-row-3">
          <SoilOCChart    dynamicData={null} theme={theme} lang={lang} />
          <PestIndexChart dynamicData={null} theme={theme} lang={lang} />
          <FertilizerChart dynamicData={null} theme={theme} lang={lang} />
        </div>

        {/* ══ Row 5: Crop Detail Cards ══ */}
        {predicted && cropResult?.top_crops?.length > 0 && (
          <CropDetailCards cropResult={cropResult} lang={lang} />
        )}

      </main>
    </div>
  );
}
