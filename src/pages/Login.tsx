import React, { useState } from 'react';
import { Eye, EyeOff, Lock, User, Mail, AlertCircle, ArrowRight, CheckCircle2, UserPlus, ShieldCheck } from 'lucide-react';
import { EvonenceLogo } from '../components/EvonenceLogo';

interface LoginProps {
  onLoginRequest: (userId: string, pass: string) => Promise<void>;
  onRegisterRequest: (data: {
    fName: string;
    lName: string;
    email: string;
    password: string;
  }) => Promise<void>;
}

export const Login: React.FC<LoginProps> = ({ onLoginRequest, onRegisterRequest }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [registrationType, setRegistrationType] = useState<'EMPLOYEE' | 'MANAGER'>('EMPLOYEE');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const changeMode = (nextMode: 'login' | 'register') => {
    setMode(nextMode);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (mode === 'login') {
      if (!userId.trim() || !password) {
        setErrorMessage('Please enter both Email/User ID and Password.');
        return;
      }
    } else {
      if (!firstName.trim() || !lastName.trim() || !userId.trim() || !password) {
        setErrorMessage('Please complete all fields.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match.');
        return;
      }
    }

    setIsLoading(true);
    try {
      if (mode === 'register') {
        await onRegisterRequest({
          fName: firstName.trim(),
          lName: lastName.trim(),
          email: userId.trim().toLowerCase(),
          password,
        });
        setPassword('');
        setConfirmPassword('');
        setFirstName('');
        setLastName('');
        setSuccessMessage(
          registrationType === 'MANAGER'
            ? 'Account created with employee access. Contact a super admin to promote this account to Manager; manager access is not active until approved.'
            : 'Account created. Sign in with your email address and password.'
        );
        setMode('login');
      } else {
        await onLoginRequest(userId.trim(), password);
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : mode === 'register'
        ? 'Unable to create your account. Please try again.'
        : 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F7F9FC]">
      <div className="md:w-5/12 bg-[#08172c] text-white p-8 md:p-12 flex flex-col justify-between border-r border-[#122846] relative overflow-hidden">
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
        <div className="relative z-10 text-[11px] text-slate-400 border-t border-slate-800/80 pt-4 mt-8">
          © {new Date().getFullYear()} Evonence. All rights reserved.
        </div>
      </div>

      <div className="md:w-7/12 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="md:hidden mb-6 pb-4 border-b border-slate-100 flex justify-center">
            <EvonenceLogo variant="light" size="md" showTagline={true} />
          </div>

          <div className="mb-6">
            <h3 className="text-2xl font-bold text-[#0B3A5B]">
              {mode === 'login' ? 'Sign In' : 'Create Your Account'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {mode === 'login'
                ? 'Enter your Evonence enterprise credentials to access the skill matrix.'
                : 'Register as an employee. Your email address will be your login username.'}
            </p>
          </div>

          {successMessage && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <fieldset>
                  <legend className="block text-xs font-semibold text-slate-700 mb-2">Account type</legend>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRegistrationType('EMPLOYEE')}
                      aria-pressed={registrationType === 'EMPLOYEE'}
                      className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-semibold ${
                        registrationType === 'EMPLOYEE'
                          ? 'border-[#1769AA] bg-blue-50 text-[#0B3A5B]'
                          : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <User className="w-4 h-4" /> Employee
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegistrationType('MANAGER')}
                      aria-pressed={registrationType === 'MANAGER'}
                      className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-semibold ${
                        registrationType === 'MANAGER'
                          ? 'border-[#1769AA] bg-blue-50 text-[#0B3A5B]'
                          : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4" /> Manager
                    </button>
                  </div>
                  {registrationType === 'MANAGER' && (
                    <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-[11px] leading-relaxed text-amber-900">
                      Manager accounts require a Super Admin to promote them. This signup creates an employee account first; manager access starts only after the admin changes the role.
                    </p>
                  )}
                </fieldset>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="register_first_name" className="block text-xs font-semibold text-slate-700 mb-1">
                      First Name
                    </label>
                    <input
                      id="register_first_name"
                      type="text"
                      required
                      autoComplete="given-name"
                      maxLength={100}
                      value={firstName}
                      onChange={(event) => setFirstName(event.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1769AA]"
                    />
                  </div>
                  <div>
                    <label htmlFor="register_last_name" className="block text-xs font-semibold text-slate-700 mb-1">
                      Last Name
                    </label>
                    <input
                      id="register_last_name"
                      type="text"
                      required
                      autoComplete="family-name"
                      maxLength={100}
                      value={lastName}
                      onChange={(event) => setLastName(event.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1769AA]"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label htmlFor="login_userid" className="block text-xs font-semibold text-slate-700 mb-1">
                {mode === 'register' ? 'Email Address (your login username)' : 'Corporate Email ID or User ID'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  {mode === 'register' ? <Mail className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>
                <input
                  id="login_userid"
                  type={mode === 'register' ? 'email' : 'text'}
                  required
                  autoComplete={mode === 'register' ? 'email' : 'username'}
                  maxLength={100}
                  value={userId}
                  onChange={(event) => setUserId(event.target.value)}
                  placeholder={mode === 'register' ? 'name@company.com' : 'e.g. name@evonence.com or user ID'}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1769AA] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="login_password" className="block text-xs font-semibold text-slate-700 mb-1">
                Password {mode === 'register' && <span className="font-normal text-slate-500">(at least 8 characters)</span>}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login_password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={mode === 'register' ? 8 : undefined}
                  maxLength={72}
                  autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter password"
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

            {mode === 'register' && (
              <div>
                <label htmlFor="confirm_password" className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirm Password
                </label>
                <input
                  id="confirm_password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  maxLength={72}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Re-enter password"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1769AA]"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#1769AA] hover:bg-[#125386] active:bg-[#0B3A5B] text-white text-sm font-semibold shadow-xs transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{mode === 'register' ? 'Creating account...' : 'Authenticating...'}</span>
                </>
              ) : (
                <>
                  <span>{mode === 'register' ? 'Create Employee Account' : 'Sign In'}</span>
                  {mode === 'register' ? <UserPlus className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                </>
              )}
            </button>
          </form>

          <div className="mt-5 text-center text-xs text-slate-500">
            {mode === 'login' ? "Don't have an account? " : 'Already registered? '}
            <button
              type="button"
              onClick={() => changeMode(mode === 'login' ? 'register' : 'login')}
              className="font-semibold text-[#1769AA] hover:text-[#0B3A5B]"
            >
              {mode === 'login' ? 'Create an account' : 'Sign in'}
            </button>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 text-center text-xs text-slate-400">
            Evonence Cloud Solutions • Single Sign-On Ready
          </div>
        </div>
      </div>
    </div>
  );
};
