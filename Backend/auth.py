import os
from dotenv import load_dotenv
from jose import jwt
from datetime import datetime, timedelta, timezone
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
load_dotenv()
secret_key = os.getenv("JWT_SECRET_KEY")

if secret_key is None:
    raise ValueError("JWT_SECRET_KEY not found in .env")

SECRET_KEY: str = secret_key
ALGORITHM = "HS256"

security=HTTPBearer()


def create_access_token(user_id: int):
    expire = datetime.now(timezone.utc) + timedelta(hours=1)

    payload = {
        "user_id": user_id,
        "exp": expire
    }

    token = jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return token


def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = payload.get("user_id")

        if user_id is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid token"
            )

        return int(user_id)

    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )