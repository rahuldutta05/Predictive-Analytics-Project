import React from "react";
import { Bar } from 'react-chartjs-2';
import ChartCard from './ChartCard';
import { t } from "../../i18n";
import { getChartTheme } from "../../hooks/useChartTheme";

const NPKChart = ({ inputs, theme = "light", lang = "en" }) => {
  const tk = getChartTheme(theme);

  const barColors = [
    { bg: tk.green.faded,  border: tk.green.solid  },
    { bg: tk.blue.faded,   border: tk.blue.solid   },
    { bg: tk.amber.faded,  border: tk.amber.solid  },
  ];

  const data = {
    labels: ['Nitrogen (N)', 'Phosphorus (P)', 'Potassium (K)'],
    datasets: [{
      label: 'kg / ha',
      data: [inputs.N, inputs.P, inputs.K],
      backgroundColor: barColors.map(c => c.bg),
      borderColor:     barColors.map(c => c.border),
      borderWidth: 2,
      borderRadius: 12,
      borderSkipped: false,
    }],
  };

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 950, easing: 'easeOutBack' },
    plugins: {
      legend: { display: false },
      tooltip: {
        ...tk.tooltipPlugin,
        callbacks: {
          title: ctx => ctx[0].label,
          label: ctx => `  ${ctx.parsed.x.toFixed(1)} kg/ha`,
        },
      },
      datalabels: {
        display: true,
        anchor: 'end',
        align: 'end',
        formatter: v => `${v} kg/ha`,
        color: tk.textMuted,
        font: { weight: '600', size: 11 },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        max: 320,
        title: { display: true, text: 'Concentration (kg/ha)', color: tk.titleColor, font: { size: 12, weight: '500' } },
        ticks: { color: tk.text, font: { size: 11 } },
        grid: { color: tk.gridColor },
        border: { color: tk.gridColor },
      },
      y: {
        grid: { display: false },
        ticks: { color: tk.text, font: { size: 12, weight: '600' } },
        border: { display: false },
      },
    },
    layout: { padding: { right: 72, top: 8, bottom: 4 } },
  };

  return (
    <ChartCard
      title={t(lang, "chartNpkTitle")}
      subtitle={t(lang, "chartNpkSub")}
      icon="🌿"
      badge="Input"
    >
      <Bar data={data} options={options} />
    </ChartCard>
  );
};

export default NPKChart;
