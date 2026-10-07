from app.models.skill import Skills


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
    assert data["comments"].startswith("[Pending manager approval submitted on")

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


def test_manager_can_approve_all_pending_skills_for_one_employee(client, db_session):
    second_skill = Skills(
        skill_type="Hard skills",
        category_name="Programming Languages",
        category_id=101,
        skillname="Rust",
        skill_description="Systems programming language",
    )
    db_session.add(second_skill)
    db_session.commit()

    employee_login = client.post(
        "/api/auth/login",
        json={"Login_userid": "emp1", "password": "Emp@123"},
    )
    employee_headers = {"Authorization": f"Bearer {employee_login.json()['access_token']}"}
    for skill_id in (1, second_skill.skill_id):
        response = client.post(
            "/api/employee-skills",
            headers=employee_headers,
            json={"skill_id": skill_id, "self_rating": 4, "comments": f"Experienced with {skill_id}"},
        )
        assert response.status_code == 201

    manager_login = client.post(
        "/api/auth/login",
        json={"Login_userid": "manager", "password": "Manager@123"},
    )
    manager_headers = {"Authorization": f"Bearer {manager_login.json()['access_token']}"}
    batch_response = client.post(
        "/api/employee-skills/3/review-batch",
        headers=manager_headers,
        json={"action": "APPROVE", "manager_notes": "Reviewed together"},
    )

    assert batch_response.status_code == 200
    assert batch_response.json()["count"] == 2
    assert len(batch_response.json()["unique_ids"]) == 2
    ratings = client.get("/api/employee-skills?emp_id=3", headers=manager_headers).json()
    reviewed_ratings = [rating for rating in ratings if rating["skill_id"] in (1, second_skill.skill_id)]
    assert len(reviewed_ratings) == 2
    assert all(rating["is_active"] for rating in reviewed_ratings)
    assert all(rating["comments"].startswith("[Approved by") for rating in reviewed_ratings)


def test_employee_resubmission_reopens_approval_and_batch_rejects_pending_only(client):
    employee_login = client.post(
        "/api/auth/login",
        json={"Login_userid": "emp1", "password": "Emp@123"},
    )
    employee_headers = {"Authorization": f"Bearer {employee_login.json()['access_token']}"}
    first_submission = client.post(
        "/api/employee-skills",
        headers=employee_headers,
        json={"skill_id": 1, "self_rating": 4, "comments": "First assessment"},
    )
    unique_id = first_submission.json()["unique_id"]

    manager_login = client.post(
        "/api/auth/login",
        json={"Login_userid": "manager", "password": "Manager@123"},
    )
    manager_headers = {"Authorization": f"Bearer {manager_login.json()['access_token']}"}
    client.post(
        f"/api/employee-skills/{unique_id}/review",
        headers=manager_headers,
        json={"action": "APPROVE"},
    )
    resubmission = client.post(
        "/api/employee-skills",
        headers=employee_headers,
        json={"skill_id": 1, "self_rating": 4.5, "comments": "Updated assessment"},
    )
    assert resubmission.status_code == 201
    assert resubmission.json()["comments"].startswith("[Pending manager approval submitted on")

    rejected = client.post(
        "/api/employee-skills/3/review-batch",
        headers=manager_headers,
        json={"action": "REJECT", "manager_notes": "Please provide stronger evidence"},
    )
    assert rejected.status_code == 200
    assert rejected.json()["count"] == 1
    assert rejected.json()["unique_ids"] == [unique_id]
    assert client.get(
        f"/api/employee-skills/{unique_id}",
        headers=manager_headers,
    ).json()["is_active"] is False


def test_batch_rejection_requires_reason(client):
    employee_login = client.post(
        "/api/auth/login",
        json={"Login_userid": "emp1", "password": "Emp@123"},
    )
    client.post(
        "/api/employee-skills",
        headers={"Authorization": f"Bearer {employee_login.json()['access_token']}"},
        json={"skill_id": 1, "self_rating": 4, "comments": "Please review"},
    )
    manager_login = client.post(
        "/api/auth/login",
        json={"Login_userid": "manager", "password": "Manager@123"},
    )
    response = client.post(
        "/api/employee-skills/3/review-batch",
        headers={"Authorization": f"Bearer {manager_login.json()['access_token']}"},
        json={"action": "REJECT"},
    )
    assert response.status_code == 422
