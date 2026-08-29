from __future__ import annotations

import hashlib
import os
from datetime import UTC, datetime, timedelta

import httpx
import jwt
from fastapi import Cookie, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import Settings, get_settings
from app.core.database import get_db
from app.models.user import User

AUTH_COOKIE_NAME = "finsight_access_token"


def hash_password(password: str) -> str:
    salt = os.urandom(16)
    hashed = hashlib.scrypt(password.encode("utf-8"), salt=salt, n=2**14, r=8, p=1)
    return f"{salt.hex()}:{hashed.hex()}"


def verify_password(password: str, stored_hash: str) -> bool:
    try:
        salt_hex, hash_hex = stored_hash.split(":", maxsplit=1)
    except ValueError:
        return False
    salt = bytes.fromhex(salt_hex)
    expected = bytes.fromhex(hash_hex)
    candidate = hashlib.scrypt(password.encode("utf-8"), salt=salt, n=2**14, r=8, p=1)
    return candidate == expected


def create_access_token(
    subject: str,
    user_id: int,
    settings: Settings,
    expires_delta: timedelta | None = None,
) -> str:
    expire = datetime.now(UTC) + (expires_delta or timedelta(minutes=settings.access_token_expire_minutes))
    payload = {"sub": subject, "user_id": user_id, "exp": expire}
    return jwt.encode(payload, settings.auth_secret_key, algorithm=settings.auth_algorithm)


def decode_access_token(token: str, settings: Settings) -> dict[str, object]:
    try:
        return jwt.decode(token, settings.auth_secret_key, algorithms=[settings.auth_algorithm])
    except jwt.PyJWTError as exc:  # pragma: no cover
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token.",
        ) from exc


def get_current_user(
    request: Request,
    cookie_token: str | None = Cookie(default=None, alias=AUTH_COOKIE_NAME),
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> User:
    token = _extract_token(
        request.headers.get("authorization"),
        request.headers.get("x-finsight-auth"),
        cookie_token,
    )
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")
    return _user_from_supabase_token(token, db, settings)


def get_optional_current_user(
    request: Request,
    cookie_token: str | None = Cookie(default=None, alias=AUTH_COOKIE_NAME),
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> User | None:
    token = _extract_token(
        request.headers.get("authorization"),
        request.headers.get("x-finsight-auth"),
        cookie_token,
    )
    if not token:
        return None
    try:
        return _user_from_supabase_token(token, db, settings)
    except HTTPException:
        return None


def _extract_token(
    authorization: str | None,
    fallback_header_token: str | None,
    cookie_token: str | None,
) -> str | None:
    if authorization and authorization.lower().startswith("bearer "):
        return authorization.split(" ", maxsplit=1)[1].strip()
    if fallback_header_token:
        return fallback_header_token.strip()
    if cookie_token:
        return cookie_token
    return None


def _user_from_supabase_token(token: str, db: Session, settings: Settings) -> User:
    if not settings.supabase_url or not settings.supabase_anon_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Supabase authentication is not configured on the backend.",
        )

    try:
        response = httpx.get(
            f"{settings.supabase_url}/auth/v1/user",
            headers={
                "Authorization": f"Bearer {token}",
                "apikey": settings.supabase_anon_key,
            },
            timeout=15.0,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Could not verify Supabase session right now.",
        ) from exc

    if response.status_code >= 400:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated.",
        )

    payload = response.json()
    email = payload.get("email")
    if not isinstance(email, str) or not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Supabase user email was missing.",
        )

    full_name = (
        payload.get("user_metadata", {}).get("full_name")
        or payload.get("user_metadata", {}).get("name")
        or email.split("@")[0]
    )

    user = db.execute(select(User).where(User.email == email.lower())).scalar_one_or_none()

    if user is None:
        user = User(
            email=email.lower(),
            full_name=full_name,
            password_hash="supabase-managed",
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    if full_name and user.full_name != full_name:
        user.full_name = full_name
        db.add(user)
        db.commit()
        db.refresh(user)

    return user
