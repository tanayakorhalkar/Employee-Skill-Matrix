from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.dependencies import get_current_user, require_roles
from app.core.security import get_password_hash
from app.database.session import get_db
from app.models.employee import Employee
from app.schemas.employee import EmployeeCreate, EmployeeUpdate, EmployeeResponse

router = APIRouter(prefix="/employees", tags=["Employees"])

@router.get("", response_model=List[EmployeeResponse])
def list_employees(
    search: Optional[str] = None,
    role: Optional[str] = None,
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user),
):
    query = db.query(Employee)

    if is_active is not None:
        query = query.filter(Employee.is_active == is_active)
    if role:
        query = query.filter(Employee.roles == role)
    if search:
        search_fmt = f"%{search}%"
        query = query.filter(
            (Employee.fName.ilike(search_fmt)) |
            (Employee.lName.ilike(search_fmt)) |
            (Employee.Login_userid.ilike(search_fmt))
        )

    return query.order_by(Employee.emp_id).all()

@router.get("/{emp_id}", response_model=EmployeeResponse)
def get_employee(
    emp_id: int,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user),
):
    if current_user.roles == "EMPLOYEE" and current_user.emp_id != emp_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot view another employee profile.",
        )

    employee = db.query(Employee).filter(Employee.emp_id == emp_id).first()
    if not employee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found.")
    return employee

@router.post("", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
def create_employee(
    emp_in: EmployeeCreate,
    db: Session = Depends(get_db),
    admin_user: Employee = Depends(require_roles(["SUPER_ADMIN"])),
):
    existing = db.query(Employee).filter(Employee.Login_userid == emp_in.Login_userid).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Login userid '{emp_in.Login_userid}' already exists.",
        )

    new_emp = Employee(
        fName=emp_in.fName,
        lName=emp_in.lName,
        Login_userid=emp_in.Login_userid,
        Login_password=get_password_hash(emp_in.password),
        roles=emp_in.roles,
        is_active=emp_in.is_active,
    )
    db.add(new_emp)
    db.commit()
    db.refresh(new_emp)
    return new_emp

@router.put("/{emp_id}", response_model=EmployeeResponse)
def update_employee(
    emp_id: int,
    emp_in: EmployeeUpdate,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user),
):
    is_self = current_user.emp_id == emp_id
    is_admin = current_user.roles == "SUPER_ADMIN"

    if not is_self and not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Unauthorized to update this employee.",
        )

    employee = db.query(Employee).filter(Employee.emp_id == emp_id).first()
    if not employee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found.")

    if emp_in.fName is not None:
        employee.fName = emp_in.fName
    if emp_in.lName is not None:
        employee.lName = emp_in.lName
    if emp_in.password:
        employee.Login_password = get_password_hash(emp_in.password)
    if "profile_picture" in emp_in.model_fields_set:
        employee.profile_picture = emp_in.profile_picture

    if is_admin:
        if emp_in.Login_userid and emp_in.Login_userid != employee.Login_userid:
            dup = db.query(Employee).filter(Employee.Login_userid == emp_in.Login_userid).first()
            if dup:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Login userid already taken.")
            employee.Login_userid = emp_in.Login_userid
        if emp_in.roles is not None:
            employee.roles = emp_in.roles
        if emp_in.is_active is not None:
            employee.is_active = emp_in.is_active

    db.commit()
    db.refresh(employee)
    return employee

@router.delete("/{emp_id}", status_code=status.HTTP_200_OK)
def delete_employee(
    emp_id: int,
    db: Session = Depends(get_db),
    admin_user: Employee = Depends(require_roles(["SUPER_ADMIN"])),
):
    employee = db.query(Employee).filter(Employee.emp_id == emp_id).first()
    if not employee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found.")
    db.delete(employee)
    db.commit()
    return {"message": f"Employee {emp_id} successfully deleted."}
