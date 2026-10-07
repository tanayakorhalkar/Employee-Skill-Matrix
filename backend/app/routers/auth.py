from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from app.core.security import verify_password, create_access_token, get_password_hash
from app.core.dependencies import get_current_user
from app.database.session import get_db
from app.models.employee import Employee
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse
from app.schemas.employee import EmployeeResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=TokenResponse)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    login_userid = login_data.Login_userid.strip()
    if "@" in login_userid:
        login_userid = login_userid.lower()
    user = db.query(Employee).filter(Employee.Login_userid == login_userid).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password.",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive. Contact an administrator.",
        )
    if not verify_password(login_data.password, user.Login_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password.",
        )

    # Update last_logged_in
    user.last_logged_in = datetime.now(timezone.utc)
    db.commit()
    db.refresh(user)

    access_token = create_access_token(subject=user.emp_id, roles=user.roles)
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=EmployeeResponse.model_validate(user),
    )

@router.post("/register", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
def register(registration: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(Employee).filter(
        func.lower(Employee.Login_userid) == registration.email
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email address already exists.",
        )

    employee = Employee(
        fName=registration.fName,
        lName=registration.lName,
        Login_userid=registration.email,
        Login_password=get_password_hash(registration.password),
        roles="EMPLOYEE",
        is_active=True,
    )
    db.add(employee)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email address already exists.",
        ) from exc
    db.refresh(employee)
    return employee

@router.get("/me", response_model=EmployeeResponse)
def get_me(current_user: Employee = Depends(get_current_user)):
    return EmployeeResponse.model_validate(current_user)

@router.post("/logout")
def logout():
    return {"message": "Logged out successfully."}
