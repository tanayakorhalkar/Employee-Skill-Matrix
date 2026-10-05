import React, { useState } from 'react';
import { User, Shield, CheckCircle2, Lock } from 'lucide-react';
import { SafeEmployee } from '../types/database';

interface ProfileProps {
  currentUser: SafeEmployee;
  onUpdateProfile: (data: { fName?: string; lName?: string; password?: string }) => Promise<void>;
}

export const Profile: React.FC<ProfileProps> = ({ currentUser, onUpdateProfile }) => {
  const [fName, setFName] = useState(currentUser.fName);
  const [lName, setLName] = useState(currentUser.lName);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
      alert('New password and confirmation do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onUpdateProfile({
        fName: fName.trim(),
        lName: lName.trim(),
        password: newPassword.trim() ? newPassword : undefined,
      });
      setToastMsg('Profile updated successfully!');
      setTimeout(() => setToastMsg(null), 4000);
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-[#0B3A5B] text-white text-xs font-semibold px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 border border-blue-400">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Profile Overview Card */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-[#0B3A5B] text-white flex items-center justify-center font-bold text-2xl uppercase shadow-md shrink-0">
          {currentUser.fName[0]}
          {currentUser.lName[0]}
        </div>

        <div className="flex-1 text-center sm:text-left space-y-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h2 className="text-xl font-bold text-[#0B3A5B]">
              {currentUser.fName} {currentUser.lName}
            </h2>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-900 border border-blue-200 w-fit mx-auto sm:mx-0">
              <Shield className="w-3 h-3" />
              <span>{currentUser.roles.replace('_', ' ')}</span>
            </span>
          </div>
          <p className="text-xs font-mono text-slate-500">Login ID: @{currentUser.Login_userid}</p>
          <p className="text-xs text-slate-400">
            Internal Employee ID: #{currentUser.emp_id} • Account Status:{' '}
            <span className="text-emerald-600 font-semibold">{currentUser.is_active ? 'Active' : 'Inactive'}</span>
          </p>
        </div>
      </div>

      {/* Account Details and Edit Form */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-6">
        <div>
          <h3 className="text-sm font-bold text-[#0B3A5B] flex items-center gap-2">
            <User className="w-4 h-4 text-[#1769AA]" />
            <span>Account Details & Profile Settings</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Update personal name or change your login password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">First Name (fName)</label>
              <input
                type="text"
                required
                value={fName}
                onChange={(e) => setFName(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1769AA]"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Last Name (lName)</label>
              <input
                type="text"
                required
                value={lName}
                onChange={(e) => setLName(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1769AA]"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-4">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-slate-400" />
              <span className="font-bold text-slate-700">Change Password (Optional)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Leave empty to keep unchanged"
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1769AA]"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1769AA]"
                />
              </div>
            </div>
          </div>

          {/* Audit Metadata Readonly */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-500">
            <div>
              <div className="font-semibold text-slate-700">Created On</div>
              <div>{new Date(currentUser.created_on).toLocaleString()}</div>
            </div>
            <div>
              <div className="font-semibold text-slate-700">Last Profile Update</div>
              <div>{new Date(currentUser.updated_on).toLocaleString()}</div>
            </div>
            <div>
              <div className="font-semibold text-slate-700">Last Logged In</div>
              <div>
                {currentUser.last_logged_in
                  ? new Date(currentUser.last_logged_in).toLocaleString()
                  : 'Current Session'}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-[#1769AA] hover:bg-[#125386] text-white font-semibold rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
