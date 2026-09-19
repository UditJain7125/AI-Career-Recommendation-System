import json

from sqlalchemy.orm import Session

from models import User, Assessment, Recommendation


def get_student_profile(db: Session, user_id: int):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        return {"error": "Student profile not found"}

    return {
        "name": user.name,
        "education": user.education,
        "course": user.course,
        "graduation_year": user.graduation_year
    }


def get_latest_assessment(db: Session, user_id: int):
    assessment = (
        db.query(Assessment)
        .filter(Assessment.user_id == user_id)
        .order_by(Assessment.id.desc())
        .first()
    )

    if not assessment:
        return {"error": "No assessment found"}

    try:
        answers = json.loads(str(assessment.answers))
    except (json.JSONDecodeError, TypeError):
        answers = {}

    return {
        "assessment_id": assessment.id,
        "answers": answers
    }

def get_latest_recommendations(db: Session, user_id: int):
    recommendations = (
        db.query(Recommendation)
        .filter(Recommendation.user_id == user_id)
        .order_by(
            Recommendation.assessment_id.desc(),
            Recommendation.id.asc()
        )
        .limit(5)
        .all()
    )

    if not recommendations:
        return {"error": "No career recommendations found"}

    result = []

    for item in recommendations:
        try:
            ai_explanation = json.loads(str(item.ai_explanation))
        except (json.JSONDecodeError, TypeError):
            ai_explanation = {}

        result.append({
            "career": item.career,
            "occupation_code": item.occupation_code,
            "similarity_score": item.similarity_score,
            "description": item.description,
            "ai_explanation": ai_explanation
        })

    return {
        "recommendations": result
    }

def get_skill_gaps(db: Session, user_id: int):
    recommendations = (
        db.query(Recommendation)
        .filter(Recommendation.user_id == user_id)
        .order_by(
            Recommendation.assessment_id.desc(),
            Recommendation.id.asc()
        )
        .limit(5)
        .all()
    )

    if not recommendations:
        return {"error": "No career recommendations found"}

    skill_gaps = []

    for item in recommendations:
        try:
            ai_explanation = json.loads(str(item.ai_explanation))
        except (json.JSONDecodeError, TypeError):
            continue

        skills = ai_explanation.get("skills_to_improve", [])

        for skill in skills:
            skill_gaps.append({
                "career": item.career,
                "skill": skill
            })

    if not skill_gaps:
        return {
            "error": "Skill improvement information is not available yet"
        }

    return {
        "skill_gaps": skill_gaps
    }

def get_career_information(
    db: Session,
    user_id: int,
    career_name: str
):
    recommendation = (
        db.query(Recommendation)
        .filter(
            Recommendation.user_id == user_id,
            Recommendation.career.ilike(career_name)
        )
        .order_by(Recommendation.id.desc())
        .first()
    )

    if not recommendation:
        return {"error": "Career information not found"}

    return {
        "career": recommendation.career,
        "occupation_code": recommendation.occupation_code,
        "similarity_score": recommendation.similarity_score,
        "description": recommendation.description
    }