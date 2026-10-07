from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.dependencies import require_roles
from app.database.seed import seed_database
from app.database.session import get_db
from app.models.employee import Employee
from app.models.employee_skill import EmployeeSkill
from app.models.skill import Skills

router = APIRouter(prefix="/system", tags=["System"])


@router.post("/reset-seed")
def reset_seed(
    db: Session = Depends(get_db),
    admin: Employee = Depends(require_roles(["SUPER_ADMIN"])),
):
    db.query(EmployeeSkill).delete(synchronize_session=False)
    db.query(Skills).delete(synchronize_session=False)
    db.query(Employee).delete(synchronize_session=False)
    db.commit()
    if db.bind.dialect.name == "postgresql":
        for table, column in (
            ("Employee", "emp_id"),
            ("Skills", "skill_id"),
            ("Employee_skills", "unique_id"),
        ):
            db.execute(
                text("SELECT setval(pg_get_serial_sequence(:table_name, :column_name), 1, false)"),
                {"table_name": f'"{table}"', "column_name": column},
            )
        db.commit()
    seed_database()
    return {"message": "Database reset to initial sample seed successfully."}
