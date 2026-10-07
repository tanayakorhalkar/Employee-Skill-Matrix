from app.core.security import verify_password
from app.models.employee import Employee


def test_login_success(client):
    response = client.post(
        "/api/auth/login",
        json={"Login_userid": "admin", "password": "Admin@123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["Login_userid"] == "admin"
    assert data["user"]["roles"] == "SUPER_ADMIN"
    assert "Login_password" not in data["user"]

def test_login_failure_wrong_password(client):
    response = client.post(
        "/api/auth/login",
        json={"Login_userid": "admin", "password": "WrongPassword"}
    )
    assert response.status_code == 401
    assert "Incorrect username or password" in response.json()["detail"]

def test_login_failure_invalid_user(client):
    response = client.post(
        "/api/auth/login",
        json={"Login_userid": "nonexistent", "password": "Password123"}
    )
    assert response.status_code == 401

def test_public_registration_creates_employee_with_email_username_and_hashed_password(client, db_session):
    response = client.post(
        "/api/auth/register",
        json={
            "fName": "  New ",
            "lName": " Employee ",
            "email": " New.User@Example.com ",
            "password": "StrongPass123",
            "roles": "SUPER_ADMIN",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["fName"] == "New"
    assert data["lName"] == "Employee"
    assert data["Login_userid"] == "new.user@example.com"
    assert data["roles"] == "EMPLOYEE"
    assert data["is_active"] is True
    assert "Login_password" not in data

    employee = db_session.query(Employee).filter_by(Login_userid="new.user@example.com").one()
    assert employee.Login_password != "StrongPass123"
    assert verify_password("StrongPass123", employee.Login_password)

    login_response = client.post(
        "/api/auth/login",
        json={"Login_userid": "NEW.USER@EXAMPLE.COM", "password": "StrongPass123"},
    )
    assert login_response.status_code == 200
    assert login_response.json()["user"]["emp_id"] == data["emp_id"]

def test_public_registration_rejects_duplicate_email_case_insensitively(client):
    client.post(
        "/api/auth/register",
        json={
            "fName": "New",
            "lName": "Employee",
            "email": "New.User@example.com",
            "password": "StrongPass123",
        },
    )
    duplicate = client.post(
        "/api/auth/register",
        json={
            "fName": "Other",
            "lName": "Person",
            "email": "new.user@EXAMPLE.com",
            "password": "OtherPass123",
        },
    )
    assert duplicate.status_code == 409

def test_public_registration_rejects_invalid_email_and_short_password(client):
    invalid_email = client.post(
        "/api/auth/register",
        json={
            "fName": "New",
            "lName": "Employee",
            "email": "not-an-email",
            "password": "StrongPass123",
        },
    )
    short_password = client.post(
        "/api/auth/register",
        json={
            "fName": "New",
            "lName": "Employee",
            "email": "new@example.com",
            "password": "short",
        },
    )
    assert invalid_email.status_code == 422
    assert short_password.status_code == 422

def test_get_current_user_me(client):
    # Log in
    res = client.post("/api/auth/login", json={"Login_userid": "emp1", "password": "Emp@123"})
    token = res.json()["access_token"]

    # Call /me with token
    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["Login_userid"] == "emp1"
    assert me_res.json()["roles"] == "EMPLOYEE"

def test_protected_route_without_token(client):
    response = client.get("/api/employees")
    assert response.status_code == 401
