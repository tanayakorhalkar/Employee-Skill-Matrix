/**
 * Exact Database Schema Types for the 3 Tables:
 * 1. Employee
 * 2. Skills
 * 3. Employee_skills
 *
 * Enforcing exact casing and column specifications.
 */

export type UserRole = 'SUPER_ADMIN' | 'MANAGER' | 'EMPLOYEE';

export interface Employee {
  emp_id: number;
  fName: string;
  lName: string;
  Login_userid: string;
  Login_password: string; // Password hash only
  is_active: boolean;
  created_on: string; // ISO TIMESTAMP
  updated_on: string; // ISO TIMESTAMP
  last_logged_in: string | null; // ISO TIMESTAMP
  roles: UserRole;
  profile_picture: string | null;
}

export type SafeEmployee = Omit<Employee, 'Login_password'>;

export interface Skill {
  skill_id: number;
  skill_type: 'Technical skills' | 'Soft skills' | 'Hard skills';
  category_name: string;
  category_id: number;
  skillname: string;
  skill_description: string;
}

export interface EmployeeSkill {
  unique_id: number;
  skill_id: number;
  emp_id: number;
  self_rating: number; // 1 to 5
  comments: string | null;
  is_active: boolean;
  add_update_timestamp: string; // ISO TIMESTAMP
}

// Joined representation for UI display
export interface EmployeeSkillJoined extends EmployeeSkill {
  employee?: SafeEmployee;
  skill?: Skill;
}

export interface AuthSession {
  token: string;
  user: SafeEmployee;
}
