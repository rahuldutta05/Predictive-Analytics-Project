import React, { useEffect, useState } from "react";

import "./components/charts/chartSetup";

import CropRecommendationChart from "./components/charts/CropRecommendationChart";
import NPKChart from "./components/charts/NPKChart";
import RainfallYieldChart from "./components/charts/RainfallYieldChart";
import RadarProfileChart from "./components/charts/RadarProfileChart";
import SoilOCChart from "./components/charts/SoilOCChart";
import PestIndexChart from "./components/charts/PestIndexChart";
import FertilizerChart from "./components/charts/FertilizerChart";

import "./Dashboard.css";
import { t } from "./i18n";
import { recommendCrop } from "./api";

const DEFAULT_INPUTS = {
  N: 90,
  P: 35,
  K: 180,
  temperature: 24,
  humidity: 80,
  ph: 6.5,
  rainfall: 200,
  Soil_OC: 1.25,
  Fertilizer_kg_ha: 252,
  Pest_Index: 0.79,
  Irrigation_mm: 308,
};

export default function Dashboard({ theme = "light", lang = "en" }) {
  const [cropResult, setCropResult] = useState(null);

  useEffect(() => {
    // Populate the crop recommendation chart using default inputs.
    // If the backend isn't running, the chart will fall back to its placeholder state.
    recommendCrop(DEFAULT_INPUTS)
      .then((res) => setCropResult(res))
      .catch(() => {});
  }, []);

  return (
    <div>
      <section className="page-hero">
        <div className="page-hero-inner">
          <h1 className="page-hero-title">{t(lang, "heroDashboardTitle")}</h1>
          <p className="page-hero-sub">{t(lang, "heroDashboardSub")}</p>
        </div>
      </section>

      <main className="page-main">
        {/* Charts row 1 */}
        <div className="chart-row-2">
          <CropRecommendationChart cropResult={cropResult} theme={theme} lang={lang} />
          <NPKChart inputs={DEFAULT_INPUTS} theme={theme} lang={lang} />
        </div>

        {/* Charts row 2 */}
        <div className="chart-row-2" style={{ marginTop: "1.5rem" }}>
          <RainfallYieldChart theme={theme} lang={lang} />
          <RadarProfileChart inputs={DEFAULT_INPUTS} theme={theme} lang={lang} />
        </div>

        {/* Charts row 3 */}
        <div className="chart-row-3" style={{ marginTop: "1.5rem" }}>
          <SoilOCChart dynamicData={null} theme={theme} lang={lang} />
          <PestIndexChart dynamicData={null} theme={theme} lang={lang} />
          <FertilizerChart dynamicData={null} theme={theme} lang={lang} />
        </div>
      </main>
    </div>
  );
}
