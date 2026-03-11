import pandas as pd
import numpy as np
import os
from src.data_io import generate_simulated_data, save_data
from src.estimators import ols_adjustment, estimate_psm, iptw_ate
from src.diagnostics import check_balance, plot_propensity_overlap
from src.reporting import generate_summary_report

# Try to import DML
try:
    from src.estimators import dml_ate
    has_dml = True
except ImportError:
    has_dml = False

def run_demo():
    print("Starting Causal Pipeline Demo...")
    
    # 1. Generate & Load Data
    os.makedirs("data/processed", exist_ok=True)
    os.makedirs("report/figures", exist_ok=True)
    
    df = generate_simulated_data(n_samples=2500)
    save_data(df, "data/processed/simulated_sample.csv")
    print(f"Dataset generated with {len(df)} samples.")
    print("True ATE is known to be 2.50\n")

    outcome = 'outcome'
    treatment = 'treatment'
    covariates = ['age', 'income', 'prior_outcome']

    # 2. Diagnostics
    print("--- Pre-treatment Balance ---")
    balance_df = check_balance(df, treatment, covariates)
    print(balance_df)
    
    plot_propensity_overlap(df, treatment, covariates, save_path="report/figures/overlap.png")
    print("\nOverlap plot saved to report/figures/overlap.png\n")

    # 3. Estimation
    results = {}
    
    # OLS
    ols_model = ols_adjustment(df, outcome, treatment, covariates)
    results['OLS (Covariate Adj)'] = ols_model.params[treatment]
    
    # PSM
    psm_ate = estimate_psm(df, outcome, treatment, covariates)
    results['PSM (1:1 NN)'] = psm_ate
    
    # IPTW
    iptw_res = iptw_ate(df, outcome, treatment, covariates)
    results['IPTW'] = iptw_res
    
    # DML
    if has_dml:
        dml_res, _ = dml_ate(df, outcome, treatment, covariates)
        results['Double ML'] = dml_res
    else:
        print("EconML not installed, skipping DML.")

    # 4. Reporting
    generate_summary_report(results)

if __name__ == "__main__":
    run_demo()
