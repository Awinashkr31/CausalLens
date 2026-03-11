import requests

try:
    with open("data/processed/simulated_sample.csv", "rb") as f:
        res = requests.post("http://127.0.0.1:8000/upload/", files={"file": f})
        print("Status:", res.status_code)
        print("Response:", res.text)
except Exception as e:
    print("Error:", e)
