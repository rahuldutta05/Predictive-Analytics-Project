import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import ChartCard from './ChartCard';
import mockData from '../../crop_data.json';

const PestIndexChart = ({ dynamicData }) => {
  const initial = useMemo(() => {
    const labels = [...new Set(mockData.map(d => d.label))];
    return {
      labels,
      datasets: [{
        label: 'Pest Index',
        data: labels.map(l => {
          const rows = mockData.filter(d => d.label === l);
          return (rows.reduce((s, d) => s + d.Pest_Index, 0) / rows.length).toFixed(2);
        }),
        backgroundColor: '#d44a2acc',
        borderColor: '#d44a2a',
        borderWidth: 3,
        borderRadius: 6,
      }],
    };
  }, []);

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
        formatter: v => v,
        color: 'var(--text-secondary)',
        font: { size: 10 },
      },
    },
    scales: {
      x: { beginAtZero: true, title: { display: true, text: 'Index Value' }, grid: { color: 'rgba(128, 128, 128, 0.15)' } },
      y: { grid: { display: false }, ticks: { font: { size: 11 } } },
    },
    layout: { padding: { right: 30 } },
  };

  return (
    <ChartCard
      title="🐛 Pest Index Distribution"
      subtitle={dynamicData ? 'Filtered to recommended crops' : 'All crops in dataset'}
    >
      <Bar data={dynamicData || initial} options={options} />
    </ChartCard>
  );
};

export default PestIndexChart;
