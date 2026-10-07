from collections import Counter
from decimal import Decimal
from typing import Dict

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload

from app.core.dependencies import get_current_user
from app.database.session import get_db
from app.models.employee import Employee
from app.models.employee_skill import EmployeeSkill
from app.models.skill import Skills
from app.schemas.employee_skill import EmployeeSkillResponse
from app.schemas.skill import SkillResponse

router = APIRouter(prefix="/stats", tags=["Analytics"])


@router.get("/dashboard")
def dashboard_stats(
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user),
) -> Dict:
    skills = db.query(Skills).all()
    records = (
        db.query(EmployeeSkill)
        .options(joinedload(EmployeeSkill.employee), joinedload(EmployeeSkill.skill))
        .filter(EmployeeSkill.is_active.is_(True))
        .order_by(EmployeeSkill.add_update_timestamp.desc())
        .all()
    )

    if current_user.roles == "EMPLOYEE":
        own_records = [record for record in records if record.emp_id == current_user.emp_id]
        counts = Counter(
            min(5, max(1, int(record.self_rating + Decimal("0.5"))))
            for record in own_records
        )
        return {
            "totalRatedSkills": len(own_records),
            "totalAvailableSkills": len(skills),
            "averageRating": round(
                float(sum(record.self_rating for record in own_records) / len(own_records)), 1
            ) if own_records else 0,
            "ratingDistribution": {rating: counts[rating] for rating in range(1, 6)},
            "recentUpdates": [
                EmployeeSkillResponse.model_validate(record).model_dump(mode="json")
                for record in own_records[:5]
            ],
        }

    active_employees = db.query(Employee).filter(Employee.is_active.is_(True)).count()
    counts = Counter(
        min(5, max(1, int(record.self_rating + Decimal("0.5"))))
        for record in records
    )
    by_skill = {
        skill.skill_id: {"skill": skill, "count": 0, "sum": 0}
        for skill in skills
    }
    for record in records:
        item = by_skill.get(record.skill_id)
        if item:
            item["count"] += 1
            item["sum"] += float(record.self_rating)

    skill_stats = [
        {
            "skill": SkillResponse.model_validate(item["skill"]).model_dump(mode="json"),
            "count": item["count"],
            "avgRating": round(item["sum"] / item["count"], 1) if item["count"] else 0,
        }
        for item in by_skill.values()
    ]
    strongest = sorted(
        (item for item in skill_stats if item["count"]),
        key=lambda item: item["avgRating"],
        reverse=True,
    )[:5]
    gaps = sorted(
        (item for item in skill_stats if not item["count"] or item["avgRating"] < 3),
        key=lambda item: item["count"],
    )[:5]

    return {
        "totalEmployees": active_employees,
        "totalSkills": len(skills),
        "totalRatingsRecorded": len(records),
        "averageRating": round(
            float(sum(record.self_rating for record in records) / len(records)), 1
        ) if records else 0,
        "ratingDistribution": {rating: counts[rating] for rating in range(1, 6)},
        "strongestSkills": strongest,
        "skillGaps": gaps,
    }
