import React, { useState } from 'react';
import { Search, UserPlus, Edit2, Trash2, CheckCircle2, Shield, User, X } from 'lucide-react';
import { SafeEmployee, UserRole } from '../types/database';

interface EmployeeManagementProps {
  employees: SafeEmployee[];
  currentUser: SafeEmployee;
  onRefresh: () => void;
  onCreateEmployee: (data: {
    fName: string;
    lName: string;
    Login_userid: string;
    password: string;
    roles: UserRole;
    is_active?: boolean;
  }) => Promise<void>;
  onUpdateEmployee: (
    emp_id: number,
    data: {
      fName?: string;
      lName?: string;
      Login_userid?: string;
      password?: string;
      roles?: UserRole;
      is_active?: boolean;
    }
  ) => Promise<void>;
  onDeleteEmployee: (emp_id: number) => Promise<void>;
}

export const EmployeeManagement: React.FC<EmployeeManagementProps> = ({
  employees,
  currentUser,
  onCreateEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
}) => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<SafeEmployee | null>(null);

  // Form states
  const [fName, setFName] = useState('');
  const [lName, setLName] = useState('');
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('EMPLOYEE');
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const isSuperAdmin = currentUser.roles === 'SUPER_ADMIN';

  const filtered = employees.filter((e) => {
    if (roleFilter !== 'ALL' && e.roles !== roleFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        e.fName.toLowerCase().includes(q) ||
        e.lName.toLowerCase().includes(q) ||
        e.Login_userid.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenCreate = () => {
    setFName('');
    setLName('');
    setLoginId('');
    setPassword('');
    setRole('EMPLOYEE');
    setIsActive(true);
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (emp: SafeEmployee) => {
    setEditingEmp(emp);
    setFName(emp.fName);
    setLName(emp.lName);
    setLoginId(emp.Login_userid);
    setPassword('');
    setRole(emp.roles);
    setIsActive(emp.is_active);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onCreateEmployee({
        fName: fName.trim(),
        lName: lName.trim(),
        Login_userid: loginId.trim(),
        password,
        roles: role,
        is_active: isActive,
      });
      setToastMsg(`Employee ${fName} ${lName} created successfully.`);
      setTimeout(() => setToastMsg(null), 4000);
      setIsCreateOpen(false);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to create employee.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmp) return;
    setIsSubmitting(true);
    try {
      await onUpdateEmployee(editingEmp.emp_id, {
        fName: fName.trim(),
        lName: lName.trim(),
        Login_userid: loginId.trim(),
        password: password.trim() ? password : undefined,
        roles: role,
        is_active: isActive,
      });
      setToastMsg(`Employee ${fName} ${lName} updated successfully.`);
      setTimeout(() => setToastMsg(null), 4000);
      setEditingEmp(null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update employee.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (emp: SafeEmployee) => {
    if (emp.emp_id === currentUser.emp_id) {
      alert('You cannot delete your own active account.');
      return;
    }
    if (!confirm(`Are you sure you want to delete ${emp.fName} ${emp.lName} (@${emp.Login_userid})?`)) {
      return;
    }
    try {
      await onDeleteEmployee(emp.emp_id);
      setToastMsg(`Employee ${emp.fName} deleted.`);
      setTimeout(() => setToastMsg(null), 4000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete employee.');
    }
  };

  return (
    <div className="space-y-6">
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-[#0B3A5B] text-white text-xs font-semibold px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 border border-blue-400">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Control Bar */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-[#0B3A5B]">Employee Accounts & Directory</h2>
            <p className="text-xs text-slate-500">
              {isSuperAdmin
                ? 'Create, edit, manage permissions, and deactivate employee accounts across the company.'
                : 'View directory of engineering staff and managers.'}
            </p>
          </div>

          {isSuperAdmin && (
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 rounded-lg bg-[#1769AA] hover:bg-[#125386] text-white text-xs font-semibold shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add New Employee</span>
            </button>
          )}
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or User ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1769AA]"
            />
          </div>

          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1769AA]"
            >
              <option value="ALL">All Roles</option>
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="MANAGER">Manager</option>
              <option value="EMPLOYEE">Employee</option>
            </select>
          </div>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700 uppercase tracking-wider">
              <tr>
                <th className="p-4">Emp ID</th>
                <th className="p-4">Employee</th>
                <th className="p-4">Login User ID</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Last Logged In</th>
                {isSuperAdmin && <th className="p-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((emp) => (
                <tr key={emp.emp_id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-4 font-mono text-slate-500 font-semibold">#{emp.emp_id}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#1769AA] text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {emp.fName[0]}
                        {emp.lName[0]}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">
                          {emp.fName} {emp.lName}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Created {new Date(emp.created_on).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-mono font-medium text-slate-700">@{emp.Login_userid}</td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        emp.roles === 'SUPER_ADMIN'
                          ? 'bg-blue-100 text-blue-900 border border-blue-200'
                          : emp.roles === 'MANAGER'
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                          : 'bg-slate-100 text-slate-800 border border-slate-200'
                      }`}
                    >
                      {emp.roles === 'SUPER_ADMIN' ? (
                        <Shield className="w-3 h-3" />
                      ) : (
                        <User className="w-3 h-3" />
                      )}
                      <span>
                        {emp.roles === 'SUPER_ADMIN'
                          ? 'Super Admin'
                          : emp.roles === 'MANAGER'
                          ? 'Manager'
                          : 'Employee'}
                      </span>
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        emp.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {emp.is_active ? 'Active' : 'Deactivated'}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500">
                    {emp.last_logged_in ? new Date(emp.last_logged_in).toLocaleString() : 'Never'}
                  </td>
                  {isSuperAdmin && (
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(emp)}
                          className="p-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-blue-700 cursor-pointer transition-colors"
                          title="Edit employee"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(emp)}
                          className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-700 cursor-pointer transition-colors"
                          title="Delete employee"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {(isCreateOpen || editingEmp) && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => {
                setIsCreateOpen(false);
                setEditingEmp(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-base text-[#0B3A5B] mb-1">
              {editingEmp ? `Edit Employee #${editingEmp.emp_id}` : 'Create New Employee'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter employee credentials and assign role permissions.
            </p>

            <form onSubmit={editingEmp ? handleEditSubmit : handleCreateSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">First Name (fName)</label>
                  <input
                    type="text"
                    required
                    value={fName}
                    onChange={(e) => setFName(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1769AA]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Last Name (lName)</label>
                  <input
                    type="text"
                    required
                    value={lName}
                    onChange={(e) => setLName(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1769AA]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Login Identifier (Login_userid)
                </label>
                <input
                  type="text"
                  required
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  placeholder="e.g. jdoe"
                  className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1769AA]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {editingEmp ? 'Change Password (leave empty to keep current)' : 'Login Password'}
                </label>
                <input
                  type="password"
                  required={!editingEmp}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={editingEmp ? '••••••••' : 'Min 6 characters'}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1769AA]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Role (roles)</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1769AA]"
                >
                  <option value="EMPLOYEE">Employee (Self rating & matrix)</option>
                  <option value="MANAGER">Manager (Review & allocation)</option>
                  <option value="SUPER_ADMIN">Super Admin (System wide)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="is_active_toggle"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded text-[#1769AA] focus:ring-[#1769AA]"
                />
                <label htmlFor="is_active_toggle" className="font-semibold text-slate-700">
                  Account is Active (is_active)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateOpen(false);
                    setEditingEmp(null);
                  }}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 font-semibold text-white bg-[#1769AA] hover:bg-[#125386] rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? 'Saving...' : editingEmp ? 'Save Changes' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
