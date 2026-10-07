import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# In-memory SQLite for tests
os.environ["DATABASE_URL"] = "sqlite:///:memory:"

from app.main import app
from app.database.session import Base, get_db
from app.models.employee import Employee
from app.models.skill import Skills
from app.models.employee_skill import EmployeeSkill
from app.core.security import get_password_hash

engine_test = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine_test)

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine_test)
    yield
    Base.metadata.drop_all(bind=engine_test)

@pytest.fixture
def db_session():
    connection = engine_test.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    # Seed base test users
    admin = Employee(
        fName="Evonence",
        lName="Admin",
        Login_userid="admin",
        Login_password=get_password_hash("Admin@123"),
        roles="SUPER_ADMIN",
        is_active=True,
    )
    manager = Employee(
        fName="Sarah",
        lName="Connor",
        Login_userid="manager",
        Login_password=get_password_hash("Manager@123"),
        roles="MANAGER",
        is_active=True,
    )
    employee = Employee(
        fName="John",
        lName="Doe",
        Login_userid="emp1",
        Login_password=get_password_hash("Emp@123"),
        roles="EMPLOYEE",
        is_active=True,
    )
    session.add_all([admin, manager, employee])

    # Seed a test skill
    skill = Skills(
        skill_type="Hard skills",
        category_name="Programming Languages",
        category_id=101,
        skillname="Python",
        skill_description="General-purpose programming language",
    )
    session.add(skill)
    session.commit()

    yield session

    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
