// chartSetup.js
// Import this once at the top of Dashboard.jsx to register all Chart.js components.

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

// Sensible global defaults
ChartJS.defaults.font.family = "'DM Sans', system-ui, sans-serif";
ChartJS.defaults.plugins.datalabels.display = false; // opt-in per chart
