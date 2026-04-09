import requests
try:
    with open("data/processed/simulated_sample.csv", "rb") as f:
        res = requests.post("http://127.0.0.1:8000/upload/", files={"file": f})
        data = res.json()
        
        payload = {
            "dataset_id": data["dataset_id"],
            "treatment": "treatment",
            "outcome": "outcome",
            "covariates": ["age", "income", "prior_outcome"],
            "methods": ["psm", "dml"],
            "hyperparameters": {
                "psm_n_neighbors": 3,
                "psm_caliper": 0.1,
                "dml_n_estimators": 10,
                "dml_max_depth": 3
            }
        }
        res2 = requests.post("http://127.0.0.1:8000/analyze/", json=payload)
        
        results = res2.json().get("results", [])
        print("Hyperparameter Test Results:")
        for r in results:
            print(f"- {r.get('method')}: ATE={r.get('ate')} Error={r.get('error')}")
except Exception as e:
    print("Error:", e)
