def test_super_admin_create_employee(client):
    # Login as admin
    login_res = client.post("/api/auth/login", json={"Login_userid": "admin", "password": "Admin@123"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    create_res = client.post(
        "/api/employees",
        headers=headers,
        json={
            "fName": "Test",
            "lName": "Worker",
            "Login_userid": "testworker",
            "password": "Worker@123",
            "roles": "EMPLOYEE",
            "is_active": True,
        }
    )
    assert create_res.status_code == 201
    data = create_res.json()
    assert data["Login_userid"] == "testworker"
    assert data["roles"] == "EMPLOYEE"
    assert "Login_password" not in data

def test_employee_cannot_create_employee(client):
    # Login as normal employee
    login_res = client.post("/api/auth/login", json={"Login_userid": "emp1", "password": "Emp@123"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = client.post(
        "/api/employees",
        headers=headers,
        json={
            "fName": "Hacker",
            "lName": "User",
            "Login_userid": "hacker",
            "password": "Password123",
            "roles": "SUPER_ADMIN",
        }
    )
    assert res.status_code == 403

def test_list_employees(client):
    login_res = client.post("/api/auth/login", json={"Login_userid": "admin", "password": "Admin@123"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/employees", headers=headers)
    assert res.status_code == 200
    assert len(res.json()) >= 3
