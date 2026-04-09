import requests

try:
    # First upload a file to have something in the list
    with open("data/processed/simulated_sample.csv", "rb") as f:
        requests.post("http://127.0.0.1:8000/upload/", files={"file": f})
    
    # Now check the datasets endpoint
    res = requests.get("http://127.0.0.1:8000/datasets/")
    print("Status:", res.status_code)
    print("Datasets:", res.json())
except Exception as e:
    print("Error:", e)
