import React from 'react';
import './ChartCard.css';

/**
 * ChartCard — wrapper for every chart.
 * Props:
 *   title      {string}  – chart heading
 *   subtitle   {string}  – grey caption
 *   badge      {string}  – optional right-aligned pill (e.g. "Live", "Avg")
 *   icon       {string}  – optional emoji / single char shown in header
 *   children   {node}    – the chart element
 *   placeholder {string} – message when no children
 */
const ChartCard = ({ title, subtitle, badge, icon, children, placeholder }) => (
  <div className="chart-card">
    <div className="chart-card-header">
      <div className="chart-card-header-left">
        {icon && <span className="chart-card-icon" aria-hidden="true">{icon}</span>}
        <div>
          <h3 className="chart-card-title">{title}</h3>
          {subtitle && <p className="chart-card-subtitle">{subtitle}</p>}
        </div>
      </div>
      {badge && <span className="chart-card-badge">{badge}</span>}
    </div>
    <div className="chart-canvas">
      {children || (
        <div className="chart-placeholder">
          <div className="chart-placeholder-inner">
            <span className="chart-placeholder-icon">📊</span>
            <span>{placeholder || 'Run a prediction to see data'}</span>
          </div>
        </div>
      )}
    </div>
  </div>
);

export default ChartCard;
