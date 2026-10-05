def test_list_skills(client):
    login_res = client.post("/api/auth/login", json={"Login_userid": "emp1", "password": "Emp@123"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/skills", headers=headers)
    assert res.status_code == 200
    assert len(res.json()) >= 1

def test_admin_create_skill(client):
    login_res = client.post("/api/auth/login", json={"Login_userid": "admin", "password": "Admin@123"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = client.post(
        "/api/skills",
        headers=headers,
        json={
            "skill_type": "Hard skills",
            "category_name": "Cloud Platforms",
            "category_id": 102,
            "skillname": "Google Cloud Run",
        }
    )
    assert res.status_code == 201
    assert res.json()["skillname"] == "Google Cloud Run"
    assert "skill_description" in res.json()

def test_employee_cannot_create_skill(client):
    login_res = client.post("/api/auth/login", json={"Login_userid": "emp1", "password": "Emp@123"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = client.post(
        "/api/skills",
        headers=headers,
        json={
            "skill_type": "Hard skills",
            "category_name": "Databases",
            "category_id": 103,
            "skillname": "MongoDB",
        }
    )
    assert res.status_code == 403
