import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import ChartCard from './ChartCard';
import mockData from '../../crop_data.json';
import { t } from "../../i18n";
import { getChartTheme, createVerticalGradient } from "../../hooks/useChartTheme";

const RainfallYieldChart = ({ theme = "light", lang = "en" }) => {
  const tk = getChartTheme(theme);

  const { labels, yieldVals, rainfallVals } = useMemo(() => {
    const cropLabels = [...new Set(mockData.map(d => d.label))];
    const agg = cropLabels.map(label => {
      const rows = mockData.filter(d => d.label === label);
      return {
        label,
        avgRainfall: parseFloat((rows.reduce((s, d) => s + d.rainfall, 0) / rows.length).toFixed(1)),
        avgYield:    parseFloat((rows.reduce((s, d) => s + d.Yield_t_ha, 0) / rows.length).toFixed(2)),
      };
    });
    return {
      labels:       agg.map(d => d.label),
      yieldVals:    agg.map(d => d.avgYield),
      rainfallVals: agg.map(d => d.avgRainfall),
    };
  }, []);

  const data = {
    labels,
    datasets: [
      {
        label: 'Avg Yield (t/ha)',
        data: yieldVals,
        borderColor: tk.green.solid,
        backgroundColor: (ctx) => {
          if (!ctx.chart.chartArea) return tk.green.faded;
          const { ctx: canvasCtx, chartArea: { top, bottom } } = ctx.chart;
          return createVerticalGradient(canvasCtx, bottom - top,
            tk.isDark ? 'rgba(77,184,126,0.55)' : 'rgba(77,184,126,0.35)',
            'rgba(77,184,126,0.02)'
          );
        },
        borderWidth: 2.5,
        tension: 0.42,
        fill: true,
        pointRadius: 5,
        pointHoverRadius: 8,
        pointBackgroundColor: tk.green.solid,
        pointBorderColor: tk.isDark ? '#0f1f0e' : '#ffffff',
        pointBorderWidth: 2,
        yAxisID: 'y-yield',
      },
      {
        label: 'Avg Rainfall (mm)',
        data: rainfallVals,
        borderColor: tk.blue.solid,
        backgroundColor: (ctx) => {
          if (!ctx.chart.chartArea) return tk.blue.faded;
          const { ctx: canvasCtx, chartArea: { top, bottom } } = ctx.chart;
          return createVerticalGradient(canvasCtx, bottom - top,
            tk.isDark ? 'rgba(59,159,232,0.45)' : 'rgba(59,159,232,0.28)',
            'rgba(59,159,232,0.02)'
          );
        },
        borderWidth: 2.5,
        tension: 0.42,
        fill: true,
        pointRadius: 5,
        pointHoverRadius: 8,
        pointBackgroundColor: tk.blue.solid,
        pointBorderColor: tk.isDark ? '#0f1f0e' : '#ffffff',
        pointBorderWidth: 2,
        borderDash: [6, 3],
        yAxisID: 'y-rainfall',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    animation: { duration: 1100, easing: 'easeOutQuart' },
    plugins: {
      legend: {
        position: 'top',
        labels: { ...tk.legendLabels },
      },
      tooltip: {
        ...tk.tooltipPlugin,
        callbacks: {
          title: ctx => ctx[0].label,
          label: ctx => {
            const u = ctx.datasetIndex === 0 ? ' t/ha' : ' mm';
            return `  ${ctx.dataset.label}: ${ctx.parsed.y.toFixed(2)}${u}`;
          },
        },
      },
      datalabels: { display: false },
    },
    scales: {
      'y-yield': {
        type: 'linear',
        position: 'left',
        title: { display: true, text: 'Yield (t/ha)', color: tk.green.solid, font: { size: 12, weight: '600' } },
        grid: { color: tk.gridColor },
        ticks: { color: tk.text, font: { size: 11 } },
        border: { color: tk.gridColor },
      },
      'y-rainfall': {
        type: 'linear',
        position: 'right',
        title: { display: true, text: 'Rainfall (mm)', color: tk.blue.solid, font: { size: 12, weight: '600' } },
        grid: { drawOnChartArea: false },
        ticks: { color: tk.text, font: { size: 11 } },
        border: { display: false },
      },
      x: {
        ticks: { maxRotation: 40, color: tk.text, font: { size: 10 } },
        grid: { display: false },
        border: { color: tk.gridColor },
      },
    },
  };

  return (
    <ChartCard
      title={t(lang, "chartRainYieldTitle")}
      subtitle={t(lang, "chartRainYieldSub")}
      icon="🌧️"
      badge="Dual Axis"
    >
      <Line data={data} options={options} />
    </ChartCard>
  );
};

export default RainfallYieldChart;
