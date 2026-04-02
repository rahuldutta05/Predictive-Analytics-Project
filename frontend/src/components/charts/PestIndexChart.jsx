import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import ChartCard from './ChartCard';
import mockData from '../../crop_data.json';
import { t } from "../../i18n";
import { getChartTheme } from "../../hooks/useChartTheme";

const PestIndexChart = ({ dynamicData, theme = "light", lang = "en" }) => {
  const tk = getChartTheme(theme);

  const initial = useMemo(() => {
    const labels = [...new Set(mockData.map(d => d.label))];
    const values = labels.map(l => {
      const rows = mockData.filter(d => d.label === l);
      return parseFloat((rows.reduce((s, d) => s + d.Pest_Index, 0) / rows.length).toFixed(2));
    });

    // Colour-code bars by severity: low=green, mid=amber, high=red
    const bgColors = values.map(v =>
      v < 0.4 ? tk.green.faded
      : v < 0.7 ? tk.amber.faded
      : tk.red.faded
    );
    const borderColors = values.map(v =>
      v < 0.4 ? tk.green.solid
      : v < 0.7 ? tk.amber.solid
      : tk.red.solid
    );

    return {
      labels,
      datasets: [{
        label: 'Pest Index',
        data: values,
        backgroundColor: bgColors,
        borderColor:     borderColors,
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      }],
    };
  }, [tk]);

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 1000, easing: 'easeOutQuart' },
    plugins: {
      legend: { display: false },
      tooltip: {
        ...tk.tooltipPlugin,
        callbacks: {
          title: ctx => ctx[0].label,
          label: ctx => {
            const v = ctx.parsed.x;
            const severity = v < 0.4 ? '🟢 Low' : v < 0.7 ? '🟡 Moderate' : '🔴 High';
            return [`  Score: ${v}`, `  Risk: ${severity}`];
          },
        },
      },
      datalabels: {
        display: true,
        anchor: 'end',
        align: 'end',
        formatter: v => v.toFixed(2),
        color: tk.textMuted,
        font: { size: 10, weight: '600' },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        max: 1.1,
        title: { display: true, text: 'Index Value (0–1)', color: tk.titleColor, font: { size: 12, weight: '500' } },
        grid: { color: tk.gridColor },
        ticks: { color: tk.text, font: { size: 11 } },
        border: { color: tk.gridColor },
      },
      y: {
        grid: { display: false },
        ticks: { font: { size: 11 }, color: tk.text },
        border: { display: false },
      },
    },
    layout: { padding: { right: 36, top: 8 } },
  };

  return (
    <ChartCard
      title={t(lang, "chartPestTitle")}
      subtitle={dynamicData ? 'Filtered to recommended crops' : 'All crops — colour-coded by severity'}
      icon="🐛"
      badge="Index"
    >
      <Bar data={dynamicData || initial} options={options} />
    </ChartCard>
  );
};

export default PestIndexChart;
