// chartSetup.js — Register all Chart.js components once (import at top of Dashboard.jsx)

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  RadialLinearScale,
  Filler,
  ArcElement,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  RadialLinearScale,
  Filler,
  ArcElement,
  ChartDataLabels,
);

// ── Global font & animation defaults ───────────────────────────
ChartJS.defaults.font.family   = "'DM Sans', system-ui, sans-serif";
ChartJS.defaults.font.size     = 13;

// Richer, snappier animation
ChartJS.defaults.animation.duration = 900;
ChartJS.defaults.animation.easing   = 'easeOutQuart';

// Smooth responsive resizing
ChartJS.defaults.responsive         = true;
ChartJS.defaults.maintainAspectRatio = false;

// Datalabels: off by default — each chart opts in as needed
ChartJS.defaults.plugins.datalabels.display = false;

// ── Global tooltip style ────────────────────────────────────────
ChartJS.defaults.plugins.tooltip.padding       = 14;
ChartJS.defaults.plugins.tooltip.cornerRadius  = 12;
ChartJS.defaults.plugins.tooltip.caretSize     = 6;
ChartJS.defaults.plugins.tooltip.displayColors = true;
ChartJS.defaults.plugins.tooltip.boxPadding    = 5;
ChartJS.defaults.plugins.tooltip.titleFont     = { size: 13, weight: '600' };
ChartJS.defaults.plugins.tooltip.bodyFont      = { size: 12 };
