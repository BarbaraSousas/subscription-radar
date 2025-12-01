# app/api/v1/auth.py
import logging
from typing import Annotated
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from sqlalchemy.exc import IntegrityError, OperationalError
from app.db import get_session
from app.models import User
from app.schemas import UserCreate, UserLogin, UserResponse, Token
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token
)
from app.deps import CurrentUser

# Configure logger for this module
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(
    user_data: UserCreate,
    session: Annotated[Session, Depends(get_session)]
):
    """
    Register a new user.

    Creates a new user account with hashed password.
    Returns the created user information (without password).
    """
    # Check if user already exists
    statement = select(User).where(User.email == user_data.email)
    existing_user = session.exec(statement).first()

    if existing_user:
        logger.warning(
            f"Registration attempt with existing email: {user_data.email}"
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Create new user with hashed password
    db_user = User(
        email=user_data.email,
        full_name=user_data.full_name,
        hashed_password=get_password_hash(user_data.password)
    )

    try:
        session.add(db_user)
        session.commit()
        session.refresh(db_user)

        # Log successful registration
        logger.info(
            f"New user registered successfully: {db_user.email} (ID: {db_user.id})"
        )
    except IntegrityError as e:
        # Email already exists (race condition - two simultaneous requests)
        session.rollback()
        logger.error(
            f"IntegrityError during registration for {user_data.email}: {str(e)}"
        )
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered. This can happen if multiple registration attempts occur simultaneously."
        )
    except OperationalError as e:
        # Database connection issue, disk full, etc.
        session.rollback()
        logger.error(
            f"OperationalError during registration for {user_data.email}: {str(e)}"
        )
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service temporarily unavailable. Please try again later."
        )
    except Exception as e:
        # Catch any other unexpected errors
        session.rollback()
        logger.critical(
            f"Unexpected error during registration for {user_data.email}: {str(e)}",
            exc_info=True  # This includes the full stack trace
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during registration."
        )

    return db_user


@router.post("/login", response_model=Token)
def login(
    credentials: UserLogin,
    session: Annotated[Session, Depends(get_session)]
):
    """
    Login with email and password.

    Validates credentials and returns a JWT access token.
    """
    # Find user by email
    statement = select(User).where(User.email == credentials.email)
    user = session.exec(statement).first()

    # Timing attack mitigation: Always hash a password, even if user doesn't exist
    # This ensures both paths (user exists / doesn't exist) take similar time
    if not user:
        # Hash a dummy password to match the timing of the real password check
        # This prevents attackers from discovering valid emails via timing analysis
        verify_password(
            credentials.password,
            # Dummy bcrypt hash (same format as real hashes)
            "$2b$12$dummyhashtopreventtimingattacksshouldnotmatchanything"
        )
        logger.warning(
            f"Failed login attempt - email not found: {credentials.email}"
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Verify password
    if not verify_password(credentials.password, user.hashed_password):
        logger.warning(
            f"Failed login attempt - incorrect password for: {credentials.email}"
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Check if user is active
    if not user.is_active:
        logger.warning(
            f"Login attempt by inactive user: {credentials.email}"
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )

    # Create access token
    access_token = create_access_token(data={"sub": str(user.id)})

    logger.info(
        f"User logged in successfully: {user.email} (ID: {user.id})"
    )

    return Token(access_token=access_token)


@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: CurrentUser):
    """
    Get current user information.

    Requires authentication via JWT token in Authorization header.
    Returns the authenticated user's profile.
    """
    return current_user
