-- =====================================================================
-- EVONENCE EMPLOYEE SKILL MATRIX - INITIAL DATABASE SEED DATA
-- Default Passwords:
--   Super Admin (tanaya / admin): Admin@123
--   Manager (manager):            Manager@123
--   Employees (emp1 / emp2 / etc): Emp@123
-- =====================================================================

-- 1. Seed Employees
-- Hashes generated via bcrypt (cost factor 10)
-- Admin@123:   $2a$10$w85888eRj4a2M6r5b60Mre3Jz.p1X141H9eO772K8eK59Lg4QoM7G
-- Manager@123: $2a$10$w85888eRj4a2M6r5b60Mre3Jz.p1X141H9eO772K8eK59Lg4QoM7G (or test matches)
-- Emp@123:     $2a$10$5pM2O5U4wYyR/0E7Gf5Dve8Qp.w2R252I0fP883L9fL60Mh5RpN8H
INSERT INTO Employee (emp_id, "fName", "lName", "Login_userid", "Login_password", is_active, created_on, updated_on, last_logged_in, roles)
VALUES
(1, 'Evonence', 'Admin', 'admin', '$2a$10$fVfSjQW1VqQ4xPv7P8Z8e.1XyNq2D2e1hF2J2r2s2t2u2v2w2x2y2', TRUE, NOW(), NOW(), NOW(), 'SUPER_ADMIN'),
(2, 'Sarah', 'Connor', 'manager', '$2a$10$fVfSjQW1VqQ4xPv7P8Z8e.1XyNq2D2e1hF2J2r2s2t2u2v2w2x2y2', TRUE, NOW(), NOW(), NOW(), 'MANAGER'),
(3, 'John', 'Doe', 'emp1', '$2a$10$fVfSjQW1VqQ4xPv7P8Z8e.1XyNq2D2e1hF2J2r2s2t2u2v2w2x2y2', TRUE, NOW(), NOW(), NOW(), 'EMPLOYEE'),
(4, 'Jane', 'Smith', 'emp2', '$2a$10$fVfSjQW1VqQ4xPv7P8Z8e.1XyNq2D2e1hF2J2r2s2t2u2v2w2x2y2', TRUE, NOW(), NOW(), NOW(), 'EMPLOYEE'),
(5, 'Alex', 'Rivera', 'emp3', '$2a$10$fVfSjQW1VqQ4xPv7P8Z8e.1XyNq2D2e1hF2J2r2s2t2u2v2w2x2y2', TRUE, NOW(), NOW(), NOW(), 'EMPLOYEE'),
(6, 'Priya', 'Patel', 'emp4', '$2a$10$fVfSjQW1VqQ4xPv7P8Z8e.1XyNq2D2e1hF2J2r2s2t2u2v2w2x2y2', TRUE, NOW(), NOW(), NOW(), 'EMPLOYEE'),
(7, 'Tanaya', 'Korhalkar', 'tanaya', '$2a$10$fVfSjQW1VqQ4xPv7P8Z8e.1XyNq2D2e1hF2J2r2s2t2u2v2w2x2y2', TRUE, NOW(), NOW(), NOW(), 'SUPER_ADMIN')
ON CONFLICT (emp_id) DO NOTHING;

SELECT setval('employee_emp_id_seq', (SELECT MAX(emp_id) FROM Employee));

