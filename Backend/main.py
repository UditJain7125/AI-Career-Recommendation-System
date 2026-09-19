import json
import bcrypt
import os
import shutil
from typing import cast

from fastapi import (
    FastAPI,
    HTTPException,
    Depends,
    UploadFile,
    File
)

from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from sqlalchemy.orm import Session

from assessment import (
    SKILL_QUESTIONS,
    ABILITY_QUESTIONS,
    INTEREST_QUESTIONS,
    create_feature_vector
)

from recommendation.recommenation import recommend_careers

from schemas import (
    StudentAssessment,
    UserCreate,
    UserLogin,
    AgentChatRequest
)

from database import SessionLocal,engine

from models import (
    User,
    Assessment,
    Recommendation,
    Base
)

from auth import (
    create_access_token,
    get_current_user_id
)

from Groq_service import generate_career_explanation
from Agent.career_agent import run_career_agent

# =========================================
# FASTAPI APP
# =========================================

app = FastAPI(
    title="AI Career Recommendation System",
    version="1.0.0"
)
Base.metadata.create_all(bind=engine)

# =========================================
# STATIC FILES
# =========================================
# Create the upload directory before mounting it, so a fresh
# deployment (with no uploaded photos yet) doesn't crash on boot.

upload_base_dir = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "uploads",
    "profile"
)

os.makedirs(upload_base_dir, exist_ok=True)

app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads"
)


# =========================================
# CORS
# =========================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://uditjain7125.github.io"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================
# DATABASE CONNECTION
# =========================================

def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()


# =========================================
# HOME
# =========================================

@app.get("/")
def home():

    return {
        "message": "AI Career Recommendation API is running"
    }


# =========================================
# ASSESSMENT QUESTIONS
# =========================================

@app.get("/assessment/questions")
def get_assessment_questions():

    questions = []

    all_questions = {
        **SKILL_QUESTIONS,
        **ABILITY_QUESTIONS,
        **INTEREST_QUESTIONS
    }

    for feature, question in all_questions.items():

        questions.append({
            "feature": feature,
            "question": question,
            "min_rating": 1,
            "max_rating": 5
        })

    return {
        "total_questions": len(questions),
        "questions": questions
    }


# =========================================
# SIGNUP
# =========================================

