-- =====================================================================
-- EVONENCE EMPLOYEE SKILL MATRIX - POSTGRESQL SCHEMA DEFINITION
-- Strict 3-Table Architecture: Employee, Skills, Employee_skills
-- =====================================================================

-- Drop existing tables if re-creating
DROP TABLE IF EXISTS Employee_skills CASCADE;
DROP TABLE IF EXISTS Skills CASCADE;
DROP TABLE IF EXISTS Employee CASCADE;

-- 1. Employee Table
CREATE TABLE Employee (
    emp_id SERIAL PRIMARY KEY,
    "fName" VARCHAR(100) NOT NULL,
    "lName" VARCHAR(100) NOT NULL,
    "Login_userid" VARCHAR(100) UNIQUE NOT NULL,
    "Login_password" VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_on TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_on TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    last_logged_in TIMESTAMPTZ,
    roles VARCHAR(50) NOT NULL CHECK (roles IN ('SUPER_ADMIN', 'MANAGER', 'EMPLOYEE')),
    profile_picture TEXT
);

CREATE INDEX idx_employee_login ON Employee(LOWER("Login_userid"));
CREATE INDEX idx_employee_role ON Employee(roles);

-- 2. Skills Table (Competency Taxonomy)
CREATE TABLE Skills (
    skill_id SERIAL PRIMARY KEY,
    skill_type VARCHAR(50) NOT NULL CHECK (skill_type IN ('Technical skills', 'Soft skills')),
    category_name VARCHAR(100) NOT NULL,
    category_id INT NOT NULL,
    skillname VARCHAR(100) NOT NULL,
    skill_description TEXT NOT NULL DEFAULT ''
);

CREATE INDEX idx_skills_type ON Skills(skill_type);
CREATE INDEX idx_skills_category ON Skills(category_name);

-- 3. Employee_skills Table (Evaluations, Reviews, and Ratings)
CREATE TABLE Employee_skills (
    unique_id SERIAL PRIMARY KEY,
    skill_id INT NOT NULL REFERENCES Skills(skill_id) ON DELETE CASCADE,
    emp_id INT NOT NULL REFERENCES Employee(emp_id) ON DELETE CASCADE,
    self_rating NUMERIC(2, 1) NOT NULL CHECK (self_rating >= 0.5 AND self_rating <= 5.0),
    comments TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    add_update_timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_emp_skill UNIQUE(emp_id, skill_id)
);

CREATE INDEX idx_emp_skills_empid ON Employee_skills(emp_id);
CREATE INDEX idx_emp_skills_skillid ON Employee_skills(skill_id);
