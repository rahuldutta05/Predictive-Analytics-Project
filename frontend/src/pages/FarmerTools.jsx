import React, { useState } from "react";
import "../styles/FarmerToolsPage.css";
import "./FarmerToolsExtra.css";
import { t } from "../i18n";
import { getCropInfo } from "../data/cropInfo";

/* ── Crop-specific advice panel ──────────────────────────── */
function CropAdvicePanel({ crops, lang }) {
  const [activeIdx, setActiveIdx] = useState(0);
  if (!crops?.length) return null;

  const activeCrop = crops[activeIdx];
  const info = getCropInfo(activeCrop.crop);
  if (!info) return null;

  const name = activeCrop.crop.charAt(0).toUpperCase() + activeCrop.crop.slice(1);

  return (
    <div className="ft-crop-advice content-card">
      <div className="ft-crop-advice-header">
        <h2 className="ft-crop-advice-title">🌱 {t(lang, "ftAdviceTitle")}</h2>
        <p className="ft-crop-advice-sub">{t(lang, "ftAdviceSub")}</p>
      </div>

      {/* Crop selector tabs */}
      <div className="ft-crop-tabs">
        {crops.map((c, i) => {
          const ci = getCropInfo(c.crop);
          return (
            <button
              key={c.crop}
              type="button"
              className={`ft-crop-tab ${i === activeIdx ? "active" : ""}`}
              onClick={() => setActiveIdx(i)}
              style={{ "--tab-color": ci?.color || "#4db87e" }}
            >
              <span>{ci?.emoji || "🌿"}</span>
              <span>{c.crop.charAt(0).toUpperCase() + c.crop.slice(1)}</span>
              <span className="ft-crop-tab-pct">{c.probability.toFixed(0)}%</span>
            </button>
          );
        })}
      </div>

      {/* Active crop details */}
      <div className="ft-crop-detail" style={{ "--accent": info.color }}>
        <div className="ft-crop-detail-hero">
          <span className="ft-crop-detail-emoji">{info.emoji}</span>
          <div>
            <h3 className="ft-crop-detail-name">{name}</h3>
            <p className="ft-crop-detail-season">📅 {info.season}</p>
          </div>
        </div>

        {/* Key insight */}
        <div className="ft-crop-insight">
          <span>💡</span>
          <span>{info.keyTip}</span>
        </div>

        {/* Quick facts grid */}
        <div className="ft-crop-facts">
          <div className="ft-crop-fact">
            <span className="ft-crop-fact-icon">💧</span>
            <div>
              <div className="ft-crop-fact-label">{t(lang, "ftAdviceWaterReq")}</div>
              <div className="ft-crop-fact-val">{info.waterNeed}</div>
            </div>
          </div>
          <div className="ft-crop-fact">
            <span className="ft-crop-fact-icon">🌍</span>
            <div>
              <div className="ft-crop-fact-label">{t(lang, "ftAdviceSoil")}</div>
              <div className="ft-crop-fact-val">{info.soilType}</div>
            </div>
          </div>
          <div className="ft-crop-fact">
            <span className="ft-crop-fact-icon">⚗️</span>
            <div>
              <div className="ft-crop-fact-label">{t(lang, "ftAdvicePh")}</div>
              <div className="ft-crop-fact-val">{info.idealPh}</div>
            </div>
          </div>
          <div className="ft-crop-fact">
            <span className="ft-crop-fact-icon">🌿</span>
            <div>
              <div className="ft-crop-fact-label">{t(lang, "ftAdviceFertilizer")}</div>
              <div className="ft-crop-fact-val">{info.fertilizer}</div>
            </div>
          </div>
          <div className="ft-crop-fact">
            <span className="ft-crop-fact-icon">🐛</span>
            <div>
              <div className="ft-crop-fact-label">{t(lang, "ftAdvicePests")}</div>
              <div className="ft-crop-fact-val">{info.commonPests}</div>
            </div>
          </div>
          <div className="ft-crop-fact">
            <span className="ft-crop-fact-icon">💰</span>
            <div>
              <div className="ft-crop-fact-label">{t(lang, "ftAdviceMSP")}</div>
              <div className="ft-crop-fact-val">₹{info.marketPrice.toLocaleString("en-IN")}</div>
            </div>
          </div>
        </div>

        {/* Growing tips */}
        <div className="ft-crop-tips">
          <h4 className="ft-crop-tips-title">📋 {t(lang, "ftAdviceTips")}</h4>
          <ul className="ft-crop-tips-list">
            {info.tips.map((tip, i) => (
              <li key={i} className="ft-crop-tip-item">
                <span className="ft-crop-tip-dot" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════
   Main FarmerTools page
═════════════════════════════════════════════════════════ */
export default function FarmerTools({ lang = "en", recommendedCrops = null }) {
  const [expanded, setExpanded] = useState("summer");

  const tips = [
    {
      id: "summer",
      titleKey: "ftSummerTitle",
      itemKeys: ["ftSummerTip1", "ftSummerTip2", "ftSummerTip3"],
    },
    {
      id: "monsoon",
      titleKey: "ftMonsoonTitle",
      itemKeys: ["ftMonsoonTip1", "ftMonsoonTip2", "ftMonsoonTip3"],
    },
    {
      id: "winter",
      titleKey: "ftWinterTitle",
      itemKeys: ["ftWinterTip1", "ftWinterTip2", "ftWinterTip3"],
    },
  ];

  const schemes = [
    { titleKey: "ftScheme1Title", descKey: "ftScheme1Desc" },
    { titleKey: "ftScheme2Title", descKey: "ftScheme2Desc" },
    { titleKey: "ftScheme3Title", descKey: "ftScheme3Desc" },
  ];

  return (
    <div>
      <section className="page-hero">
        <div className="page-hero-inner">
          <h1 className="page-hero-title">{t(lang, "heroToolsTitle")}</h1>
          <p className="page-hero-sub">{t(lang, "heroToolsSub")}</p>
        </div>
      </section>

      <main className="page-main">
        {/* Crop-specific advice panel (only shown after a prediction) */}
        {recommendedCrops?.length > 0 && (
          <CropAdvicePanel crops={recommendedCrops} lang={lang} />
        )}

        {/* If no prediction yet, show a prompt */}
        {!recommendedCrops?.length && (
          <div className="ft-no-prediction content-card">
            <div className="ft-no-pred-icon">🌾</div>
            <h3 className="ft-no-pred-title">{t(lang, "ftNoPredTitle")}</h3>
            <p className="ft-no-pred-sub">{t(lang, "ftNoPredSub")}</p>
          </div>
        )}

        {/* General Tips + Schemes */}
        <div className="ft-layout" style={{ marginTop: "1.5rem" }}>
          <div className="ft-col ft-col-7">
            <div className="content-card ft-card">
              <div className="ft-card-header">
                <h2 className="ft-card-title">{t(lang, "ftSeasonalTipsTitle")}</h2>
                <p className="ft-card-sub">{t(lang, "ftSeasonalTipsSub")}</p>
              </div>

              <div className="ft-accordion">
                {tips.map((tip) => (
                  <div key={tip.id} className={`ft-acc-item${expanded === tip.id ? " open" : ""}`}>
                    <button
                      type="button"
                      className="ft-acc-summary"
                      onClick={() => setExpanded((cur) => (cur === tip.id ? "" : tip.id))}
                    >
                      <span>{t(lang, tip.titleKey)}</span>
                      <span className="ft-acc-chevron">{expanded === tip.id ? "▲" : "▼"}</span>
                    </button>
                    {expanded === tip.id && (
                      <div className="ft-acc-body">
                        <ul className="ft-bullets">
                          {tip.itemKeys.map((key) => (
                            <li key={key}>{t(lang, key)}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="ft-col ft-col-5">
            <div className="content-card ft-card">
              <div className="ft-card-header">
                <h2 className="ft-card-title">{t(lang, "ftCommonSchemesTitle")}</h2>
                <p className="ft-card-sub">{t(lang, "ftCommonSchemesSub")}</p>
              </div>

              <div className="ft-scheme-list">
                {schemes.map((s) => (
                  <div key={s.titleKey} className="ft-scheme">
                    <h3 className="ft-scheme-title">{t(lang, s.titleKey)}</h3>
                    <p className="ft-scheme-desc">{t(lang, s.descKey)}</p>
                  </div>
                ))}
              </div>

              <div className="ft-note">{t(lang, "ftSchemesNote")}</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
