import React from 'react';
import { Users, Award, TrendingUp, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';
import { SafeEmployee } from '../types/database';

interface ManagerDashboardProps {
  currentUser: SafeEmployee;
  dashboardStats: any;
  onNavigate: (tab: any) => void;
}

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({
  currentUser,
  dashboardStats,
  onNavigate,
}) => {
  const stats = dashboardStats || {
    totalEmployees: 0,
    totalSkills: 0,
    totalRatingsRecorded: 0,
    averageRating: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    strongestSkills: [],
    skillGaps: [],
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#0B3A5B] via-[#0e446c] to-[#1769AA] rounded-2xl p-6 md:p-8 text-white shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 backdrop-blur-xs mb-3 border border-emerald-400/30">
            <ShieldCheck className="w-3.5 h-3.5" /> Management & Allocation Hub
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Manager Portal — {currentUser.fName} {currentUser.lName}
          </h2>
          <p className="text-slate-200 text-xs md:text-sm mt-1 max-w-2xl">
            Evaluate engineering skill inventories, review self-ratings, identify team skill gaps, and allocate
            bench capacity to incoming cloud adoption projects.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => onNavigate('review')}
            className="px-4 py-2.5 rounded-lg bg-[#20A36A] hover:bg-[#198555] text-white text-xs md:text-sm font-semibold shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Award className="w-4 h-4" />
            <span>Review Skill Submissions</span>
          </button>
          <button
            onClick={() => onNavigate('matrix')}
            className="px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs md:text-sm font-semibold backdrop-blur-xs flex items-center gap-2 transition-colors cursor-pointer border border-white/20"
          >
            <span>Team Skill Matrix</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Aggregate Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Engineers
            </span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#1769AA] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#0B3A5B]">{stats.totalEmployees}</span>
            <span className="text-xs text-slate-500">active profiles</span>
          </div>
          <div className="mt-2 text-xs text-slate-400">Available for task allocation</div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Skills in Catalog
            </span>
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#0B3A5B]">{stats.totalSkills}</span>
            <span className="text-xs text-slate-500">standard competencies</span>
          </div>
          <div className="mt-2 text-xs text-slate-400">Hard & soft skill categories</div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Ratings
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-[#20A36A] flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-700">{stats.totalRatingsRecorded}</span>
            <span className="text-xs text-slate-500">evaluations</span>
          </div>
          <div className="mt-2 text-xs text-emerald-600 font-medium">Team Avg: {stats.averageRating} / 5.0</div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Team Capabilities
            </span>
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-purple-900">
              {(stats.ratingDistribution?.[5] || 0) + (stats.ratingDistribution?.[4] || 0)}
            </span>
            <span className="text-xs text-slate-500">Expert / Advanced ratings</span>
          </div>
          <div className="mt-2 text-xs text-purple-700">Ready for senior project leads</div>
        </div>
      </div>

      {/* Strengths & Gaps Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strongest Skills */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <h3 className="text-sm font-bold text-[#0B3A5B]">Top Team Competencies (Strengths)</h3>
            </div>
            <span className="text-xs text-slate-400">High avg proficiency</span>
          </div>

          <div className="space-y-3">
            {stats.strongestSkills?.length > 0 ? (
              stats.strongestSkills.map((item: any) => (
                <div
                  key={item.skill?.skill_id}
                  className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold text-xs text-slate-800">{item.skill?.skillname}</div>
                    <div className="text-[11px] text-slate-500">
                      {item.skill?.category_name} • {item.count} engineers rated
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800">
                      ★ {item.avgRating} / 5
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-400 py-6 text-center">No competency ratings yet.</div>
            )}
          </div>
        </div>

        {/* Skill Gaps */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-[#0B3A5B]">Identified Skill Gaps / Low Supply</h3>
            </div>
            <span className="text-xs text-slate-400">Opportunities for upskilling</span>
          </div>

          <div className="space-y-3">
            {stats.skillGaps?.length > 0 ? (
              stats.skillGaps.map((item: any) => (
                <div
                  key={item.skill?.skill_id}
                  className="p-3 rounded-lg border border-amber-100 bg-amber-50/40 flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold text-xs text-slate-800">{item.skill?.skillname}</div>
                    <div className="text-[11px] text-slate-500">
                      {item.skill?.category_name} • {item.count === 0 ? 'No engineers rated' : `${item.count} engineer(s)`}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800">
                      {item.count === 0 ? 'Zero coverage' : `★ ${item.avgRating} avg`}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-400 py-6 text-center">No current skill gaps detected.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
