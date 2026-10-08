import joblib
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

model = joblib.load("occupancy_model.pkl")

FEATURES = [
    "occupant_count", "occupant_count_lag_30min", "occupant_count_lag_1h",
    "occupant_count_lag_2h", "hour", "day_of_week", "is_weekend",
    "indoor_co2", "air_temperature", "indoor_relative_humidity",
    "sound_pressure_level", "illuminance", "wifi_connected_devices"
]

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json(force=True)

    row = {f: [data.get(f, 0)] for f in FEATURES}
    X = pd.DataFrame(row)

    pred = float(model.predict(X)[0])
    current = float(data.get("occupant_count", 0))
    change = pred - current

    if pred < 5:
        crowd = "LOW"
        rec = "Suitable for routine operations or maintenance."
        action = "No immediate crowd-management action required."
    elif pred < 15:
        crowd = "MEDIUM"
        rec = "Monitor crowd levels; consider alternate room availability."
        action = "Check room capacity before scheduling events."
    else:
        crowd = "HIGH"
        rec = "Increase monitoring and prepare additional staff."
        action = "Monitor crowd and consider alternate routes."

    return jsonify({
        "current_occupancy": current,
        "predicted_occupancy_30min": round(pred, 2),
        "predicted_change": round(change, 2),
        "crowd_level": crowd,
        "recommendation": rec,
        "action": action
    })

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8000)