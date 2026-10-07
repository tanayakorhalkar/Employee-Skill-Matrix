from datetime import datetime, timezone
from sqlalchemy import Column, Integer, Numeric, Text, Boolean, DateTime, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from app.database.session import Base

class EmployeeSkill(Base):
    __tablename__ = "Employee_skills"
    __table_args__ = (
        CheckConstraint('self_rating >= 0.5 AND self_rating <= 5', name='check_self_rating_range'),
    )

    unique_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    skill_id = Column(Integer, ForeignKey("Skills.skill_id", ondelete="CASCADE"), nullable=False)
    emp_id = Column(Integer, ForeignKey("Employee.emp_id", ondelete="CASCADE"), nullable=False)
    self_rating = Column(Numeric(2, 1), nullable=False)
    comments = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    add_update_timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    employee = relationship("Employee", back_populates="skills")
    skill = relationship("Skills", back_populates="employee_ratings")
