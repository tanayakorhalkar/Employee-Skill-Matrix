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
    ManagerBatchReviewAction,
    EmployeeSkillResponse,
)

router = APIRouter(prefix="/employee-skills", tags=["Employee Skills"])


def _is_pending_review(record: EmployeeSkill) -> bool:
    if not record.is_active:
        return False

    comments = (record.comments or "").strip()
    first_line = comments.splitlines()[0].strip() if comments else ""
    if first_line.startswith("[Pending manager approval"):
        return True

    return not any(
        marker in comments
        for marker in ("[Approved by", "[Rejected by", "[Rating adjusted to")
    )


def _pending_submission_comments(
    comments: Optional[str],
    history: Optional[str],
    submitted_at: datetime,
) -> str:
    submitted_at_str = submitted_at.strftime("%Y-%m-%d %H:%M UTC")
    submission = f"[Pending manager approval submitted on {submitted_at_str}]"
    if comments and comments.strip():
        submission += f"\n{comments.strip()}"
    if history and history.strip() and history.strip() != (comments or "").strip():
        submission += f"\n\n[Previous submission and review history]\n{history.strip()}"
    return submission


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
        if current_user.roles == "EMPLOYEE":
            existing.comments = _pending_submission_comments(
                es_in.comments if es_in.comments is not None else existing.comments,
                existing.comments if es_in.comments is not None else None,
                now,
            )
            existing.is_active = True
        else:
            existing.comments = es_in.comments if es_in.comments is not None else existing.comments
        if current_user.roles != "EMPLOYEE" and es_in.is_active is not None:
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
            comments=(
                _pending_submission_comments(es_in.comments, None, now)
                if current_user.roles == "EMPLOYEE"
                else es_in.comments
            ),
            is_active=True if current_user.roles == "EMPLOYEE" else (es_in.is_active if es_in.is_active is not None else True),
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

    now = datetime.now(timezone.utc)
    if current_user.roles == "EMPLOYEE":
        record.comments = _pending_submission_comments(
            es_in.comments if es_in.comments is not None else record.comments,
            record.comments if es_in.comments is not None else None,
            now,
        )
        record.is_active = True
    record.add_update_timestamp = now
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
    if action == "REJECT" and not (review_in.manager_notes or "").strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="A rejection reason is required.",
        )
    if action == "EDIT" and review_in.reviewed_rating is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="A reviewed rating is required when editing a skill submission.",
        )

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
        note = f"[Approved by {reviewer_name} on {now_str}; rating adjusted to {record.self_rating}/5]"
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
        "self_rating": float(record.self_rating),
        "comments": record.comments,
    }


@router.post("/{emp_id}/review-batch", response_model=dict)
def review_employee_skill_batch(
    emp_id: int,
    review_in: ManagerBatchReviewAction,
    db: Session = Depends(get_db),
    reviewer: Employee = Depends(require_roles(["MANAGER", "SUPER_ADMIN"])),
):
    employee = db.query(Employee).filter(Employee.emp_id == emp_id).first()
    if not employee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found.")

    pending_records = (
        db.query(EmployeeSkill)
        .filter(EmployeeSkill.emp_id == emp_id)
        .with_for_update()
        .all()
    )
    pending_records = [record for record in pending_records if _is_pending_review(record)]
    if not pending_records:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This employee has no pending skill submissions to review.",
        )
    if review_in.action == "REJECT" and not (review_in.manager_notes or "").strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="A rejection reason is required.",
        )

    now = datetime.now(timezone.utc)
    now_str = now.strftime("%Y-%m-%d %H:%M UTC")
    reviewer_name = f"{reviewer.fName} {reviewer.lName}"
    for record in pending_records:
        base_comments = record.comments or ""
        if review_in.action == "APPROVE":
            note = f"[Approved by {reviewer_name} on {now_str}]"
            if review_in.manager_notes:
                note += f" - {review_in.manager_notes}"
            record.is_active = True
        else:
            note = f"[Rejected by {reviewer_name} on {now_str}]"
            if review_in.manager_notes:
                note += f" - Reason: {review_in.manager_notes.strip()}"
            record.is_active = False
        record.comments = f"{note}\n{base_comments}".strip()
        record.add_update_timestamp = now

    db.commit()
    return {
        "message": f"{len(pending_records)} skill submission(s) successfully {review_in.action.lower()}d.",
        "emp_id": emp_id,
        "action": review_in.action,
        "count": len(pending_records),
        "unique_ids": [record.unique_id for record in pending_records],
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
