import pandas as pd
import numpy as np

def load_data(path: str) -> pd.DataFrame:
    """Load dataset from path."""
    return pd.read_csv(path)

def save_data(df: pd.DataFrame, path: str):
    """Save dataset to path."""
    df.to_csv(path, index=False)

def generate_simulated_data(n_samples: int = 2000) -> pd.DataFrame:
    """
    Generate simulated data with a known Average Treatment Effect (ATE).
    True ATE = 2.5
    """
    np.random.seed(42)
    # Covariates
    age = np.random.normal(40, 10, n_samples)
    income = np.random.normal(50000, 15000, n_samples)
    prior_outcome = np.random.normal(5, 2, n_samples)
    
    # Propensity model: higher income and lower prior_outcome -> higher chance of treatment
    logit_p = -2.0 + 0.00005 * income - 0.2 * prior_outcome
    p_treatment = 1 / (1 + np.exp(-logit_p))
    treatment = np.random.binomial(1, p_treatment)
    
    # Outcome model: True ATE is 2.5
    true_ate = 2.5
    outcome = (10 + 0.1 * age + 0.0001 * income + 0.8 * prior_outcome + 
               true_ate * treatment + np.random.normal(0, 1, n_samples))
               
    df = pd.DataFrame({
        'id': range(n_samples),
        'age': age,
        'income': income,
        'prior_outcome': prior_outcome,
        'treatment': treatment,
        'outcome': outcome
    })
    return df
