from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, Field
from app.schemas.employee import EmployeeResponse
from app.schemas.skill import SkillResponse

class EmployeeSkillBase(BaseModel):
    skill_id: int
    emp_id: int
    self_rating: int = Field(..., ge=1, le=5)
    comments: Optional[str] = None
    is_active: bool = True

class EmployeeSkillCreate(BaseModel):
    skill_id: int
    emp_id: Optional[int] = None  # Inferred from auth token if not provided
    self_rating: int = Field(..., ge=1, le=5)
    comments: Optional[str] = None
    is_active: Optional[bool] = True

class EmployeeSkillUpdate(BaseModel):
    self_rating: Optional[int] = Field(None, ge=1, le=5)
    comments: Optional[str] = None
    is_active: Optional[bool] = None

class ManagerReviewAction(BaseModel):
    action: Literal["APPROVE", "REJECT", "EDIT"]
    manager_notes: Optional[str] = None
    reviewed_rating: Optional[int] = Field(None, ge=1, le=5)

class EmployeeSkillResponse(EmployeeSkillBase):
    unique_id: int
    add_update_timestamp: datetime
    employee: Optional[EmployeeResponse] = None
    skill: Optional[SkillResponse] = None

    class Config:
        from_attributes = True
