import pandas as pd
import numpy as np
import statsmodels.api as sm

df = pd.DataFrame({'Y': np.random.randn(100), 'T': np.random.randn(100), 'C': np.random.randn(100)})
# Duplicate T in X
X = df[['T', 'C', 'T']]
X = sm.add_constant(X)
model = sm.OLS(df['Y'], X).fit()
print("Type of params[T]:", type(model.params['T']))
orig_ate = model.params['T']

try:
    if orig_ate != 0:
        print("Not zero")
except Exception as e:
    print("Error:", e)
