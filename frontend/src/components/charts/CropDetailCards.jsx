import React, { useState } from "react";
import { getCropInfo } from "../../data/cropInfo";
import { t } from "../../i18n";
import "./CropDetailCards.css";

const MEDALS = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣"];

const InfoPill = ({ icon, label, value }) => (
  <div className="cdp-pill">
    <span className="cdp-pill-icon">{icon}</span>
    <div className="cdp-pill-text">
      <span className="cdp-pill-label">{label}</span>
      <span className="cdp-pill-value">{value}</span>
    </div>
  </div>
);

const CropCard = ({ crop, rank, probability, isOpen, onToggle, lang }) => {
  const info = getCropInfo(crop);
  const name = crop.charAt(0).toUpperCase() + crop.slice(1);
  const pct = parseFloat(probability).toFixed(1);

  if (!info) return null;

  return (
    <div
      className={`cdp-card ${isOpen ? "open" : ""}`}
      style={{ "--accent": info.color }}
    >
      {/* ── Header ── */}
      <button className="cdp-header" onClick={onToggle} type="button">
        <div className="cdp-header-left">
          <span className="cdp-rank">{MEDALS[rank]}</span>
          <span className="cdp-emoji">{info.emoji}</span>
          <div>
            <div className="cdp-crop-name">{name}</div>
            <div className="cdp-crop-season">{info.season}</div>
          </div>
        </div>
        <div className="cdp-header-right">
          <div className="cdp-match-badge">{pct}% {t(lang, "cropMatchLabel")}</div>
          <div className="cdp-price">₹{info.marketPrice.toLocaleString("en-IN")}{t(lang, "cropPriceUnit")}</div>
          <span className="cdp-chevron">{isOpen ? "▲" : "▼"}</span>
        </div>
      </button>

      {/* ── Match bar ── */}
      <div className="cdp-bar-track">
        <div className="cdp-bar-fill" style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>

      {/* ── Expanded details ── */}
      {isOpen && (
        <div className="cdp-body">
          {/* Highlight tip */}
          <div className="cdp-key-tip">
            <span className="cdp-tip-icon">💡</span>
            <span>{info.keyTip}</span>
          </div>

          {/* Info grid */}
          <div className="cdp-pills-grid">
            <InfoPill icon="💧" label={t(lang, "cropWaterNeed")} value={info.waterNeed} />
            <InfoPill icon="🌍" label={t(lang, "cropSoilType")} value={info.soilType} />
            <InfoPill icon="⚗️" label={t(lang, "cropIdealPh")} value={info.idealPh} />
            <InfoPill icon="🌿" label={t(lang, "cropFertilizer")} value={info.fertilizer} />
            <InfoPill icon="🐛" label={t(lang, "cropKeyPests")} value={info.commonPests} />
            <InfoPill icon="💰" label={t(lang, "cropMSP")} value={`₹${info.marketPrice.toLocaleString("en-IN")}${t(lang, "cropMSPUnit")}`} />
          </div>

          {/* Growing tips */}
          <div className="cdp-tips-section">
            <h4 className="cdp-tips-title">📋 {t(lang, "cropGrowingTips")}</h4>
            <ul className="cdp-tips-list">
              {info.tips.map((tip, i) => (
                <li key={i} className="cdp-tip-item">
                  <span className="cdp-tip-dot" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default function CropDetailCards({ cropResult, lang = "en" }) {
  const [openIdx, setOpenIdx] = useState(0);

  const crops = cropResult?.top_crops;
  if (!crops?.length) return null;

  const toggle = (i) => setOpenIdx((cur) => (cur === i ? -1 : i));

  return (
    <section className="cdp-section">
      <div className="cdp-section-header">
        <h2 className="cdp-section-title">🌱 {t(lang, "cropCardTitle")}</h2>
        <p className="cdp-section-sub">{t(lang, "cropCardSub")}</p>
      </div>
      <div className="cdp-list">
        {crops.map((c, i) => (
          <CropCard
            key={c.crop}
            crop={c.crop}
            rank={i}
            probability={c.probability}
            isOpen={openIdx === i}
            onToggle={() => toggle(i)}
            lang={lang}
          />
        ))}
      </div>
    </section>
  );
}
