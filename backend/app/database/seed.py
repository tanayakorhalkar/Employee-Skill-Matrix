import json
from pathlib import Path

from app.database.session import SessionLocal, engine, Base
from app.models.employee import Employee
from app.models.skill import Skills
from app.models.employee_skill import EmployeeSkill
from app.core.security import get_password_hash

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        print("Ensuring initial PostgreSQL data is available...")

        # Add sample accounts that may be missing from an older seeded database.
        initial_employees = [
            ("admin", "Evonence", "Admin", "SUPER_ADMIN", "Admin@123"),
            ("superadmin@evonence.com", "Tanaya", "Korhalkar", "SUPER_ADMIN", "Admin@123"),
            ("manager", "Sanket", "Dantkale", "MANAGER", "Manager@123"),
            ("tanaya.korhalkar@evonence.com", "Tanaya", "Korhalkar", "EMPLOYEE", "Emp@123"),
            ("ayush.joshi@evonence.com", "Ayush", "Joshi", "EMPLOYEE", "Emp@123"),
            ("siddhesh.bhor@evonence.com", "Siddhesh", "Bhor", "EMPLOYEE", "Emp@123"),
            ("vivek.dabhade@evonence.com", "Vivek", "Dabhade", "EMPLOYEE", "Emp@123"),
        ]
        legacy_employee_logins = {
            "emp1": "tanaya.korhalkar@evonence.com",
            "emp2": "ayush.joshi@evonence.com",
            "emp3": "siddhesh.bhor@evonence.com",
            "emp4": "vivek.dabhade@evonence.com",
        }
        for old_login, email_login in legacy_employee_logins.items():
            legacy_employee = db.query(Employee).filter(Employee.Login_userid == old_login).first()
            email_owner = db.query(Employee).filter(Employee.Login_userid == email_login).first()
            if legacy_employee and email_owner and legacy_employee.emp_id != email_owner.emp_id:
                raise ValueError(
                    f"Cannot migrate '{old_login}' to '{email_login}': that email is already assigned "
                    "to another employee."
                )
            if legacy_employee:
                legacy_employee.Login_userid = email_login

        legacy_superadmin = db.query(Employee).filter(Employee.Login_userid == "tanaya").first()
        superadmin_email = "superadmin@evonence.com"
        email_owner = db.query(Employee).filter(Employee.Login_userid == superadmin_email).first()
        if legacy_superadmin and email_owner and legacy_superadmin.emp_id != email_owner.emp_id:
            raise ValueError(
                f"Cannot migrate 'tanaya' to '{superadmin_email}': that email is already assigned "
                "to another employee."
            )
        if legacy_superadmin:
            legacy_superadmin.Login_userid = superadmin_email

        for login_id, first_name, last_name, role, password in initial_employees:
            existing = db.query(Employee).filter(Employee.Login_userid == login_id).first()
            if existing is None:
                db.add(Employee(
                    fName=first_name,
                    lName=last_name,
                    Login_userid=login_id,
                    Login_password=get_password_hash(password),
                    is_active=True,
                    roles=role,
                ))
        db.commit()

        employees_by_login = {
            employee.Login_userid: employee
            for employee in db.query(Employee).all()
        }

        # Preserve existing IDs for employee ratings while refreshing the catalog data.
        catalog_path = Path(__file__).resolve().parents[2] / "data" / "centralized_skills.json"
        with catalog_path.open(encoding="utf-8-sig") as catalog_file:
            catalog = json.load(catalog_file)

        existing_skills = {
            skill.skillname.casefold(): skill
            for skill in db.query(Skills).all()
        }
        legacy_names = {
            "google cloud platform": "Google Cloud Platform (GCP)",
            "docker": "Docker & Containers",
            "kubernetes": "Kubernetes (GKE)",
        }
        inserted = 0
        updated = 0
        for item in catalog:
            name_key = item["skillname"].casefold()
            skill = existing_skills.get(name_key)
            if skill is None and name_key in legacy_names:
                skill = existing_skills.get(legacy_names[name_key].casefold())

            if skill is None:
                skill = Skills(skillname=item["skillname"])
                db.add(skill)
                existing_skills[name_key] = skill
                inserted += 1
            else:
                updated += 1

            skill.skill_type = item["skill_type"]
            skill.category_name = item["category_name"]
            skill.category_id = item["category_id"]
            skill.skillname = item["skillname"]
            skill.skill_description = item["skill_description"]

        db.commit()
        print(
            f"Skill catalog synchronized: {len(catalog)} unique workbook skills, "
            f"{inserted} added, {updated} updated. Existing non-catalog skills and ratings were retained."
        )

        # 3. Employee Skills Ratings
        ratings = [
            ("tanaya.korhalkar@evonence.com", "Python", 5, "5+ years backend Python development. [Approved by Manager]"),
            ("tanaya.korhalkar@evonence.com", "TypeScript", 4, "Built full-stack TypeScript services."),
            ("tanaya.korhalkar@evonence.com", "React", 4, "Solid experience with React components."),
            ("tanaya.korhalkar@evonence.com", "Google Cloud Platform", 4, "GCP Cloud Associate certified."),
            ("tanaya.korhalkar@evonence.com", "PostgreSQL", 4, "PostgreSQL performance tuning."),
            ("ayush.joshi@evonence.com", "TypeScript", 5, "Lead TypeScript architect. [Approved by Manager]"),
            ("ayush.joshi@evonence.com", "React", 5, "React expert and component designer."),
            ("ayush.joshi@evonence.com", "Next.js", 4, "Extensive SSR and Next.js experience."),
            ("ayush.joshi@evonence.com", "Tailwind CSS", 5, "Mastery in accessible Tailwind styling."),
            ("siddhesh.bhor@evonence.com", "Google Cloud Platform", 5, "GCP Professional Cloud Architect. [Approved by Manager]"),
            ("siddhesh.bhor@evonence.com", "Docker", 5, "Production containerization and CI/CD."),
            ("siddhesh.bhor@evonence.com", "Kubernetes", 4, "Kubernetes cluster operator."),
            ("siddhesh.bhor@evonence.com", "Terraform", 4, "Terraform infrastructure as code."),
        ]
        if db.query(EmployeeSkill).count() == 0:
            skills_by_name = {
                skill.skillname: skill.skill_id
                for skill in db.query(Skills).all()
            }
            db.add_all([
                EmployeeSkill(
                    emp_id=employees_by_login[login_id].emp_id,
                    skill_id=skills_by_name[skill_name],
                    self_rating=rating,
                    comments=comments,
                    is_active=True,
                )
                for login_id, skill_name, rating, comments in ratings
            ])
            db.commit()

        print("Initial employees, skills, and ratings are available.")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
