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
