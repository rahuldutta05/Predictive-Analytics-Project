import React from "react";
import { Radar } from 'react-chartjs-2';
import ChartCard from './ChartCard';
import { t } from "../../i18n";
import { getChartTheme } from "../../hooks/useChartTheme";

// Ideal reference profiles (normalised later for display)
const IDEAL_RICE = { N: 80, P: 45, K: 45, temperature: 25, humidity: 80, ph: 6.5, rainfall: 200 };
const LABELS = ['Nitrogen', 'Phosphorus', 'Potassium', 'Temperature', 'Humidity', 'pH × 10', 'Rainfall'];
const KEYS   = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall'];

// Normalise each axis to a 0–100 scale so the radar is visually balanced
const SCALES = { N: 200, P: 150, K: 200, temperature: 50, humidity: 100, ph: 14, rainfall: 300 };
const norm = (key, val) => Math.min(100, ((val / SCALES[key]) * 100));

const RadarProfileChart = ({ inputs, theme = "light", lang = "en" }) => {
  const tk = getChartTheme(theme);

  const userNorm  = KEYS.map(k => norm(k, inputs[k]));
  const idealNorm = KEYS.map(k => norm(k, IDEAL_RICE[k]));

  const data = {
    labels: LABELS,
    datasets: [
      {
        label: 'Your Input',
        data: userNorm,
        backgroundColor: tk.green.faded,
        borderColor: tk.green.solid,
        pointBackgroundColor: tk.green.solid,
        pointBorderColor: tk.isDark ? '#0f1f0e' : '#ffffff',
        pointBorderWidth: 2,
        borderWidth: 2.5,
        pointRadius: 5,
        pointHoverRadius: 9,
        fill: true,
        order: 1,
      },
      {
        label: 'Ideal — Rice',
        data: idealNorm,
        backgroundColor: tk.blue.faded,
        borderColor: tk.blue.solid,
        pointBackgroundColor: tk.blue.solid,
        pointBorderColor: tk.isDark ? '#0f1f0e' : '#ffffff',
        pointBorderWidth: 2,
        borderWidth: 2,
        borderDash: [6, 4],
        pointRadius: 4,
        pointHoverRadius: 8,
        fill: true,
        order: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 1100, easing: 'easeOutBack' },
    plugins: {
      legend: {
        position: 'top',
        labels: { ...tk.legendLabels },
      },
      tooltip: {
        ...tk.tooltipPlugin,
        callbacks: {
          label: ctx => {
            const raw = ctx.datasetIndex === 0 ? inputs[KEYS[ctx.dataIndex]] : IDEAL_RICE[KEYS[ctx.dataIndex]];
            const unit = ['kg/ha','kg/ha','kg/ha','°C','%','','mm'][ctx.dataIndex];
            return `  ${ctx.dataset.label}: ${parseFloat(raw).toFixed(1)} ${unit}`;
          },
        },
      },
      datalabels: { display: false },
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        angleLines: { color: tk.gridColor, lineWidth: 1.5 },
        grid:        { color: tk.gridColor, lineWidth: 1 },
        pointLabels: {
          font: { size: 12, weight: '600', family: "'DM Sans', system-ui, sans-serif" },
          color: tk.text,
          padding: 8,
        },
        ticks: {
          display: false,
          stepSize: 25,
        },
      },
    },
  };

  return (
    <ChartCard
      title={t(lang, "chartRadarTitle")}
      subtitle={t(lang, "chartRadarSub")}
      icon="🎯"
      badge="Profile"
    >
      <Radar data={data} options={options} />
    </ChartCard>
  );
};

export default RadarProfileChart;
