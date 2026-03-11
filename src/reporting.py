import pandas as pd

def generate_summary_report(results_dict):
    """
    Format the results of different estimators into a summary DataFrame.
    """
    df_res = pd.DataFrame.from_dict(results_dict, orient='index', columns=['ATE'])
    print("--- Causal Effect Estimates ---")
    print(df_res)
    print("-------------------------------")
    return df_res
