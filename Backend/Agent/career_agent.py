from sqlalchemy.orm import Session

from Agent.tools import (
    get_student_profile,
    get_latest_assessment,
    get_latest_recommendations,
    get_career_information,
    get_skill_gaps,
)

from Groq_service import generate_agent_response


def select_tool(user_message: str):
    """
    Select the most relevant tool based on the student's question.
    """

    message = user_message.lower().strip()

    # --------------------------------------------------
    # 1. SKILL GAP QUESTIONS
    # --------------------------------------------------

    if any(phrase in message for phrase in [
        "what skills should i improve",
        "which skills should i improve",
        "skills should i improve",
        "skills to improve",
        "skill gaps",
        "what are my skill gaps",
        "which areas should i improve",
        "what areas should i improve",
        "areas to improve",
        "what should i improve",
        "what do i need to improve",
        "where should i improve",
    ]):
        return "skill_gaps"

    # --------------------------------------------------
    # 2. RECOMMENDATION QUESTIONS
    # --------------------------------------------------

    if any(phrase in message for phrase in [
        "recommended careers",
        "recommended career",
        "career recommendations",
        "career recommendation",
        "which careers were recommended",
        "which career was recommended",
        "which careers are recommended",
        "which career is recommended",
        "what careers were recommended",
        "what career was recommended",
        "what are my recommended careers",
        "what is my recommended career",
        "my recommendations",
        "my career recommendations",
        "my matches",
        "show my careers",
        "show my recommendations",
        "what careers match me",
        "which careers match me",
    ]):
        return "recommendations"

    if (
        ("career" in message or "careers" in message)
        and (
            "recommend" in message
            or "recommendation" in message
            or "recommended" in message
            or "match" in message
            or "matches" in message
        )
        and (
            "my" in message
            or "me" in message
        )
    ):
        return "recommendations"

    # --------------------------------------------------
    # 3. PROFILE QUESTIONS
    # --------------------------------------------------

    if any(phrase in message for phrase in [
        "my profile",
        "my education",
        "my course",
        "my graduation",
        "my graduation year",
        "my name",
        "my details",
        "what do you know about me",
        "tell me about myself",
        "what is my profile",
        "show my profile",
    ]):
        return "profile"

    # --------------------------------------------------
    # 4. ASSESSMENT QUESTIONS
    # --------------------------------------------------

    if any(phrase in message for phrase in [
        "my assessment",
        "my answers",
        "my ratings",
        "my assessment answers",
        "my assessment results",
        "my abilities",
        "my interests",
        "my assessment score",
        "what did i answer",
        "show my assessment",
    ]):
        return "assessment"

    # --------------------------------------------------
    # 5. SPECIFIC CAREER INFORMATION
    # --------------------------------------------------

    if any(phrase in message for phrase in [
        "tell me about",
        "information about",
        "details about",
        "more about",
        "explain",
        "what is",
        "what does",
        "how do i become",
        "how can i become",
        "career path for",
        "career path of",
    ]):
        return "career_information"

    # --------------------------------------------------
    # 6. GENERAL QUESTION
    # --------------------------------------------------

    return "general"


def find_recommended_career(
    recommendations_data,
    user_message: str
):
    """
    Find a specific career mentioned in the student's
    actual recommended careers.
    """

    if not isinstance(recommendations_data, dict):
        return None

    recommendations = recommendations_data.get(
        "recommendations"
    )

    if not isinstance(recommendations, list):
        return None

    message_lower = user_message.lower()

    for recommendation in recommendations:

        if not isinstance(recommendation, dict):
            continue

        career = recommendation.get("career")

        if not isinstance(career, str):
            continue

        career_lower = career.lower()

        if career_lower in message_lower:
            return career

        if career_lower.endswith("s"):

            career_without_s = career_lower[:-1]

            if career_without_s in message_lower:
                return career

    return None


def format_profile_response(profile):
    """
    Create a deterministic profile response.

    No LLM is used here, so the agent cannot invent
    personal information.
    """

    if not isinstance(profile, dict):
        return "Student profile information is not available."

    if "error" in profile:
        return str(profile["error"])

    lines = [
        "Your profile information:"
    ]

    name = profile.get("name")
    education = profile.get("education")
    course = profile.get("course")
    graduation_year = profile.get("graduation_year")

    if name:
        lines.append(f"1. Name: {name}")
    else:
        lines.append("1. Name: Not available")

    if education:
        lines.append(f"2. Education: {education}")
    else:
        lines.append("2. Education: Not available")

    if course:
        lines.append(f"3. Course: {course}")
    else:
        lines.append("3. Course: Not available")

    if graduation_year:
        lines.append(
            f"4. Graduation year: {graduation_year}"
        )
    else:
        lines.append(
            "4. Graduation year: Not available"
        )

    return "\n".join(lines)


