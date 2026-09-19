import os
from dotenv import load_dotenv
from groq import Groq
import json
load_dotenv()

api_key = os.getenv("GROQ_API_KEY")

if not api_key:
    raise ValueError("GROQ_API_KEY not found in .env")

client = Groq(api_key=api_key)

def generate_career_explanation(career, description):

    prompt = f"""
You are an AI career guidance assistant.

Career:
{career}

Career description:
{description}

Generate career guidance for a student.

Return ONLY valid JSON.

Do NOT use Markdown.
Do NOT use ```json.
Do NOT add any explanation before or after the JSON.

Use exactly this structure:

{{
    "career": "career name",

    "why_suitable": [
        "reason 1",
        "reason 2",
        "reason 3"
    ],

    "important_skills": [
        "skill 1",
        "skill 2",
        "skill 3",
        "skill 4",
        "skill 5"
    ],

    "skills_to_improve": [
        "skill 1",
        "skill 2",
        "skill 3"
    ],

    "learning_roadmap": [
        {{
            "step": 1,
            "title": "Step title",
            "description": "Short description"
        }},
        {{
            "step": 2,
            "title": "Step title",
            "description": "Short description"
        }},
        {{
            "step": 3,
            "title": "Step title",
            "description": "Short description"
        }},
        {{
            "step": 4,
            "title": "Step title",
            "description": "Short description"
        }}
    ]
}}

Keep the information concise and student-friendly.
"""

    try:

        response = client.chat.completions.create(
            model="openai/gpt-oss-20b",
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.3
        )

        result = (response.choices[0].message.content or "").strip()

        # Remove Markdown code fences if the model adds them
        if result.startswith("```json"):
            result = result[7:]

        if result.startswith("```"):
            result = result[3:]

        if result.endswith("```"):
            result = result[:-3]

        result = result.strip()

        # Convert JSON string into Python dictionary
        return json.loads(result)

    except Exception as e:

        print("GROQ ERROR:", e)

        return {
            "career": career,
            "why_suitable": [],
            "important_skills": [],
            "skills_to_improve": [],
            "learning_roadmap": []
        }

def generate_agent_response(prompt: str):
    response = client.chat.completions.create(
        model="openai/gpt-oss-20b",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a helpful AI Career Guidance Agent. "
                    "Answer the student's career-related questions "
                    "using the information provided in the prompt. "
                    "Do not invent student data or change career "
                    "recommendations. Keep answers clear, practical, "
                    "and easy to understand."
                )
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.3,
        max_tokens=1000
    )

    return response.choices[0].message.content