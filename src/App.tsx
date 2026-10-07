import { useState, useEffect, useCallback } from 'react';
import { api, tokenStorage } from './lib/api';
import { SafeEmployee, Skill, EmployeeSkillJoined } from './types/database';
import { Sidebar, Header, NavTab } from './components/Navigation';
import { Login } from './pages/Login';
import { EmployeeDashboard } from './pages/EmployeeDashboard';
import { ManagerDashboard } from './pages/ManagerDashboard';
import { SuperAdminDashboard } from './pages/SuperAdminDashboard';
import { MySkills } from './pages/MySkills';
import { SkillMatrix } from './pages/SkillMatrix';
import { SkillReview } from './pages/SkillReview';
import { EmployeeManagement } from './pages/EmployeeManagement';
import { SkillsManagement } from './pages/SkillsManagement';
import { SkillCatalog } from './pages/SkillCatalog';
import { Profile } from './pages/Profile';

export default function App() {
  const [currentUser, setCurrentUser] = useState<SafeEmployee | null>(() => tokenStorage.getUser());
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // App Data
  const [skills, setSkills] = useState<Skill[]>([]);
  const [employees, setEmployees] = useState<SafeEmployee[]>([]);
  const [employeeSkills, setEmployeeSkills] = useState<EmployeeSkillJoined[]>([]);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [isDataLoading, setIsDataLoading] = useState(false);

  // Load Initial Session
  useEffect(() => {
    const initAuth = async () => {
      const token = tokenStorage.getToken();
      if (token) {
        try {
          const user = await api.auth.me();
          setCurrentUser(user);
        } catch {
          tokenStorage.clear();
          setCurrentUser(null);
        }
      }
      setIsLoadingAuth(false);
    };

    initAuth();

    const handleUnauthorized = () => {
      setCurrentUser(null);
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  // Fetch App Data
  const loadData = useCallback(async () => {
    if (!currentUser) return;
    setIsDataLoading(true);
    try {
      const [skillsData, statsData, empSkillsData] = await Promise.all([
        api.skills.list(),
        api.stats.dashboard(),
        api.employeeSkills.list(),
      ]);

      setSkills(skillsData);
      setDashboardStats(statsData);
      setEmployeeSkills(empSkillsData);

      // Fetch employees list if Manager or Super Admin
      if (currentUser.roles === 'SUPER_ADMIN' || currentUser.roles === 'MANAGER') {
        const empData = await api.employees.list();
        setEmployees(empData);
      } else {
        setEmployees([currentUser]);
      }
    } catch (err) {
      console.error('Failed to load application data:', err);
    } finally {
      setIsDataLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser, loadData]);

  // Auth Handlers
  const handleLoginRequest = async (userId: string, pass: string) => {
    const data = await api.auth.login(userId, pass);
    setCurrentUser(data.user);
    setCurrentTab('dashboard');
  };

  const handleRegisterRequest = async (data: {
    fName: string;
    lName: string;
    email: string;
    password: string;
  }) => {
    await api.auth.register(data);
  };

  const handleLogout = async () => {
    await api.auth.logout();
    setCurrentUser(null);
    setCurrentTab('dashboard');
  };

  // Skill Rating Handler
  const handleSaveRating = async (skillId: number, rating: number, comments: string) => {
    await api.employeeSkills.createOrUpdate({
      skill_id: skillId,
      self_rating: rating,
      comments: comments.trim() || undefined,
    });
    await loadData();
  };

  // Review Action Handler (Manager/Admin)
  const handleReviewAction = async (
    uniqueId: number,
    action: 'APPROVE' | 'REJECT' | 'EDIT',
    notes?: string,
    reviewedRating?: number
  ) => {
    await api.employeeSkills.review(uniqueId, {
      action,
      manager_notes: notes,
      reviewed_rating: reviewedRating,
    });
    await loadData();
  };

  const handleBatchReview = async (
    empId: number,
    action: 'APPROVE' | 'REJECT',
    notes?: string
  ) => {
    await api.employeeSkills.reviewBatch(empId, {
      action,
      manager_notes: notes,
    });
    await loadData();
  };

  // Employee CRUD Handlers
  const handleCreateEmployee = async (data: any) => {
    await api.employees.create(data);
    await loadData();
  };

  const handleUpdateEmployee = async (emp_id: number, data: any) => {
    await api.employees.update(emp_id, data);
    await loadData();
  };

  const handleDeleteEmployee = async (emp_id: number) => {
    await api.employees.delete(emp_id);
    await loadData();
  };

  // Skill Master CRUD Handlers
  const handleCreateSkill = async (data: any) => {
    await api.skills.create(data);
    await loadData();
  };

  const handleUpdateSkill = async (skill_id: number, data: any) => {
    await api.skills.update(skill_id, data);
    await loadData();
  };

  const handleDeleteSkill = async (skill_id: number) => {
    await api.skills.delete(skill_id);
    await loadData();
  };

  // Profile Update
  const handleUpdateProfile = async (data: {
    fName?: string;
    lName?: string;
    password?: string;
    profile_picture?: string | null;
  }) => {
    if (!currentUser) return;
    const updated = await api.employees.update(currentUser.emp_id, data);
    setCurrentUser(updated);
    tokenStorage.setUser(updated);
    await loadData();
  };

  // Reset Seed Handler
  const handleResetSeed = async () => {
    if (confirm('Reset database to initial seed data? This will restore sample employees and skills.')) {
      await api.system.resetSeed();
      await loadData();
      alert('Database successfully reset to seed data.');
    }
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-[#08172c] flex flex-col items-center justify-center text-white">
        <div className="w-10 h-10 border-4 border-[#00A0E9] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold tracking-wide text-slate-300">
          Loading Evonence Skill Matrix...
        </p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <Login
        onLoginRequest={handleLoginRequest}
        onRegisterRequest={handleRegisterRequest}
      />
    );
  }

  const getPageTitle = (tab: NavTab) => {
    switch (tab) {
      case 'dashboard':
        return {
          title:
            currentUser.roles === 'MANAGER'
              ? 'Manager Dashboard'
              : currentUser.roles === 'SUPER_ADMIN'
              ? 'Super Admin Dashboard'
              : 'Employee Dashboard',
          subtitle: 'Welcome to your internal competency & skill matrix hub',
        };
      case 'my-skills':
        return {
          title: 'My Skills & Ratings',
          subtitle: 'Assess your technical proficiencies and add justifications',
        };
      case 'matrix':
        return {
          title: 'Employee Skill Matrix',
          subtitle: 'Visual competency mapping across engineers and skill categories',
        };
      case 'review':
        return {
          title: 'Skill Review & Approvals',
          subtitle: 'Manager verification and approval workflow for submitted ratings',
        };
      case 'employees':
        return {
          title: 'Employee Management',
          subtitle: 'Manage user credentials, roles, and account statuses',
        };
      case 'skills-mgmt':
        return {
          title: 'Skills Master Management',
          subtitle: 'Organizational skill hierarchy taxonomy and definitions',
        };
      case 'catalog':
        return {
          title: 'Skill Hierarchy Catalog',
          subtitle: 'Explore the full organizational skill taxonomy and competency structure',
        };
      case 'profile':
        return {
          title: 'My Profile',
          subtitle: 'Manage your employee account details and preferences',
        };
    }
  };

  const { title, subtitle } = getPageTitle(currentTab);

  return (
    <div className="min-h-screen flex bg-[#F7F9FC]">
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title={title}
          subtitle={subtitle}
          currentUser={currentUser}
          onResetSeed={currentUser.roles === 'SUPER_ADMIN' ? handleResetSeed : undefined}
        />

        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {isDataLoading && (
            <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700 flex items-center justify-between">
              <span>Synchronizing latest skill matrices...</span>
              <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {currentTab === 'dashboard' && currentUser.roles === 'EMPLOYEE' && (
            <EmployeeDashboard
              currentUser={currentUser}
              mySkills={employeeSkills}
              totalAvailableSkills={skills.length}
              onNavigate={setCurrentTab}
            />
          )}

          {currentTab === 'dashboard' && currentUser.roles === 'MANAGER' && (
            <ManagerDashboard
              currentUser={currentUser}
              dashboardStats={dashboardStats}
              onNavigate={setCurrentTab}
            />
          )}

          {currentTab === 'dashboard' && currentUser.roles === 'SUPER_ADMIN' && (
            <SuperAdminDashboard
              currentUser={currentUser}
              dashboardStats={dashboardStats}
              employees={employees}
              skills={skills}
              employeeSkills={employeeSkills}
              onNavigate={setCurrentTab}
            />
          )}

          {currentTab === 'my-skills' && (
            <MySkills
              skills={skills}
              mySkills={employeeSkills}
              onSaveRating={handleSaveRating}
            />
          )}

          {currentTab === 'matrix' && (
            <SkillMatrix
              employees={employees}
              skills={skills}
              employeeSkills={employeeSkills}
              currentUser={currentUser}
            />
          )}

          {currentTab === 'review' && (
            <SkillReview
              records={employeeSkills}
              employees={employees}
              onReviewAction={handleReviewAction}
              onBatchReview={handleBatchReview}
            />
          )}

          {currentTab === 'employees' && (
            <EmployeeManagement
              employees={employees}
              currentUser={currentUser}
              onRefresh={loadData}
              onCreateEmployee={handleCreateEmployee}
              onUpdateEmployee={handleUpdateEmployee}
              onDeleteEmployee={handleDeleteEmployee}
            />
          )}

          {currentTab === 'skills-mgmt' && (
            <SkillsManagement
              skills={skills}
              onRefresh={loadData}
              onCreateSkill={handleCreateSkill}
              onUpdateSkill={handleUpdateSkill}
              onDeleteSkill={handleDeleteSkill}
            />
          )}

          {currentTab === 'catalog' && <SkillCatalog skills={skills} />}

          {currentTab === 'profile' && (
            <Profile currentUser={currentUser} onUpdateProfile={handleUpdateProfile} />
          )}
        </main>
      </div>
    </div>
  );
}
