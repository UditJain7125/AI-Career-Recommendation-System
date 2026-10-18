import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL is None:
    raise ValueError("DATABASE_URL not found in .env")

# Fix for SQLAlchemy compatibility if URL begins with 'postgres://'
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# pool_pre_ping=True checks connection health before executing queries,
# preventing errors if Neon paused/closed an idle connection.
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=300
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()