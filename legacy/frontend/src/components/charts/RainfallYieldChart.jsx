import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import ChartCard from './ChartCard';
import mockData from '../../crop_data.json';

const RainfallYieldChart = () => {
  const { labels, yieldVals, rainfallVals } = useMemo(() => {
    const cropLabels = [...new Set(mockData.map(d => d.label))];
    const agg = cropLabels.map(label => {
      const rows = mockData.filter(d => d.label === label);
      return {
        label,
        avgRainfall: (rows.reduce((s, d) => s + d.rainfall, 0) / rows.length).toFixed(1),
        avgYield:    (rows.reduce((s, d) => s + d.Yield_t_ha, 0) / rows.length).toFixed(2),
      };
    });
    return {
      labels:      agg.map(d => d.label),
      yieldVals:   agg.map(d => d.avgYield),
      rainfallVals: agg.map(d => d.avgRainfall),
    };
  }, []);

  const data = {
    labels,
    datasets: [
      {
        label: 'Avg Yield (t/ha)',
        data: yieldVals,
        borderColor: '#4a7c59',
        backgroundColor: 'rgba(74,124,89,0.08)',
        borderWidth: 4,
        tension: 0.4,
        fill: true,
        pointRadius: 6,
        pointHoverRadius: 10,
        yAxisID: 'y-yield',
      },
      {
        label: 'Avg Rainfall (mm)',
        data: rainfallVals,
        borderColor: '#3a6ea8',
        backgroundColor: 'rgba(58,110,168,0.08)',
        borderWidth: 4,
        tension: 0.4,
        fill: true,
        pointRadius: 6,
        pointHoverRadius: 10,
        yAxisID: 'y-rainfall',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      datalabels: { display: false },
    },
    scales: {
      'y-yield':    { type: 'linear', position: 'left',  title: { display: true, text: 'Yield (t/ha)' }, grid: { color: 'rgba(128, 128, 128, 0.15)' } },
      'y-rainfall': { type: 'linear', position: 'right', title: { display: true, text: 'Rainfall (mm)' }, grid: { drawOnChartArea: false } },
      x: { ticks: { maxRotation: 45 }, grid: { display: false } },
    },
  };

  return (
    <ChartCard title="📈 Rainfall vs Yield" subtitle="Historical averages per crop from dataset">
      <Line data={data} options={options} />
    </ChartCard>
  );
};

export default RainfallYieldChart;
