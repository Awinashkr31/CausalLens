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
