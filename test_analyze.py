import requests

try:
    with open("data/processed/simulated_sample.csv", "rb") as f:
        res = requests.post("http://127.0.0.1:8000/upload/", files={"file": f})
        data = res.json()
        print("Upload Status:", res.status_code)
        
        payload = {
            "dataset_id": data["dataset_id"],
            "treatment": "treatment",
            "outcome": "outcome",
            "covariates": ["age", "income", "prior_outcome"],
            "methods": ["ols", "psm", "iptw", "dml"]
        }
        res2 = requests.post("http://127.0.0.1:8000/analyze/", json=payload)
        print("Analyze Status:", res2.status_code)
        if res2.status_code != 200:
            print(res2.text)
        else:
            print("Analyze Success! Keys:", res2.json().keys())
except Exception as e:
    print("Error:", e)
