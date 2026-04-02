import React, { useState, useEffect } from 'react';
import '../styles/Features.css';

function FieldComparator({ language }) {
  const [fields, setFields] = useState([]);
  const [formData, setFormData] = useState({
    field_id: '',
    field_name: '',
    area_ha: 1,
    crop_name: 'Rice',
    N: 40, P: 15, K: 150,
    temperature: 25, humidity: 75, ph: 6.5, rainfall: 150,
    yield_achieved: 4
  });
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: isNaN(value) ? value : parseFloat(value)
    }));
  };

  const handleAddField = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/field_record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      alert('Field recorded successfully!');
      
      // Load comparison
      fetchComparison();
    } catch (error) {
      console.error('Error:', error);
      alert('Error recording field. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const fetchComparison = async () => {
    try {
      const response = await fetch('http://localhost:8000/field_comparison');
      const data = await response.json();
      setComparison(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    fetchComparison();
  }, []);

  return (
    <div className="feature-container">
      <div className="feature-header">
        <h2>🗺️ Field Performance Comparator</h2>
        <p>Track and compare performance across multiple fields</p>
      </div>

      <div className="feature-content">
        <div className="input-section">
          <h3>Record Field Data</h3>
          
          <div className="form-grid">
            <div className="form-group">
              <label>Field ID</label>
              <input 
                type="text" 
                name="field_id" 
                value={formData.field_id}
                onChange={handleChange}
                placeholder="e.g., FIELD_001"
              />
            </div>

            <div className="form-group">
              <label>Field Name</label>
              <input 
                type="text" 
                name="field_name" 
                value={formData.field_name}
                onChange={handleChange}
                placeholder="e.g., North Field"
              />
            </div>

            <div className="form-group">
              <label>Area (ha)</label>
              <input 
                type="number" 
                name="area_ha" 
                step="0.1"
                value={formData.area_ha}
                onChange={handleChange}
              />
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

            <div className="form-group">
              <label>N (mg/kg)</label>
              <input type="number" name="N" value={formData.N} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Yield Achieved (t/ha)</label>
              <input type="number" name="yield_achieved" step="0.1" value={formData.yield_achieved} onChange={handleChange} />
            </div>
          </div>

          <button className="btn-primary" onClick={handleAddField} disabled={loading}>
            {loading ? 'Recording...' : 'Record Field Data'}
          </button>
        </div>

        {comparison && (
          <div className="result-section">
            <h3>Field Comparison</h3>
            
            {comparison.field_comparison && comparison.field_comparison.length > 0 ? (
              <>
                {comparison.best_performing_field && (
                  <div className="best-field-card">
                    <h4>🏆 Best Performing Field</h4>
                    <p><strong>{comparison.best_performing_field.field_name}</strong></p>
                    <p>Avg Yield: {comparison.best_performing_field.avg_yield_t_ha} t/ha</p>
                  </div>
                )}

                <div className="fields-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Field Name</th>
                        <th>Area (ha)</th>
                        <th>Crop</th>
                        <th>Avg Yield (t/ha)</th>
                        <th>Avg NPK</th>
                        <th>Records</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparison.field_comparison.map((field, idx) => (
                        <tr key={idx}>
                          <td>{field.field_name}</td>
                          <td>{field.area_ha}</td>
                          <td>{field.current_crop}</td>
                          <td>{field.avg_yield_t_ha}</td>
                          <td>{field.avg_npk.toFixed(1)}</td>
                          <td>{field.number_of_records}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <p className="empty-state">No field data recorded yet. Start by adding a field above.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default FieldComparator;
