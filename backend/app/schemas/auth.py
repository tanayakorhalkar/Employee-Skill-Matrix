from typing import Optional
from pydantic import BaseModel
from app.schemas.employee import EmployeeResponse

class LoginRequest(BaseModel):
    Login_userid: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: EmployeeResponse

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    roles: Optional[str] = None
