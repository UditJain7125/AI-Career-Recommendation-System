import pandas as pd
import os

# ==========================================
# PATHS
# ==========================================

RAW_PATH = "../../dataset"
OUTPUT_PATH = "../../dataset/processed"

os.makedirs(OUTPUT_PATH, exist_ok=True)


# ==========================================
# OCCUPATION DATA
# ==========================================

occupation_path = os.path.join(
    RAW_PATH,
    "occupation_data.csv"
)

occupation = pd.read_csv(occupation_path)

occupation = occupation[
    ["O*NET-SOC Code", "Title", "Description"]
].copy()

occupation = occupation.rename(columns={
    "O*NET-SOC Code": "occupation_code",
    "Title": "career",
    "Description": "description"
})

print("Occupation data:", occupation.shape)


# ==========================================
# PROCESS SKILLS / ABILITIES
# ==========================================

def process_standard_file(filename, prefix):

    path = os.path.join(RAW_PATH, filename)

    df = pd.read_csv(path)

    print("\nProcessing:", filename)
    print("Original shape:", df.shape)

    # Keep required columns
    df = df[
        [
            "O*NET-SOC Code",
            "Element Name",
            "Scale Name",
            "Data Value"
        ]
    ].copy()

    # We want Importance
    df = df[
        df["Scale Name"].str.strip().str.lower()
        == "importance"
    ]

    print("Importance rows:", len(df))

    # Convert Data Value
    df["Data Value"] = pd.to_numeric(
        df["Data Value"],
        errors="coerce"
    )

    # Remove missing values
    df = df.dropna(
        subset=["Data Value"]
    )

    # Create feature name
    df["feature"] = (
        prefix
        + "_"
        + df["Element Name"]
        .str.lower()
        .str.replace(" ", "_", regex=False)
        .str.replace("/", "_", regex=False)
        .str.replace("-", "_", regex=False)
        .str.replace("(", "", regex=False)
        .str.replace(")", "", regex=False)
    )

    # Convert rows into columns
    result = df.pivot_table(
        index="O*NET-SOC Code",
        columns="feature",
        values="Data Value",
        aggfunc="mean"
    )

    result = result.reset_index()

    result = result.rename(
        columns={
            "O*NET-SOC Code": "occupation_code"
        }
    )

    print("Processed shape:", result.shape)

    return result


# ==========================================
# PROCESS SKILLS
# ==========================================

skills = process_standard_file(
    "essential_skills.csv",
    "skill"
)


# ==========================================
# PROCESS ABILITIES
# ==========================================

abilities = process_standard_file(
    "abilities.csv",
    "ability"
)


# ==========================================
# PROCESS INTERESTS
# ==========================================

def process_interests():

    filename = "career_interest_types.csv"

    path = os.path.join(
        RAW_PATH,
        filename
    )

    df = pd.read_csv(path)

    print("\nProcessing:", filename)
    print("Original shape:", df.shape)

    df = df[
        [
            "O*NET-SOC Code",
            "Element Name",
            "Scale Name",
            "Data Value"
        ]
    ].copy()

    # Use Occupational Interests
    df = df[
        df["Scale Name"].str.strip().str.lower()
        == "occupational interests"
    ]

    print("Interest rows:", len(df))

    df["Data Value"] = pd.to_numeric(
        df["Data Value"],
        errors="coerce"
    )

    df = df.dropna(
        subset=["Data Value"]
    )

    # Create feature names
    df["feature"] = (
        "interest_"
        + df["Element Name"]
        .str.lower()
        .str.replace(" ", "_", regex=False)
        .str.replace("/", "_", regex=False)
        .str.replace("-", "_", regex=False)
    )

    result = df.pivot_table(
        index="O*NET-SOC Code",
        columns="feature",
        values="Data Value",
        aggfunc="mean"
    )

    result = result.reset_index()

    result = result.rename(
        columns={
            "O*NET-SOC Code": "occupation_code"
        }
    )

    print("Processed shape:", result.shape)

    return result


interests = process_interests()


# ==========================================
# MERGE EVERYTHING
# ==========================================

print("\n================================")
print("MERGING DATA")
print("================================")

final_df = occupation.merge(
    skills,
    on="occupation_code",
    how="left"
)

print("After skills:", final_df.shape)


final_df = final_df.merge(
    abilities,
    on="occupation_code",
    how="left"
)

print("After abilities:", final_df.shape)


final_df = final_df.merge(
    interests,
    on="occupation_code",
    how="left"
)

print("After interests:", final_df.shape)


# ==========================================
# REMOVE DUPLICATES
# ==========================================

final_df = final_df.drop_duplicates(
    subset=["occupation_code"]
)


# ==========================================
# SAVE
# ==========================================

output_file = os.path.join(
    OUTPUT_PATH,
    "career_ml_dataset.csv"
)

final_df.to_csv(
    output_file,
    index=False
)


# ==========================================
# FINAL RESULT
# ==========================================

print("\n================================")
print("PROCESSING COMPLETED")
print("================================")

print("Saved to:", output_file)
print("Rows:", final_df.shape[0])
print("Columns:", final_df.shape[1])

print("\nFirst 5 rows:")
print(final_df.head())

print("\nFirst 20 columns:")
print(final_df.columns[:20].tolist())