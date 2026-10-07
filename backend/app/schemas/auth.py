from typing import Optional
import re
from pydantic import BaseModel, Field, field_validator
from app.schemas.employee import EmployeeResponse

class LoginRequest(BaseModel):
    Login_userid: str
    password: str

class RegisterRequest(BaseModel):
    fName: str = Field(..., min_length=1, max_length=100)
    lName: str = Field(..., min_length=1, max_length=100)
    email: str = Field(..., min_length=3, max_length=100)
    password: str = Field(..., min_length=8, max_length=128)

    @field_validator("fName", "lName")
    @classmethod
    def normalize_name(cls, value: str) -> str:
        normalized = value.strip()
        if not normalized:
            raise ValueError("Name cannot be empty.")
        return normalized

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        normalized = value.strip().lower()
        if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", normalized):
            raise ValueError("Enter a valid email address.")
        return normalized

    @field_validator("password")
    @classmethod
    def validate_password_length(cls, value: str) -> str:
        if len(value.encode("utf-8")) > 72:
            raise ValueError("Password must be at most 72 UTF-8 bytes.")
        return value

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: EmployeeResponse

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    roles: Optional[str] = None
