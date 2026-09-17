# AI Career Recommendation System

An AI-powered full-stack web application that analyzes a student's skills, abilities, and interests and recommends suitable careers using machine learning and O*NET career data. An LLM then generates personalized explanations, key skills, improvement areas, and a learning roadmap for each recommendation.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Key Features](#2-key-features)
3. [Technology Stack](#3-technology-stack)
4. [System Architecture](#4-system-architecture)
5. [Application Flow](#5-application-flow)
6. [Machine Learning Approach](#6-machine-learning-approach)
7. [Assessment Features](#7-assessment-features)
8. [Rating System](#8-rating-system)
9. [Dataset](#9-dataset)
10. [Data Preprocessing](#10-data-preprocessing)
11. [Model Evaluation](#11-model-evaluation)
12. [AI / LLM Integration](#12-ai--llm-integration)
13. [Database Design](#13-database-design)
14. [Authentication](#14-authentication)
15. [API Endpoints](#15-api-endpoints)
16. [Project Structure](#16-project-structure)
17. [Setup & Installation](#17-setup--installation)
18. [Running the Application](#18-running-the-application)
19. [Example Responses](#19-example-responses)
20. [Security Considerations](#20-security-considerations)
21. [Testing](#21-testing)
22. [Limitations](#22-limitations)
23. [Future Enhancements](#23-future-enhancements)
24. [Author](#24-author)

---

## 1. Overview

Choosing a suitable career can be difficult — students often lack a clear understanding of how their skills, abilities, and interests map to real-world career paths.

This system solves that problem through a structured **68-question career assessment**. It:

- Collects student profile information
- Evaluates skills, abilities, and interests
- Converts responses into a numerical feature vector
- Compares the student's profile against O*NET career profiles using **Cosine Similarity**
- Returns the **top 5 career matches**
- Uses an **LLM** to generate personalized explanations, skill gaps, and a learning roadmap
- Stores assessment and recommendation history in **PostgreSQL**

---

## 2. Key Features

### Student Authentication
- Signup / Login with JWT-based authentication
- Protected API endpoints
- Logout functionality

### Career Assessment
- 68 questions across Skills, Abilities, and Interests
- 1–5 rating scale
- Progress tracking with Previous / Next navigation

### Career Recommendation
- ML-based profile matching with standardized feature scaling
- Cosine similarity against 1,016 O*NET career profiles
- Top 5 recommendations with match percentage

### AI Career Insights
For each recommended career, the system generates:
- Why the career suits the student
- Important skills
- Skills to improve
- A personalized learning roadmap

### Dashboard
- Total assessments and recommendations
- Best career match
- Profile summary and recent recommendations

### Assessment History
- View previous assessments and recommendations
- Expand detailed AI explanations, skills, and roadmaps

### User Profile
- View and manage profile info
- Optional profile photo (JPG, PNG, WEBP)

---

## 3. Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React, TypeScript, Vite, HTML, CSS, React Router, Axios |
| **Backend** | Python, FastAPI, Pydantic, SQLAlchemy, JWT Authentication |
| **Machine Learning** | Pandas, NumPy, Scikit-learn, StandardScaler, Cosine Similarity |
| **AI / LLM** | Groq API — `openai/gpt-oss-20b` |
| **Database** | PostgreSQL, Psycopg, SQLAlchemy |
| **Dev Tools** | VS Code, Jupyter Notebook, uv, Git / GitHub |

---

## 4. System Architecture

```
                    STUDENT
                       │
                       ▼
              ┌────────────────────┐
              │  React + TypeScript │
              │      Frontend       │
              └────────────────────┘
                       │  HTTP / REST API
                       ▼
              ┌────────────────────┐
              │      FastAPI        │
              │      Backend        │
              └────────────────────┘
                       │
          ┌────────────┴─────────────┐
          ▼                           ▼
┌──────────────────┐       ┌──────────────────┐
│ Career Assessment  │       │   PostgreSQL     │
│ Feature Creation    │       │     Database      │
└──────────────────┘       └──────────────────┘
          │
          ▼
┌──────────────────────────┐
│  StandardScaler            │
│  Feature Normalization     │
└──────────────────────────┘
          │
          ▼
┌──────────────────────────┐
│    Cosine Similarity       │
│  Career Profile Matching   │
└──────────────────────────┘
          │
          ▼
┌──────────────────────────┐
│  1,016 O*NET Career        │
│         Profiles           │
└──────────────────────────┘
          │
          ▼
┌──────────────────────────┐
│      Top 5 Careers         │
└──────────────────────────┘
          │
          ▼
┌──────────────────────────┐
│         Groq LLM           │
│  Explanation · Skill Gap   │
│     · Learning Roadmap     │
└──────────────────────────┘
          │
          ▼
┌──────────────────────────┐
│   Result / History Page    │
└──────────────────────────┘
```

---

## 5. Application Flow

```
Home → Signup → Login → Dashboard → Career Assessment
  → 68 Questions → Feature Vector → StandardScaler
  → Cosine Similarity → Top 5 Career Recommendations
  → Groq LLM → (Explanation + Learning Roadmap)
  → Result → History
```

---

## 6. Machine Learning Approach

**Problem definition:** O*NET provides detailed career profiles but no labeled student-to-career outcome data, so this is treated as a **similarity-matching problem** rather than supervised classification.

**Method:** Cosine Similarity

1. The student's assessment is converted into a 68-feature numerical vector.
2. The vector is standardized using `StandardScaler`.
3. The standardized vector is compared against 1,016 standardized O*NET career profiles.
4. Similarity scores are calculated and sorted.
5. The top 5 highest-scoring careers are returned.

```
Student Profile → 68 Numerical Features → StandardScaler
   → Student Vector → Cosine Similarity → 1,016 Career Profiles
   → Sort Similarity Scores → Top 5 Careers
```

---

## 7. Assessment Features

The assessment covers **68 total features** across three categories:

**Skills (10)**
Active Learning, Active Listening, Critical Thinking, Learning Strategies, Mathematics, Monitoring, Reading Comprehension, Science, Speaking, Writing

**Abilities (52)** — includes:
Deductive Reasoning, Inductive Reasoning, Mathematical Reasoning, Oral Comprehension, Oral Expression, Written Comprehension, Written Expression, Problem Sensitivity, Visualization, Originality, Information Ordering, Selective Attention, Reaction Time, Spatial Orientation, Manual Dexterity, and other O*NET abilities

**Interests (6)**
Artistic, Conventional, Enterprising, Investigative, Realistic, Social

---

## 8. Rating System

Each question is answered on a 1–5 scale, mapped to a normalized score:

| Rating | Score |
|:---:|:---:|
| 1 | 0 |
| 2 | 25 |
| 3 | 50 |
| 4 | 75 |
| 5 | 100 |

This produces a consistent numerical representation of the student's profile.

---

## 9. Dataset

Built on the **O*NET 31.0 database** ([onetcenter.org](https://www.onetcenter.org/database.html)), which includes occupation codes, titles, descriptions, skills, abilities, interests, education info, and work-related characteristics.

**Processed dataset:**
- **Occupations:** 1,016
- **Features:** 68 numerical features
- **Total columns:** 71 (3 career-info columns + 68 numerical features)

```
dataset/
└── processed/
    └── career_ml_dataset_clean.csv
```

---

## 10. Data Preprocessing

1. Load O*NET occupation data
2. Load essential skills data
3. Load abilities data
4. Load career interest data
5. Filter relevant measurement rows
6. Convert O*NET values into numerical features
7. Merge features using occupation codes
8. Handle missing values
9. Separate career information from numerical features
10. Apply feature scaling
11. Save the processed dataset and model-support files

---

## 11. Model Evaluation

The system compares the student's standardized feature vector against all 1,016 standardized O*NET career profiles and ranks careers by similarity score — a higher score means closer similarity.

**Example scores:**

| Career | Similarity Score |
|---|:---:|
| Financial Risk Specialists | 1.0000 |
| Financial and Investment Analysts | 0.9831 |
| Health Information Technologists and Medical Registrars | 0.6334 |

> **Note:** O*NET does not provide labeled student-to-career outcomes, so these scores represent *profile similarity* — not traditional classification accuracy or real-world career-choice accuracy.

---

## 12. AI / LLM Integration

**Model:** Groq API — `openai/gpt-oss-20b`

The LLM does **not** select careers — that's handled entirely by the ML recommendation engine. The LLM is invoked afterward to generate explanations.

```
ML Model → Career Ranking → Top 5 Careers → Groq LLM
   → Why Suitable
   → Important Skills
   → Skills to Improve
   → Learning Roadmap
```

This separation keeps career matching (ML) and explanation generation (LLM) as distinct responsibilities.

---

## 13. Database Design

**PostgreSQL** with three core tables:

```
users                        assessments                recommendations
├── id                       ├── id                      ├── id
├── name                     ├── user_id                 ├── user_id
├── email                    └── answers                 ├── assessment_id
├── password                                              ├── career
├── education                                              ├── occupation_code
├── course                                                  ├── similarity_score
├── graduation_year                                        ├── description
└── profile_image                                          └── ai_explanation
```

---

## 14. Authentication

JWT-based authentication protects all sensitive endpoints.

```
Login → Validate Email + Password → Generate JWT
   → Frontend Stores Token → Token Sent with Protected Requests
   → FastAPI Validates JWT
```

---

## 15. API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Health check — confirms the API is running |
| `GET` | `/assessment/questions` | Returns the 68 career assessment questions |
| `POST` | `/signup` | Creates a new user account |
| `POST` | `/login` | Authenticates the user and returns an access token |
| `POST` | `/recommend` | Processes assessment answers and returns career recommendations |
| `GET` | `/history` | Returns the user's previous assessments and recommendations |
| `GET` | `/profile` | Returns the authenticated user's profile |
| `POST` | `/profile/photo` | Uploads a profile image (JPG, PNG, WEBP) |

**`/recommend` pipeline:**
1. Validate the assessment
2. Create the feature vector
3. Scale the feature vector
4. Calculate cosine similarity
5. Select the top 5 careers
6. Generate AI explanations
7. Store the assessment and recommendations

---

## 16. Project Structure

```
career-recommendation-system/
│
├── backend/
│   ├── main.py
│   ├── schemas.py
│   ├── assessment.py
│   ├── database.py
│   ├── models.py
│   ├── auth.py
│   ├── Groq_service.py
│   │
│   ├── model/
│   │   ├── scaler.pkl
│   │   ├── feature_columns.pkl
│   │   ├── X_scaled.npy
│   │   └── career_info.csv
│   │
│   └── recommendation/
│       ├── __init__.py
│       └── recommenation.py
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Topbar.tsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Signup.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Assessment.tsx
│   │   │   ├── Result.tsx
│   │   │   ├── History.tsx
│   │   │   └── Profile.tsx
│   │   │
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   │
│   ├── package.json
│   └── vite.config.ts
│
├── dataset/
│   ├── raw/
│   └── processed/
│
├── ml/
│
└── README.md
```

---

## 17. Setup & Installation

### Requirements
- Python 3.12+
- [uv](https://github.com/astral-sh/uv)
- PostgreSQL
- Node.js and npm

### Backend Setup

```bash
# From the project root — create a virtual environment
uv venv

# Install backend dependencies
uv add fastapi uvicorn sqlalchemy python-dotenv
uv add "psycopg[binary]"
uv add bcrypt python-multipart
uv add python-jose
uv add pandas numpy scikit-learn joblib
uv add groq
```

### Environment Variables

Create a `.env` file inside `backend/`:

```env
DATABASE_URL=postgresql+psycopg://USERNAME:PASSWORD@127.0.0.1:5432/career_recommendation
JWT_SECRET_KEY=your-secret-key
GROQ_API_KEY=your-groq-api-key
```

> ⚠️ Do not commit `.env` to GitHub.

### Database

Make sure PostgreSQL is running:

- **Host:** `127.0.0.1`
- **Port:** `5432`
- **Database:** `career_recommendation`

### Frontend Setup

```bash
cd frontend
npm install
```

---

## 18. Running the Application

**Terminal 1 — Backend**
```bash
cd backend
uv run uvicorn main:app --reload
```
API available at `http://127.0.0.1:8000` · Docs at `http://127.0.0.1:8000/docs`

**Terminal 2 — Frontend**
```bash
cd frontend
npm run dev
```
Frontend available at `http://localhost:5173`

Then open the frontend URL in your browser.

---

## 19. Example Responses

**Career recommendation:**
```json
{
  "career": "Financial Risk Specialists",
  "occupation_code": "13-2054.00",
  "similarity_score": 1.0,
  "description": "Career description"
}
```

**AI explanation:**
```json
{
  "career": "Career Name",
  "why_suitable": [
    "Reason 1",
    "Reason 2",
    "Reason 3"
  ],
  "important_skills": [
    "Skill 1",
    "Skill 2",
    "Skill 3",
    "Skill 4",
    "Skill 5"
  ],
  "skills_to_improve": [
    "Skill 1",
    "Skill 2",
    "Skill 3"
  ],
  "learning_roadmap": [
    {
      "step": 1,
      "title": "Step title",
      "description": "Step description"
    }
  ]
}
```

---

## 20. Security Considerations

- Password hashing
- JWT authentication
- Protected API endpoints
- Environment variables for API keys
- Database credentials kept outside source code
- Input validation via Pydantic
- File type validation for profile images
- CORS configuration for frontend–backend communication

---

## 21. Testing

Covered areas include:

- Signup / login (including invalid login)
- JWT authentication and protected endpoints
- Assessment question retrieval and full 68-question flow
- Career recommendation generation
- AI explanation generation
- Result and history pages
- AI detail expansion
- Profile functionality and image upload
- Responsive frontend layout

---

## 22. Limitations

- The O*NET dataset has no labeled student-to-career outcomes, so the system doesn't claim traditional supervised-classification accuracy.
- Similarity evaluation during development measured **profile matching**, not real-world career-choice accuracy.
- AI-generated explanation quality depends on the availability and response of the external LLM API.

---

## 23. Future Enhancements

- Larger student preference datasets
- Real student-to-career outcome data
- More advanced recommendation models
- Personalized course recommendations
- Salary and job-market information
- Location-based career opportunities
- Resume-based career analysis
- Job recommendation integration
- Practical skill-assessment tests
- Progress tracking for learning roadmaps
- Career comparison functionality
- Recommendation evaluation using real user feedback
- Periodic O*NET dataset updates

---

## 24. Author

**Project:** AI Career Recommendation System
**Author:** Your Name
**Technology:** React, TypeScript, FastAPI, Python, PostgreSQL, Machine Learning, Groq LLM