@app.post("/signup")
def signup(
    user: UserCreate,
    db: Session = Depends(get_db)
):

    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if existing_user:

        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    hashed_password = bcrypt.hashpw(
        user.password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")

    new_user = User(
        name=user.name,
        email=user.email,
        password=hashed_password,
        education=user.education,
        course=user.course,
        graduation_year=user.graduation_year
    )

    db.add(new_user)

    db.commit()

    db.refresh(new_user)

    return {
        "message": "User registered successfully",
        "user_id": new_user.id
    }


# =========================================
# LOGIN
# =========================================

@app.post("/login")
def login(
    user: UserLogin,
    db: Session = Depends(get_db)
):

    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if not existing_user:

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    password_correct = bcrypt.checkpw(
        user.password.encode("utf-8"),
        existing_user.password.encode("utf-8")
    )

    if not password_correct:

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    access_token = create_access_token(
        cast(int, existing_user.id)
    )

    return {
        "message": "Login successful",
        "access_token": access_token,
        "token_type": "bearer"
    }


# =========================================
# CAREER RECOMMENDATION
# =========================================

@app.post("/recommend")
def get_recommendations(
    student: StudentAssessment,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):

    try:

        # ---------------------------------
        # 1. CREATE FEATURE VECTOR
        # ---------------------------------

        feature_vector = create_feature_vector(
            student.answers
        )


        # ---------------------------------
        # 2. SAVE ASSESSMENT
        # ---------------------------------

        new_assessment = Assessment(
            user_id=user_id,
            answers=json.dumps(student.answers)
        )

        db.add(new_assessment)

        db.commit()

        db.refresh(new_assessment)


        # ---------------------------------
        # 3. GET CAREER RECOMMENDATIONS
        # ---------------------------------

        recommendations = recommend_careers(
            feature_vector,
            top_n=5
        )


        # ---------------------------------
        # 4. GENERATE GROQ EXPLANATION
        # ---------------------------------

        for rank, rec in enumerate(
            recommendations,
            start=1
        ):

            explanation = generate_career_explanation(
                rec["career"],
                rec["description"]
            )

            rec["rank"] = rank

            rec["ai_explanation"] = explanation


        # ---------------------------------
        # 5. SAVE RECOMMENDATIONS
        # ---------------------------------

        for rec in recommendations:

            new_recommendation = Recommendation(
                user_id=user_id,
                assessment_id=new_assessment.id,
                career=rec["career"],
                occupation_code=rec["occupation_code"],
                similarity_score=rec["similarity_score"],
                description=rec["description"],
                ai_explanation=json.dumps(
                    rec.get("ai_explanation", {})
                )
            )

            db.add(new_recommendation)


        db.commit()


        # ---------------------------------
        # 6. RETURN RESULT
        # ---------------------------------

        return {
            "assessment_id": new_assessment.id,
            "recommendations": recommendations
        }


    except ValueError as e:

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

@app.post("/agent/chat")
def agent_chat(
    request: AgentChatRequest,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    return run_career_agent(
        db,
        user_id,
        request.message
    )
# =========================================
# RECOMMENDATION HISTORY
# =========================================

@app.get("/history")
def get_history(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):

    history = db.query(Recommendation).filter(
        Recommendation.user_id == user_id,
        Recommendation.assessment_id.isnot(None)
    ).order_by(
        Recommendation.assessment_id.desc(),
        Recommendation.id.asc()
    ).all()

    assessments = {}

    # ---------------------------------
    # GROUP RECOMMENDATIONS
    # ---------------------------------

    for item in history:

        assessment_id = item.assessment_id

        if assessment_id not in assessments:
            assessments[assessment_id] = []

        # ---------------------------------
        # GET SAVED AI EXPLANATION
        # ---------------------------------

        stored_ai_explanation = getattr(
            item,
            "ai_explanation",
            None
        )

        ai_explanation = {}

        if stored_ai_explanation:

            try:

                ai_explanation = json.loads(
                    stored_ai_explanation
                )

            except json.JSONDecodeError:

                ai_explanation = {}

        # ---------------------------------
        # ADD RECOMMENDATION
        # ---------------------------------

        assessments[assessment_id].append({

            "career": item.career,

            "occupation_code": item.occupation_code,

            "similarity_score": item.similarity_score,

            "description": item.description,

            "ai_explanation": ai_explanation

        })

    # ---------------------------------
    # CREATE HISTORY RESPONSE
    # ---------------------------------

    history_response = []

    for assessment_id, recommendations in assessments.items():

        history_response.append({

            "assessment_id": assessment_id,

            "recommendations": recommendations

        })

    return {

        "user_id": user_id,
        "total_assessments": len(history_response),
        "total_recommendations": len(history),
        "history": history_response
}

# =========================================
# USER PROFILE
# =========================================

@app.get("/profile")
def get_profile(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):

    user = db.query(User).filter(
        User.id == user_id
    ).first()


    if not user:

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )


    return {

        "id": user.id,

        "name": user.name,

        "email": user.email,

        "education": user.education,

        "course": user.course,

        "graduation_year": user.graduation_year,

        "profile_image": user.profile_image

    }


# =========================================
# PROFILE PHOTO UPLOAD
# =========================================

@app.post("/profile/photo")
def upload_profile_photo(
    photo: UploadFile = File(...),
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):

    # ---------------------------------
    # 1. CHECK FILE TYPE
    # ---------------------------------

    allowed_types = [

        "image/jpeg",

        "image/png",

        "image/webp"

    ]


    if photo.content_type not in allowed_types:

        raise HTTPException(

            status_code=400,

            detail="Only JPG, PNG, and WEBP images are allowed."

        )


    # ---------------------------------
    # 2. CREATE UPLOAD FOLDER
    # ---------------------------------

    upload_dir = os.path.join(

        os.path.dirname(
            os.path.abspath(__file__)
        ),

        "uploads",

        "profile"

    )


    os.makedirs(

        upload_dir,

        exist_ok=True

    )


    # ---------------------------------
    # 3. GET FILE EXTENSION
    # ---------------------------------

    extension = os.path.splitext(

        photo.filename or ""

    )[1].lower()


    if extension not in [

        ".jpg",

        ".jpeg",

        ".png",

        ".webp"

    ]:

        raise HTTPException(

            status_code=400,

            detail="Invalid image file."

        )


    # ---------------------------------
    # 4. CREATE USER FILE NAME
    # ---------------------------------

    filename = f"user_{user_id}{extension}"


    file_path = os.path.join(

        upload_dir,

        filename

    )


    # ---------------------------------
    # 5. SAVE IMAGE
    # ---------------------------------

    with open(file_path, "wb") as buffer:

        shutil.copyfileobj(

            photo.file,

            buffer

        )


    # ---------------------------------
    # 6. FIND USER
    # ---------------------------------

    user = db.query(User).filter(

        User.id == user_id

    ).first()


    if not user:

        raise HTTPException(

            status_code=404,

            detail="User not found"

        )


    # ---------------------------------
    # 7. SAVE IMAGE PATH
    # ---------------------------------

    setattr(

        user,

        "profile_image",

        f"uploads/profile/{filename}"

    )


    db.commit()

    db.refresh(user)


    # ---------------------------------
    # 8. RETURN RESPONSE
    # ---------------------------------

    return {

        "message": "Profile photo uploaded successfully",

        "profile_image": user.profile_image

    }