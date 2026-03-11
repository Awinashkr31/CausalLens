import pandas as pd
from sklearn.preprocessing import StandardScaler

def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    """Basic data cleaning: drop missing values."""
    return df.dropna().copy()

def standardize_covariates(df: pd.DataFrame, covariates: list) -> pd.DataFrame:
    """Standardize specified covariates."""
    scaler = StandardScaler()
    df_scaled = df.copy()
    df_scaled[covariates] = scaler.fit_transform(df[covariates])
    return df_scaled