def format_recommendations_response(
    recommendations_data
):
    """
    Create a deterministic recommendation response.

    The ranking comes directly from PostgreSQL.
    """

    if not isinstance(
        recommendations_data,
        dict
    ):
        return "Career recommendations are not available."

    if "error" in recommendations_data:
        return str(
            recommendations_data["error"]
        )

    recommendations = recommendations_data.get(
        "recommendations"
    )

    if not isinstance(
        recommendations,
        list
    ) or not recommendations:

        return "Career recommendations are not available."

    lines = [
        "Your recommended careers:"
    ]

    for index, recommendation in enumerate(
        recommendations,
        start=1
    ):

        if not isinstance(
            recommendation,
            dict
        ):
            continue

        career = recommendation.get(
            "career"
        )

        if not career:
            continue

        lines.append(
            f"{index}. {career}"
        )

    return "\n".join(lines)


def format_skill_gaps_response(
    skill_gap_data
):
    """
    Create a deterministic skill-gap response.

    Skills come from the stored AI explanation
    associated with the student's recommendations.
    """

    if not isinstance(
        skill_gap_data,
        dict
    ):
        return "Skill improvement information is not available."

    if "error" in skill_gap_data:
        return str(
            skill_gap_data["error"]
        )

    skill_gaps = skill_gap_data.get(
        "skill_gaps"
    )

    if not isinstance(
        skill_gaps,
        list
    ) or not skill_gaps:

        return "Skill improvement information is not available."

    lines = [
        "Skills you can improve based on your career recommendations:"
    ]

    seen = set()
    counter = 1

    for item in skill_gaps:

        if not isinstance(
            item,
            dict
        ):
            continue

        career = item.get("career")
        skill = item.get("skill")

        if not skill:
            continue

        key = (
            str(career),
            str(skill)
        )

        if key in seen:
            continue

        seen.add(key)

        if career:
            lines.append(
                f"{counter}. {skill} - related to {career}"
            )
        else:
            lines.append(
                f"{counter}. {skill}"
            )

        counter += 1

    if counter == 1:
        return "Skill improvement information is not available."

    return "\n".join(lines)


def format_assessment_response(
    assessment_data
):
    """
    Create a deterministic assessment response.

    The actual assessment answers are returned directly
    from the database.
    """

    if not isinstance(
        assessment_data,
        dict
    ):
        return "Assessment information is not available."

    if "error" in assessment_data:
        return str(
            assessment_data["error"]
        )

    answers = assessment_data.get(
        "answers"
    )

    assessment_id = assessment_data.get(
        "assessment_id"
    )

    if not isinstance(
        answers,
        dict
    ):
        return "Assessment information is not available."

    lines = []

    if assessment_id is not None:
        lines.append(
            f"Latest assessment ID: {assessment_id}"
        )

    lines.append(
        f"Total questions answered: {len(answers)}"
    )

    lines.append(
        "Your assessment responses are available in the system."
    )

    return "\n".join(lines)


def format_career_information_response(
    career_data
):
    """
    Create a deterministic response for a specific
    recommended career.

    Uses only information stored in the database.
    """

    if not isinstance(
        career_data,
        dict
    ):
        return "Career information is not available."

    if "error" in career_data:
        return str(
            career_data["error"]
        )

    career = career_data.get(
        "career"
    )

    description = career_data.get(
        "description"
    )

    occupation_code = career_data.get(
        "occupation_code"
    )

    similarity_score = career_data.get(
        "similarity_score"
    )

    ai_explanation = career_data.get(
        "ai_explanation"
    )

    lines = []

    if career:
        lines.append(
            f"Career: {career}"
        )

    if description:
        lines.append(
            f"\nDescription:\n{description}"
        )

    if occupation_code:
        lines.append(
            f"\nOccupation code: {occupation_code}"
        )

    if similarity_score is not None:
        percentage = float(
            similarity_score
        ) * 100

        lines.append(
            f"\nMatch score: {percentage:.2f}%"
        )

    # --------------------------------------------------
    # USE ONLY ALREADY STORED AI EXPLANATION
    # --------------------------------------------------

    if isinstance(
        ai_explanation,
        dict
    ):

        why_suitable = ai_explanation.get(
            "why_suitable",
            []
        )

        important_skills = ai_explanation.get(
            "important_skills",
            []
        )

        skills_to_improve = ai_explanation.get(
            "skills_to_improve",
            []
        )

        if isinstance(
            why_suitable,
            list
        ) and why_suitable:

            lines.append(
                "\nWhy this career was recommended:"
            )

            for index, item in enumerate(
                why_suitable,
                start=1
            ):

                lines.append(
                    f"{index}. {item}"
                )

        if isinstance(
            important_skills,
            list
        ) and important_skills:

            lines.append(
                "\nImportant skills:"
            )

            for index, item in enumerate(
                important_skills,
                start=1
            ):

                lines.append(
                    f"{index}. {item}"
                )

        if isinstance(
            skills_to_improve,
            list
        ) and skills_to_improve:

            lines.append(
                "\nSkills to improve:"
            )

            for index, item in enumerate(
                skills_to_improve,
                start=1
            ):

                lines.append(
                    f"{index}. {item}"
                )

    return "\n".join(lines)


