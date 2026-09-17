import os
import joblib
import numpy as np
import pandas as pd

from sklearn.metrics.pairwise import cosine_similarity

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

MODEL_DIR = os.path.join(
    BASE_DIR,
    "model"
)

DATASET_PATH = os.path.join(
    BASE_DIR,
    "..",
    "dataset",
    "processed",
    "career_ml_dataset_clean.csv"
)

scaler = joblib.load(
    os.path.join(MODEL_DIR, "scaler.pkl")
)

feature_columns = joblib.load(
    os.path.join(MODEL_DIR, "feature_columns.pkl")
)

X_scaled = np.load(
    os.path.join(MODEL_DIR, "X_scaled.npy")
)

career_info = pd.read_csv(DATASET_PATH)


def recommend_careers(student_profile, top_n=5):

    student_df = pd.DataFrame(
        [student_profile],
        columns=feature_columns
    )

    student_scaled = scaler.transform(student_df)

    similarities = cosine_similarity(
        student_scaled,
        X_scaled
    )[0]

    top_indices = np.argsort(
        similarities
    )[::-1][:top_n]

    recommendations = []

    for index in top_indices:
        recommendations.append({
            "occupation_code": career_info.iloc[index]["occupation_code"],
            "career": career_info.iloc[index]["career"],
            "description": career_info.iloc[index]["description"],
            "similarity_score": round(
                float(similarities[index]),
                4
            )
        })

    return recommendations