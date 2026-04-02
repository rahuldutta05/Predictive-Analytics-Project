import React, { useMemo } from 'react';
import { PolarArea } from 'react-chartjs-2';
import ChartCard from './ChartCard';
import mockData from '../../crop_data.json';

const PALETTE = [
  'rgba(200,134,10,0.65)', 'rgba(74,124,89,0.65)',  'rgba(58,110,168,0.65)',
  'rgba(155,89,182,0.65)', 'rgba(212,74,42,0.65)',   'rgba(22,160,133,0.65)',
  'rgba(230,126,34,0.65)', 'rgba(44,62,80,0.65)',    'rgba(142,68,173,0.65)',
  'rgba(39,174,96,0.65)',  'rgba(192,57,43,0.65)',   'rgba(41,128,185,0.65)',
  'rgba(243,156,18,0.65)', 'rgba(127,140,141,0.65)', 'rgba(26,188,156,0.65)',
  'rgba(231,76,60,0.65)',  'rgba(52,152,219,0.65)',  'rgba(149,165,166,0.65)',
  'rgba(211,84,0,0.65)',   'rgba(189,195,199,0.65)', 'rgba(46,204,113,0.65)',
  'rgba(231,145,232,0.65)'
];

const FertilizerChart = ({ dynamicData }) => {
  const initial = useMemo(() => {
    const labels = [...new Set(mockData.map(d => d.label))];
    return {
      labels,
      datasets: [{
        label: 'Fertilizer (kg/ha)',
        data: labels.map(l => {
          const rows = mockData.filter(d => d.label === l);
          return (rows.reduce((s, d) => s + d.Fertilizer_kg_ha, 0) / rows.length).toFixed(1);
        }),
        backgroundColor: PALETTE,
        borderColor: PALETTE.map(c => c.replace('0.65', '1')),
        borderWidth: 3,
      }],
    };
  }, []);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right', labels: { boxWidth: 12, font: { size: 11 } } },
      datalabels: { display: false },
    },
    scales: {
      r: { pointLabels: { display: false } },
    },
  };

  return (
    <ChartCard
      title="💊 Fertilizer Usage"
      subtitle={dynamicData ? 'Filtered to recommended crops' : 'All crops — avg kg/ha'}
    >
      <PolarArea data={dynamicData || initial} options={options} />
    </ChartCard>
  );
};

export default FertilizerChart;
