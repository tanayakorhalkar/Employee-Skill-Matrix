import React from 'react';
import {
  LayoutDashboard,
  Grid,
  Users,
  Award,
  CheckCircle2,
  User,
  LogOut,
  FolderTree,
  ChevronRight,
  Shield,
  Briefcase,
  UserCheck,
} from 'lucide-react';
import { EvonenceLogo } from './EvonenceLogo';
import { SafeEmployee, UserRole } from '../types/database';

export type NavTab =
  | 'dashboard'
  | 'my-skills'
  | 'matrix'
  | 'review'
  | 'employees'
  | 'skills-mgmt'
  | 'catalog'
  | 'profile';

interface NavigationProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  currentUser: SafeEmployee;
  onLogout: () => void;
}

export const Sidebar: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  onLogout,
}) => {
  const role = currentUser.roles;

  const roleBadge = (r: UserRole) => {
    switch (r) {
      case 'SUPER_ADMIN':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-900 text-blue-200 border border-blue-700">
            <Shield className="w-3 h-3 text-cyan-400" /> Super Admin
          </span>
        );
      case 'MANAGER':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-950 text-emerald-200 border border-emerald-700">
            <Briefcase className="w-3 h-3 text-emerald-400" /> Manager
          </span>
        );
      case 'EMPLOYEE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-200 border border-slate-700">
            <UserCheck className="w-3 h-3 text-slate-300" /> Employee
          </span>
        );
    }
  };

  const navItems = [
    // Common Dashboard
    {
      id: 'dashboard' as NavTab,
      label: role === 'MANAGER' ? 'Manager Dashboard' : role === 'SUPER_ADMIN' ? 'Admin Dashboard' : 'My Dashboard',
      icon: LayoutDashboard,
      roles: ['SUPER_ADMIN', 'MANAGER', 'EMPLOYEE'],
    },
    // Employee Specific
    {
      id: 'my-skills' as NavTab,
      label: 'My Skills & Ratings',
      icon: Award,
      roles: ['EMPLOYEE'],
    },
    // Skill Matrix (All roles)
    {
      id: 'matrix' as NavTab,
      label: role === 'EMPLOYEE' ? 'My Skill Matrix' : 'Skill Matrix',
      icon: Grid,
      roles: ['SUPER_ADMIN', 'MANAGER', 'EMPLOYEE'],
    },
    // Manager & Admin: Review
    {
      id: 'review' as NavTab,
      label: 'Skill Review & Approvals',
      icon: CheckCircle2,
      roles: ['SUPER_ADMIN', 'MANAGER'],
    },
    // Catalog (for browsing hierarchy)
    {
      id: 'catalog' as NavTab,
      label: 'Skill Hierarchy Catalog',
      icon: FolderTree,
      roles: ['EMPLOYEE', 'MANAGER'],
    },
    // Admin only
    {
      id: 'employees' as NavTab,
      label: 'Employee Management',
      icon: Users,
      roles: ['SUPER_ADMIN', 'MANAGER'], // Managers can view team
    },
    {
      id: 'skills-mgmt' as NavTab,
      label: 'Skills Master Management',
      icon: Award,
      roles: ['SUPER_ADMIN'],
    },
    // Profile
    {
      id: 'profile' as NavTab,
      label: 'My Profile',
      icon: User,
      roles: ['SUPER_ADMIN', 'MANAGER', 'EMPLOYEE'],
    },
  ];

  const visibleNav = navItems.filter((item) => item.roles.includes(role));

  return (
    <aside className="w-64 bg-[#08172c] text-slate-200 flex flex-col border-r border-[#122846] shrink-0 h-screen sticky top-0">
      {/* Brand Header */}
      <div className="p-4 border-b border-[#122846]">
        <EvonenceLogo variant="dark" size="sm" showTagline={true} />
        <div className="mt-2 text-[10px] text-slate-400 font-medium tracking-wider uppercase pl-1">
          Skill Matrix Enterprise
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
          Navigation
        </div>
        {visibleNav.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[#1769AA] text-white shadow-sm'
                  : 'text-slate-300 hover:bg-[#0e2444] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {isActive && <ChevronRight className="w-4 h-4 text-white/80" />}
            </button>
          );
        })}
      </nav>

      {/* User Footer Panel */}
      <div className="p-3 border-t border-[#122846] bg-[#061223]">
        <div className="flex items-center justify-between gap-2 px-2 py-1 mb-2">
          <div className="truncate">
            <div className="text-xs font-semibold text-white truncate">
              {currentUser.fName} {currentUser.lName}
            </div>
            <div className="text-[11px] text-slate-400 truncate">@{currentUser.Login_userid}</div>
          </div>
          <div>{roleBadge(role)}</div>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-300 hover:text-red-300 hover:bg-red-950/40 rounded-md transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export const Header: React.FC<{
  title: string;
  subtitle?: string;
  currentUser: SafeEmployee;
  onResetSeed?: () => void;
}> = ({ title, subtitle, currentUser, onResetSeed }) => {
  return (
    <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10 shadow-xs">
      <div>
        <h1 className="text-xl font-bold text-[#0B3A5B] tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {currentUser.roles === 'SUPER_ADMIN' && onResetSeed && (
          <button
            onClick={onResetSeed}
            className="text-xs px-2.5 py-1 text-slate-600 hover:text-blue-700 hover:bg-blue-50 border border-slate-200 rounded-md transition-colors"
            title="Reset to default seed data"
          >
            Reset Seed Data
          </button>
        )}

        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-[#1769AA] text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
            {currentUser.fName[0]}
            {currentUser.lName[0]}
          </div>
          <div className="text-right hidden sm:block">
            <div className="text-xs font-semibold text-slate-800">
              {currentUser.fName} {currentUser.lName}
            </div>
            <div className="text-[10px] text-slate-500 capitalize">
              {currentUser.roles.replace('_', ' ').toLowerCase()}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
