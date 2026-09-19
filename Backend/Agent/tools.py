import json

from sqlalchemy.orm import Session

from models import User, Assessment, Recommendation


def get_student_profile(
    db: Session,
    user_id: int
):
    """
    Retrieve the student's actual profile information.
    """

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        return {
            "error": "Student profile not found"
        }

    return {
        "name": getattr(user, "name", None),
        "education": getattr(user, "education", None),
        "course": getattr(user, "course", None),
        "graduation_year": getattr(
            user,
            "graduation_year",
            None
        )
    }


def get_latest_assessment(
    db: Session,
    user_id: int
):
    """
    Retrieve the student's latest assessment.
    """

    assessment = (
        db.query(Assessment)
        .filter(
            Assessment.user_id == user_id
        )
        .order_by(
            Assessment.id.desc()
        )
        .first()
    )

    if not assessment:
        return {
            "error": "No assessment found"
        }

    raw_answers = getattr(
        assessment,
        "answers",
        ""
    )

    try:
        answers = json.loads(
            str(raw_answers)
        )

    except (
        json.JSONDecodeError,
        TypeError
    ):
        answers = {}

    return {
        "assessment_id": getattr(
            assessment,
            "id",
            None
        ),
        "answers": answers
    }


def get_latest_recommendations(
    db: Session,
    user_id: int
):
    """
    Retrieve the five career recommendations
    from the student's latest assessment.
    """

    recommendations = (
        db.query(Recommendation)
        .filter(
            Recommendation.user_id == user_id
        )
        .order_by(
            Recommendation.assessment_id.desc(),
            Recommendation.id.asc()
        )
        .limit(5)
        .all()
    )

    if not recommendations:
        return {
            "error": "No career recommendations found"
        }

    result = []

    for item in recommendations:

        # Safely retrieve AI explanation
        raw_ai_explanation = getattr(
            item,
            "ai_explanation",
            None
        )

        ai_explanation = {}

        if raw_ai_explanation:

            try:
                ai_explanation = json.loads(
                    str(raw_ai_explanation)
                )

            except (
                json.JSONDecodeError,
                TypeError
            ):
                ai_explanation = {}

        result.append({
            "career": getattr(
                item,
                "career",
                None
            ),

            "occupation_code": getattr(
                item,
                "occupation_code",
                None
            ),

            "similarity_score": getattr(
                item,
                "similarity_score",
                None
            ),

            "description": getattr(
                item,
                "description",
                None
            ),

            "ai_explanation": ai_explanation
        })

    return {
        "recommendations": result
    }


def get_skill_gaps(
    db: Session,
    user_id: int
):
    """
    Retrieve skill improvement information
    from the student's latest recommendations.
    """

    recommendations = (
        db.query(Recommendation)
        .filter(
            Recommendation.user_id == user_id
        )
        .order_by(
            Recommendation.assessment_id.desc(),
            Recommendation.id.asc()
        )
        .limit(5)
        .all()
    )

    if not recommendations:
        return {
            "error": "No career recommendations found"
        }

    skill_gaps = []

    for item in recommendations:

        # Safely retrieve AI explanation
        raw_ai_explanation = getattr(
            item,
            "ai_explanation",
            None
        )

        if not raw_ai_explanation:
            continue

        try:
            ai_explanation = json.loads(
                str(raw_ai_explanation)
            )

        except (
            json.JSONDecodeError,
            TypeError
        ):
            continue

        if not isinstance(
            ai_explanation,
            dict
        ):
            continue

        skills = ai_explanation.get(
            "skills_to_improve",
            []
        )

        if not isinstance(
            skills,
            list
        ):
            continue

        career = getattr(
            item,
            "career",
            None
        )

        for skill in skills:

            skill_gaps.append({
                "career": career,
                "skill": skill
            })

    if not skill_gaps:
        return {
            "error": (
                "Skill improvement information "
                "is not available yet"
            )
        }

    return {
        "skill_gaps": skill_gaps
    }


def get_career_information(
    db: Session,
    user_id: int,
    career_name: str
):
    """
    Retrieve career information that actually exists
    in the student's recommendation data.

    Only information stored in the database is returned.
    """

    recommendation = (
        db.query(Recommendation)
        .filter(
            Recommendation.user_id == user_id,
            Recommendation.career.ilike(
                career_name
            )
        )
        .order_by(
            Recommendation.id.desc()
        )
        .first()
    )

    if not recommendation:
        return {
            "error": "Career information not found"
        }

    # Safely retrieve stored AI explanation
    raw_ai_explanation = getattr(
        recommendation,
        "ai_explanation",
        None
    )

    ai_explanation = {}

    if raw_ai_explanation:

        try:
            ai_explanation = json.loads(
                str(raw_ai_explanation)
            )

        except (
            json.JSONDecodeError,
            TypeError
        ):
            ai_explanation = {}

    return {
        "career": getattr(
            recommendation,
            "career",
            None
        ),

        "occupation_code": getattr(
            recommendation,
            "occupation_code",
            None
        ),

        "similarity_score": getattr(
            recommendation,
            "similarity_score",
            None
        ),

        "description": getattr(
            recommendation,
            "description",
            None
        ),

        "ai_explanation": ai_explanation
    }