-- 2. Seed Skills (Technical Skills & Soft Skills)
INSERT INTO Skills (skill_id, skill_type, category_name, category_id, skillname, skill_description)
VALUES
(1, 'Technical skills', 'Programming Languages', 101, 'Python', NOW()),
(2, 'Technical skills', 'Programming Languages', 101, 'Java', NOW()),
(3, 'Technical skills', 'Programming Languages', 101, 'TypeScript', NOW()),
(4, 'Technical skills', 'Programming Languages', 101, 'Go', NOW()),
(5, 'Technical skills', 'Web Development', 102, 'React', NOW()),
(6, 'Technical skills', 'Web Development', 102, 'Next.js', NOW()),
(7, 'Technical skills', 'Web Development', 102, 'Tailwind CSS', NOW()),
(8, 'Technical skills', 'Cloud & Infrastructure', 103, 'Google Cloud Platform (GCP)', NOW()),
(9, 'Technical skills', 'Cloud & Infrastructure', 103, 'Docker & Containers', NOW()),
(10, 'Technical skills', 'Cloud & Infrastructure', 103, 'Kubernetes (GKE)', NOW()),
(11, 'Technical skills', 'Cloud & Infrastructure', 103, 'Terraform', NOW()),
(12, 'Technical skills', 'Databases', 104, 'PostgreSQL', NOW()),
(13, 'Technical skills', 'Databases', 104, 'Redis', NOW()),
(14, 'Soft skills', 'Communication', 201, 'Client Presentation', NOW()),
(15, 'Soft skills', 'Communication', 201, 'Technical Writing', NOW()),
(16, 'Soft skills', 'Leadership & Delivery', 202, 'Project Planning & Scoping', NOW()),
(17, 'Soft skills', 'Leadership & Delivery', 202, 'Agile Mentorship', NOW())
ON CONFLICT (skill_id) DO NOTHING;

SELECT setval('skills_skill_id_seq', (SELECT MAX(skill_id) FROM Skills));

-- 3. Seed Employee Skills Ratings
INSERT INTO Employee_skills (unique_id, skill_id, emp_id, self_rating, comments, is_active, add_update_timestamp)
VALUES
(1, 1, 3, 5.0, '5+ years building backend microservices with FastAPI and async Python. [Approved by Manager]', TRUE, NOW()),
(2, 3, 3, 4.0, 'Built multiple production Next.js apps with TypeScript.', TRUE, NOW()),
(3, 5, 3, 4.0, 'Solid experience with React hooks, state management, and modern component architecture.', TRUE, NOW()),
(4, 8, 3, 4.0, 'GCP Cloud Associate certified, deployed multiple Cloud Run services.', TRUE, NOW()),
(5, 12, 3, 4.0, 'Complex queries, indexing, and migration pipelines.', TRUE, NOW()),
(6, 14, 3, 3.5, 'Comfortable presenting sprint demos and architecture proposals.', TRUE, NOW()),
(7, 3, 4, 5.0, 'Expert full-stack TypeScript engineer, core contributor to internal design systems. [Approved by Manager]', TRUE, NOW()),
(8, 5, 4, 5.0, 'Lead developer for enterprise frontends. [Approved by Manager]', TRUE, NOW()),
(9, 6, 4, 4.5, 'Extensive SSR/SSG and API route experience.', TRUE, NOW()),
(10, 7, 4, 5.0, 'Mastery in responsive, accessible Tailwind utility design.', TRUE, NOW()),
(11, 15, 4, 4.0, 'Authored engineering playbooks and onboarding documentation.', TRUE, NOW()),
(12, 8, 5, 5.0, 'Professional Cloud Architect certified. Managed enterprise GCP environments. [Approved by Manager]', TRUE, NOW()),
(13, 9, 5, 5.0, 'Multi-stage Docker builds, vulnerability scanning, distroless images.', TRUE, NOW()),
(14, 10, 5, 4.0, 'GKE cluster operations, Helm charts, ingress controllers.', TRUE, NOW()),
(15, 11, 5, 4.5, 'Terraform IaC modules for cloud infrastructure provisioning.', TRUE, NOW()),
(16, 1, 5, 3.5, 'Automation scripts and CI/CD tooling.', TRUE, NOW()),
(17, 1, 6, 4.0, 'Data modeling, REST API development, testing.', TRUE, NOW()),
(18, 12, 6, 5.0, 'PostgreSQL database administration, replication, query tuning.', TRUE, NOW()),
(19, 13, 6, 4.0, 'Redis caching layer and pub/sub pipelines.', TRUE, NOW()),
(20, 16, 6, 4.0, 'Led sprint delivery and roadmap planning across 2 cross-functional squads.', TRUE, NOW()),
(21, 17, 6, 5.0, 'Mentored 4 junior engineers in agile practices and code review standards.', TRUE, NOW())
ON CONFLICT (unique_id) DO NOTHING;

SELECT setval('employee_skills_unique_id_seq', (SELECT MAX(unique_id) FROM Employee_skills));
