import numpy as np
import pandas as pd
import statsmodels.api as sm
import statsmodels.formula.api as smf
from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import NearestNeighbors

def ols_adjustment(df, outcome, treatment, covariates):
    X = df[[treatment] + covariates]
    X = sm.add_constant(X)
    model = sm.OLS(df[outcome], X).fit(cov_type='HC1')  # robust SE
    return model

def estimate_psm(df, outcome, treatment, covariates, caliper=None, n_neighbors=1):
    lr = LogisticRegression(max_iter=1000)
    lr.fit(df[covariates], df[treatment])
    df['pscore'] = lr.predict_proba(df[covariates])[:,1]

    treated = df[df[treatment]==1].reset_index(drop=True)
    control = df[df[treatment]==0].reset_index(drop=True)

    nn = NearestNeighbors(n_neighbors=n_neighbors)
    nn.fit(control[['pscore']])
    dists, idx = nn.kneighbors(treated[['pscore']])
    
    matches_outcomes = control[outcome].values[idx]
    matches_mean = matches_outcomes.mean(axis=1)
    
    # caliper check based on nearest match
    if caliper is not None:
        mask = (dists[:, 0] <= caliper)
        treated = treated[mask]
        matches_mean = matches_mean[mask]

    ate = (treated[outcome].values - matches_mean).mean()
    return ate

def iptw_ate(df, outcome, treatment, covariates):
    lr = LogisticRegression(max_iter=1000)
    lr.fit(df[covariates], df[treatment])
    p = lr.predict_proba(df[covariates])[:,1]
    
    # Truncate propensities to avoid extreme weights
    p = np.clip(p, 0.01, 0.99)
    
    weights = np.where(df[treatment]==1, 1/p, 1/(1-p))
    
    treated_sum = df.loc[df[treatment]==1, outcome].multiply(weights[df[treatment]==1]).sum()
    control_sum = df.loc[df[treatment]==0, outcome].multiply(weights[df[treatment]==0]).sum()
    
    ate = (treated_sum / weights[df[treatment]==1].sum()) - (control_sum / weights[df[treatment]==0].sum())
    return ate

def diff_in_diff(df, outcome, treated_group, post_period, cluster_id=None):
    """
    df has columns representing treated_group (0/1) and post_period (0/1).
    """
    df['interaction'] = df[treated_group] * df[post_period]
    formula = f'{outcome} ~ {treated_group} + {post_period} + interaction'
    
    if cluster_id:
        model = smf.ols(formula, data=df).fit(cov_type='cluster', cov_kwds={'groups': df[cluster_id]})
    else:
        model = smf.ols(formula, data=df).fit(cov_type='HC1')
    return model

def estimate_subgroup_effects(df, outcome, treatment, covariates, subgroup_col):
    """
    Calculate ATE for each distinct value in the subgroup_col.
    Useful for Understanding Heterogeneous Treatment Effects (HTE).
    """
    if subgroup_col not in df.columns:
        return []

    results = []
    # Force categorical if it's not already
    groups = df[subgroup_col].unique()
    
    for group in groups:
        sub_df = df[df[subgroup_col] == group].copy()
        
        # Check if we have enough data (at least some treated and some control)
        if sub_df[treatment].nunique() < 2 or len(sub_df) < 10:
            continue
            
        try:
            model = ols_adjustment(sub_df, outcome, treatment, covariates)
            results.append({
                "subgroup": str(group),
                "ate": float(model.params[treatment]),
                "se": float(model.bse[treatment]),
                "p_value": float(model.pvalues[treatment]),
                "sample_size": len(sub_df)
            })
        except:
            continue
            
    return results

# We can import modern ML estimators securely if libraries are available
try:
    from econml.dml import LinearDML
    from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
    
    def dml_ate(df, outcome, treatment, covariates, n_estimators=50, max_depth=5):
        est = LinearDML(model_y=RandomForestRegressor(n_estimators=n_estimators, max_depth=max_depth), 
                        model_t=RandomForestClassifier(n_estimators=n_estimators, max_depth=max_depth),
                        discrete_treatment=True, cv=3)
        est.fit(df[outcome], df[treatment], X=df[covariates])
        ate = est.ate(X=df[covariates])
        return ate, est
except ImportError:
    pass
