import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { Employee, Skill, EmployeeSkill, SafeEmployee, UserRole } from '../types/database';

interface DatabaseData {
  Employee: Employee[];
  Skills: Skill[];
  Employee_skills: EmployeeSkill[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

class DatabaseStore {
  private data: DatabaseData = {
    Employee: [],
    Skills: [],
    Employee_skills: [],
  };

  private empAutoId = 1;
  private skillAutoId = 1;
  private empSkillAutoId = 1;

  constructor() {
    this.init();
  }

  private init() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        this.updateAutoIds();
        return;
      } catch {
        console.warn('Failed to parse database.json, re-seeding default data.');
      }
    }

    this.seedDefaultData();
    this.save();
  }

  private updateAutoIds() {
    this.empAutoId = this.data.Employee.reduce((max, e) => Math.max(max, e.emp_id), 0) + 1;
    this.skillAutoId = this.data.Skills.reduce((max, s) => Math.max(max, s.skill_id), 0) + 1;
    this.empSkillAutoId = this.data.Employee_skills.reduce((max, es) => Math.max(max, es.unique_id), 0) + 1;
  }

  private save() {
    fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
  }

  public seedDefaultData() {
    const saltRounds = 10;
    const adminHash = bcrypt.hashSync('Admin@123', saltRounds);
    const mgrHash = bcrypt.hashSync('Manager@123', saltRounds);
    const empHash = bcrypt.hashSync('Emp@123', saltRounds);

    const now = new Date().toISOString();

    const employees: Employee[] = [
      {
        emp_id: 1,
        fName: 'Evonence',
        lName: 'Admin',
        Login_userid: 'admin',
        Login_password: adminHash,
        is_active: true,
        created_on: '2026-01-10T09:00:00.000Z',
        updated_on: now,
        last_logged_in: now,
        roles: 'SUPER_ADMIN',
      },
      {
        emp_id: 2,
        fName: 'Sarah',
        lName: 'Connor',
        Login_userid: 'manager',
        Login_password: mgrHash,
        is_active: true,
        created_on: '2026-01-15T09:00:00.000Z',
        updated_on: now,
        last_logged_in: now,
        roles: 'MANAGER',
      },
      {
        emp_id: 3,
        fName: 'John',
        lName: 'Doe',
        Login_userid: 'emp1',
        Login_password: empHash,
        is_active: true,
        created_on: '2026-02-01T09:00:00.000Z',
        updated_on: now,
        last_logged_in: now,
        roles: 'EMPLOYEE',
      },
      {
        emp_id: 4,
        fName: 'Jane',
        lName: 'Smith',
        Login_userid: 'emp2',
        Login_password: empHash,
        is_active: true,
        created_on: '2026-02-05T09:00:00.000Z',
        updated_on: now,
        last_logged_in: now,
        roles: 'EMPLOYEE',
      },
      {
        emp_id: 5,
        fName: 'Alex',
        lName: 'Rivera',
        Login_userid: 'emp3',
        Login_password: empHash,
        is_active: true,
        created_on: '2026-02-10T09:00:00.000Z',
        updated_on: now,
        last_logged_in: now,
        roles: 'EMPLOYEE',
      },
      {
        emp_id: 6,
        fName: 'Priya',
        lName: 'Sharma',
        Login_userid: 'emp4',
        Login_password: empHash,
        is_active: true,
        created_on: '2026-02-15T09:00:00.000Z',
        updated_on: now,
        last_logged_in: now,
        roles: 'EMPLOYEE',
      },
    ];

    const skills: Skill[] = [
      // Hard Skills - Programming Languages (cat 101)
      { skill_id: 1, skill_type: 'Hard skills', category_name: 'Programming Languages', category_id: 101, skillname: 'Python', skill_description: now },
      { skill_id: 2, skill_type: 'Hard skills', category_name: 'Programming Languages', category_id: 101, skillname: 'Java', skill_description: now },
      { skill_id: 3, skill_type: 'Hard skills', category_name: 'Programming Languages', category_id: 101, skillname: 'TypeScript', skill_description: now },
      { skill_id: 4, skill_type: 'Hard skills', category_name: 'Programming Languages', category_id: 101, skillname: 'Go', skill_description: now },

      // Hard Skills - Web & Frontend (cat 102)
      { skill_id: 5, skill_type: 'Hard skills', category_name: 'Web Development', category_id: 102, skillname: 'React', skill_description: now },
      { skill_id: 6, skill_type: 'Hard skills', category_name: 'Web Development', category_id: 102, skillname: 'Next.js', skill_description: now },
      { skill_id: 7, skill_type: 'Hard skills', category_name: 'Web Development', category_id: 102, skillname: 'Tailwind CSS', skill_description: now },

      // Hard Skills - Cloud & Infrastructure (cat 103)
      { skill_id: 8, skill_type: 'Hard skills', category_name: 'Cloud & Infrastructure', category_id: 103, skillname: 'Google Cloud Platform (GCP)', skill_description: now },
      { skill_id: 9, skill_type: 'Hard skills', category_name: 'Cloud & Infrastructure', category_id: 103, skillname: 'Docker & Containers', skill_description: now },
      { skill_id: 10, skill_type: 'Hard skills', category_name: 'Cloud & Infrastructure', category_id: 103, skillname: 'Kubernetes (GKE)', skill_description: now },
      { skill_id: 11, skill_type: 'Hard skills', category_name: 'Cloud & Infrastructure', category_id: 103, skillname: 'Terraform', skill_description: now },

      // Hard Skills - Databases & Data (cat 104)
      { skill_id: 12, skill_type: 'Hard skills', category_name: 'Databases', category_id: 104, skillname: 'PostgreSQL', skill_description: now },
      { skill_id: 13, skill_type: 'Hard skills', category_name: 'Databases', category_id: 104, skillname: 'Redis', skill_description: now },

      // Soft Skills - Communication (cat 201)
      { skill_id: 14, skill_type: 'Soft skills', category_name: 'Communication', category_id: 201, skillname: 'Client Presentation', skill_description: now },
      { skill_id: 15, skill_type: 'Soft skills', category_name: 'Communication', category_id: 201, skillname: 'Technical Writing', skill_description: now },

      // Soft Skills - Leadership & Delivery (cat 202)
      { skill_id: 16, skill_type: 'Soft skills', category_name: 'Leadership & Delivery', category_id: 202, skillname: 'Project Planning & Scoping', skill_description: now },
      { skill_id: 17, skill_type: 'Soft skills', category_name: 'Leadership & Delivery', category_id: 202, skillname: 'Agile Mentorship', skill_description: now },
    ];

    const empSkills: EmployeeSkill[] = [
      // John Doe (emp_id 3)
      { unique_id: 1, skill_id: 1, emp_id: 3, self_rating: 5, comments: '5+ years building backend microservices with FastAPI and async Python. [Approved by Manager]', is_active: true, add_update_timestamp: now },
      { unique_id: 2, skill_id: 3, emp_id: 3, self_rating: 4, comments: 'Built multiple production Next.js apps with TypeScript.', is_active: true, add_update_timestamp: now },
      { unique_id: 3, skill_id: 5, emp_id: 3, self_rating: 4, comments: 'Solid experience with React hooks, state management, and modern component architecture.', is_active: true, add_update_timestamp: now },
      { unique_id: 4, skill_id: 8, emp_id: 3, self_rating: 4, comments: 'GCP Cloud Associate certified, deployed multiple Cloud Run services.', is_active: true, add_update_timestamp: now },
      { unique_id: 5, skill_id: 12, emp_id: 3, self_rating: 4, comments: 'Complex queries, indexing, and migration pipelines.', is_active: true, add_update_timestamp: now },
      { unique_id: 6, skill_id: 14, emp_id: 3, self_rating: 3, comments: 'Comfortable presenting sprint demos and architecture proposals.', is_active: true, add_update_timestamp: now },

      // Jane Smith (emp_id 4)
      { unique_id: 7, skill_id: 3, emp_id: 4, self_rating: 5, comments: 'Expert full-stack TypeScript engineer, core contributor to internal design systems. [Approved by Manager]', is_active: true, add_update_timestamp: now },
      { unique_id: 8, skill_id: 5, emp_id: 4, self_rating: 5, comments: 'Lead developer for enterprise frontends. [Approved by Manager]', is_active: true, add_update_timestamp: now },
      { unique_id: 9, skill_id: 6, emp_id: 4, self_rating: 4, comments: 'Extensive SSR/SSG and API route experience.', is_active: true, add_update_timestamp: now },
      { unique_id: 10, skill_id: 7, emp_id: 4, self_rating: 5, comments: 'Mastery in responsive, accessible Tailwind utility design.', is_active: true, add_update_timestamp: now },
      { unique_id: 11, skill_id: 15, emp_id: 4, self_rating: 4, comments: 'Authored engineering playbooks and onboarding documentation.', is_active: true, add_update_timestamp: now },

      // Alex Rivera (emp_id 5)
      { unique_id: 12, skill_id: 8, emp_id: 5, self_rating: 5, comments: 'Professional Cloud Architect certified. Managed enterprise GCP environments. [Approved by Manager]', is_active: true, add_update_timestamp: now },
      { unique_id: 13, skill_id: 9, emp_id: 5, self_rating: 5, comments: 'Multi-stage Docker builds, vulnerability scanning, distroless images.', is_active: true, add_update_timestamp: now },
      { unique_id: 14, skill_id: 10, emp_id: 5, self_rating: 4, comments: 'GKE cluster operations, Helm charts, ingress controllers.', is_active: true, add_update_timestamp: now },
      { unique_id: 15, skill_id: 11, emp_id: 5, self_rating: 4, comments: 'Terraform IaC modules for cloud infrastructure provisioning.', is_active: true, add_update_timestamp: now },
      { unique_id: 16, skill_id: 1, emp_id: 5, self_rating: 3, comments: 'Automation scripts and CI/CD tooling.', is_active: true, add_update_timestamp: now },

      // Priya Sharma (emp_id 6)
      { unique_id: 17, skill_id: 1, emp_id: 6, self_rating: 4, comments: 'Data modeling, REST API development, testing.', is_active: true, add_update_timestamp: now },
      { unique_id: 18, skill_id: 12, emp_id: 6, self_rating: 5, comments: 'PostgreSQL database administration, replication, query tuning.', is_active: true, add_update_timestamp: now },
      { unique_id: 19, skill_id: 13, emp_id: 6, self_rating: 4, comments: 'Redis caching layer and pub/sub pipelines.', is_active: true, add_update_timestamp: now },
      { unique_id: 20, skill_id: 16, emp_id: 6, self_rating: 4, comments: 'Led sprint delivery and roadmap planning across 2 cross-functional squads.', is_active: true, add_update_timestamp: now },
      { unique_id: 21, skill_id: 17, emp_id: 6, self_rating: 5, comments: 'Mentored 4 junior engineers in agile practices and code review standards.', is_active: true, add_update_timestamp: now },
    ];

    this.data = {
      Employee: employees,
      Skills: skills,
      Employee_skills: empSkills,
    };

    this.updateAutoIds();
    this.save();
  }

  // --- Safe Employee Helper ---
  public toSafeEmployee(emp: Employee): SafeEmployee {
    const { Login_password, ...safe } = emp;
    return safe;
  }

  // --- Employee Table Operations ---
  public getEmployees(filter?: { search?: string; role?: string; is_active?: boolean }): SafeEmployee[] {
    let list = this.data.Employee;

    if (filter?.is_active !== undefined) {
      list = list.filter(e => e.is_active === filter.is_active);
    }
    if (filter?.role) {
      list = list.filter(e => e.roles === filter.role);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(e =>
        e.fName.toLowerCase().includes(q) ||
        e.lName.toLowerCase().includes(q) ||
        e.Login_userid.toLowerCase().includes(q)
      );
    }

    return list.map(e => this.toSafeEmployee(e));
  }

  public getEmployeeById(emp_id: number): SafeEmployee | null {
    const emp = this.data.Employee.find(e => e.emp_id === emp_id);
    return emp ? this.toSafeEmployee(emp) : null;
  }

  public getEmployeeWithPassword(emp_id: number): Employee | null {
    return this.data.Employee.find(e => e.emp_id === emp_id) || null;
  }

  public getEmployeeByLogin(login_userid: string): Employee | null {
    return this.data.Employee.find(e => e.Login_userid.toLowerCase() === login_userid.toLowerCase()) || null;
  }

  public createEmployee(params: {
    fName: string;
    lName: string;
    Login_userid: string;
    passwordPlain: string;
    roles: UserRole;
    is_active?: boolean;
  }): SafeEmployee {
    if (this.getEmployeeByLogin(params.Login_userid)) {
      throw new Error(`Login identifier "${params.Login_userid}" is already taken.`);
    }

    const hash = bcrypt.hashSync(params.passwordPlain, 10);
    const now = new Date().toISOString();

    const newEmp: Employee = {
      emp_id: this.empAutoId++,
      fName: params.fName.trim(),
      lName: params.lName.trim(),
      Login_userid: params.Login_userid.trim(),
      Login_password: hash,
      is_active: params.is_active !== undefined ? params.is_active : true,
      created_on: now,
      updated_on: now,
      last_logged_in: null,
      roles: params.roles,
    };

    this.data.Employee.push(newEmp);
    this.save();
    return this.toSafeEmployee(newEmp);
  }

  public updateEmployee(emp_id: number, params: {
    fName?: string;
    lName?: string;
    Login_userid?: string;
    passwordPlain?: string;
    roles?: UserRole;
    is_active?: boolean;
    last_logged_in?: string;
  }): SafeEmployee {
    const index = this.data.Employee.findIndex(e => e.emp_id === emp_id);
    if (index === -1) {
      throw new Error(`Employee with ID ${emp_id} not found.`);
    }

    const current = this.data.Employee[index];

    if (params.Login_userid && params.Login_userid.toLowerCase() !== current.Login_userid.toLowerCase()) {
      if (this.getEmployeeByLogin(params.Login_userid)) {
        throw new Error(`Login identifier "${params.Login_userid}" is already taken.`);
      }
      current.Login_userid = params.Login_userid.trim();
    }

    if (params.fName !== undefined) current.fName = params.fName.trim();
    if (params.lName !== undefined) current.lName = params.lName.trim();
    if (params.roles !== undefined) current.roles = params.roles;
    if (params.is_active !== undefined) current.is_active = params.is_active;
    if (params.last_logged_in !== undefined) current.last_logged_in = params.last_logged_in;
    if (params.passwordPlain) {
      current.Login_password = bcrypt.hashSync(params.passwordPlain, 10);
    }

    current.updated_on = new Date().toISOString();

    this.data.Employee[index] = current;
    this.save();
    return this.toSafeEmployee(current);
  }

  public deleteEmployee(emp_id: number): boolean {
    const index = this.data.Employee.findIndex(e => e.emp_id === emp_id);
    if (index === -1) return false;
    this.data.Employee.splice(index, 1);
    // Cascade delete employee skills
    this.data.Employee_skills = this.data.Employee_skills.filter(es => es.emp_id !== emp_id);
    this.save();
    return true;
  }

  // --- Skills Table Operations ---
  public getSkills(filter?: { search?: string; skill_type?: string; category_name?: string }): Skill[] {
    let list = this.data.Skills;

    if (filter?.skill_type) {
      list = list.filter(s => s.skill_type.toLowerCase() === filter.skill_type?.toLowerCase());
    }
    if (filter?.category_name) {
      list = list.filter(s => s.category_name.toLowerCase() === filter.category_name?.toLowerCase());
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(s =>
        s.skillname.toLowerCase().includes(q) ||
        s.category_name.toLowerCase().includes(q) ||
        s.skill_type.toLowerCase().includes(q)
      );
    }

    return list;
  }

  public getSkillById(skill_id: number): Skill | null {
    return this.data.Skills.find(s => s.skill_id === skill_id) || null;
  }

  public createSkill(params: {
    skill_type: 'Hard skills' | 'Soft skills';
    category_name: string;
    category_id: number;
    skillname: string;
  }): Skill {
    const now = new Date().toISOString();
    const newSkill: Skill = {
      skill_id: this.skillAutoId++,
      skill_type: params.skill_type,
      category_name: params.category_name.trim(),
      category_id: params.category_id,
      skillname: params.skillname.trim(),
      skill_description: now, // Preserving exact schema column type
    };

    this.data.Skills.push(newSkill);
    this.save();
    return newSkill;
  }

  public updateSkill(skill_id: number, params: {
    skill_type?: 'Hard skills' | 'Soft skills';
    category_name?: string;
    category_id?: number;
    skillname?: string;
  }): Skill {
    const index = this.data.Skills.findIndex(s => s.skill_id === skill_id);
    if (index === -1) {
      throw new Error(`Skill with ID ${skill_id} not found.`);
    }

    const current = this.data.Skills[index];
    if (params.skill_type !== undefined) current.skill_type = params.skill_type;
    if (params.category_name !== undefined) current.category_name = params.category_name.trim();
    if (params.category_id !== undefined) current.category_id = params.category_id;
    if (params.skillname !== undefined) current.skillname = params.skillname.trim();

    this.data.Skills[index] = current;
    this.save();
    return current;
  }

  public deleteSkill(skill_id: number): boolean {
    const index = this.data.Skills.findIndex(s => s.skill_id === skill_id);
    if (index === -1) return false;
    this.data.Skills.splice(index, 1);
    // Cascade delete employee skills
    this.data.Employee_skills = this.data.Employee_skills.filter(es => es.skill_id !== skill_id);
    this.save();
    return true;
  }

  // --- Employee_skills Table Operations ---
  public getEmployeeSkills(filter?: {
    emp_id?: number;
    skill_id?: number;
    is_active?: boolean;
  }): (EmployeeSkill & { employee?: SafeEmployee; skill?: Skill })[] {
    let list = this.data.Employee_skills;

    if (filter?.emp_id !== undefined) {
      list = list.filter(es => es.emp_id === filter.emp_id);
    }
    if (filter?.skill_id !== undefined) {
      list = list.filter(es => es.skill_id === filter.skill_id);
    }
    if (filter?.is_active !== undefined) {
      list = list.filter(es => es.is_active === filter.is_active);
    }

    return list.map(es => {
      const emp = this.getEmployeeById(es.emp_id);
      const skill = this.getSkillById(es.skill_id);
      return {
        ...es,
        employee: emp || undefined,
        skill: skill || undefined,
      };
    });
  }

  public getEmployeeSkillById(unique_id: number): (EmployeeSkill & { employee?: SafeEmployee; skill?: Skill }) | null {
    const es = this.data.Employee_skills.find(item => item.unique_id === unique_id);
    if (!es) return null;
    return {
      ...es,
      employee: this.getEmployeeById(es.emp_id) || undefined,
      skill: this.getSkillById(es.skill_id) || undefined,
    };
  }

  public createOrUpdateEmployeeSkill(params: {
    skill_id: number;
    emp_id: number;
    self_rating: number;
    comments?: string | null;
    is_active?: boolean;
  }): EmployeeSkill {
    // Constraint Validation
    if (params.self_rating < 1 || params.self_rating > 5) {
      throw new Error('Validation Error: self_rating must be between 1 and 5 inclusive.');
    }
    if (!this.getEmployeeById(params.emp_id)) {
      throw new Error(`Foreign Key Error: Employee with ID ${params.emp_id} does not exist.`);
    }
    if (!this.getSkillById(params.skill_id)) {
      throw new Error(`Foreign Key Error: Skill with ID ${params.skill_id} does not exist.`);
    }

    const now = new Date().toISOString();
    const existingIndex = this.data.Employee_skills.findIndex(
      es => es.emp_id === params.emp_id && es.skill_id === params.skill_id
    );

    if (existingIndex >= 0) {
      const current = this.data.Employee_skills[existingIndex];
      current.self_rating = params.self_rating;
      current.comments = params.comments !== undefined ? params.comments : current.comments;
      if (params.is_active !== undefined) current.is_active = params.is_active;
      current.add_update_timestamp = now;
      this.data.Employee_skills[existingIndex] = current;
      this.save();
      return current;
    } else {
      const newRecord: EmployeeSkill = {
        unique_id: this.empSkillAutoId++,
        skill_id: params.skill_id,
        emp_id: params.emp_id,
        self_rating: params.self_rating,
        comments: params.comments || null,
        is_active: params.is_active !== undefined ? params.is_active : true,
        add_update_timestamp: now,
      };
      this.data.Employee_skills.push(newRecord);
      this.save();
      return newRecord;
    }
  }

  public updateEmployeeSkillRecord(unique_id: number, params: {
    self_rating?: number;
    comments?: string | null;
    is_active?: boolean;
  }): EmployeeSkill {
    const index = this.data.Employee_skills.findIndex(es => es.unique_id === unique_id);
    if (index === -1) {
      throw new Error(`Employee_skills record with unique_id ${unique_id} not found.`);
    }

    const current = this.data.Employee_skills[index];

    if (params.self_rating !== undefined) {
      if (params.self_rating < 1 || params.self_rating > 5) {
        throw new Error('Validation Error: self_rating must be between 1 and 5 inclusive.');
      }
      current.self_rating = params.self_rating;
    }
    if (params.comments !== undefined) {
      current.comments = params.comments;
    }
    if (params.is_active !== undefined) {
      current.is_active = params.is_active;
    }
    current.add_update_timestamp = new Date().toISOString();

    this.data.Employee_skills[index] = current;
    this.save();
    return current;
  }

  public deleteEmployeeSkill(unique_id: number): boolean {
    const index = this.data.Employee_skills.findIndex(es => es.unique_id === unique_id);
    if (index === -1) return false;
    this.data.Employee_skills.splice(index, 1);
    this.save();
    return true;
  }
}

export const db = new DatabaseStore();