def run_career_agent(
    db: Session,
    user_id: int,
    user_message: str
):
    """
    AI Career Guidance Agent.

    Database-based questions are answered directly
    from retrieved information.

    The LLM is used only for general career questions
    where generation is useful.
    """

    selected_tool = select_tool(
        user_message
    )

    # --------------------------------------------------
    # GET STUDENT PROFILE
    # --------------------------------------------------

    profile = get_student_profile(
        db,
        user_id
    )

    if "error" in profile:

        return {
            "message": profile["error"],
            "selected_tool": selected_tool
        }

    # ==================================================
    # PROFILE
    # ==================================================

    if selected_tool == "profile":

        profile_data = get_student_profile(
            db,
            user_id
        )

        return {
            "message": format_profile_response(
                profile_data
            ),
            "selected_tool": "profile"
        }

    # ==================================================
    # RECOMMENDATIONS
    # ==================================================

    if selected_tool == "recommendations":

        recommendation_data = (
            get_latest_recommendations(
                db,
                user_id
            )
        )

        return {
            "message": format_recommendations_response(
                recommendation_data
            ),
            "selected_tool": "recommendations"
        }

    # ==================================================
    # SKILL GAPS
    # ==================================================

    if selected_tool == "skill_gaps":

        skill_gap_data = get_skill_gaps(
            db,
            user_id
        )

        return {
            "message": format_skill_gaps_response(
                skill_gap_data
            ),
            "selected_tool": "skill_gaps"
        }

    # ==================================================
    # ASSESSMENT
    # ==================================================

    if selected_tool == "assessment":

        assessment_data = get_latest_assessment(
            db,
            user_id
        )

        return {
            "message": format_assessment_response(
                assessment_data
            ),
            "selected_tool": "assessment"
        }

    # ==================================================
    # SPECIFIC CAREER
    # ==================================================

    if selected_tool == "career_information":

        recommendations_data = (
            get_latest_recommendations(
                db,
                user_id
            )
        )

        career_name = find_recommended_career(
            recommendations_data,
            user_message
        )

        if not career_name:

            return {
                "message": (
                    "I could not identify that career "
                    "from your recommended careers."
                ),
                "selected_tool": "career_information"
            }

        career_data = get_career_information(
            db,
            user_id,
            career_name
        )

        return {
            "message": format_career_information_response(
                career_data
            ),
            "selected_tool": "career_information"
        }

    # ==================================================
    # GENERAL QUESTION
    # ==================================================

    recommendations = get_latest_recommendations(
        db,
        user_id
    )

    skill_gaps = get_skill_gaps(
        db,
        user_id
    )

    context = {
        "student_profile": profile,
        "recommendations": recommendations,
        "skill_gaps": skill_gaps,
        "student_question": user_message
    }

    prompt = f"""
You are an AI Career Guidance Agent.

Answer the student's general career-related question.

Student profile:
{context["student_profile"]}

Student's career recommendations:
{context["recommendations"]}

Student's skill improvement information:
{context["skill_gaps"]}

Student question:
{context["student_question"]}

IMPORTANT RULES:

1. Do not invent personal information.

2. Do not invent career recommendations.

3. Do not change the student's recommendation ranking.

4. Do not invent assessment scores.

5. Do not claim information about the student that is not
   present in the retrieved data.

6. If the question requires information that is not
   available, clearly say that it is not available.

7. Do not provide unsupported salary information.

8. Do not provide unsupported employment information.

9. Do not provide unsupported job-outlook information.

10. Do not provide unsupported market statistics.

11. Do not pretend general knowledge came from the
    student's database.

12. Keep the answer concise and useful.

13. Use plain text only.

14. Do not use Markdown.

15. Do not use bold or italic formatting.

16. Do not use bullet symbols.

17. Use numbered lists when useful.

18. Do not create tables.

19. Do not use pipe characters.

20. If the question is unrelated to career guidance,
    politely explain that you are a career guidance
    assistant.

Answer the student's question now.
"""

    try:

        response = generate_agent_response(
            prompt
        )

        return {
            "message": response,
            "selected_tool": "general"
        }

    except Exception as e:

        return {
            "message": (
                "Unable to generate an AI response."
            ),
            "selected_tool": "general",
            "error": str(e)
        }