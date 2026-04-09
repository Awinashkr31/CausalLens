import pandas as pd
import numpy as np
import os

# Create a folder for the sample datasets
os.makedirs("data/samples", exist_ok=True)

np.random.seed(42)

def generate_ecommerce_data(n=5000):
    print("Generating 1. E-Commerce Promotions Dataset...")
    age = np.random.normal(35, 12, n).clip(18, 80)
    income = np.random.normal(70000, 25000, n).clip(20000, 200000)
    past_spend = np.random.exponential(500, n)
    days_since_active = np.random.poisson(15, n)
    device_mobile = np.random.binomial(1, 0.7, n)
    
    # Confounding: More active, higher past spend -> higher probability of promo
    logit = -2 + 0.001 * past_spend - 0.05 * days_since_active + 0.5 * device_mobile
    prob = 1 / (1 + np.exp(-logit))
    promo_email = np.random.binomial(1, prob)
    
    # HTE: Promo works better for younger users and higher income
    treatment_effect = 20 + 0.001 * income - 0.5 * (age - 35)
    
    # Outcome: 30-day Life Time Value (LTV)
    outcome_ltv = 50 + 0.1 * past_spend + 0.002 * income - 2 * days_since_active + (promo_email * treatment_effect) + np.random.normal(0, 50, n)
    
    df = pd.DataFrame({
        'age': np.round(age),
        'income': np.round(income, 2),
        'past_spend': np.round(past_spend, 2),
        'days_since_active': days_since_active,
        'device_mobile': device_mobile,
        'promo_email': promo_email,
        'outcome_ltv': np.round(outcome_ltv, 2)
    })
    df.to_csv("data/samples/1_ecommerce_promotions.csv", index=False)

def generate_education_data(n=3000):
    print("Generating 2. Education Intervention Dataset...")
    prior_score = np.random.normal(65, 15, n).clip(0, 100)
    attendance_rate = np.random.beta(8, 2, n) * 100
    parental_income = np.random.lognormal(11, 0.5, n)
    class_size = np.random.randint(15, 40, n)
    learning_disability = np.random.binomial(1, 0.1, n)
    
    # Confounding: lower prior score and lower income -> higher probability of being assigned tutoring
    logit = 4 - 0.05 * prior_score - 0.00005 * parental_income + 1.5 * learning_disability
    prob = 1 / (1 + np.exp(-logit))
    after_school_tutoring = np.random.binomial(1, prob)
    
    # HTE: Tutoring helps more for students with lower prior scores and learning disabilities
    treatment_effect = 10 + 0.2 * (100 - prior_score) + 5 * learning_disability
    
    # Outcome: Final Score
    final_score = 20 + 0.6 * prior_score + 0.2 * attendance_rate + 0.0001 * parental_income - 0.1 * class_size - 10 * learning_disability + (after_school_tutoring * treatment_effect) + np.random.normal(0, 5, n)
    final_score = final_score.clip(0, 100)
    
    df = pd.DataFrame({
        'prior_score': np.round(prior_score, 1),
        'attendance_rate': np.round(attendance_rate, 1),
        'parental_income': np.round(parental_income, 2),
        'class_size': class_size,
        'learning_disability': learning_disability,
        'after_school_tutoring': after_school_tutoring,
        'final_score': np.round(final_score, 1)
    })
    df.to_csv("data/samples/2_education_intervention.csv", index=False)

def generate_healthcare_data(n=4000):
    print("Generating 3. Healthcare Trial Dataset...")
    base_bp = np.random.normal(140, 15, n).clip(90, 200)
    age = np.random.normal(55, 12, n).clip(20, 90)
    bmi = np.random.normal(28, 6, n).clip(15, 50)
    cholesterol = np.random.normal(200, 40, n).clip(100, 400)
    smoking_status = np.random.binomial(1, 0.2, n)
    exercise_freq = np.random.poisson(2, n).clip(0, 7)
    
    # Confounding: Higher base BP, higher BMI, older -> higher chance of receiving new drug
    logit = -8 + 0.04 * base_bp + 0.05 * age + 0.05 * bmi
    prob = 1 / (1 + np.exp(-logit))
    new_drug = np.random.binomial(1, prob)
    
    # Treatment effect is negative (reduction in BP). Drug reduces BP by ~15 points on average
    # HTE: Works better for higher base BP, worse for smokers
    treatment_effect = -15 - 0.1 * (base_bp - 140) + 5 * smoking_status
    
    # Outcome: Post-treatment Blood Pressure
    post_bp = 20 + 0.8 * base_bp + 0.1 * age + 0.2 * bmi + 0.05 * cholesterol + 5 * smoking_status - 2 * exercise_freq + (new_drug * treatment_effect) + np.random.normal(0, 10, n)
    
    df = pd.DataFrame({
        'base_bp': np.round(base_bp, 1),
        'age': np.round(age),
        'bmi': np.round(bmi, 1),
        'cholesterol': np.round(cholesterol, 1),
        'smoking_status': smoking_status,
        'exercise_freq': exercise_freq,
        'new_drug': new_drug,
        'post_bp': np.round(post_bp, 1)
    })
    df.to_csv("data/samples/3_healthcare_trial.csv", index=False)

def generate_logistics_data(n=10000):
    print("Generating 4. Logistics Routing Dataset...")
    distance = np.random.exponential(50, n).clip(1, 500)
    package_weight = np.random.lognormal(2, 1, n).clip(0.1, 100)
    driver_experience = np.random.poisson(5, n).clip(0, 30)
    traffic_index = np.random.uniform(1, 10, n)
    is_rush_hour = np.random.binomial(1, 0.3, n)
    weather_bad = np.random.binomial(1, 0.2, n)
    
    # Confounding: AI route optimization applied more often for longer distances and rush hours
    logit = -3 + 0.02 * distance + 1.5 * is_rush_hour
    prob = 1 / (1 + np.exp(-logit))
    ai_optimized_route = np.random.binomial(1, prob) # 1 if AI route used, 0 if human standard route
    
    # Treatment Effect: Reduction in delivery time. AI reduces time more efficiently for longer distances and rush hours.
    treatment_effect = -10 - 0.2 * distance - 15 * is_rush_hour + 5 * weather_bad
    
    # Outcome: Delivery time in minutes
    delivery_time = 15 + 1.5 * distance + 0.5 * package_weight - 2 * driver_experience + 5 * traffic_index + 10 * is_rush_hour + 20 * weather_bad + (ai_optimized_route * treatment_effect) + np.random.normal(0, 15, n)
    delivery_time = delivery_time.clip(10, None) # minimum 10 minutes
    
    df = pd.DataFrame({
        'distance': np.round(distance, 2),
        'package_weight': np.round(package_weight, 2),
        'driver_experience': driver_experience,
        'traffic_index': np.round(traffic_index, 1),
        'is_rush_hour': is_rush_hour,
        'weather_bad': weather_bad,
        'ai_optimized_route': ai_optimized_route,
        'delivery_time': np.round(delivery_time, 1)
    })
    df.to_csv("data/samples/4_logistics_routing.csv", index=False)

if __name__ == "__main__":
    generate_ecommerce_data()
    generate_education_data()
    generate_healthcare_data()
    generate_logistics_data()
    print("Successfully saved all 4 detailed datasets to data/samples/ directory!")
