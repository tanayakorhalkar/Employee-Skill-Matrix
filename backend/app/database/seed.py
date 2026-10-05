from datetime import datetime, timezone
from app.database.session import SessionLocal, engine, Base
from app.models.employee import Employee
from app.models.skill import Skills
from app.models.employee_skill import EmployeeSkill
from app.core.security import get_password_hash

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if already seeded
        if db.query(Employee).count() > 0:
            print("Database already contains employees. Skipping seed.")
            return

        print("Seeding initial database data...")

        # 1. Employees
        admin = Employee(
            fName="Evonence",
            lName="Admin",
            Login_userid="admin",
            Login_password=get_password_hash("Admin@123"),
            is_active=True,
            roles="SUPER_ADMIN",
        )
        manager = Employee(
            fName="Sarah",
            lName="Connor",
            Login_userid="manager",
            Login_password=get_password_hash("Manager@123"),
            is_active=True,
            roles="MANAGER",
        )
        emp1 = Employee(
            fName="John",
            lName="Doe",
            Login_userid="emp1",
            Login_password=get_password_hash("Emp@123"),
            is_active=True,
            roles="EMPLOYEE",
        )
        emp2 = Employee(
            fName="Jane",
            lName="Smith",
            Login_userid="emp2",
            Login_password=get_password_hash("Emp@123"),
            is_active=True,
            roles="EMPLOYEE",
        )
        emp3 = Employee(
            fName="Alex",
            lName="Rivera",
            Login_userid="emp3",
            Login_password=get_password_hash("Emp@123"),
            is_active=True,
            roles="EMPLOYEE",
        )

        db.add_all([admin, manager, emp1, emp2, emp3])
        db.commit()

        # 2. Skills
        now = datetime.now(timezone.utc)
        skills = [
            # Hard Skills - Programming
            Skills(skill_type="Hard skills", category_name="Programming Languages", category_id=101, skillname="Python", skill_description=now),
            Skills(skill_type="Hard skills", category_name="Programming Languages", category_id=101, skillname="Java", skill_description=now),
            Skills(skill_type="Hard skills", category_name="Programming Languages", category_id=101, skillname="TypeScript", skill_description=now),
            Skills(skill_type="Hard skills", category_name="Programming Languages", category_id=101, skillname="Go", skill_description=now),
            # Web Development
            Skills(skill_type="Hard skills", category_name="Web Development", category_id=102, skillname="React", skill_description=now),
            Skills(skill_type="Hard skills", category_name="Web Development", category_id=102, skillname="Next.js", skill_description=now),
            Skills(skill_type="Hard skills", category_name="Web Development", category_id=102, skillname="Tailwind CSS", skill_description=now),
            # Cloud
            Skills(skill_type="Hard skills", category_name="Cloud & Infrastructure", category_id=103, skillname="Google Cloud Platform (GCP)", skill_description=now),
            Skills(skill_type="Hard skills", category_name="Cloud & Infrastructure", category_id=103, skillname="Docker & Containers", skill_description=now),
            Skills(skill_type="Hard skills", category_name="Cloud & Infrastructure", category_id=103, skillname="Kubernetes (GKE)", skill_description=now),
            Skills(skill_type="Hard skills", category_name="Cloud & Infrastructure", category_id=103, skillname="Terraform", skill_description=now),
            # Databases
            Skills(skill_type="Hard skills", category_name="Databases", category_id=104, skillname="PostgreSQL", skill_description=now),
            Skills(skill_type="Hard skills", category_name="Databases", category_id=104, skillname="Redis", skill_description=now),
            # Soft Skills
            Skills(skill_type="Soft skills", category_name="Communication", category_id=201, skillname="Client Presentation", skill_description=now),
            Skills(skill_type="Soft skills", category_name="Communication", category_id=201, skillname="Technical Writing", skill_description=now),
            Skills(skill_type="Soft skills", category_name="Leadership & Delivery", category_id=202, skillname="Project Planning & Scoping", skill_description=now),
            Skills(skill_type="Soft skills", category_name="Leadership & Delivery", category_id=202, skillname="Agile Mentorship", skill_description=now),
        ]
        db.add_all(skills)
        db.commit()

        # 3. Employee Skills Ratings
        ratings = [
            # John Doe (emp1)
            EmployeeSkill(emp_id=emp1.emp_id, skill_id=1, self_rating=5, comments="5+ years backend Python development. [Approved by Manager]", is_active=True),
            EmployeeSkill(emp_id=emp1.emp_id, skill_id=3, self_rating=4, comments="Built full-stack TypeScript services.", is_active=True),
            EmployeeSkill(emp_id=emp1.emp_id, skill_id=5, self_rating=4, comments="Solid experience with React components.", is_active=True),
            EmployeeSkill(emp_id=emp1.emp_id, skill_id=8, self_rating=4, comments="GCP Cloud Associate certified.", is_active=True),
            EmployeeSkill(emp_id=emp1.emp_id, skill_id=12, self_rating=4, comments="PostgreSQL performance tuning.", is_active=True),

            # Jane Smith (emp2)
            EmployeeSkill(emp_id=emp2.emp_id, skill_id=3, self_rating=5, comments="Lead TypeScript architect. [Approved by Manager]", is_active=True),
            EmployeeSkill(emp_id=emp2.emp_id, skill_id=5, self_rating=5, comments="React expert and component designer.", is_active=True),
            EmployeeSkill(emp_id=emp2.emp_id, skill_id=6, self_rating=4, comments="Extensive SSR and Next.js experience.", is_active=True),
            EmployeeSkill(emp_id=emp2.emp_id, skill_id=7, self_rating=5, comments="Mastery in accessible Tailwind styling.", is_active=True),

            # Alex Rivera (emp3)
            EmployeeSkill(emp_id=emp3.emp_id, skill_id=8, self_rating=5, comments="GCP Professional Cloud Architect. [Approved by Manager]", is_active=True),
            EmployeeSkill(emp_id=emp3.emp_id, skill_id=9, self_rating=5, comments="Production containerization and CI/CD.", is_active=True),
            EmployeeSkill(emp_id=emp3.emp_id, skill_id=10, self_rating=4, comments="Kubernetes cluster operator.", is_active=True),
            EmployeeSkill(emp_id=emp3.emp_id, skill_id=11, self_rating=4, comments="Terraform infrastructure as code.", is_active=True),
        ]
        db.add_all(ratings)
        db.commit()

        print("Database seeded successfully!")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
