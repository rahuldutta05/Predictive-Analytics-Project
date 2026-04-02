import React from 'react';
import './ChartCard.css';

const ChartCard = ({ title, subtitle, children, placeholder }) => (
  <div className="chart-card">
    <div className="chart-card-header">
      <h3 className="chart-card-title">{title}</h3>
      {subtitle && <p className="chart-card-subtitle">{subtitle}</p>}
    </div>
    <div className="chart-canvas">
      {children || (
        <div className="chart-placeholder">
          <span>{placeholder || 'Run a prediction to see data'}</span>
        </div>
      )}
    </div>
  </div>
);

export default ChartCard;
