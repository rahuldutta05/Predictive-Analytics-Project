# AgriSense 🌾 - Agriculture Analytics Platform v2.0

**AgriSense** is a comprehensive, AI-powered agriculture analytics platform designed to empower farmers with data-driven insights. By leveraging advanced machine learning models and actionable recommendations, the platform helps optimize crop selection, yield, resource management, and sustainable farming practices.

![AgriSense Architecture](architecture.png)

---

## 🎯 Key Features (v2.0)

AgriSense v2.0 introduces a powerful suite of **16 core modules** to support every stage of the farming lifecycle:

### 🧠 Core Prediction Engines
- **🎯 Crop Recommendation**: AI-driven selection based on NPK, pH, and climate data (~99% accuracy).
- **📈 Yield Prediction**: Multi-parameter forecasting using 16+ engineered farm features.

### 🌱 Soil & Resource Management
- **🧪 Soil Health Dashboard**: Detailed composition analysis with personalized health scores (0-100).
- **💊 Fertilizer Recommender**: Precise input suggestions and cost-saving calculations.
- **💧 Irrigation Scheduler**: Smart watering plans based on growth stages and weather forecasts.
- **💦 Water Audit**: Efficiency analysis and cost-saving recommendations for sustainable irrigation.

### 💰 Farm Economics
- **📊 Market Prices**: Live reference mandi rates for major Indian crops.
- **💵 Revenue & ROI Estimator**: Harvest income projections based on predicted yields.
- **💰 Expense & Income Tracker**: Categorized financial tracking and profitability reports.
- **📜 Government Schemes**: Indexed subsidies, loans, and direct application links for multiple states.

### 🛡️ Risk Management & Planning
- **⛅ Weather-Based Advisories**: Actionable farming tips and specialized alerts for extreme conditions.
- **🐛 Pest & Weed Alerts**: Early warning system for outbreaks with localized management strategies.
- **🔄 Crop Rotation Guide**: Sustainable rotation plans to maintain soil fertility and break pest cycles.
- **📅 Crop Advisory Timeline**: Month-by-month activity guidance tailored to the crop cycle.

### 👥 Community & Support
- **🤝 Farmer Community Forum**: A collaborative Q&A space for knowledge sharing and expert advice.
- **🌐 Multilingual Support**: Seamless interface in **English (EN)**, **Hindi (HI)**, and **Tamil (TA)**.

---

## 🏗️ Technology Stack

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python 3.9+)
- **Machine Learning**: Scikit-Learn (Random Forest pipelines), Joblib, Pandas, NumPy
- **Server**: Uvicorn with auto-refresh (Development)
- **API Docs**: Interactive Swagger/OpenAPI at `/docs`

### Frontend
- **Framework**: [React 18+](https://react.dev/) with [Vite](https://vitejs.dev/)
- **Visualizations**: [Chart.js](https://www.chartjs.org/) for interactive data analytics
- **Styling**: Vanilla CSS (Responsive Design, Dark Mode, Glassmorphism)
- **State**: React Hooks & Context API

---

## 🚀 Getting Started

### Prerequisites
- **Python 3.9+**
- **Node.js v18+** & npm
- A modern web browser

### 1. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv
.\venv\Scripts\activate  # Windows
source venv/bin/activate # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Start the server
python main.py
```
> [!IMPORTANT]
> Ensure your trained models (`crop_recommendation_topk_model.pkl` and `yield_predictor.pkl`) are placed in `ml model/models/` for predictions to work.

### 2. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```
> [!TIP]
> The app will be live at `http://localhost:5173`. Select your preferred language from the settings in the top navigation bar.

---

## 📝 Project Structure

```text
Software-Engineering-Project/
├── backend/                # FastAPI Application & Business Logic
│   └── main.py             # Main entry point with 20+ endpoints
├── frontend/               # React Application & UI Components
│   └── src/
│       ├── components/     # 16+ Feature-specific components & charts
│       └── api.js          # Unified API integration layer
├── ml model/               # Machine Learning Research & Assets
│   └── models/             # Production-ready Scikit-Learn pipelines (.pkl)
├── architecture.png        # System architecture diagram
└── protocol_stack.png      # Communication protocol map
```

---

## 🐛 Troubleshooting

| Issue | Potential Solution |
| :--- | :--- |
| **Model Load Error** | Verify filenames in `ml model/models/` match `main.py` definitions. |
| **CORS Policy Error** | Ensure backend is running and correct URL is set in `frontend/src/api.js`. |
| **Charts Missing** | Clear browser cache or ensure `Chart.js` is correctly initialized via `npm install`. |
| **Database Resets** | Current version uses in-memory storage. Deploy with PostgreSQL for persistence. |

---

## 🔒 Security & Deployment

For production environments, it is highly recommended to:
1.  **Persistence**: Migrate from in-memory dictionary storage to **PostgreSQL** or **MongoDB**.
2.  **Auth**: Layer **JWT** or **OAuth2** authentication for user data protection.
3.  **Optimization**: Use a production-grade WSGI/ASGI server like **Gunicorn**.
4.  **Containerization**: Deploy using **Docker** for consistent environment management.

---

**AgriSense v2.0** - *Empowering Indian Farmers with the Power of AI.* 🌾📊

**Version:** 2.0.0  
**Status:** Feature Complete / Demo Ready
