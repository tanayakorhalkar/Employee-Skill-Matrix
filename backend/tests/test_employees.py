import base64


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


def test_employee_can_save_and_remove_own_profile_picture(client):
    login = client.post(
        "/api/auth/login",
        json={"Login_userid": "emp1", "password": "Emp@123"},
    )
    headers = {"Authorization": f"Bearer {login.json()['access_token']}"}
    picture = "data:image/png;base64," + base64.b64encode(b"\x89PNG\r\n\x1a\nimage-data").decode()

    save_response = client.put(
        f"/api/employees/{login.json()['user']['emp_id']}",
        headers=headers,
        json={"profile_picture": picture},
    )
    assert save_response.status_code == 200
    assert save_response.json()["profile_picture"] == picture

    me_response = client.get("/api/auth/me", headers=headers)
    assert me_response.status_code == 200
    assert me_response.json()["profile_picture"] == picture

    remove_response = client.put(
        f"/api/employees/{login.json()['user']['emp_id']}",
        headers=headers,
        json={"profile_picture": None},
    )
    assert remove_response.status_code == 200
    assert remove_response.json()["profile_picture"] is None


def test_profile_picture_rejects_unsupported_and_oversized_images(client):
    login = client.post(
        "/api/auth/login",
        json={"Login_userid": "emp1", "password": "Emp@123"},
    )
    headers = {"Authorization": f"Bearer {login.json()['access_token']}"}
    endpoint = f"/api/employees/{login.json()['user']['emp_id']}"

    unsupported = client.put(
        endpoint,
        headers=headers,
        json={"profile_picture": "data:image/svg+xml;base64,PHN2Zz4="},
    )
    oversized_data = b"\x89PNG\r\n\x1a\n" + b"x" * (2 * 1024 * 1024)
    oversized = client.put(
        endpoint,
        headers=headers,
        json={"profile_picture": "data:image/png;base64," + base64.b64encode(oversized_data).decode()},
    )

    assert unsupported.status_code == 422
    assert oversized.status_code == 422
