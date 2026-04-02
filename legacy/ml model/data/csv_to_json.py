import pandas as pd
import json

csv_file = "Crop_recommendation.csv"
json_file = "crop_data.json" # New file name for the JSON output

try:
    df = pd.read_csv(csv_file)
    # Convert DataFrame to a list of dictionaries (JSON format)
    data = df.to_dict(orient='records')

    with open(json_file, 'w') as f:
        json.dump(data, f, indent=4) # indent for pretty-printing

    print(f"✅ Successfully converted '{csv_file}' to '{json_file}'")
    print(f"First 2 records:\n{json.dumps(data[:2], indent=4)}")

except FileNotFoundError:
    print(f"Error: '{csv_file}' not found. Make sure it's in the same directory.")
except Exception as e:
    print(f"An error occurred: {e}")