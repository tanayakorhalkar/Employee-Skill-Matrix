def get_token(client, login_id, password):
    response = client.post(
        "/api/auth/login",
        json={"Login_userid": login_id, "password": password},
    )
    assert response.status_code == 200
    return response.json()["access_token"]


def test_manager_dashboard_stats_use_database_records(client, db_session):
    from app.models.employee import Employee
    from app.models.employee_skill import EmployeeSkill
    from app.models.skill import Skills

    employee = db_session.query(Employee).filter_by(Login_userid="emp1").one()
    skill = db_session.query(Skills).filter_by(skillname="Python").one()
    db_session.add(EmployeeSkill(
        emp_id=employee.emp_id,
        skill_id=skill.skill_id,
        self_rating=4.5,
        comments="Production experience",
        is_active=True,
    ))
    db_session.commit()

    token = get_token(client, "manager", "Manager@123")
    response = client.get(
        "/api/stats/dashboard",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["totalEmployees"] == 3
    assert data["totalSkills"] == 1
    assert data["totalRatingsRecorded"] == 1
    assert data["averageRating"] == 4.5
    assert data["strongestSkills"][0]["skill"]["skillname"] == "Python"


def test_employee_dashboard_stats_only_include_own_ratings(client, db_session):
    from app.models.employee import Employee
    from app.models.employee_skill import EmployeeSkill
    from app.models.skill import Skills

    employee = db_session.query(Employee).filter_by(Login_userid="emp1").one()
    skill = db_session.query(Skills).filter_by(skillname="Python").one()
    db_session.add(EmployeeSkill(
        emp_id=employee.emp_id,
        skill_id=skill.skill_id,
        self_rating=3.5,
        is_active=True,
    ))
    db_session.commit()

    token = get_token(client, "emp1", "Emp@123")
    response = client.get(
        "/api/stats/dashboard",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    assert response.json()["totalRatedSkills"] == 1
    assert response.json()["averageRating"] == 3.5


def test_employee_skill_submission_accepts_half_star_ratings(client):
    token = get_token(client, "emp1", "Emp@123")
    response = client.post(
        "/api/employee-skills",
        headers={"Authorization": f"Bearer {token}"},
        json={"skill_id": 1, "self_rating": 4.5, "comments": "Production experience"},
    )

    assert response.status_code == 201
    assert response.json()["self_rating"] == 4.5
