import React, { useState, useEffect } from 'react';
import '../styles/Features.css';

function MarketPrices({ language }) {
  const [prices, setPrices] = useState(null);
  const [selectedCrop, setSelectedCrop] = useState('Rice');
  const [revenue, setRevenue] = useState(null);
  const [yieldAmount, setYieldAmount] = useState(4);
  const [landArea, setLandArea] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPrices();
  }, []);

  const fetchPrices = async () => {
    try {
      const response = await fetch('http://localhost:8000/market_prices');
      const data = await response.json();
      setPrices(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const calculateRevenue = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/revenue_estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crop_name: selectedCrop,
          predicted_yield: yieldAmount,
          land_area_ha: landArea
        })
      });
      const data = await response.json();
      setRevenue(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="feature-container">
      <div className="feature-header">
        <h2>📊 Market Prices & Revenue</h2>
        <p>Check current market prices and calculate your potential earnings</p>
      </div>

      <div className="feature-content">
        {prices && (
          <>
            <div className="prices-grid">
              <h3>Current Market Prices</h3>
              <div className="prices-list">
                {prices.crops.map((crop, idx) => (
                  <div key={idx} className="price-card">
                    <h4>{crop.crop}</h4>
                    <p className="price">
                      {Object.values(crop).find(v => typeof v === 'number' && v > 100)}
                    </p>
                    <p className="trend">Trend: {crop.trend}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="input-section">
              <h3>Calculate Your Revenue</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Crop</label>
                  <select value={selectedCrop} onChange={(e) => setSelectedCrop(e.target.value)}>
                    {prices.crops.map((crop, idx) => (
                      <option key={idx}>{crop.crop}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Expected Yield (t/ha)</label>
                  <input type="number" step="0.1" value={yieldAmount} onChange={(e) => setYieldAmount(parseFloat(e.target.value))} />
                </div>

                <div className="form-group">
                  <label>Land Area (ha)</label>
                  <input type="number" step="0.1" value={landArea} onChange={(e) => setLandArea(parseFloat(e.target.value))} />
                </div>
              </div>

              <button className="btn-primary" onClick={calculateRevenue} disabled={loading}>
                {loading ? 'Calculating...' : 'Calculate Revenue'}
              </button>
            </div>

            {revenue && (
              <div className="result-section">
                <h3>Revenue Estimate</h3>
                <div className="revenue-display">
                  <div className="revenue-card">
                    <h4>Estimated Revenue</h4>
                    <p className="revenue-amount">{revenue.estimated_revenue}</p>
                  </div>
                  <div className="revenue-card">
                    <h4>Total Production</h4>
                    <p className="amount">{revenue.total_production}</p>
                  </div>
                  <div className="revenue-card">
                    <h4>Market Trend</h4>
                    <p className="trend">{revenue.market_trend}</p>
                  </div>
                </div>
                <p className="note">{revenue.note}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default MarketPrices;
