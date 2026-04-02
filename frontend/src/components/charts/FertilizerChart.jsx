import React, { useMemo } from 'react';
import { PolarArea } from 'react-chartjs-2';
import ChartCard from './ChartCard';
import mockData from '../../crop_data.json';
import { t } from "../../i18n";
import { getChartTheme } from "../../hooks/useChartTheme";

const FertilizerChart = ({ dynamicData, theme = "light", lang = "en" }) => {
  const tk = getChartTheme(theme);

  const initial = useMemo(() => {
    const labels = [...new Set(mockData.map(d => d.label))];
    const values = labels.map(l => {
      const rows = mockData.filter(d => d.label === l);
      return parseFloat((rows.reduce((s, d) => s + d.Fertilizer_kg_ha, 0) / rows.length).toFixed(1));
    });

    // Apply 70% opacity to palette colours
    const bg     = tk.palette.slice(0, labels.length).map(c => c + 'b3');
    const border = tk.palette.slice(0, labels.length);

    return {
      labels,
      datasets: [{
        label: 'Fertilizer (kg/ha)',
        data: values,
        backgroundColor: bg,
        borderColor: border,
        borderWidth: 2,
        hoverBorderWidth: 3,
      }],
    };
  }, [tk]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 1100, easing: 'easeOutBack' },
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
          title: ctx => ctx[0].label,
          label: ctx => `  Fertilizer: ${ctx.parsed.r.toFixed(1)} kg/ha`,
        },
      },
      datalabels: { display: false },
    },
    scales: {
      r: {
        pointLabels: { display: false },
        grid: { color: tk.gridColor },
        angleLines: { color: tk.gridColor },
        ticks: {
          color: tk.textMuted,
          font: { size: 10 },
          backdropColor: 'transparent',
          count: 4,
        },
      },
    },
  };

  return (
    <ChartCard
      title={t(lang, "chartFertilizerTitle")}
      subtitle={dynamicData ? 'Filtered to recommended crops' : 'All crops — avg kg/ha'}
      icon="🧪"
      badge="Avg"
    >
      <PolarArea data={dynamicData || initial} options={options} />
    </ChartCard>
  );
};

export default FertilizerChart;
