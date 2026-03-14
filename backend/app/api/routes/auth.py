import re

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ...database import Base, engine, get_db
from ...dependencies.auth import get_current_user
from ...models.user import User
from ...schemas.auth import AuthResponse, LoginRequest, MeResponse, RegisterRequest, UserResponse
from ...services.password import hash_password, verify_password
from ...services.token import create_access_token

router = APIRouter()
Base.metadata.create_all(bind=engine)

PHONE_PATTERN = re.compile(r"^\d{10}$")


def normalize_phone(raw_phone: str) -> str:
    return re.sub(r"\D", "", raw_phone or "")


def validate_auth_input(phone: str, password: str) -> str:
    normalized_phone = normalize_phone(phone)
    if not PHONE_PATTERN.fullmatch(normalized_phone):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="auth.errors.invalidPhone",
        )
    if len(password or "") < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="auth.errors.passwordMin",
        )
    return normalized_phone


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)) -> AuthResponse:
    normalized_phone = validate_auth_input(payload.phone, payload.password)
    existing_user = db.query(User).filter(User.phone == normalized_phone).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="auth.errors.phoneAlreadyExists",
        )

    user = User(
        full_name=payload.full_name.strip(),
        phone=normalized_phone,
        password_hash=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(user.id)
    return AuthResponse(access_token=token, user=UserResponse.model_validate(user))


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> AuthResponse:
    normalized_phone = validate_auth_input(payload.phone, payload.password)
    user = db.query(User).filter(User.phone == normalized_phone).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="auth.errors.invalidCredentials",
        )

    token = create_access_token(user.id)
    return AuthResponse(access_token=token, user=UserResponse.model_validate(user))


@router.get("/me", response_model=MeResponse)
def me(current_user: User = Depends(get_current_user)) -> MeResponse:
    return MeResponse(user=UserResponse.model_validate(current_user))
