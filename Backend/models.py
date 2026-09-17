from sqlalchemy import Column, Integer, String, Text, Float, ForeignKey
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)
    education = Column(String(100))
    course = Column(String(100))
    graduation_year = Column(Integer)
    #Optional profile photo
    profile_image = Column(String(255),nullable=True)


class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    answers = Column(Text, nullable=False)


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)

    # User who received the recommendation
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Assessment that generated this recommendation
    assessment_id = Column(
        Integer,
        ForeignKey("assessments.id"),
        nullable=False
    )

    career = Column(String(200), nullable=False)
    occupation_code = Column(String(50))
    similarity_score = Column(Float)
    description = Column(Text)
    ai_explanation = Column(Text,nullable=True)