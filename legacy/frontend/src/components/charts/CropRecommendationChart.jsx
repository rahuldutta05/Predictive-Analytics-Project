import React from 'react';
import { Bar } from 'react-chartjs-2';
import ChartCard from './ChartCard';

const COLORS = ['#4a7c59', '#3a6ea8', '#c8860a', '#9b59b6', '#d44a2a'];

const CropRecommendationChart = ({ cropResult }) => {
  if (!cropResult?.top_crops) {
    return (
      <ChartCard
        title="📊 Top Crop Recommendations"
        subtitle="AI-ranked crops by soil & climate match"
      />
    );
  }

  const crops = cropResult.top_crops;
  const data = {
    labels: crops.map(c => c.crop.charAt(0).toUpperCase() + c.crop.slice(1)),
    datasets: [{
      label: 'Match (%)',
      data: crops.map(c => c.probability.toFixed(2)),
      backgroundColor: COLORS.slice(0, crops.length),
      borderColor: COLORS.slice(0, crops.length).map(c => c + 'dd'),
      borderWidth: 3,
      borderRadius: 8,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: { label: ctx => ` ${ctx.parsed.y}% match` }
      },
      datalabels: {
        display: true,
        anchor: 'end',
        align: 'top',
        formatter: v => v + '%',
        color: 'var(--text-secondary)',
        font: { weight: '600', size: 11 },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: { display: true, text: 'Probability (%)' },
        grid: { color: 'rgba(128, 128, 128, 0.15)' },
      },
      x: { grid: { display: false } },
    },
  };

  return (
    <ChartCard
      title="📊 Top Crop Recommendations"
      subtitle="AI-ranked crops by soil & climate match"
    >
      <Bar data={data} options={options} />
    </ChartCard>
  );
};

export default CropRecommendationChart;
