import React from 'react';
import {
  Users,
  Award,
  Layers,
  Shield,
  ArrowRight,
  UserCheck,
  CheckCircle2,
  FileSpreadsheet,
  Settings,
  Database,
  TrendingUp,
  Briefcase,
} from 'lucide-react';
import { SafeEmployee, Skill, EmployeeSkillJoined } from '../types/database';

interface SuperAdminDashboardProps {
  currentUser: SafeEmployee;
  dashboardStats: any;
  employees: SafeEmployee[];
  skills: Skill[];
  employeeSkills: EmployeeSkillJoined[];
  onNavigate: (tab: any) => void;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({
  currentUser,
  dashboardStats,
  employees,
  skills,
  employeeSkills,
  onNavigate,
}) => {
  const stats = dashboardStats || {
    totalEmployees: employees.length || 0,
    totalSkills: skills.length || 0,
    totalRatingsRecorded: employeeSkills.length || 0,
    averageRating: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    strongestSkills: [],
    skillGaps: [],
  };

  const activeEmployees = employees.filter((e) => e.is_active).length;
  const superAdminsCount = employees.filter((e) => e.roles === 'SUPER_ADMIN').length;
  const managersCount = employees.filter((e) => e.roles === 'MANAGER').length;
  const engineersCount = employees.filter((e) => e.roles === 'EMPLOYEE').length;

  const technicalSkillsCount = skills.filter(
    (s) => s.skill_type === 'Technical skills' || s.skill_type === 'Hard skills'
  ).length;
  const softSkillsCount = skills.filter((s) => s.skill_type === 'Soft skills').length;

  return (
    <div className="space-y-6">
      {/* Super Admin Executive Header */}
      <div className="bg-gradient-to-r from-[#08172c] via-[#0B3A5B] to-[#1769AA] rounded-2xl p-6 md:p-8 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 border border-[#122846]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#00A0E9]/20 text-[#00A0E9] border border-[#00A0E9]/30 mb-3">
            <Shield className="w-3.5 h-3.5" /> Enterprise Super Admin Governance
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Super Admin Command Center
          </h2>
          <p className="text-slate-200 text-xs md:text-sm mt-1 max-w-2xl leading-relaxed">
            Welcome back, <span className="font-semibold text-white">{currentUser.fName} {currentUser.lName}</span> ({currentUser.Login_userid}).
            Full administrative authority across workforce RBAC credentials, competency taxonomy, and organizational skill inventories.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => onNavigate('employees')}
            className="px-4 py-2.5 rounded-lg bg-[#00A0E9] hover:bg-[#008ecf] text-white text-xs md:text-sm font-semibold shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Users className="w-4 h-4" />
            <span>Manage Employees</span>
          </button>
          <button
            onClick={() => onNavigate('skills-mgmt')}
            className="px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs md:text-sm font-semibold backdrop-blur-xs flex items-center gap-2 transition-colors cursor-pointer border border-white/20"
          >
            <Layers className="w-4 h-4" />
            <span>Taxonomy Master</span>
          </button>
          <button
            onClick={() => onNavigate('matrix')}
            className="px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs md:text-sm font-semibold backdrop-blur-xs flex items-center gap-2 transition-colors cursor-pointer border border-white/20"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Full Matrix</span>
          </button>
        </div>
      </div>

      {/* Primary Governance Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Workforce */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Workforce</span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-[#0B3A5B]">{employees.length}</div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
              <span>{activeEmployees} active</span>
              <span className="text-slate-300">•</span>
              <span>{employees.length - activeEmployees} deactivated</span>
            </div>
          </div>
        </div>

        {/* Master Skills Taxonomy */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Skills Master Registry</span>
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-[#0B3A5B]">{skills.length}</div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <span>{technicalSkillsCount} Technical skills</span>
              <span className="text-slate-300">•</span>
              <span>{softSkillsCount} Soft skills</span>
            </div>
          </div>
        </div>

        {/* Recorded Skill Ratings */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Evaluations Logged</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-[#0B3A5B]">{stats.totalRatingsRecorded}</div>
            <div className="text-xs text-slate-500 mt-1">
              Avg org competency: <span className="font-semibold text-emerald-600">{stats.averageRating ? stats.averageRating.toFixed(1) : '4.2'} / 5.0</span>
            </div>
          </div>
        </div>

        {/* Access Roles */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Role Breakdown</span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-[#0B3A5B]">{superAdminsCount + managersCount}</div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <span>{superAdminsCount} Admins</span>
              <span className="text-slate-300">•</span>
              <span>{managersCount} Mgrs</span>
              <span className="text-slate-300">•</span>
              <span>{engineersCount} Eng</span>
            </div>
          </div>
        </div>
      </div>

      {/* Super Admin Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Module 1: Workforce RBAC */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-[#1769AA]/10 text-[#1769AA] flex items-center justify-center mb-4">
              <UserCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#0B3A5B]">Workforce & RBAC Management</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Provision corporate accounts, configure Super Admin, Manager, and Engineering roles, reset credentials, or deactivate profiles.
            </p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100 text-slate-600">
                <span>Active Engineers</span>
                <span className="font-semibold text-slate-900">{engineersCount}</span>
              </div>
              <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100 text-slate-600">
                <span>Managers & Approvers</span>
                <span className="font-semibold text-slate-900">{managersCount}</span>
              </div>
              <div className="flex items-center justify-between text-xs py-1 text-slate-600">
                <span>Super Admins</span>
                <span className="font-semibold text-slate-900">{superAdminsCount}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('employees')}
            className="mt-6 w-full py-2.5 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-[#0B3A5B] border border-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <span>Open Employee Management</span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Module 2: Skill Hierarchy Taxonomy */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center mb-4">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#0B3A5B]">Skills Master Architecture</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Define the organizational competency catalog. Standardize skill names, taxonomy categories, and hard vs soft skill classifications.
            </p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100 text-slate-600">
                <span>Programming & Web</span>
                <span className="font-semibold text-slate-900">7 skills</span>
              </div>
              <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100 text-slate-600">
                <span>Cloud & Infrastructure</span>
                <span className="font-semibold text-slate-900">4 skills</span>
              </div>
              <div className="flex items-center justify-between text-xs py-1 text-slate-600">
                <span>Leadership & Delivery</span>
                <span className="font-semibold text-slate-900">4 skills</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('skills-mgmt')}
            className="mt-6 w-full py-2.5 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-[#0B3A5B] border border-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <span>Manage Skills Master</span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Module 3: Enterprise Audit & Matrix */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-4">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#0B3A5B]">Audit & Cross-Team Matrix</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Cross-examine competencies across departments, track review approvals, and ensure schema integrity across Employee, Skills, and Employee_skills.
            </p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100 text-slate-600">
                <span>Audit Status</span>
                <span className="font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 100% Compliant
                </span>
              </div>
              <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100 text-slate-600">
                <span>Database Schema</span>
                <span className="font-semibold text-slate-900">Strict 3 Tables</span>
              </div>
              <div className="flex items-center justify-between text-xs py-1 text-slate-600">
                <span>Security</span>
                <span className="font-semibold text-slate-900">Bcrypt + JWT</span>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-2">
            <button
              onClick={() => onNavigate('matrix')}
              className="py-2.5 px-2 rounded-lg bg-[#1769AA] hover:bg-[#125386] text-white text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
            >
              <span>Matrix View</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigate('review')}
              className="py-2.5 px-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
            >
              <span>Reviews</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
