from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import io
import traceback
from typing import List

from src.estimators import ols_adjustment, estimate_psm, iptw_ate
from src.diagnostics import plot_propensity_overlap, check_balance

# Try to import DML
try:
    from src.estimators import dml_ate
    has_dml = True
except ImportError:
    has_dml = False

app = FastAPI(title="Causal Inference API", version="1.0")

# Enable CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for datasets (for demonstration purposes)
# In production, use a database or temp files with unique IDs
DATASETS = {}

class AnalysisRequest(BaseModel):
    dataset_id: str
    treatment: str
    outcome: str
    covariates: List[str]
    methods: List[str]

@app.get("/")
def read_root():
    return {"message": "Welcome to the Causal Impact Pipeline API"}

@app.post("/upload/")
async def upload_csv(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
        
        # Simple ID generation
        dataset_id = file.filename
        DATASETS[dataset_id] = df
        
        # Determine likely datatypes for columns
        columns_info = []
        for col in df.columns:
            dtype = str(df[col].dtype)
            col_type = "numeric" if "int" in dtype or "float" in dtype else "categorical"
            columns_info.append({"name": col, "type": col_type})

        return {
            "dataset_id": dataset_id,
            "filename": file.filename, 
            "columns": columns_info, 
            "rows": len(df)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/analyze/")
async def run_analysis(request: AnalysisRequest):
    if request.dataset_id not in DATASETS:
        raise HTTPException(status_code=404, detail="Dataset not found. Please upload again.")
    
    df = DATASETS[request.dataset_id].copy()
    
    # Validation
    required_cols = [request.treatment, request.outcome] + request.covariates
    missing = [col for col in required_cols if col not in df.columns]
    if missing:
        raise HTTPException(status_code=400, detail=f"Missing columns: {missing}")

    try:
        # 1. Diagnostics (Balance & Overlap)
        balance_df = check_balance(df, request.treatment, request.covariates)
        balance_records = balance_df.to_dict(orient='records')
        
        overlap_plot_b64 = plot_propensity_overlap(
            df, request.treatment, request.covariates, return_base64=True
        )

        results = []
        
        # 2. Run selected estimators
        if "ols" in request.methods:
            try:
                model = ols_adjustment(df, request.outcome, request.treatment, request.covariates)
                results.append({
                    "method": "OLS (Covariate Adjustment)",
                    "ate": float(model.params[request.treatment]),
                    "se": float(model.bse[request.treatment]),
                    "p_value": float(model.pvalues[request.treatment])
                })
            except Exception as e:
                print(f"OLS failed: {e}")
                
        if "psm" in request.methods:
            try:
                ate = estimate_psm(df, request.outcome, request.treatment, request.covariates)
                results.append({
                    "method": "Propensity Score Matching (1:1 NN)",
                    "ate": float(ate),
                    "se": None, "p_value": None
                })
            except Exception as e:
                 print(f"PSM failed: {e}")

        if "iptw" in request.methods:
            try:
                ate = iptw_ate(df, request.outcome, request.treatment, request.covariates)
                results.append({
                    "method": "Inverse Probability of Treatment Weighting",
                    "ate": float(ate),
                    "se": None, "p_value": None
                })
            except Exception as e:
                 print(f"IPTW failed: {e}")
                 
        if "dml" in request.methods and has_dml:
            try:
                ate, _ = dml_ate(df, request.outcome, request.treatment, request.covariates)
                results.append({
                    "method": "Double Machine Learning",
                    "ate": float(ate),
                    "se": None, "p_value": None
                })
            except Exception as e:
                 print(f"DML failed: {e}")

        return {
            "results": results,
            "diagnostics": {
                "balance": balance_records,
                "overlap_plot": overlap_plot_b64
            }
        }
        
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
