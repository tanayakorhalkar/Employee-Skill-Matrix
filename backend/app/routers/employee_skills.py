from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from app.core.dependencies import get_current_user, require_roles
from app.database.session import get_db
from app.models.employee import Employee
from app.models.skill import Skills
from app.models.employee_skill import EmployeeSkill
from app.schemas.employee_skill import (
    EmployeeSkillCreate,
    EmployeeSkillUpdate,
    ManagerReviewAction,
    EmployeeSkillResponse,
)

router = APIRouter(prefix="/employee-skills", tags=["Employee Skills"])

@router.get("", response_model=List[EmployeeSkillResponse])
def list_employee_skills(
    emp_id: Optional[int] = None,
    skill_id: Optional[int] = None,
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user),
):
    query = db.query(EmployeeSkill).options(
        joinedload(EmployeeSkill.employee),
        joinedload(EmployeeSkill.skill),
    )

    # RBAC: Employees can only view their own ratings
    if current_user.roles == "EMPLOYEE":
        query = query.filter(EmployeeSkill.emp_id == current_user.emp_id)
    elif emp_id is not None:
        query = query.filter(EmployeeSkill.emp_id == emp_id)

    if skill_id is not None:
        query = query.filter(EmployeeSkill.skill_id == skill_id)
    if is_active is not None:
        query = query.filter(EmployeeSkill.is_active == is_active)

    return query.order_by(EmployeeSkill.unique_id.desc()).all()

@router.get("/{unique_id}", response_model=EmployeeSkillResponse)
def get_employee_skill(
    unique_id: int,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user),
):
    record = db.query(EmployeeSkill).options(
        joinedload(EmployeeSkill.employee),
        joinedload(EmployeeSkill.skill),
    ).filter(EmployeeSkill.unique_id == unique_id).first()

    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Record not found.")

    if current_user.roles == "EMPLOYEE" and record.emp_id != current_user.emp_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot view another employee's rating.")

    return record

@router.post("", response_model=EmployeeSkillResponse, status_code=status.HTTP_201_CREATED)
def create_or_update_employee_skill(
    es_in: EmployeeSkillCreate,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user),
):
    target_emp_id = es_in.emp_id or current_user.emp_id
    if current_user.roles == "EMPLOYEE" and target_emp_id != current_user.emp_id:
        target_emp_id = current_user.emp_id

    # Verify foreign keys
    emp = db.query(Employee).filter(Employee.emp_id == target_emp_id).first()
    if not emp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found.")

    skill = db.query(Skills).filter(Skills.skill_id == es_in.skill_id).first()
    if not skill:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill not found.")

    now = datetime.now(timezone.utc)

    # Check if record already exists for this (emp_id, skill_id)
    existing = db.query(EmployeeSkill).filter(
        EmployeeSkill.emp_id == target_emp_id,
        EmployeeSkill.skill_id == es_in.skill_id,
    ).first()

    if existing:
        existing.self_rating = es_in.self_rating
        existing.comments = es_in.comments if es_in.comments is not None else existing.comments
        if es_in.is_active is not None:
            existing.is_active = es_in.is_active
        existing.add_update_timestamp = now
        db.commit()
        db.refresh(existing)
        return existing
    else:
        new_record = EmployeeSkill(
            skill_id=es_in.skill_id,
            emp_id=target_emp_id,
            self_rating=es_in.self_rating,
            comments=es_in.comments,
            is_active=es_in.is_active if es_in.is_active is not None else True,
            add_update_timestamp=now,
        )
        db.add(new_record)
        db.commit()
        db.refresh(new_record)
        return new_record

@router.put("/{unique_id}", response_model=EmployeeSkillResponse)
def update_employee_skill(
    unique_id: int,
    es_in: EmployeeSkillUpdate,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user),
):
    record = db.query(EmployeeSkill).filter(EmployeeSkill.unique_id == unique_id).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Record not found.")

    if current_user.roles == "EMPLOYEE" and record.emp_id != current_user.emp_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot edit another employee's rating.")

    if es_in.self_rating is not None:
        record.self_rating = es_in.self_rating
    if es_in.comments is not None:
        record.comments = es_in.comments
    if es_in.is_active is not None:
        record.is_active = es_in.is_active

    record.add_update_timestamp = datetime.now(timezone.utc)
    db.commit()
    db.refresh(record)
    return record

@router.post("/{unique_id}/review", response_model=dict)
def review_employee_skill(
    unique_id: int,
    review_in: ManagerReviewAction,
    db: Session = Depends(get_db),
    reviewer: Employee = Depends(require_roles(["MANAGER", "SUPER_ADMIN"])),
):
    record = db.query(EmployeeSkill).filter(EmployeeSkill.unique_id == unique_id).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Record not found.")

    action = review_in.action
    now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    reviewer_name = f"{reviewer.fName} {reviewer.lName}"

    base_comments = record.comments or ""

    if action == "APPROVE":
        note = f"[Approved by {reviewer_name} on {now_str}]"
        if review_in.manager_notes:
            note += f" - {review_in.manager_notes}"
        record.comments = f"{note}\n{base_comments}".strip()
        record.is_active = True

    elif action == "REJECT":
        note = f"[Rejected by {reviewer_name} on {now_str}]"
        if review_in.manager_notes:
            note += f" - Reason: {review_in.manager_notes}"
        record.comments = f"{note}\n{base_comments}".strip()
        record.is_active = False

    elif action == "EDIT":
        if review_in.reviewed_rating is not None:
            record.self_rating = review_in.reviewed_rating
        note = f"[Rating adjusted to {record.self_rating}/5 by {reviewer_name} on {now_str}]"
        if review_in.manager_notes:
            note += f" - Note: {review_in.manager_notes}"
        record.comments = f"{note}\n{base_comments}".strip()
        record.is_active = True

    record.add_update_timestamp = datetime.now(timezone.utc)
    db.commit()
    db.refresh(record)

    return {
        "message": f"Skill submission successfully {action.lower()}d.",
        "unique_id": record.unique_id,
        "is_active": record.is_active,
        "self_rating": record.self_rating,
        "comments": record.comments,
    }

@router.delete("/{unique_id}", status_code=status.HTTP_200_OK)
def delete_employee_skill(
    unique_id: int,
    db: Session = Depends(get_db),
    admin_user: Employee = Depends(require_roles(["SUPER_ADMIN"])),
):
    record = db.query(EmployeeSkill).filter(EmployeeSkill.unique_id == unique_id).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Record not found.")
    db.delete(record)
    db.commit()
    return {"message": f"Employee skill record {unique_id} deleted successfully."}
