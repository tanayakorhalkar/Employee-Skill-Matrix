from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship
from app.database.session import Base

class Skills(Base):
    __tablename__ = "Skills"

    skill_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    skill_type = Column(String(100), nullable=False)  # "Hard skills" / "Soft skills"
    category_name = Column(String(100), nullable=False)
    category_id = Column(Integer, nullable=False)
    skillname = Column(String(150), nullable=False)
    skill_description = Column(Text, default="", server_default="", nullable=False)

    # Relationships (within the 3 tables)
    employee_ratings = relationship("EmployeeSkill", back_populates="skill", cascade="all, delete-orphan")
