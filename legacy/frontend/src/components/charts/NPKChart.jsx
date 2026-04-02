import React from 'react';
import { Bar } from 'react-chartjs-2';
import ChartCard from './ChartCard';

const NPKChart = ({ inputs }) => {
  const data = {
    labels: ['Nitrogen (N)', 'Phosphorus (P)', 'Potassium (K)'],
    datasets: [{
      label: 'kg/ha',
      data: [inputs.N, inputs.P, inputs.K],
      backgroundColor: ['#4a7c59cc', '#3a6ea8cc', '#c8860acc'],
      borderColor: ['#4a7c59', '#3a6ea8', '#c8860a'],
      borderWidth: 4,
      borderRadius: 8,
    }],
  };

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      datalabels: {
        display: true,
        anchor: 'end',
        align: 'end',
        formatter: v => v + ' kg/ha',
        color: 'var(--text-secondary)',
        font: { weight: '600', size: 11 },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        max: 300,
        title: { display: true, text: 'Concentration (kg/ha)' },
        grid: { color: 'rgba(128, 128, 128, 0.15)' },
      },
      y: { grid: { display: false } },
    },
    layout: { padding: { right: 60 } },
  };

  return (
    <ChartCard title="🧪 Soil Nutrient Profile (NPK)" subtitle="Current input levels">
      <Bar data={data} options={options} />
    </ChartCard>
  );
};

export default NPKChart;
