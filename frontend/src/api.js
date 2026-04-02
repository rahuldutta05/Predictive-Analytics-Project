// src/api.js
import axios from "axios";

const API_BASE = "http://localhost:8000";

export const predictYield = async (payload) => {
  try {
    // Send all 11 features to predictYield API
    const res = await axios.post(`${API_BASE}/predict_yield`, payload);
    return res.data; // Expected: { "predicted_yield_t_ha": X.XX, "timestamp": "..." }
  } catch (error) {
    console.error("Error calling predictYield API:", error.response?.data || error.message);
    throw error;
  }
};

export const recommendCrop = async (payload) => {
  try {
    // Filter payload to only include features required by recommendCrop (7 features)
    const filteredPayload = {
      N: payload.N,
      P: payload.P,
      K: payload.K,
      temperature: payload.temperature,
      humidity: payload.humidity,
      ph: payload.ph,
      rainfall: payload.rainfall,
    };
    const res = await axios.post(`${API_BASE}/recommend_crop`, filteredPayload); // Endpoint is /recommend_crop
    return res.data; // Expected: { "top_crops": [{ "crop": "...", "probability": X.XX }], "timestamp": "..." }
  } catch (error) {
    console.error("Error calling recommendCrop API:", error.response?.data || error.message);
    throw error;
  }
};