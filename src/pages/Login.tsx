import React, { useState } from 'react';
import { Eye, EyeOff, Lock, User, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { EvonenceLogo } from '../components/EvonenceLogo';
import { SafeEmployee } from '../types/database';

interface LoginProps {
  onLoginSuccess: (user: SafeEmployee) => void;
  onLoginRequest: (userId: string, pass: string) => Promise<void>;
}

export const Login: React.FC<LoginProps> = ({ onLoginRequest }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId.trim() || !password.trim()) {
      setErrorMessage('Please enter both User ID and Password.');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);
    try {
      await onLoginRequest(userId.trim(), password);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid credentials. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (u: string, p: string) => {
    setUserId(u);
    setPassword(p);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F7F9FC]">
      {/* Left Brand Showcase Banner */}
      <div className="md:w-5/12 bg-[#08172c] text-white p-8 md:p-12 flex flex-col justify-between border-r border-[#122846] relative overflow-hidden">
        {/* Background decorative ambient glow */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#00A0E9]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#1769AA]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <EvonenceLogo variant="dark" size="lg" showTagline={true} />
          <div className="mt-12 space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#00A0E9]/20 text-[#00A0E9] border border-[#00A0E9]/30">
              <CheckCircle2 className="w-3.5 h-3.5" /> Internal Enterprise Platform
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
              Employee Skill Matrix & Resource Planning
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Empowering engineers and managers at Evonence to catalogue competencies, maintain verified skill
              hierarchies, evaluate proficiencies, and allocate the right talent to client projects.
            </p>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="relative z-10 my-8 space-y-3">
          <div className="flex items-start gap-3 text-xs text-slate-300">
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 font-bold">
              ✓
            </div>
            <span>Strict 3-table relational schema architecture (Employee, Skills, Employee_skills).</span>
          </div>
          <div className="flex items-start gap-3 text-xs text-slate-300">
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 font-bold">
              ✓
            </div>
            <span>Role-Based Access Control for Super Admin, Manager, and Engineering staff.</span>
          </div>
          <div className="flex items-start gap-3 text-xs text-slate-300">
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 font-bold">
              ✓
            </div>
            <span>1–5 Proficiency self-rating workflow with Manager review and matrix visualization.</span>
          </div>
        </div>

        <div className="relative z-10 text-[11px] text-slate-400 border-t border-slate-800/80 pt-4">
          © {new Date().getFullYear()} Evonence. All rights reserved.
        </div>
      </div>

      {/* Right Login Form */}
      <div className="md:w-7/12 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          {/* Mobile Brand Logo */}
          <div className="md:hidden mb-6 pb-4 border-b border-slate-100 flex justify-center">
            <EvonenceLogo variant="light" size="md" showTagline={true} />
          </div>

          <div className="mb-6">
            <h3 className="text-2xl font-bold text-[#0B3A5B]">Sign In</h3>
            <p className="text-xs text-slate-500 mt-1">
              Enter your Evonence enterprise credentials to access the skill matrix.
            </p>
          </div>

          {/* Quick Demo Fill Buttons */}
          <div className="mb-6 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Quick Demo Logins (Click to populate):
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin', 'Admin@123')}
                className="text-left px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <div className="font-semibold text-blue-900">Super Admin</div>
                <div className="text-[10px] text-slate-500">admin / Admin@123</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('manager', 'Manager@123')}
                className="text-left px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:border-emerald-500 hover:bg-emerald-50 transition-colors"
              >
                <div className="font-semibold text-emerald-900">Manager</div>
                <div className="text-[10px] text-slate-500">manager / Manager@123</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('emp1', 'Emp@123')}
                className="text-left px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:border-slate-400 hover:bg-slate-100 transition-colors"
              >
                <div className="font-semibold text-slate-800">John (Employee)</div>
                <div className="text-[10px] text-slate-500">emp1 / Emp@123</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('emp2', 'Emp@123')}
                className="text-left px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:border-slate-400 hover:bg-slate-100 transition-colors"
              >
                <div className="font-semibold text-slate-800">Jane (Employee)</div>
                <div className="text-[10px] text-slate-500">emp2 / Emp@123</div>
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login_userid" className="block text-xs font-semibold text-slate-700 mb-1">
                Login User ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="login_userid"
                  type="text"
                  required
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="e.g. admin, manager, emp1"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1769AA] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="login_password" className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login_password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1769AA] focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#1769AA] hover:bg-[#125386] active:bg-[#0B3A5B] text-white text-sm font-semibold shadow-xs transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-400">
            Evonence Cloud Solutions • Single Sign-On Ready
          </div>
        </div>
      </div>
    </div>
  );
};
