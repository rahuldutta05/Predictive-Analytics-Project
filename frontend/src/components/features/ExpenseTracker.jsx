import React, { useState, useEffect } from 'react';
import '../styles/Features.css';

function ExpenseTracker({ language }) {
  const [formData, setFormData] = useState({
    seeds_cost: 2000,
    fertilizer_cost: 3000,
    pesticide_cost: 1000,
    labor_cost: 5000,
    water_cost: 1500,
    machinery_cost: 2000,
    land_area_ha: 1,
    crop_name: 'Rice'
  });
  
  const [result, setResult] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: isNaN(value) ? value : parseFloat(value)
    }));
  };

  const handleTrack = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/track_expense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      setResult(data);
      
      // Fetch summary
      const summaryResponse = await fetch(`http://localhost:8000/expense_summary?crop_name=${formData.crop_name}`);
      const summaryData = await summaryResponse.json();
      setSummary(summaryData);
    } catch (error) {
      console.error('Error:', error);
      alert('Error tracking expense. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="feature-container">
      <div className="feature-header">
        <h2>💰 Expense & Income Tracker</h2>
        <p>Track farming expenses and calculate ROI</p>
      </div>

      <div className="feature-content">
        <div className="input-section">
          <h3>Record Your Expenses</h3>
          
          <div className="form-grid">
            <div className="form-group">
              <label>Seeds & Planting ₹</label>
              <input type="number" name="seeds_cost" value={formData.seeds_cost} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Fertilizer & Nutrients ₹</label>
              <input type="number" name="fertilizer_cost" value={formData.fertilizer_cost} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Pesticides & Herbicides ₹</label>
              <input type="number" name="pesticide_cost" value={formData.pesticide_cost} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Labor Cost ₹</label>
              <input type="number" name="labor_cost" value={formData.labor_cost} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Water & Irrigation ₹</label>
              <input type="number" name="water_cost" value={formData.water_cost} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Machinery & Equipment ₹</label>
              <input type="number" name="machinery_cost" value={formData.machinery_cost} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Land Area (ha)</label>
              <input type="number" name="land_area_ha" step="0.1" value={formData.land_area_ha} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Crop Name</label>
              <select name="crop_name" value={formData.crop_name} onChange={handleChange}>
                <option>Rice</option>
                <option>Wheat</option>
                <option>Corn</option>
                <option>Tomato</option>
              </select>
            </div>
          </div>

          <button className="btn-primary" onClick={handleTrack} disabled={loading}>
            {loading ? 'Processing...' : 'Track Expenses'}
          </button>
        </div>

        {result && (
          <div className="result-section">
            <h3>Expense Analysis</h3>
            
            <div className="expense-summary">
              <div className="expense-card">
                <h4>Total Expense</h4>
                <p className="amount">₹{result.total_expense}</p>
              </div>
              <div className="expense-card">
                <h4>Cost per Hectare</h4>
                <p className="amount">₹{result.cost_per_ha}</p>
              </div>
            </div>

            <div className="expense-breakdown">
              <h4>Expense Breakdown</h4>
              <div className="breakdown-items">
                <div className="breakdown-item">
                  <span>Seeds & Planting</span>
                  <span>₹{result.breakdown.seeds}</span>
                  <div className="progress-bar">
                    <div className="progress" style={{width: `${(result.breakdown.seeds/result.total_expense)*100}%`}}></div>
                  </div>
                </div>
                <div className="breakdown-item">
                  <span>Fertilizer</span>
                  <span>₹{result.breakdown.fertilizer}</span>
                  <div className="progress-bar">
                    <div className="progress" style={{width: `${(result.breakdown.fertilizer/result.total_expense)*100}%`}}></div>
                  </div>
                </div>
                <div className="breakdown-item">
                  <span>Labor</span>
                  <span>₹{result.breakdown.labor}</span>
                  <div className="progress-bar">
                    <div className="progress" style={{width: `${(result.breakdown.labor/result.total_expense)*100}%`}}></div>
                  </div>
                </div>
                <div className="breakdown-item">
                  <span>Others</span>
                  <span>₹{result.breakdown.pesticide + result.breakdown.water + result.breakdown.machinery}</span>
                </div>
              </div>
            </div>

            {summary && (
              <div className="summary-stats">
                <h4>Crop Summary ({summary.crop})</h4>
                <p>Average expense: ₹{summary.avg_total_expense}</p>
                <p>Average cost/ha: ₹{summary.avg_cost_per_ha}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ExpenseTracker;
