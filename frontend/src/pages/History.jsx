import React, { useMemo, useState } from "react";
import { clearHistory, loadHistory } from "../utils/history";
import "../styles/HistoryPage.css";
import { t } from "../i18n";

function safeCropName(entry) {
  const top = entry?.cropResult?.top_crops?.[0];
  if (!top) return "—";
  return top.crop.charAt(0).toUpperCase() + top.crop.slice(1);
}

export default function History({ lang = "en" }) {
  const [history, setHistory] = useState(() => loadHistory());

  const rows = useMemo(() => history.slice(0, 20), [history]);

  const handleClear = () => {
    clearHistory();
    setHistory([]);
  };

  return (
    <div>
      <section className="page-hero">
        <div className="page-hero-inner">
          <h1 className="page-hero-title">{t(lang, "heroHistoryTitle")}</h1>
          <p className="page-hero-sub">{t(lang, "heroHistorySub")}</p>
        </div>
      </section>

      <main className="page-main">
        <div className="content-card">
          <div className="hist-head">
            <div>
              <h2 className="hist-title">{t(lang, "historyRecentRunsTitle")}</h2>
              <p className="hist-sub">{history.length} saved entr{history.length === 1 ? "y" : "ies"}.</p>
            </div>
            <button className="hist-clear" onClick={handleClear} disabled={history.length === 0}>
              {t(lang, "historyClear")}
            </button>
          </div>

          {rows.length === 0 ? (
            <div className="hist-empty">
              <div className="hist-empty-icon">📭</div>
              <h3 className="hist-empty-title">{t(lang, "historyNoHistoryTitle")}</h3>
              <p className="hist-empty-sub">{t(lang, "historyNoHistorySub")}</p>
            </div>
          ) : (
            <div className="hist-table-wrap">
              <table className="hist-table">
                <thead>
                  <tr>
                    <th>{t(lang, "historyTableDate")}</th>
                    <th>{t(lang, "historyTableBestCrop")}</th>
                    <th>{t(lang, "historyTablePredictedYield")}</th>
                    <th>{t(lang, "historyTableGrossRevenue")}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((e) => {
                    const date = e?.createdAt ? new Date(e.createdAt) : null;
                    const yieldVal = e?.yieldResult?.predicted_yield_t_ha;
                    const gross = e?.grossRevenue;
                    return (
                      <tr key={e.id}>
                        <td className="hist-td">
                          {date ? date.toLocaleString() : "—"}
                        </td>
                        <td className="hist-td">{safeCropName(e)}</td>
                        <td className="hist-td">
                          {typeof yieldVal === "number" ? `${yieldVal.toFixed(2)} t/ha` : "—"}
                        </td>
                        <td className="hist-td">
                          {typeof gross === "number" ? `₹ ${Number(gross).toLocaleString("en-IN")}` : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

