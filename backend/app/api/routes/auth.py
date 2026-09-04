from __future__ import annotations

import httpx
from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.core.config import Settings, get_settings
from app.core.security import AUTH_COOKIE_NAME, get_current_user
from app.models.user import User
from app.schemas.auth import AuthResponse, LoginRequest, RegisterRequest, UserResponse
from app.schemas.common import ApiMessage

router = APIRouter()


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(
    payload: RegisterRequest,
    response: Response,
    settings: Settings = Depends(get_settings),
) -> AuthResponse:
    supabase_response = _supabase_request(
        settings,
        "/auth/v1/signup",
        {
            "email": payload.email.lower(),
            "password": payload.password,
            "data": {"full_name": payload.full_name.strip()},
        },
    )
    return _build_auth_response_from_supabase(supabase_response, response, created=True)


@router.post("/login", response_model=AuthResponse)
def login(
    payload: LoginRequest,
    response: Response,
    settings: Settings = Depends(get_settings),
) -> AuthResponse:
    supabase_response = _supabase_request(
        settings,
        "/auth/v1/token?grant_type=password",
        {
            "email": payload.email.lower(),
            "password": payload.password,
        },
    )
    return _build_auth_response_from_supabase(supabase_response, response, created=False)


@router.post("/logout", response_model=ApiMessage)
def logout(response: Response) -> ApiMessage:
    response.delete_cookie(AUTH_COOKIE_NAME)
    return ApiMessage(message="Logged out successfully.")


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)) -> UserResponse:
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        created_at=current_user.created_at.isoformat(),
    )


def _supabase_request(settings: Settings, path: str, payload: dict) -> dict:
    if not settings.supabase_url or not settings.supabase_anon_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Supabase authentication is not configured.",
        )

    try:
        response = httpx.post(
            f"{settings.supabase_url}{path}",
            json=payload,
            headers={
                "apikey": settings.supabase_anon_key,
                "Content-Type": "application/json",
            },
            timeout=20.0,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Could not reach Supabase authentication right now.",
        ) from exc

    data = response.json()
    if response.status_code >= 400:
        detail = (
            data.get("msg") or data.get("error_description") or data.get("message") or "Authentication request failed."
        )
        raise HTTPException(status_code=response.status_code, detail=detail)
    return data


def _build_auth_response_from_supabase(data: dict, response: Response, created: bool) -> AuthResponse:
    access_token = data.get("access_token")
    user = data.get("user")
    if not access_token or not isinstance(user, dict):
        detail = (
            "Supabase did not return a session. Check whether email confirmation is disabled for testing."
            if created
            else "Supabase did not return a session."
        )
        raise HTTPException(status_code=400, detail=detail)

    email = user.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Supabase user email was missing.")

    full_name = (
        user.get("user_metadata", {}).get("full_name")
        or user.get("user_metadata", {}).get("name")
        or email.split("@")[0]
    )

    response.set_cookie(
        key=AUTH_COOKIE_NAME,
        value=access_token,
        httponly=True,
        samesite="lax",
        secure=False,
        max_age=60 * 60 * 24 * 7,
    )

    return AuthResponse(
        access_token=access_token,
        user=UserResponse(
            id=user.get("id", email),
            email=email,
            full_name=full_name,
            created_at=user.get("created_at") or "",
        ),
    )
