from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from app.database.session import Base

class Employee(Base):
    __tablename__ = "Employee"

    emp_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    fName = Column(String(100), nullable=False)
    lName = Column(String(100), nullable=False)
    Login_userid = Column(String(100), unique=True, index=True, nullable=False)
    Login_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_on = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_on = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
    last_logged_in = Column(DateTime, nullable=True)
    roles = Column(String(50), nullable=False)  # SUPER_ADMIN, MANAGER, EMPLOYEE

    # Relationships (within the 3 tables)
    skills = relationship("EmployeeSkill", back_populates="employee", cascade="all, delete-orphan")
