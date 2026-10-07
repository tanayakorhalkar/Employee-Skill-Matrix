from typing import Optional, Literal
from pydantic import BaseModel, Field

SkillTypeLiteral = Literal["Hard skills", "Soft skills"]

class SkillBase(BaseModel):
    skill_type: SkillTypeLiteral
    category_name: str = Field(..., max_length=100)
    category_id: int
    skillname: str = Field(..., max_length=150)

class SkillCreate(SkillBase):
    skill_description: str = ""

class SkillUpdate(BaseModel):
    skill_type: Optional[SkillTypeLiteral] = None
    category_name: Optional[str] = Field(None, max_length=100)
    category_id: Optional[int] = None
    skillname: Optional[str] = Field(None, max_length=150)
    skill_description: Optional[str] = None

class SkillResponse(SkillBase):
    skill_id: int
    skill_description: str

    class Config:
        from_attributes = True
