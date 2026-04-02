import React from "react";
import { Bar } from 'react-chartjs-2';
import ChartCard from './ChartCard';
import { t } from "../../i18n";
import { getChartTheme } from "../../hooks/useChartTheme";

const SEGMENT_COLORS = [
  { solid: "#4db87e", badge: "#22c55e" },
  { solid: "#3b9fe8", badge: "#60a5fa" },
  { solid: "#f0a830", badge: "#fbbf24" },
  { solid: "#b07eea", badge: "#c084fc" },
  { solid: "#f06050", badge: "#f87171" },
];

const CropRecommendationChart = ({ cropResult, theme = "light", lang = "en" }) => {
  const tk = getChartTheme(theme);

  if (!cropResult?.top_crops) {
    return (
      <ChartCard
        title={t(lang, "chartTopCropTitle")}
        subtitle={t(lang, "chartTopCropSub")}
        icon="🌾"
        badge="AI"
      />
    );
  }

  const crops = cropResult.top_crops;
  const colors = SEGMENT_COLORS.slice(0, crops.length);

  const data = {
    labels: crops.map(c => c.crop.charAt(0).toUpperCase() + c.crop.slice(1)),
    datasets: [{
      label: 'Match (%)',
      data: crops.map(c => parseFloat(c.probability.toFixed(2))),
      backgroundColor: colors.map(c => c.solid + 'cc'),
      borderColor:     colors.map(c => c.solid),
      borderWidth: 2,
      borderRadius: 14,
      borderSkipped: false,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 1000, easing: 'easeOutBack' },
    plugins: {
      legend: { display: false },
      tooltip: {
        ...tk.tooltipPlugin,
        callbacks: {
          title: ctx => `🌱 ${ctx[0].label}`,
          label: ctx => {
            const rank = ctx.dataIndex + 1;
            const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
            return [`  Match: ${ctx.parsed.y.toFixed(1)}%`, `  Rank: ${medal}`];
          },
        },
      },
      datalabels: {
        display: true,
        anchor: 'end',
        align: 'top',
        offset: 4,
        formatter: v => `${v.toFixed(0)}%`,
        color: tk.text,
        font: { weight: '700', size: 13 },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 105,
        title: { display: true, text: 'Match Probability (%)', color: tk.titleColor, font: { size: 12, weight: '500' } },
        ticks: { color: tk.text, font: { size: 11 }, callback: v => `${v}%` },
        grid: { color: tk.gridColor },
        border: { color: tk.gridColor },
      },
      x: {
        grid: { display: false },
        ticks: { color: tk.text, font: { size: 13, weight: '600' } },
        border: { display: false },
      },
    },
    layout: { padding: { top: 24, bottom: 4, left: 4, right: 4 } },
  };

  return (
    <ChartCard
      title={t(lang, "chartTopCropTitle")}
      subtitle={t(lang, "chartTopCropSub")}
      icon="🌾"
      badge="AI"
    >
      <Bar data={data} options={options} />
    </ChartCard>
  );
};

export default CropRecommendationChart;
