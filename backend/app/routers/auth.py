from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.security import verify_password, create_access_token
from app.core.dependencies import get_current_user
from app.database.session import get_db
from app.models.employee import Employee
from app.schemas.auth import LoginRequest, TokenResponse
from app.schemas.employee import EmployeeResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=TokenResponse)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(Employee).filter(Employee.Login_userid == login_data.Login_userid).first()
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

@router.get("/me", response_model=EmployeeResponse)
def get_me(current_user: Employee = Depends(get_current_user)):
    return EmployeeResponse.model_validate(current_user)

@router.post("/logout")
def logout():
    return {"message": "Logged out successfully."}
