import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from './src/server/db';
import { SafeEmployee, UserRole } from './src/types/database';

const JWT_SECRET = process.env.JWT_SECRET || 'evonence-skill-matrix-secure-jwt-key-2026';
const PORT = Number(process.env.PORT) || 3000;

interface AuthRequest extends Request {
  user?: SafeEmployee;
}

// Authentication Middleware
function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Authentication token required.' });
    return;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { emp_id: number; roles: UserRole };
    const user = db.getEmployeeById(payload.emp_id);
    if (!user || !user.is_active) {
      res.status(401).json({ error: 'User account is inactive or not found.' });
      return;
    }
    req.user = user;
    next();
  } catch {
    res.status(403).json({ error: 'Invalid or expired token.' });
    return;
  }
}

// RBAC Middleware
function requireRole(...allowedRoles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }
    if (!allowedRoles.includes(req.user.roles)) {
      res.status(403).json({
        error: `Access Denied: Requires one of [${allowedRoles.join(', ')}]. Current role: ${req.user.roles}.`
      });
      return;
    }
    next();
  };
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // CORS headers
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }
    next();
  });

  const api = express.Router();

  // -------------------------------------------------------------
  // AUTHENTICATION ROUTES
  // -------------------------------------------------------------
  api.post('/auth/login', (req: Request, res: Response) => {
    const { Login_userid, password } = req.body;

    if (!Login_userid || !password) {
      res.status(400).json({ error: 'Login_userid and password are required.' });
      return;
    }

    const empWithPassword = db.getEmployeeByLogin(Login_userid);
    if (!empWithPassword) {
      res.status(401).json({ error: 'Invalid login credentials.' });
      return;
    }

    if (!empWithPassword.is_active) {
      res.status(403).json({ error: 'Account is deactivated. Contact Super Admin.' });
      return;
    }

    const isMatch = bcrypt.compareSync(password, empWithPassword.Login_password);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid login credentials.' });
      return;
    }

    // Update last_logged_in timestamp
    const now = new Date().toISOString();
    const updated = db.updateEmployee(empWithPassword.emp_id, { last_logged_in: now });

    // Generate JWT
    const token = jwt.sign(
      {
        emp_id: updated.emp_id,
        Login_userid: updated.Login_userid,
        roles: updated.roles,
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: updated,
    });
  });

  api.get('/auth/me', authenticateToken, (req: AuthRequest, res: Response) => {
    res.json({ user: req.user });
  });

  api.post('/auth/logout', (_req: Request, res: Response) => {
    res.json({ message: 'Logged out successfully.' });
  });

  // -------------------------------------------------------------
  // EMPLOYEES ROUTES
  // -------------------------------------------------------------
  api.get('/employees', authenticateToken, (req: AuthRequest, res: Response) => {
    const { search, role, is_active } = req.query;

    // RBAC: Super Admin and Manager can see full employee list.
    // Employee can see active employees list (needed for team visibility) or filtered list
    const filter: { search?: string; role?: string; is_active?: boolean } = {};
    if (typeof search === 'string') filter.search = search;
    if (typeof role === 'string') filter.role = role;
    if (is_active !== undefined) filter.is_active = is_active === 'true';

    const employees = db.getEmployees(filter);
    res.json(employees);
  });

  api.get('/employees/:emp_id', authenticateToken, (req: AuthRequest, res: Response) => {
    const empId = Number(req.params.emp_id);
    if (isNaN(empId)) {
      res.status(400).json({ error: 'Invalid employee ID.' });
      return;
    }

    // Employee role can view their own profile, managers and admins can view any
    if (req.user?.roles === 'EMPLOYEE' && req.user.emp_id !== empId) {
      res.status(403).json({ error: 'Unauthorized to view other employee details.' });
      return;
    }

    const employee = db.getEmployeeById(empId);
    if (!employee) {
      res.status(404).json({ error: 'Employee not found.' });
      return;
    }
    res.json(employee);
  });

  api.post('/employees', authenticateToken, requireRole('SUPER_ADMIN'), (req: Request, res: Response) => {
    const { fName, lName, Login_userid, password, roles, is_active } = req.body;

    if (!fName || !lName || !Login_userid || !password || !roles) {
      res.status(400).json({ error: 'fName, lName, Login_userid, password, and roles are required.' });
      return;
    }

    if (!['SUPER_ADMIN', 'MANAGER', 'EMPLOYEE'].includes(roles)) {
      res.status(400).json({ error: 'roles must be SUPER_ADMIN, MANAGER, or EMPLOYEE.' });
      return;
    }

    try {
      const created = db.createEmployee({
        fName,
        lName,
        Login_userid,
        passwordPlain: password,
        roles,
        is_active: is_active !== undefined ? Boolean(is_active) : true,
      });
      res.status(201).json(created);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create employee.';
      res.status(400).json({ error: message });
    }
  });

  api.put('/employees/:emp_id', authenticateToken, (req: AuthRequest, res: Response) => {
    const empId = Number(req.params.emp_id);
    if (isNaN(empId)) {
      res.status(400).json({ error: 'Invalid employee ID.' });
      return;
    }

    // Role check: Only SUPER_ADMIN can edit others or change roles
    const isSelf = req.user?.emp_id === empId;
    const isSuperAdmin = req.user?.roles === 'SUPER_ADMIN';

    if (!isSelf && !isSuperAdmin) {
      res.status(403).json({ error: 'Unauthorized to update this employee.' });
      return;
    }

    const { fName, lName, Login_userid, password, roles, is_active } = req.body;

    const updates: {
      fName?: string;
      lName?: string;
      Login_userid?: string;
      passwordPlain?: string;
      roles?: UserRole;
      is_active?: boolean;
    } = {};

    if (fName !== undefined) updates.fName = fName;
    if (lName !== undefined) updates.lName = lName;
    if (password) updates.passwordPlain = password;

    if (isSuperAdmin) {
      if (Login_userid !== undefined) updates.Login_userid = Login_userid;
      if (roles !== undefined) {
        if (!['SUPER_ADMIN', 'MANAGER', 'EMPLOYEE'].includes(roles)) {
          res.status(400).json({ error: 'roles must be SUPER_ADMIN, MANAGER, or EMPLOYEE.' });
          return;
        }
        updates.roles = roles;
      }
      if (is_active !== undefined) updates.is_active = Boolean(is_active);
    }

    try {
      const updated = db.updateEmployee(empId, updates);
      res.json(updated);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update employee.';
      res.status(400).json({ error: message });
    }
  });

  api.delete('/employees/:emp_id', authenticateToken, requireRole('SUPER_ADMIN'), (req: Request, res: Response) => {
    const empId = Number(req.params.emp_id);
    if (isNaN(empId)) {
      res.status(400).json({ error: 'Invalid employee ID.' });
      return;
    }

    const success = db.deleteEmployee(empId);
    if (!success) {
      res.status(404).json({ error: 'Employee not found.' });
      return;
    }
    res.json({ message: 'Employee deleted successfully.' });
  });

  // -------------------------------------------------------------
  // SKILLS ROUTES
  // -------------------------------------------------------------
  api.get('/skills', authenticateToken, (req: Request, res: Response) => {
    const { search, skill_type, category_name } = req.query;
    const filter: { search?: string; skill_type?: string; category_name?: string } = {};
    if (typeof search === 'string') filter.search = search;
    if (typeof skill_type === 'string') filter.skill_type = skill_type;
    if (typeof category_name === 'string') filter.category_name = category_name;

    const skills = db.getSkills(filter);
    res.json(skills);
  });

  api.get('/skills/:skill_id', authenticateToken, (req: Request, res: Response) => {
    const skillId = Number(req.params.skill_id);
    if (isNaN(skillId)) {
      res.status(400).json({ error: 'Invalid skill ID.' });
      return;
    }

    const skill = db.getSkillById(skillId);
    if (!skill) {
      res.status(404).json({ error: 'Skill not found.' });
      return;
    }
    res.json(skill);
  });

  api.post('/skills', authenticateToken, requireRole('SUPER_ADMIN'), (req: Request, res: Response) => {
    const { skill_type, category_name, category_id, skillname } = req.body;

    if (!skill_type || !category_name || category_id === undefined || !skillname) {
      res.status(400).json({ error: 'skill_type, category_name, category_id, and skillname are required.' });
      return;
    }

    const normalizedType = skill_type === 'Hard skills' ? 'Technical skills' : skill_type;
    if (!['Technical skills', 'Soft skills'].includes(normalizedType)) {
      res.status(400).json({ error: 'skill_type must be either "Technical skills" or "Soft skills".' });
      return;
    }

    try {
      const created = db.createSkill({
        skill_type: normalizedType,
        category_name,
        category_id: Number(category_id),
        skillname,
      });
      res.status(201).json(created);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create skill.';
      res.status(400).json({ error: message });
    }
  });

  api.put('/skills/:skill_id', authenticateToken, requireRole('SUPER_ADMIN'), (req: Request, res: Response) => {
    const skillId = Number(req.params.skill_id);
    if (isNaN(skillId)) {
      res.status(400).json({ error: 'Invalid skill ID.' });
      return;
    }

    const { skill_type, category_name, category_id, skillname } = req.body;
    const normalizedType = skill_type === 'Hard skills' ? 'Technical skills' : skill_type;

    try {
      const updated = db.updateSkill(skillId, {
        skill_type: normalizedType,
        category_name,
        category_id: category_id !== undefined ? Number(category_id) : undefined,
        skillname,
      });
      res.json(updated);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update skill.';
      res.status(400).json({ error: message });
    }
  });

  api.delete('/skills/:skill_id', authenticateToken, requireRole('SUPER_ADMIN'), (req: Request, res: Response) => {
    const skillId = Number(req.params.skill_id);
    if (isNaN(skillId)) {
      res.status(400).json({ error: 'Invalid skill ID.' });
      return;
    }

    const success = db.deleteSkill(skillId);
    if (!success) {
      res.status(404).json({ error: 'Skill not found.' });
      return;
    }
    res.json({ message: 'Skill deleted successfully.' });
  });

  // -------------------------------------------------------------
  // EMPLOYEE SKILLS ROUTES
  // -------------------------------------------------------------
  api.get('/employee-skills', authenticateToken, (req: AuthRequest, res: Response) => {
    const { emp_id, skill_id, is_active } = req.query;

    const filter: { emp_id?: number; skill_id?: number; is_active?: boolean } = {};
    if (emp_id !== undefined) filter.emp_id = Number(emp_id);
    if (skill_id !== undefined) filter.skill_id = Number(skill_id);
    if (is_active !== undefined) filter.is_active = is_active === 'true';

    // Role check: If EMPLOYEE role, they can only query their own skills
    if (req.user?.roles === 'EMPLOYEE') {
      filter.emp_id = req.user.emp_id;
    }

    const records = db.getEmployeeSkills(filter);
    res.json(records);
  });

  api.get('/employee-skills/:unique_id', authenticateToken, (req: AuthRequest, res: Response) => {
    const uniqueId = Number(req.params.unique_id);
    if (isNaN(uniqueId)) {
      res.status(400).json({ error: 'Invalid unique_id.' });
      return;
    }

    const record = db.getEmployeeSkillById(uniqueId);
    if (!record) {
      res.status(404).json({ error: 'Employee skill record not found.' });
      return;
    }

    if (req.user?.roles === 'EMPLOYEE' && record.emp_id !== req.user.emp_id) {
      res.status(403).json({ error: 'Unauthorized to view this record.' });
      return;
    }

    res.json(record);
  });

  api.post('/employee-skills', authenticateToken, (req: AuthRequest, res: Response) => {
    const { skill_id, emp_id, self_rating, comments, is_active } = req.body;

    if (!skill_id || self_rating === undefined) {
      res.status(400).json({ error: 'skill_id and self_rating are required.' });
      return;
    }

    // Role check: Employees can only submit for themselves
    let targetEmpId = Number(emp_id);
    if (req.user?.roles === 'EMPLOYEE' || !targetEmpId) {
      targetEmpId = req.user!.emp_id;
    } else if (req.user?.roles !== 'SUPER_ADMIN' && req.user?.roles !== 'MANAGER') {
      targetEmpId = req.user!.emp_id;
    }

    const ratingNum = Number(self_rating);
    if (isNaN(ratingNum) || ratingNum < 0.5 || ratingNum > 5) {
      res.status(400).json({ error: 'self_rating must be between 1 and 5 (decimals allowed, e.g. 3.5).' });
      return;
    }
    const cleanRating = Math.round(ratingNum * 10) / 10;

    try {
      const record = db.createOrUpdateEmployeeSkill({
        skill_id: Number(skill_id),
        emp_id: targetEmpId,
        self_rating: cleanRating,
        comments: comments || null,
        is_active: is_active !== undefined ? Boolean(is_active) : true,
      });
      const populated = db.getEmployeeSkillById(record.unique_id);
      res.status(201).json(populated);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create employee skill record.';
      res.status(400).json({ error: message });
    }
  });

  api.put('/employee-skills/:unique_id', authenticateToken, (req: AuthRequest, res: Response) => {
    const uniqueId = Number(req.params.unique_id);
    if (isNaN(uniqueId)) {
      res.status(400).json({ error: 'Invalid unique_id.' });
      return;
    }

    const existing = db.getEmployeeSkillById(uniqueId);
    if (!existing) {
      res.status(404).json({ error: 'Record not found.' });
      return;
    }

    // Authorization
    if (req.user?.roles === 'EMPLOYEE' && existing.emp_id !== req.user.emp_id) {
      res.status(403).json({ error: 'Unauthorized to update this record.' });
      return;
    }

    const { self_rating, comments, is_active } = req.body;

    const updates: { self_rating?: number; comments?: string | null; is_active?: boolean } = {};
    if (self_rating !== undefined) {
      const r = Number(self_rating);
      if (isNaN(r) || r < 0.5 || r > 5) {
        res.status(400).json({ error: 'self_rating must be between 1 and 5 (decimals allowed).' });
        return;
      }
      updates.self_rating = Math.round(r * 10) / 10;
    }
    if (comments !== undefined) updates.comments = comments;
    if (is_active !== undefined) updates.is_active = Boolean(is_active);

    try {
      const updated = db.updateEmployeeSkillRecord(uniqueId, updates);
      const populated = db.getEmployeeSkillById(updated.unique_id);
      res.json(populated);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update record.';
      res.status(400).json({ error: message });
    }
  });

  // Manager Review Endpoint (Approve, Reject, or Edit rating)
  api.post('/employee-skills/:unique_id/review', authenticateToken, requireRole('MANAGER', 'SUPER_ADMIN'), (req: AuthRequest, res: Response) => {
    const uniqueId = Number(req.params.unique_id);
    const { action, manager_notes, reviewed_rating } = req.body;

    if (!['APPROVE', 'REJECT', 'EDIT'].includes(action)) {
      res.status(400).json({ error: 'action must be APPROVE, REJECT, or EDIT.' });
      return;
    }

    const existing = db.getEmployeeSkillById(uniqueId);
    if (!existing) {
      res.status(404).json({ error: 'Record not found.' });
      return;
    }

    let newRating = existing.self_rating;
    if (action === 'EDIT' && reviewed_rating !== undefined) {
      const r = Number(reviewed_rating);
      if (isNaN(r) || r < 0.5 || r > 5) {
        res.status(400).json({ error: 'reviewed_rating must be between 1 and 5 (decimals allowed).' });
        return;
      }
      newRating = Math.round(r * 10) / 10;
    }

    let updatedComments = existing.comments || '';
    const reviewerName = `${req.user!.fName} ${req.user!.lName}`;
    const timestamp = new Date().toLocaleString();

    if (action === 'APPROVE') {
      updatedComments = `[Approved by ${reviewerName} on ${timestamp}] ${manager_notes ? '- ' + manager_notes : ''}\n${updatedComments}`.trim();
    } else if (action === 'REJECT') {
      updatedComments = `[Rejected by ${reviewerName} on ${timestamp}] ${manager_notes ? '- Reason: ' + manager_notes : ''}\n${updatedComments}`.trim();
    } else if (action === 'EDIT') {
      updatedComments = `[Adjusted to ${newRating}/5 by ${reviewerName} on ${timestamp}] ${manager_notes ? '- Note: ' + manager_notes : ''}\n${updatedComments}`.trim();
    }

    // When rejected, record status is marked is_active = false
    const isActive = action === 'REJECT' ? false : true;

    try {
      const updated = db.updateEmployeeSkillRecord(uniqueId, {
        self_rating: newRating,
        comments: updatedComments,
        is_active: isActive,
      });
      const populated = db.getEmployeeSkillById(updated.unique_id);
      res.json({
        message: `Skill submission successfully ${action.toLowerCase()}d.`,
        record: populated,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Review action failed.';
      res.status(400).json({ error: message });
    }
  });

  api.delete('/employee-skills/:unique_id', authenticateToken, requireRole('SUPER_ADMIN'), (req: Request, res: Response) => {
    const uniqueId = Number(req.params.unique_id);
    if (isNaN(uniqueId)) {
      res.status(400).json({ error: 'Invalid unique_id.' });
      return;
    }

    const success = db.deleteEmployeeSkill(uniqueId);
    if (!success) {
      res.status(404).json({ error: 'Record not found.' });
      return;
    }
    res.json({ message: 'Record deleted successfully.' });
  });

  // -------------------------------------------------------------
  // DASHBOARD AGGREGATE STATS & MATRIX DATA
  // -------------------------------------------------------------
  api.get('/stats/dashboard', authenticateToken, (req: AuthRequest, res: Response) => {
    const employees = db.getEmployees({ is_active: true });
    const skills = db.getSkills();
    const allRecords = db.getEmployeeSkills({ is_active: true });

    // Role-specific stats
    if (req.user?.roles === 'EMPLOYEE') {
      const myRecords = allRecords.filter(r => r.emp_id === req.user!.emp_id);
      const avgRating = myRecords.length > 0
        ? Number((myRecords.reduce((sum, r) => sum + r.self_rating, 0) / myRecords.length).toFixed(1))
        : 0;

      const ratingDist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      myRecords.forEach(r => {
        const bucket = Math.min(5, Math.max(1, Math.round(r.self_rating)));
        ratingDist[bucket] = (ratingDist[bucket] || 0) + 1;
      });

      res.json({
        totalRatedSkills: myRecords.length,
        totalAvailableSkills: skills.length,
        averageRating: avgRating,
        ratingDistribution: ratingDist,
        recentUpdates: myRecords.slice(-5).reverse(),
      });
      return;
    }

    // Manager / Super Admin aggregate stats
    const totalRated = allRecords.length;
    const avgRating = totalRated > 0
      ? Number((allRecords.reduce((sum, r) => sum + r.self_rating, 0) / totalRated).toFixed(1))
      : 0;

    // Skill distribution
    const ratingDist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    allRecords.forEach(r => {
      const bucket = Math.min(5, Math.max(1, Math.round(r.self_rating)));
      ratingDist[bucket] = (ratingDist[bucket] || 0) + 1;
    });

    // Top skills & gaps
    const skillStatsMap: Record<number, { skill: typeof skills[0]; count: number; avgRating: number; sum: number }> = {};
    skills.forEach(s => {
      skillStatsMap[s.skill_id] = { skill: s, count: 0, avgRating: 0, sum: 0 };
    });

    allRecords.forEach(r => {
      if (skillStatsMap[r.skill_id]) {
        skillStatsMap[r.skill_id].count++;
        skillStatsMap[r.skill_id].sum += r.self_rating;
      }
    });

    Object.values(skillStatsMap).forEach(item => {
      if (item.count > 0) {
        item.avgRating = Number((item.sum / item.count).toFixed(1));
      }
    });

    const skillList = Object.values(skillStatsMap);
    const strongestSkills = [...skillList]
      .filter(s => s.count > 0)
      .sort((a, b) => b.avgRating - a.avgRating)
      .slice(0, 5);

    const skillGaps = [...skillList]
      .filter(s => s.count === 0 || s.avgRating < 3)
      .sort((a, b) => a.count - b.count)
      .slice(0, 5);

    res.json({
      totalEmployees: employees.length,
      totalSkills: skills.length,
      totalRatingsRecorded: totalRated,
      averageRating: avgRating,
      ratingDistribution: ratingDist,
      strongestSkills,
      skillGaps,
    });
  });

  // Reset database to initial seed data
  api.post('/system/reset-seed', authenticateToken, requireRole('SUPER_ADMIN'), (_req: Request, res: Response) => {
    db.seedDefaultData();
    res.json({ message: 'Database reset to initial sample seed successfully.' });
  });

  // Mount API router
  app.use('/api', api);

  // Vite Integration (Dev Mode vs Prod Mode)
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Evonence Skill Matrix] Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Fatal: Failed to start server:', err);
  process.exit(1);
});
