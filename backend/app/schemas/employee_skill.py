from datetime import datetime
from typing import Optional, Literal
from decimal import Decimal
from pydantic import BaseModel, Field
from app.schemas.employee import EmployeeResponse
from app.schemas.skill import SkillResponse

class EmployeeSkillBase(BaseModel):
    skill_id: int
    emp_id: int
    self_rating: float = Field(..., ge=0.5, le=5)
    comments: Optional[str] = None
    is_active: bool = True

class EmployeeSkillCreate(BaseModel):
    skill_id: int
    emp_id: Optional[int] = None  # Inferred from auth token if not provided
    self_rating: Decimal = Field(..., ge=0.5, le=5, max_digits=2, decimal_places=1)
    comments: Optional[str] = None
    is_active: Optional[bool] = True

class EmployeeSkillUpdate(BaseModel):
    self_rating: Optional[Decimal] = Field(None, ge=0.5, le=5, max_digits=2, decimal_places=1)
    comments: Optional[str] = None
    is_active: Optional[bool] = None

class ManagerReviewAction(BaseModel):
    action: Literal["APPROVE", "REJECT", "EDIT"]
    manager_notes: Optional[str] = None
    reviewed_rating: Optional[Decimal] = Field(None, ge=0.5, le=5, max_digits=2, decimal_places=1)

class ManagerBatchReviewAction(BaseModel):
    action: Literal["APPROVE", "REJECT"]
    manager_notes: Optional[str] = None

class EmployeeSkillResponse(EmployeeSkillBase):
    unique_id: int
    add_update_timestamp: datetime
    employee: Optional[EmployeeResponse] = None
    skill: Optional[SkillResponse] = None

    class Config:
        from_attributes = True
