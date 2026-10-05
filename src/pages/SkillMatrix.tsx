import React, { useState, useMemo } from 'react';
import { Search, Filter, Briefcase, Info, X } from 'lucide-react';
import { SafeEmployee, Skill, EmployeeSkillJoined } from '../types/database';
import { getProficiencyLabel, getRatingColors, RatingBadge } from '../components/RatingBadge';

interface SkillMatrixProps {
  employees: SafeEmployee[];
  skills: Skill[];
  employeeSkills: EmployeeSkillJoined[];
  currentUser: SafeEmployee;
}

export const SkillMatrix: React.FC<SkillMatrixProps> = ({
  employees,
  skills,
  employeeSkills,
  currentUser,
}) => {
  const [searchEmployee, setSearchEmployee] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedSkillType, setSelectedSkillType] = useState<string>('ALL');
  const [minRatingFilter, setMinRatingFilter] = useState<number>(0);

  // Inspector modal state
  const [inspectedCell, setInspectedCell] = useState<{
    employee: SafeEmployee;
    skill: Skill;
    record?: EmployeeSkillJoined;
  } | null>(null);

  // Quick allocation finder state
  const [allocationSkillId, setAllocationSkillId] = useState<number | 'ALL'>('ALL');
  const [allocationMinRating, setAllocationMinRating] = useState<number>(3);

  // Categories
  const categories = useMemo(() => Array.from(new Set(skills.map((s) => s.category_name))), [skills]);

  // Lookup map: `${emp_id}_${skill_id}` -> EmployeeSkillJoined
  const matrixMap = useMemo(() => {
    const map = new Map<string, EmployeeSkillJoined>();
    employeeSkills.forEach((item) => {
      if (item.is_active) {
        map.set(`${item.emp_id}_${item.skill_id}`, item);
      }
    });
    return map;
  }, [employeeSkills]);

  // Filter skills
  const filteredSkills = useMemo(() => {
    return skills.filter((s) => {
      if (selectedSkillType !== 'ALL' && s.skill_type !== selectedSkillType) return false;
      if (selectedCategory !== 'ALL' && s.category_name !== selectedCategory) return false;
      return true;
    });
  }, [skills, selectedSkillType, selectedCategory]);

  // Filter employees
  const filteredEmployees = useMemo(() => {
    let list = employees.filter((e) => e.is_active);

    // If Employee role, only show themselves (or team if manager/admin)
    if (currentUser.roles === 'EMPLOYEE') {
      list = list.filter((e) => e.emp_id === currentUser.emp_id);
    }

    if (searchEmployee.trim()) {
      const q = searchEmployee.toLowerCase();
      list = list.filter(
        (e) =>
          e.fName.toLowerCase().includes(q) ||
          e.lName.toLowerCase().includes(q) ||
          e.Login_userid.toLowerCase().includes(q)
      );
    }

    // Min rating filter: employee must have at least one skill matching the min rating
    if (minRatingFilter > 0) {
      list = list.filter((e) => {
        return filteredSkills.some((s) => {
          const rating = matrixMap.get(`${e.emp_id}_${s.skill_id}`)?.self_rating || 0;
          return rating >= minRatingFilter;
        });
      });
    }

    // Allocation finder filter
    if (allocationSkillId !== 'ALL') {
      list = list.filter((e) => {
        const rating = matrixMap.get(`${e.emp_id}_${allocationSkillId}`)?.self_rating || 0;
        return rating >= allocationMinRating;
      });
    }

    return list;
  }, [employees, currentUser, searchEmployee, minRatingFilter, allocationSkillId, allocationMinRating, filteredSkills, matrixMap]);

  return (
    <div className="space-y-6">
      {/* Top Banner and Controls */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-[#0B3A5B]">Organizational Skill Matrix</h2>
            <p className="text-xs text-slate-500">
              Interactive competency mapping across engineers and technical domains. Click any cell to inspect
              experience justification notes.
            </p>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase mr-1">Legend:</span>
            {[1, 2, 3, 4, 5].map((lvl) => {
              const col = getRatingColors(lvl);
              return (
                <span
                  key={lvl}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold border ${col.bg} ${col.text} ${col.border}`}
                >
                  {lvl}: {getProficiencyLabel(lvl)}
                </span>
              );
            })}
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs">
          {currentUser.roles !== 'EMPLOYEE' && (
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search engineer..."
                value={searchEmployee}
                onChange={(e) => setSearchEmployee(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1769AA]"
              />
            </div>
          )}

          <div>
            <select
              value={selectedSkillType}
              onChange={(e) => setSelectedSkillType(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1769AA]"
            >
              <option value="ALL">All Skill Types</option>
              <option value="Hard skills">Hard Skills</option>
              <option value="Soft skills">Soft Skills</option>
            </select>
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1769AA]"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={minRatingFilter}
              onChange={(e) => setMinRatingFilter(Number(e.target.value))}
              className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1769AA]"
            >
              <option value="0">Min Rating: Any</option>
              <option value="3">Min Rating: ★3 (Intermediate+)</option>
              <option value="4">Min Rating: ★4 (Advanced+)</option>
              <option value="5">Min Rating: ★5 (Expert Only)</option>
            </select>
          </div>
        </div>

        {/* Project Task Allocation Assistant (For Managers & Super Admins) */}
        {currentUser.roles !== 'EMPLOYEE' && (
          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#1769AA] shrink-0" />
              <div>
                <span className="font-bold text-[#0B3A5B]">Resource Allocation Helper: </span>
                <span className="text-slate-600">
                  Filter engineers with specific competency level for client project assignments.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={allocationSkillId}
                onChange={(e) =>
                  setAllocationSkillId(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))
                }
                className="bg-white border border-blue-300 rounded px-2 py-1 text-xs text-slate-800"
              >
                <option value="ALL">Select Skill Requirement</option>
                {skills.map((s) => (
                  <option key={s.skill_id} value={s.skill_id}>
                    {s.skillname}
                  </option>
                ))}
              </select>

              <select
                value={allocationMinRating}
                onChange={(e) => setAllocationMinRating(Number(e.target.value))}
                className="bg-white border border-blue-300 rounded px-2 py-1 text-xs text-slate-800"
              >
                <option value="3">Level 3+ (Intermediate)</option>
                <option value="4">Level 4+ (Advanced)</option>
                <option value="5">Level 5 (Expert)</option>
              </select>

              {allocationSkillId !== 'ALL' && (
                <button
                  onClick={() => setAllocationSkillId('ALL')}
                  className="text-xs text-blue-700 underline font-semibold ml-1 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 2D Matrix Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto max-h-[650px] relative">
          <table className="w-full text-left border-collapse min-w-[800px]">
            {/* Header Row */}
            <thead className="bg-[#08172c] text-white text-xs sticky top-0 z-20 shadow-xs">
              <tr>
                <th className="p-3 sticky left-0 z-30 bg-[#08172c] border-r border-[#122846] w-48 font-bold">
                  Engineer ({filteredEmployees.length})
                </th>
                {filteredSkills.map((skill) => (
                  <th
                    key={skill.skill_id}
                    className="p-3 font-semibold text-center border-r border-[#122846] min-w-[110px] max-w-[130px] whitespace-normal"
                    title={`${skill.skill_type} > ${skill.category_name} > ${skill.skillname}`}
                  >
                    <div className="text-[10px] text-cyan-300 font-mono tracking-tight uppercase truncate">
                      {skill.category_name}
                    </div>
                    <div className="text-xs text-white font-bold leading-tight mt-0.5 line-clamp-2">
                      {skill.skillname}
                    </div>
                  </th>
                ))}
                <th className="p-3 font-bold text-center w-28 bg-[#061223]">Avg Score</th>
              </tr>
            </thead>

            {/* Matrix Body */}
            <tbody className="text-xs divide-y divide-slate-200">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={filteredSkills.length + 2} className="py-12 text-center text-slate-400">
                    No matching employees or skills found for current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp, empIdx) => {
                  let employeeTotal = 0;
                  let employeeRatedCount = 0;

                  return (
                    <tr
                      key={emp.emp_id}
                      className={empIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60 hover:bg-blue-50/40'}
                    >
                      {/* Fixed Left Column (Engineer Name) */}
                      <td className="p-3 sticky left-0 z-10 bg-inherit border-r border-slate-200 font-semibold text-slate-900 shadow-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#1769AA] text-white flex items-center justify-center font-bold text-[11px] shrink-0">
                            {emp.fName[0]}
                            {emp.lName[0]}
                          </div>
                          <div className="truncate">
                            <div className="truncate">
                              {emp.fName} {emp.lName}
                            </div>
                            <div className="text-[10px] text-slate-400 font-normal truncate">
                              @{emp.Login_userid} • {emp.roles.toLowerCase()}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Skill Rating Cells */}
                      {filteredSkills.map((skill) => {
                        const record = matrixMap.get(`${emp.emp_id}_${skill.skill_id}`);
                        const rating = record?.self_rating || 0;
                        if (rating > 0) {
                          employeeTotal += rating;
                          employeeRatedCount++;
                        }

                        const colors = getRatingColors(rating);

                        return (
                          <td
                            key={skill.skill_id}
                            className="p-2 text-center border-r border-slate-200 align-middle"
                          >
                            <button
                              type="button"
                              onClick={() => setInspectedCell({ employee: emp, skill, record })}
                              className={`w-full py-1.5 px-1 rounded-md font-bold text-xs transition-transform hover:scale-105 active:scale-95 cursor-pointer flex flex-col items-center justify-center ${
                                rating > 0
                                  ? `${colors.bg} ${colors.text} border ${colors.border} shadow-2xs`
                                  : 'text-slate-300 hover:text-slate-500 hover:bg-slate-100'
                              }`}
                              title={
                                rating > 0
                                  ? `${emp.fName} ${emp.lName} - ${skill.skillname}: ${rating}/5 (${getProficiencyLabel(
                                      rating
                                    )})\nClick to inspect comments & review`
                                  : 'Not rated'
                              }
                            >
                              {rating > 0 ? (
                                <>
                                  <span className="flex items-center gap-0.5">
                                    <span>★</span>
                                    <span>{rating}</span>
                                  </span>
                                  <span className="text-[9px] font-medium opacity-80 truncate max-w-[80px]">
                                    {getProficiencyLabel(rating)}
                                  </span>
                                </>
                              ) : (
                                <span className="text-slate-300">-</span>
                              )}
                            </button>
                          </td>
                        );
                      })}

                      {/* Row Avg */}
                      <td className="p-3 text-center font-bold text-slate-800 bg-slate-100/50">
                        {employeeRatedCount > 0 ? (
                          <div>
                            <span className="text-xs text-[#0B3A5B]">
                              {(employeeTotal / employeeRatedCount).toFixed(1)}
                            </span>
                            <span className="text-[10px] text-slate-400 ml-0.5">/5</span>
                            <div className="text-[9px] text-slate-500 font-normal">
                              ({employeeRatedCount} skills)
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-normal">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* Column Avg Footer */}
            {filteredEmployees.length > 0 && (
              <tfoot className="bg-slate-100 text-slate-700 font-bold text-xs border-t-2 border-slate-300 sticky bottom-0 z-20">
                <tr>
                  <td className="p-3 sticky left-0 z-30 bg-slate-100 border-r border-slate-300 text-slate-800">
                    Domain Avg (All)
                  </td>
                  {filteredSkills.map((skill) => {
                    let colSum = 0;
                    let colCount = 0;
                    filteredEmployees.forEach((emp) => {
                      const r = matrixMap.get(`${emp.emp_id}_${skill.skill_id}`)?.self_rating;
                      if (r) {
                        colSum += r;
                        colCount++;
                      }
                    });
                    const avg = colCount > 0 ? (colSum / colCount).toFixed(1) : '-';
                    return (
                      <td key={skill.skill_id} className="p-2 text-center border-r border-slate-300">
                        <div className="text-xs font-bold text-blue-900">{avg}</div>
                        <div className="text-[9px] text-slate-500 font-normal">{colCount} rated</div>
                      </td>
                    );
                  })}
                  <td className="p-2 text-center bg-slate-200 text-slate-900">
                    Matrix Summary
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Cell Inspector Modal */}
      {inspectedCell && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setInspectedCell(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#1769AA] flex items-center justify-center">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#0B3A5B]">{inspectedCell.skill.skillname}</h3>
                <p className="text-xs text-slate-500">
                  {inspectedCell.skill.skill_type} • {inspectedCell.skill.category_name}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500">Evaluated Engineer</div>
                  <div className="font-bold text-sm text-slate-900">
                    {inspectedCell.employee.fName} {inspectedCell.employee.lName}
                  </div>
                  <div className="text-[11px] text-slate-400">@{inspectedCell.employee.Login_userid}</div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-500 mb-1">Rating</div>
                  {inspectedCell.record ? (
                    <RatingBadge rating={inspectedCell.record.self_rating} size="md" />
                  ) : (
                    <span className="text-xs text-slate-400">Not rated yet</span>
                  )}
                </div>
              </div>

              {inspectedCell.record ? (
                <>
                  <div>
                    <div className="text-xs font-semibold text-slate-700 mb-1">
                      Justification & Review Notes
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                      {inspectedCell.record.comments || 'No comment provided by engineer.'}
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-100">
                    <span>Record Status: {inspectedCell.record.is_active ? 'Active' : 'Inactive'}</span>
                    <span>
                      Timestamp: {new Date(inspectedCell.record.add_update_timestamp).toLocaleString()}
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-xs text-slate-500 p-4 text-center">
                  This engineer has not registered a proficiency rating for this skill yet.
                </div>
              )}
            </div>

            <div className="mt-6 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setInspectedCell(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
