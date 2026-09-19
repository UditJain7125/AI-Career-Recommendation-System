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

    message = user_message.lower()

    # Questions about the student's profile
    if any(word in message for word in [
        "my profile",
        "my education",
        "my course",
        "my graduation",
        "my name"
    ]):
        return "profile"

    # Questions about the student's assessment
    if any(word in message for word in [
        "my assessment",
        "my answers",
        "my ratings",
        "my skills",
        "my abilities",
        "my interests"
    ]):
        return "assessment"

    # Questions about skills that the student should improve
    if any(phrase in message for phrase in [
        "what skills should i improve",
        "skills should i improve",
        "skills to improve",
        "areas should i improve",
        "areas to improve",
        "what should i improve",
        "skill gaps",
        "which skills should i improve"
    ]):
        return "skill_gaps"

    # Questions asking for the student's recommendations
    if any(word in message for word in [
        "recommended careers",
        "recommendations",
        "which careers",
        "career recommendations",
        "my matches"
    ]):
        return "recommendations"

    # Questions about a specific career
    if any(word in message for word in [
        "tell me about",
        "information about",
        "details about",
        "what is",
        "explain"
    ]):
        return "career_information"

    return "general"


def run_career_agent(
    db: Session,
    user_id: int,
    user_message: str
):
    """
    Career Guidance Agent.

    Selects the appropriate information source
    and then uses the LLM to generate a response.
    """

    selected_tool = select_tool(user_message)

    # Get the student's profile
    profile = get_student_profile(
        db,
        user_id
    )

    if "error" in profile:
        return {
            "message": profile["error"]
        }

    # Base context for the LLM
    context = {
        "student_profile": profile,
        "student_question": user_message,
        "selected_tool": selected_tool
    }

    # --------------------------------------------------
    # PROFILE
    # --------------------------------------------------

    if selected_tool == "profile":

        context["information"] = get_student_profile(
            db,
            user_id
        )

    # --------------------------------------------------
    # ASSESSMENT
    # --------------------------------------------------

    elif selected_tool == "assessment":

        context["information"] = get_latest_assessment(
            db,
            user_id
        )

    # --------------------------------------------------
    # SKILL GAPS
    # --------------------------------------------------

    elif selected_tool == "skill_gaps":

        context["information"] = get_skill_gaps(
            db,
            user_id
        )

    # --------------------------------------------------
    # RECOMMENDATIONS
    # --------------------------------------------------

    elif selected_tool == "recommendations":

        context["information"] = get_latest_recommendations(
            db,
            user_id
        )

    # --------------------------------------------------
    # SPECIFIC CAREER INFORMATION
    # --------------------------------------------------

    elif selected_tool == "career_information":

        recommendations_data = get_latest_recommendations(
            db,
            user_id
        )

        career_name = None

        if "recommendations" in recommendations_data:

            message_lower = user_message.lower()

            for recommendation in recommendations_data["recommendations"]:

                # Make sure the recommendation is a dictionary
                if not isinstance(recommendation, dict):
                    continue

                career = recommendation.get("career")

                # Make sure career is a string
                if not isinstance(career, str):
                    continue

                # Check whether the career name appears
                # in the student's question
                if career.lower() in message_lower:
                    career_name = career
                    break

        if career_name:

            context["information"] = get_career_information(
                db,
                user_id,
                career_name
            )

        else:

            context["information"] = {
                "error": (
                    "The specific career could not be identified "
                    "from the student's question."
                )
            }

    # --------------------------------------------------
    # GENERAL CAREER QUESTION
    # --------------------------------------------------

    else:

        context["information"] = {
            "message": (
                "Use the student's profile, assessment, "
                "and career recommendations when relevant."
            )
        }

    # --------------------------------------------------
    # LLM PROMPT
    # --------------------------------------------------

    prompt = f"""
You are a Career Guidance Agent.

Student profile:
{context["student_profile"]}

Information selected by the agent:
{context["information"]}

Student question:
{context["student_question"]}

Answer the student's question clearly and personally.

Rules:
- Use the information provided.
- Do not invent assessment results or student information.
- Do not change the student's career recommendations.
- Give practical career guidance.
- Keep the answer clear, concise, and easy to understand.
- Use plain text formatting only.
- Do not use Markdown.
- Do not use bold or italic formatting.
- Do not use ** or * characters for formatting.
- Do not use bullet symbols such as •.
- Use numbered lists such as 1., 2., 3. when listing items.
- Use simple hyphens for sub-points.
- Do not use pipe characters such as |.
- Do not use table separators such as |---|.
- Do not use headings with ###.
- Do not return literal \\n characters. Use normal line breaks.
- Do not start the response with a name unless the student's actual name
  is provided in the student profile.
- If the question is unrelated to career guidance,
  politely explain that you are a career guidance assistant.
"""

    # --------------------------------------------------
    # GENERATE AI RESPONSE
    # --------------------------------------------------

    try:

        response = generate_agent_response(
            prompt
        )

        return {
            "message": response,
            "selected_tool": selected_tool
        }

    except Exception as e:

        return {
            "message": "Unable to generate an AI response.",
            "error": str(e)
        }