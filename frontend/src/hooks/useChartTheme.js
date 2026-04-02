/**
 * useChartTheme — returns chart-colour tokens and a gradient helper.
 * Import + call once per chart component; pass the `theme` prop.
 */

export function getChartTheme(theme) {
  const isDark = theme === "dark";

  return {
    isDark,

    // ── Text colours ────────────────────────────────────────────
    text:       isDark ? "#c8d8c5" : "#4a4a42",
    textMuted:  isDark ? "#7a9478" : "#8a8a80",
    titleColor: isDark ? "#e8ede6" : "#1a1a14",

    // ── Grid / axis lines ────────────────────────────────────────
    gridColor:   isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)",
    borderColor: isDark ? "rgba(255,255,255,0.85)" : "#ffffff",

    // ── Tooltip background / border ──────────────────────────────
    tooltipBg:     isDark ? "#0f1f0e" : "#ffffff",
    tooltipBorder: isDark ? "#3a5c38" : "#e2e2da",
    tooltipText:   isDark ? "#e8ede6" : "#1a1a14",

    // ── Named brand colours – consistent across all charts ───────
    green:  { solid: "#4db87e", faded: isDark ? "rgba(77,184,126,0.40)" : "rgba(77,184,126,0.20)" },
    blue:   { solid: "#3b9fe8", faded: isDark ? "rgba(59,159,232,0.40)" : "rgba(59,159,232,0.20)" },
    amber:  { solid: "#f0a830", faded: isDark ? "rgba(240,168,48,0.40)" : "rgba(240,168,48,0.20)" },
    purple: { solid: "#b07eea", faded: isDark ? "rgba(176,126,234,0.40)" : "rgba(176,126,234,0.20)" },
    red:    { solid: "#f06050", faded: isDark ? "rgba(240,96,80,0.40)"  : "rgba(240,96,80,0.20)"  },
    teal:   { solid: "#2dd4bf", faded: isDark ? "rgba(45,212,191,0.40)" : "rgba(45,212,191,0.20)" },
    orange: { solid: "#fb923c", faded: isDark ? "rgba(251,146,60,0.40)" : "rgba(251,146,60,0.20)" },
    pink:   { solid: "#f472b6", faded: isDark ? "rgba(244,114,182,0.40)": "rgba(244,114,182,0.20)"},

    // ── Vibrant sequential palette for multi-crop charts ─────────
    palette: [
      "#4db87e", "#3b9fe8", "#f0a830", "#b07eea", "#f06050",
      "#2dd4bf", "#fb923c", "#f472b6", "#a3e635", "#38bdf8",
      "#e879f9", "#fbbf24", "#34d399", "#60a5fa", "#f87171",
      "#c084fc", "#fb7185", "#a78bfa", "#4ade80", "#facc15",
      "#22d3ee", "#f97316",
    ],

    // ── Common legend label style ────────────────────────────────
    legendLabels: {
      color: isDark ? "#c8d8c5" : "#5a5a52",
      font: { size: 12, family: "'DM Sans', system-ui, sans-serif", weight: "500" },
      boxWidth: 14,
      boxHeight: 14,
      padding: 16,
      usePointStyle: true,
      pointStyle: "circle",
    },

    // ── Tooltip plugin defaults (spread into plugins.tooltip) ────
    tooltipPlugin: {
      backgroundColor: isDark ? "rgba(10,18,10,0.92)" : "rgba(255,255,255,0.97)",
      borderColor:     isDark ? "#3a5c38" : "#dde8db",
      borderWidth: 1,
      titleColor: isDark ? "#e8ede6" : "#1a1a14",
      bodyColor:  isDark ? "#c8d8c5" : "#5a5a52",
      padding: 14,
      cornerRadius: 12,
      displayColors: true,
      boxPadding: 5,
      titleFont: { size: 13, weight: "600", family: "'DM Sans', system-ui, sans-serif" },
      bodyFont:  { size: 12, family: "'DM Sans', system-ui, sans-serif" },
      caretSize: 6,
      caretPadding: 6,
    },
  };
}

/**
 * createVerticalGradient — builds a top→bottom canvas gradient.
 * Call inside a `data` callback that receives the Chart.js `{ chart }` context.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} height  – chart area height in px
 * @param {string} colorTop    – e.g. "rgba(74,158,107,0.7)"
 * @param {string} colorBottom – e.g. "rgba(74,158,107,0.0)"
 */
export function createVerticalGradient(ctx, height, colorTop, colorBottom) {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, colorTop);
  gradient.addColorStop(1, colorBottom);
  return gradient;
}
