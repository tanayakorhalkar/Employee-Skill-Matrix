from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, Field

RoleType = Literal["SUPER_ADMIN", "MANAGER", "EMPLOYEE"]

class EmployeeBase(BaseModel):
    fName: str = Field(..., max_length=100)
    lName: str = Field(..., max_length=100)
    Login_userid: str = Field(..., max_length=100)
    roles: RoleType
    is_active: bool = True

class EmployeeCreate(EmployeeBase):
    password: str = Field(..., min_length=6)

class EmployeeUpdate(BaseModel):
    fName: Optional[str] = Field(None, max_length=100)
    lName: Optional[str] = Field(None, max_length=100)
    Login_userid: Optional[str] = Field(None, max_length=100)
    password: Optional[str] = Field(None, min_length=6)
    roles: Optional[RoleType] = None
    is_active: Optional[bool] = None

class EmployeeResponse(EmployeeBase):
    emp_id: int
    created_on: datetime
    updated_on: datetime
    last_logged_in: Optional[datetime] = None

    class Config:
        from_attributes = True
