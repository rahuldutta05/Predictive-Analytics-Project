import requests
import json

BASE_URL = "http://localhost:8000"

def test_predict_yield():
    payload = {
        "N": 50, "P": 50, "K": 50,
        "temperature": 25, "humidity": 80, "ph": 6.5, "rainfall": 100,
        "Soil_OC": 0.5, "Fertilizer_kg_ha": 200, "Pest_Index": 0, "Irrigation_mm": 500
    }
    response = requests.post(f"{BASE_URL}/predict_yield", json=payload)
    print(f"Predict Yield Response: {response.status_code}")
    print(json.dumps(response.json(), indent=2))

def test_recommend_crop():
    payload = {
        "N": 50, "P": 50, "K": 50,
        "temperature": 25, "humidity": 80, "ph": 6.5, "rainfall": 100
    }
    response = requests.post(f"{BASE_URL}/recommend_crop", json=payload)
    print(f"Recommend Crop Response: {response.status_code}")
    print(json.dumps(response.json(), indent=2))

if __name__ == "__main__":
    try:
        test_predict_yield()
        print("-" * 20)
        test_recommend_crop()
    except Exception as e:
        print(f"Error: {e}")
