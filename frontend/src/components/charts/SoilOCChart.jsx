import React, { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import ChartCard from './ChartCard';
import mockData from '../../crop_data.json';
import { t } from "../../i18n";
import { getChartTheme } from "../../hooks/useChartTheme";

const SoilOCChart = ({ dynamicData, theme = "light", lang = "en" }) => {
  const tk = getChartTheme(theme);

  const initial = useMemo(() => {
    const labels = [...new Set(mockData.map(d => d.label))];
    const values = labels.map(l => {
      const rows = mockData.filter(d => d.label === l);
      return parseFloat((rows.reduce((s, d) => s + d.Soil_OC, 0) / rows.length).toFixed(2));
    });

    return {
      labels,
      datasets: [{
        label: 'Soil OC (g/kg)',
        data: values,
        backgroundColor: tk.palette.slice(0, labels.length),
        borderColor: tk.isDark ? 'rgba(12,24,12,0.8)' : 'rgba(255,255,255,0.9)',
        borderWidth: 3,
        hoverBorderWidth: 4,
        hoverOffset: 8,
      }],
    };
  }, [tk]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '55%',
    animation: { duration: 1050, easing: 'easeOutBack' },
    plugins: {
      legend: {
        position: 'right',
        labels: {
          ...tk.legendLabels,
          font: { ...tk.legendLabels.font, size: 11 },
          boxWidth: 12,
          boxHeight: 12,
          padding: 10,
        },
      },
      tooltip: {
        ...tk.tooltipPlugin,
        callbacks: {
          label: ctx => {
            const val = ctx.parsed;
            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
            const pct = ((val / total) * 100).toFixed(1);
            return [`  ${ctx.label}: ${val} g/kg`, `  Share: ${pct}%`];
          },
        },
      },
      datalabels: {
        display: ctx => {
          const val = ctx.dataset.data[ctx.dataIndex];
          const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
          return (val / total) > 0.06;  // only show label if slice > 6%
        },
        formatter: (val, ctx) => ctx.chart.data.labels[ctx.dataIndex],
        color: '#ffffff',
        font: { size: 10, weight: '700' },
        textShadowBlur: 4,
        textShadowColor: 'rgba(0,0,0,0.5)',
      },
    },
  };

  return (
    <ChartCard
      title={t(lang, "chartSoilOcTitle")}
      subtitle={dynamicData ? 'Filtered to recommended crops' : 'All crops — avg g/kg'}
      icon="🌱"
      badge="OC"
    >
      <Doughnut data={dynamicData || initial} options={options} />
    </ChartCard>
  );
};

export default SoilOCChart;
