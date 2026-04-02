import React, { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import ChartCard from './ChartCard';
import mockData from '../../crop_data.json';

const PALETTE = ['#4a7c59','#3a6ea8','#c8860a','#9b59b6','#d44a2a',
                 '#16a085','#e67e22','#2c3e50','#8e44ad','#27ae60',
                 '#c0392b','#2980b9','#f39c12','#7f8c8d','#1abc9c',
                 '#e74c3c','#3498db','#95a5a6','#d35400','#bdc3c7','#2ecc71','#e8daef'];

const SoilOCChart = ({ dynamicData }) => {
  const initial = useMemo(() => {
    const labels = [...new Set(mockData.map(d => d.label))];
    return {
      labels,
      datasets: [{
        label: 'Soil OC (g/kg)',
        data: labels.map(l => {
          const rows = mockData.filter(d => d.label === l);
          return (rows.reduce((s, d) => s + d.Soil_OC, 0) / rows.length).toFixed(2);
        }),
        backgroundColor: PALETTE,
        borderColor: '#fff',
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
  };

  return (
    <ChartCard
      title="🌳 Soil Organic Carbon"
      subtitle={dynamicData ? 'Filtered to recommended crops' : 'All crops in dataset'}
    >
      <Doughnut data={dynamicData || initial} options={options} />
    </ChartCard>
  );
};

export default SoilOCChart;
