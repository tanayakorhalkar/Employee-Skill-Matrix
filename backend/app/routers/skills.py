from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.dependencies import get_current_user, require_roles
from app.database.session import get_db
from app.models.employee import Employee
from app.models.skill import Skills
from app.schemas.skill import SkillCreate, SkillUpdate, SkillResponse

router = APIRouter(prefix="/skills", tags=["Skills"])

@router.get("", response_model=List[SkillResponse])
def list_skills(
    search: Optional[str] = None,
    skill_type: Optional[str] = None,
    category_name: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user),
):
    query = db.query(Skills)
    if skill_type:
        query = query.filter(Skills.skill_type.ilike(skill_type))
    if category_name:
        query = query.filter(Skills.category_name.ilike(category_name))
    if search:
        search_fmt = f"%{search}%"
        query = query.filter(
            (Skills.skillname.ilike(search_fmt)) |
            (Skills.category_name.ilike(search_fmt)) |
            (Skills.skill_type.ilike(search_fmt))
        )
    return query.order_by(Skills.skill_type, Skills.category_id, Skills.skill_id).all()

@router.get("/{skill_id}", response_model=SkillResponse)
def get_skill(
    skill_id: int,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user),
):
    skill = db.query(Skills).filter(Skills.skill_id == skill_id).first()
    if not skill:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill not found.")
    return skill

@router.post("", response_model=SkillResponse, status_code=status.HTTP_201_CREATED)
def create_skill(
    skill_in: SkillCreate,
    db: Session = Depends(get_db),
    admin_user: Employee = Depends(require_roles(["SUPER_ADMIN"])),
):
    new_skill = Skills(
        skill_type=skill_in.skill_type,
        category_name=skill_in.category_name,
        category_id=skill_in.category_id,
        skillname=skill_in.skillname,
        skill_description=datetime.now(timezone.utc),  # schema mandates TIMESTAMP
    )
    db.add(new_skill)
    db.commit()
    db.refresh(new_skill)
    return new_skill

@router.put("/{skill_id}", response_model=SkillResponse)
def update_skill(
    skill_id: int,
    skill_in: SkillUpdate,
    db: Session = Depends(get_db),
    admin_user: Employee = Depends(require_roles(["SUPER_ADMIN"])),
):
    skill = db.query(Skills).filter(Skills.skill_id == skill_id).first()
    if not skill:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill not found.")

    if skill_in.skill_type is not None:
        skill.skill_type = skill_in.skill_type
    if skill_in.category_name is not None:
        skill.category_name = skill_in.category_name
    if skill_in.category_id is not None:
        skill.category_id = skill_in.category_id
    if skill_in.skillname is not None:
        skill.skillname = skill_in.skillname

    db.commit()
    db.refresh(skill)
    return skill

@router.delete("/{skill_id}", status_code=status.HTTP_200_OK)
def delete_skill(
    skill_id: int,
    db: Session = Depends(get_db),
    admin_user: Employee = Depends(require_roles(["SUPER_ADMIN"])),
):
    skill = db.query(Skills).filter(Skills.skill_id == skill_id).first()
    if not skill:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill not found.")
    db.delete(skill)
    db.commit()
    return {"message": f"Skill {skill_id} deleted successfully."}
