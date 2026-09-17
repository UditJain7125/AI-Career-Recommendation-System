from pydantic import BaseModel, Field


class StudentAssessment(BaseModel):
    answers: dict[str, int] = Field(
        ...,
        description="Student answers with ratings from 1 to 5"
    )
class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    education: str | None = None
    course: str | None = None
    graduation_year: int | None = None

class UserLogin(BaseModel):
    email: str
    password: str
  