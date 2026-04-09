from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel, field_validator
import pandas as pd
import io
import traceback
import os
from typing import List

from src.estimators import ols_adjustment, estimate_psm, iptw_ate, estimate_subgroup_effects
from src.diagnostics import plot_propensity_overlap, check_balance, run_refutation_test, plot_love_plot

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

UPLOADS_DIR = "data/uploads"
os.makedirs(UPLOADS_DIR, exist_ok=True)

class AnalysisRequest(BaseModel):
    dataset_id: str
    treatment: str
    outcome: str
    covariates: List[str]
    methods: List[str]
    subgroup_variable: str = ""
    hyperparameters: dict = {}

    @field_validator("covariates")
    def covariates_validator(cls, v):
        if not v:
            raise ValueError("At least one covariate must be provided")
        return v


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
        df.to_csv(os.path.join(UPLOADS_DIR, dataset_id), index=False)
        
        # Determine likely datatypes for columns
        columns_info = []
        for col in df.columns:
            dtype = str(df[col].dtype)
            col_type = "numeric" if "int" in dtype or "float" in dtype else "categorical"
            columns_info.append({"name": col, "type": col_type})

        # Heuristic Auto-Selection Guesser
        guessed_treatment = ""
        guessed_outcome = ""
        guessed_covariates = []
        
        # Treatment Keywords Heuristics
        treatment_keywords = ['treat', 'intervention', 'program', 'campaign', 'ad', 'promo', 'group']
        for col in df.columns:
            col_lower = col.lower()
            if any(k in col_lower for k in treatment_keywords):
                guessed_treatment = col
                break
                
        # Outcome Keywords Heuristics
        outcome_keywords = ['outcome', 'sales', 'revenue', 'income', 'result', 'effect', 'score', 'amount']
        for col in df.columns:
            if col == guessed_treatment:
                continue
            col_lower = col.lower()
            if any(k in col_lower for k in outcome_keywords):
                guessed_outcome = col
                break
                
        # All remaining numeric columns are assumed covariates
        for col in df.columns:
            if col != guessed_treatment and col != guessed_outcome:
                dtype = str(df[col].dtype)
                if "int" in dtype or "float" in dtype:
                    guessed_covariates.append(col)

        return {
            "dataset_id": dataset_id,
            "filename": file.filename, 
            "columns": columns_info, 
            "rows": len(df),
            "defaults": {
                "treatment": guessed_treatment,
                "outcome": guessed_outcome,
                "covariates": guessed_covariates
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/datasets/")
async def list_datasets():
    """Returns a list of all currently loaded dataset IDs and basic stats."""
    datasets_info = []
    if os.path.exists(UPLOADS_DIR):
        for f in os.listdir(UPLOADS_DIR):
            if f.endswith(".csv"):
                df = pd.read_csv(os.path.join(UPLOADS_DIR, f))
                datasets_info.append({
                    "dataset_id": f,
                    "rows": len(df),
                    "columns": len(df.columns),
                    "filename": f
                })
    return datasets_info

@app.post("/demo/")
async def load_demo():
    try:
        df = pd.read_csv("data/samples/3_healthcare_trial.csv")
        dataset_id = "demo_healthcare_trial.csv"
        df.to_csv(os.path.join(UPLOADS_DIR, dataset_id), index=False)
        
        columns_info = []
        for col in df.columns:
            dtype = str(df[col].dtype)
            col_type = "numeric" if "int" in dtype or "float" in dtype else "categorical"
            columns_info.append({"name": col, "type": col_type})

        return {
            "dataset_id": dataset_id,
            "filename": "3_healthcare_trial.csv", 
            "columns": columns_info, 
            "rows": len(df),
            "defaults": {
                "treatment": "new_drug",
                "outcome": "post_bp",
                "covariates": ["base_bp", "age", "bmi", "cholesterol"],
                "subgroup": "age"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/analyze/")
async def run_analysis(request: AnalysisRequest):
    filepath = os.path.join(UPLOADS_DIR, request.dataset_id)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Dataset not found. Please upload again.")
    
    df = pd.read_csv(filepath)
    
    # Validation
    if request.treatment == request.outcome:
        raise HTTPException(status_code=400, detail="Treatment and outcome cannot be the same variable.")
        
    required_cols = [request.treatment, request.outcome] + request.covariates
    missing = [col for col in required_cols if col not in df.columns]
    if missing:
        raise HTTPException(status_code=400, detail=f"Missing columns: {missing}")

    # Remove duplicates, treatment, and outcome from covariates
    clean_covs = []
    for c in request.covariates:
        if c not in clean_covs and c != request.treatment and c != request.outcome:
            clean_covs.append(c)
    request.covariates = clean_covs

    try:
        # 1. Diagnostics (Balance & Overlap)
        balance_df = check_balance(df, request.treatment, request.covariates)
        balance_records = balance_df.to_dict(orient='records')
        
        overlap_plot_b64 = plot_propensity_overlap(
            df, request.treatment, request.covariates, return_base64=True
        )
        
        love_plot_b64 = plot_love_plot(balance_df, return_base64=True)
        
        # 2. Sensitivity Analysis (Refutation)
        refutation = run_refutation_test(df, request.outcome, request.treatment, request.covariates)
        
        # 3. Subgroup Analysis
        subgroup_results = []
        if request.subgroup_variable:
            subgroup_results = estimate_subgroup_effects(
                df, request.outcome, request.treatment, request.covariates, request.subgroup_variable
            )

        results = []
        
        # 4. Run selected estimators
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
                results.append({"method": "OLS (Covariate Adjustment)", "error": str(e)})
                
        if "psm" in request.methods:
            try:
                n_neighbors = int(request.hyperparameters.get("psm_n_neighbors", 1))
                caliper = request.hyperparameters.get("psm_caliper", None)
                if caliper is not None:
                    caliper = float(caliper)
                ate = estimate_psm(df, request.outcome, request.treatment, request.covariates, caliper=caliper, n_neighbors=n_neighbors)
                results.append({
                    "method": f"Propensity Score Matching ({n_neighbors}:1 NN)",
                    "ate": float(ate),
                    "se": None, "p_value": None
                })
            except Exception as e:
                 results.append({"method": "Propensity Score Matching (1:1 NN)", "error": str(e)})

        if "iptw" in request.methods:
            try:
                ate = iptw_ate(df, request.outcome, request.treatment, request.covariates)
                results.append({
                    "method": "Inverse Probability of Treatment Weighting",
                    "ate": float(ate),
                    "se": None, "p_value": None
                })
            except Exception as e:
                 results.append({"method": "Inverse Probability of Treatment Weighting", "error": str(e)})
                 
        if "dml" in request.methods and has_dml:
            try:
                n_estimators = int(request.hyperparameters.get("dml_n_estimators", 50))
                max_depth = int(request.hyperparameters.get("dml_max_depth", 5))
                ate, _ = dml_ate(df, request.outcome, request.treatment, request.covariates, n_estimators=n_estimators, max_depth=max_depth)
                results.append({
                    "method": "Double Machine Learning",
                    "ate": float(ate),
                    "se": None, "p_value": None
                })
            except Exception as e:
                 results.append({"method": "Double Machine Learning", "error": str(e)})

        return {
            "results": results,
            "subgroup_results": subgroup_results,
            "diagnostics": {
                "balance": balance_records,
                "overlap_plot": overlap_plot_b64,
                "love_plot": love_plot_b64,
                "refutation": refutation
            }
        }
        
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


# --- Serve React Frontend (Production Build) ---
# The frontend is built into 'frontend/dist' during Docker build.
FRONTEND_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "dist")

if os.path.isdir(FRONTEND_DIR):
    # Serve static assets (JS, CSS, images)
    app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_DIR, "assets")), name="static-assets")

    # Catch-all: serve index.html for any non-API route (SPA client-side routing)
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        file_path = os.path.join(FRONTEND_DIR, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(FRONTEND_DIR, "index.html"))
