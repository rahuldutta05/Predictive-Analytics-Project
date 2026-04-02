import React from 'react';
import { Radar } from 'react-chartjs-2';
import ChartCard from './ChartCard';

const IDEAL_RICE = { N: 80, P: 45, K: 45, temperature: 25, humidity: 80, ph: 6.5, rainfall: 200 };
const LABELS = ['N', 'P', 'K', 'Temperature', 'Humidity', 'pH', 'Rainfall'];
const KEYS   = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall'];

const RadarProfileChart = ({ inputs }) => {
  const data = {
    labels: LABELS,
    datasets: [
      {
        label: 'Your Input',
        data: KEYS.map(k => inputs[k]),
        backgroundColor: 'rgba(74,124,89,0.15)',
        borderColor: '#4a7c59',
        pointBackgroundColor: '#4a7c59',
        borderWidth: 4,
        pointRadius: 5,
        pointHoverRadius: 8,
      },
      {
        label: 'Ideal — Rice',
        data: KEYS.map(k => IDEAL_RICE[k]),
        backgroundColor: 'rgba(58,110,168,0.10)',
        borderColor: '#3a6ea8',
        pointBackgroundColor: '#3a6ea8',
        borderWidth: 4,
        borderDash: [5, 3],
        pointRadius: 5,
        pointHoverRadius: 8,
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
      r: {
        beginAtZero: true,
        angleLines: { color: 'rgba(128, 128, 128, 0.2)' },
        grid: { color: 'rgba(128, 128, 128, 0.2)' },
        pointLabels: { font: { size: 12 }, color: 'var(--text-secondary)' },
      },
    },
  };

  return (
    <ChartCard
      title="🎯 Input vs Ideal Profile"
      subtitle="Comparing your values against ideal rice conditions"
    >
      <Radar data={data} options={options} />
    </ChartCard>
  );
};

export default RadarProfileChart;
