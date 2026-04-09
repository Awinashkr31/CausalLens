import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.linear_model import LogisticRegression
import io
import base64

# Use Agg backend to avoid GUI requirement issues on servers
import matplotlib
matplotlib.use('Agg')

def check_balance(df, treatment, covariates):
    """Calculate Standardized Mean Differences (SMD) before matching"""
    treated = df[df[treatment] == 1]
    control = df[df[treatment] == 0]
    
    balance = []
    for cov in covariates:
        mean_t = treated[cov].mean()
        mean_c = control[cov].mean()
        var_t = treated[cov].var()
        var_c = control[cov].var()
        
        pooled_std = np.sqrt( (var_t + var_c) / 2 )
        smd = abs(mean_t - mean_c) / pooled_std if pooled_std > 0 else 0
        balance.append({'Covariate': cov, 'SMD': smd})
        
    return pd.DataFrame(balance)

def plot_propensity_overlap(df, treatment, covariates, save_path=None, return_base64=False):
    """Plot propensity score distribution for treated and control."""
    lr = LogisticRegression(max_iter=1000)
    lr.fit(df[covariates], df[treatment])
    pscore = lr.predict_proba(df[covariates])[:,1]
    
    plt.figure(figsize=(8, 6))
    sns.histplot(pscore[df[treatment]==1], color='blue', label='Treated', kde=True, stat='density', alpha=0.5)
    sns.histplot(pscore[df[treatment]==0], color='red', label='Control', kde=True, stat='density', alpha=0.5)
    plt.xlabel('Propensity Score')
    plt.ylabel('Density')
    plt.title('Propensity Score Overlap')
    plt.legend()
    
    if return_base64:
        buf = io.BytesIO()
        plt.savefig(buf, format='png', bbox_inches='tight')
        buf.seek(0)
        img_base64 = base64.b64encode(buf.read()).decode('utf-8')
        plt.close()
        return f"data:image/png;base64,{img_base64}"
    
    if save_path:
        plt.savefig(save_path, bbox_inches='tight')
        plt.close()
    else:
        plt.show()

def run_refutation_test(df, outcome, treatment, covariates):
    """
    Robustness check: Add a random common cause and see if the estimate changes drastically.
    """
    # Create a random common cause that correlates with both T and Y
    # (Simplified refutation: adding pure noise as a covariate)
    df_refute = df.copy()
    df_refute['random_common_cause'] = np.random.normal(0, 1, size=len(df))
    
    from src.estimators import ols_adjustment
    model_orig = ols_adjustment(df, outcome, treatment, covariates)
    model_new = ols_adjustment(df_refute, outcome, treatment, covariates + ['random_common_cause'])
    
    orig_ate = model_orig.params[treatment]
    new_ate = model_new.params[treatment]
    
    # Check "robustness" - usually we want the percent change to be small
    pct_change = abs((new_ate - orig_ate) / orig_ate) if orig_ate != 0 else 0
    
    return {
        "original_ate": float(orig_ate),
        "new_ate": float(new_ate),
        "pct_change": float(pct_change),
        "is_robust": bool(pct_change < 0.2) # Heuristic: less than 20% change
    }

def plot_love_plot(balance_df, return_base64=True):
    """
    Generate a Love Plot (Dot plot for SMD).
    """
    plt.figure(figsize=(8, len(balance_df) * 0.5 + 2))
    
    # Sort by SMD
    plot_df = balance_df.sort_values('SMD', ascending=True)
    
    plt.axvline(x=0.1, color='red', linestyle='--', alpha=0.5, label='Threshold (0.1)')
    plt.scatter(plot_df['SMD'], plot_df['Covariate'], color='blue', s=100, zorder=3)
    
    plt.xlabel('Standardized Mean Difference (SMD)')
    plt.ylabel('Covariate')
    plt.title('Love Plot: Covariate Balance')
    plt.grid(True, axis='x', linestyle=':', alpha=0.6)
    plt.legend()
    
    if return_base64:
        buf = io.BytesIO()
        plt.savefig(buf, format='png', bbox_inches='tight')
        buf.seek(0)
        img_base64 = base64.b64encode(buf.read()).decode('utf-8')
        plt.close()
        return f"data:image/png;base64,{img_base64}"
    
    plt.show()
    plt.close()

