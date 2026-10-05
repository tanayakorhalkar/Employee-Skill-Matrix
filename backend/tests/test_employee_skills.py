def test_employee_rate_skill_1_to_5(client):
    # Login as employee
    login_res = client.post("/api/auth/login", json={"Login_userid": "emp1", "password": "Emp@123"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Submit valid rating
    rate_res = client.post(
        "/api/employee-skills",
        headers=headers,
        json={
            "skill_id": 1,
            "self_rating": 4,
            "comments": "Solid 4 years in Python asynchronous programming.",
        }
    )
    assert rate_res.status_code == 201
    data = rate_res.json()
    assert data["self_rating"] == 4
    assert data["is_active"] is True
    assert "add_update_timestamp" in data

def test_rating_validation_fails_outside_1_to_5(client):
    login_res = client.post("/api/auth/login", json={"Login_userid": "emp1", "password": "Emp@123"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Rating 6 is invalid
    res_high = client.post(
        "/api/employee-skills",
        headers=headers,
        json={"skill_id": 1, "self_rating": 6}
    )
    assert res_high.status_code == 422 or res_high.status_code == 400

    # Rating 0 is invalid
    res_low = client.post(
        "/api/employee-skills",
        headers=headers,
        json={"skill_id": 1, "self_rating": 0}
    )
    assert res_low.status_code == 422 or res_low.status_code == 400

def test_manager_review_workflow(client):
    # 1. Employee rates skill
    emp_login = client.post("/api/auth/login", json={"Login_userid": "emp1", "password": "Emp@123"})
    emp_token = emp_login.json()["access_token"]
    rate_res = client.post(
        "/api/employee-skills",
        headers={"Authorization": f"Bearer {emp_token}"},
        json={"skill_id": 1, "self_rating": 5, "comments": "Python expert"}
    )
    unique_id = rate_res.json()["unique_id"]

    # 2. Manager logs in
    mgr_login = client.post("/api/auth/login", json={"Login_userid": "manager", "password": "Manager@123"})
    mgr_token = mgr_login.json()["access_token"]
    mgr_headers = {"Authorization": f"Bearer {mgr_token}"}

    # 3. Manager approves rating
    approve_res = client.post(
        f"/api/employee-skills/{unique_id}/review",
        headers=mgr_headers,
        json={"action": "APPROVE", "manager_notes": "Verified in Q3 production release"}
    )
    assert approve_res.status_code == 200
    assert "approved" in approve_res.json()["message"].lower()
    assert "[Approved by" in approve_res.json()["comments"]

    # 4. Manager edits/adjusts rating
    edit_res = client.post(
        f"/api/employee-skills/{unique_id}/review",
        headers=mgr_headers,
        json={"action": "EDIT", "reviewed_rating": 4, "manager_notes": "Needs more GCP experience"}
    )
    assert edit_res.status_code == 200
    assert edit_res.json()["self_rating"] == 4

    # 5. Manager rejects rating
    reject_res = client.post(
        f"/api/employee-skills/{unique_id}/review",
        headers=mgr_headers,
        json={"action": "REJECT", "manager_notes": "Skill discontinued"}
    )
    assert reject_res.status_code == 200
    assert reject_res.json()["is_active"] is False
