import React from 'react';
import './SummaryCards.css';
import { t } from "../i18n";

const Card = ({ icon, label, value, sub, accent }) => (
  <div className={`summary-card accent-${accent}`}>
    <div className="card-icon">{icon}</div>
    <div className="card-body">
      <span className="card-label">{label}</span>
      <span className="card-value">{value ?? '—'}</span>
      {sub && <span className="card-sub">{sub}</span>}
    </div>
  </div>
);

const SummaryCards = ({ yieldResult, cropResult, grossRevenue, lang = "en" }) => {
  const topCrop = cropResult?.top_crops?.[0];
  const cropName = topCrop
    ? topCrop.crop.charAt(0).toUpperCase() + topCrop.crop.slice(1)
    : null;
  const cropProb = topCrop ? `${topCrop.probability.toFixed(1)}% confidence` : null;

  return (
    <div className="summary-cards">
      <Card
        icon="🌾"
        label={t(lang, "summaryYieldLabel")}
        value={yieldResult ? `${yieldResult.predicted_yield_t_ha.toFixed(2)} t/ha` : null}
        accent="green"
      />
      <Card
        icon="🌱"
        label={t(lang, "summaryCropLabel")}
        value={cropName}
        sub={cropProb}
        accent="blue"
      />
      <Card
        icon="💰"
        label={t(lang, "summaryRevenueLabel")}
        value={grossRevenue ? `₹ ${Number(grossRevenue).toLocaleString('en-IN')}` : null}
        sub={cropName ? `Based on ${cropName} MSP` : null}
        accent="amber"
      />
      <Card
        icon="🕐"
        label={t(lang, "summaryLastRunLabel")}
        value={yieldResult ? new Date(yieldResult.timestamp).toLocaleTimeString() : null}
        accent="neutral"
      />
    </div>
  );
};

export default SummaryCards;
