import React from 'react';
import { Award, Star, TrendingUp, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { SafeEmployee, EmployeeSkillJoined } from '../types/database';
import { RatingBadge } from '../components/RatingBadge';

interface EmployeeDashboardProps {
  currentUser: SafeEmployee;
  mySkills: EmployeeSkillJoined[];
  totalAvailableSkills: number;
  onNavigate: (tab: any) => void;
}

export const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({
  currentUser,
  mySkills,
  totalAvailableSkills,
  onNavigate,
}) => {
  const activeSkills = mySkills.filter((s) => s.is_active);
  const totalRated = activeSkills.length;
  const avgRating =
    totalRated > 0
      ? Number((activeSkills.reduce((acc, curr) => acc + curr.self_rating, 0) / totalRated).toFixed(1))
      : 0;

  const expertCount = activeSkills.filter((s) => s.self_rating >= 4.5).length;
  const advancedCount = activeSkills.filter((s) => s.self_rating >= 3.5 && s.self_rating < 4.5).length;
  const intermediateCount = activeSkills.filter((s) => s.self_rating >= 2.5 && s.self_rating < 3.5).length;
  const basicCount = activeSkills.filter((s) => s.self_rating >= 1.5 && s.self_rating < 2.5).length;
  const beginnerCount = activeSkills.filter((s) => s.self_rating < 1.5).length;

  // Rating distribution counts
  const dist = [
    { level: 5, label: 'Expert (4.5–5.0)', count: expertCount, color: 'bg-emerald-500' },
    { level: 4, label: 'Advanced (3.5–4.4)', count: advancedCount, color: 'bg-blue-600' },
    { level: 3, label: 'Intermediate (2.5–3.4)', count: intermediateCount, color: 'bg-indigo-500' },
    { level: 2, label: 'Basic (1.5–2.4)', count: basicCount, color: 'bg-sky-400' },
    { level: 1, label: 'Beginner (0.5–1.4)', count: beginnerCount, color: 'bg-slate-400' },
  ];

  const recentUpdates = [...activeSkills]
    .sort((a, b) => new Date(b.add_update_timestamp).getTime() - new Date(a.add_update_timestamp).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#0B3A5B] to-[#1769AA] rounded-2xl p-6 md:p-8 text-white shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-cyan-200 backdrop-blur-xs mb-3 border border-white/15">
            <CheckCircle2 className="w-3.5 h-3.5" /> Evonence Engineering Portal
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Welcome back, {currentUser.fName}!
          </h2>
          <p className="text-slate-200 text-xs md:text-sm mt-1 max-w-xl">
            Keep your professional skills up to date so project leads can accurately map your expertise to
            upcoming client architectures and cloud transformation initiatives.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => onNavigate('my-skills')}
            className="px-4 py-2.5 rounded-lg bg-[#20A36A] hover:bg-[#198555] text-white text-xs md:text-sm font-semibold shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Award className="w-4 h-4" />
            <span>Update My Skills</span>
          </button>
          <button
            onClick={() => onNavigate('matrix')}
            className="px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs md:text-sm font-semibold backdrop-blur-xs flex items-center gap-2 transition-colors cursor-pointer border border-white/20"
          >
            <span>View Skill Matrix</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              My Rated Skills
            </span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#1769AA] flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#0B3A5B]">{totalRated}</span>
            <span className="text-xs text-slate-500">of {totalAvailableSkills} catalog skills</span>
          </div>
          <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-[#1769AA] h-1.5 rounded-full"
              style={{
                width: `${totalAvailableSkills > 0 ? (totalRated / totalAvailableSkills) * 100 : 0}%`,
              }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Average Rating
            </span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#0B3A5B]">{avgRating}</span>
            <span className="text-xs text-slate-500">out of 5.0</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {avgRating >= 4 ? 'Advanced Competency Level' : avgRating >= 3 ? 'Solid Intermediate' : 'Developing'}
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              High Confidence (4–5★)
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-[#20A36A] flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-700">{expertCount + advancedCount}</span>
            <span className="text-xs text-slate-500">core proficiencies</span>
          </div>
          <div className="mt-2 text-xs text-emerald-600">
            {expertCount} Expert • {advancedCount} Advanced
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Last Login
            </span>
            <div className="w-9 h-9 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-sm font-semibold text-slate-800">
            {currentUser.last_logged_in ? new Date(currentUser.last_logged_in).toLocaleDateString() : 'Today'}
          </div>
          <div className="mt-1 text-xs text-slate-400">
            Account Status:{' '}
            <span className="text-emerald-600 font-semibold">{currentUser.is_active ? 'Active' : 'Inactive'}</span>
          </div>
        </div>
      </div>

      {/* Breakdown and Recent Submissions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Proficiency Distribution */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs lg:col-span-1">
          <h3 className="text-sm font-bold text-[#0B3A5B] mb-4">Proficiency Distribution</h3>
          <div className="space-y-3">
            {dist.map((item) => (
              <div key={item.level} className="text-xs">
                <div className="flex justify-between font-medium mb-1">
                  <span className="text-slate-700">
                    {item.level}★ {item.label}
                  </span>
                  <span className="text-slate-500 font-semibold">{item.count} skills</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`${item.color} h-2 rounded-full transition-all duration-300`}
                    style={{
                      width: `${totalRated > 0 ? (item.count / totalRated) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500">
            Proficiencies are periodically reviewed by technical managers to maintain project staffing accuracy.
          </div>
        </div>

        {/* Recently Updated Skills */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#0B3A5B]">My Recently Rated Skills</h3>
            <button
              onClick={() => onNavigate('my-skills')}
              className="text-xs text-[#1769AA] hover:text-[#0B3A5B] font-semibold"
            >
              View All Skills →
            </button>
          </div>

          {recentUpdates.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <Award className="w-10 h-10 mx-auto opacity-30 mb-2" />
              <p className="text-xs">You have not rated any skills yet.</p>
              <button
                onClick={() => onNavigate('my-skills')}
                className="mt-3 px-3 py-1.5 rounded-lg bg-[#1769AA] text-white text-xs font-semibold"
              >
                Start Rating Skills
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentUpdates.map((item) => (
                <div key={item.unique_id} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="font-semibold text-sm text-slate-800 truncate">
                      {item.skill?.skillname || `Skill #${item.skill_id}`}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                      <span>{item.skill?.category_name}</span>
                      <span>•</span>
                      <span className="italic truncate max-w-xs">{item.comments || 'No comment provided'}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <RatingBadge rating={item.self_rating} size="sm" />
                    <div className="text-[10px] text-slate-400 mt-1">
                      {new Date(item.add_update_timestamp).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
