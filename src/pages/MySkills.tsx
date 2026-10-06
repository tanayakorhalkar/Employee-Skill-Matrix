import React, { useState, useMemo } from 'react';
import { Search, Filter, Award, CheckCircle2, Edit3, Plus, X } from 'lucide-react';
import { Skill, EmployeeSkillJoined } from '../types/database';
import { RatingBadge } from '../components/RatingBadge';
import { RatingInput } from '../components/RatingInput';

interface MySkillsProps {
  skills: Skill[];
  mySkills: EmployeeSkillJoined[];
  onSaveRating: (skillId: number, rating: number, comments: string) => Promise<void>;
}

export const MySkills: React.FC<MySkillsProps> = ({ skills, mySkills, onSaveRating }) => {
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Modal State for Rating
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [ratingVal, setRatingVal] = useState<number>(3);
  const [commentsVal, setCommentsVal] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Map of existing ratings: skill_id -> EmployeeSkillJoined
  const myRatingsMap = new Map<number, EmployeeSkillJoined>();
  mySkills.forEach((s) => {
    if (s.is_active) {
      myRatingsMap.set(s.skill_id, s);
    }
  });

  // Extract unique categories synchronized dynamically to selectedType
  const availableCategories = useMemo(() => {
    let pool = skills;
    if (selectedType !== 'ALL') {
      pool = skills.filter((s) => s.skill_type === selectedType);
    }
    return Array.from(new Set(pool.map((s) => s.category_name))).sort();
  }, [skills, selectedType]);

  const handleTypeChange = (newType: string) => {
    setSelectedType(newType);
    // When changing type, if current category is not under the new type, reset to 'ALL'
    if (selectedCategory !== 'ALL') {
      const allowedCats = skills
        .filter((s) => (newType === 'ALL' ? true : s.skill_type === newType))
        .map((s) => s.category_name);
      if (!allowedCats.includes(selectedCategory)) {
        setSelectedCategory('ALL');
      }
    }
  };

  // Filter skills
  const filteredSkills = skills.filter((s) => {
    if (selectedType !== 'ALL' && s.skill_type !== selectedType) return false;
    if (selectedCategory !== 'ALL' && s.category_name !== selectedCategory) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        s.skillname.toLowerCase().includes(q) ||
        s.category_name.toLowerCase().includes(q) ||
        s.skill_type.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Group by skill_type, then category_name
  const groupedSkills: Record<string, Record<string, Skill[]>> = {};
  filteredSkills.forEach((s) => {
    if (!groupedSkills[s.skill_type]) groupedSkills[s.skill_type] = {};
    if (!groupedSkills[s.skill_type][s.category_name]) groupedSkills[s.skill_type][s.category_name] = [];
    groupedSkills[s.skill_type][s.category_name].push(s);
  });

  const handleOpenRatingModal = (skill: Skill) => {
    const existing = myRatingsMap.get(skill.skill_id);
    setEditingSkill(skill);
    setRatingVal(existing ? existing.self_rating : 3);
    setCommentsVal(existing?.comments || '');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSkill) return;

    setIsSubmitting(true);
    try {
      await onSaveRating(editingSkill.skill_id, ratingVal, commentsVal);
      setToastMsg(`Rating for ${editingSkill.skillname} successfully saved!`);
      setTimeout(() => setToastMsg(null), 4000);
      setEditingSkill(null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to save rating.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-700 text-white text-xs font-semibold px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header and Filter Controls */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-[#0B3A5B]">Skill Catalog & Self-Rating</h2>
            <p className="text-xs text-slate-500">
              Browse the organizational skill hierarchy and submit your self-assessment ratings (1–5).
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="px-2.5 py-1 rounded bg-blue-50 text-[#1769AA] border border-blue-200">
              {myRatingsMap.size} Rated by You
            </span>
            <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-600 border border-slate-200">
              {skills.length} Total in Catalog
            </span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row gap-3 pt-2 border-t border-slate-100">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search skills by name or category (e.g. Python, React, GCP)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1769AA]"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedType}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1769AA]"
            >
              <option value="ALL">All Types</option>
              <option value="Technical skills">Technical Skills</option>
              <option value="Soft skills">Soft Skills</option>
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1769AA]"
            >
              <option value="ALL">
                {selectedType === 'ALL'
                  ? 'All Categories'
                  : `All ${selectedType === 'Technical skills' ? 'Technical' : 'Soft'} Categories`}
              </option>
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Hierarchical Skill Groups */}
      <div className="space-y-6">
        {Object.entries(groupedSkills).map(([skillType, catMap]) => {
          const displayType = skillType === 'Hard skills' ? 'Technical Skills' : skillType;
          return (
            <div key={skillType} className="space-y-4">
              <div className="flex items-center gap-2 pb-1 border-b-2 border-slate-200">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    skillType === 'Technical skills' || skillType === 'Hard skills'
                      ? 'bg-[#1769AA]'
                      : 'bg-[#20A36A]'
                  }`}
                />
                <h3 className="text-base font-extrabold text-[#0B3A5B] tracking-tight">{displayType}</h3>
              </div>

            {Object.entries(catMap).map(([catName, skillList]) => (
              <div key={catName} className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700">{catName}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-500 font-mono">
                      Cat ID: {skillList[0]?.category_id}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {skillList.length} skill{skillList.length > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {skillList.map((skill) => {
                    const existing = myRatingsMap.get(skill.skill_id);
                    return (
                      <div
                        key={skill.skill_id}
                        className={`p-3.5 rounded-lg border transition-all ${
                          existing
                            ? 'bg-blue-50/30 border-blue-200 hover:border-blue-400'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-semibold text-sm text-slate-900">{skill.skillname}</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              Skill ID: #{skill.skill_id}
                            </div>
                          </div>

                          {existing ? (
                            <RatingBadge rating={existing.self_rating} size="sm" />
                          ) : (
                            <span className="text-[11px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                              Not Rated
                            </span>
                          )}
                        </div>

                        {existing && existing.comments && (
                          <div className="mt-2 text-xs text-slate-600 bg-white/80 p-2 rounded border border-slate-100 italic line-clamp-2">
                            "{existing.comments}"
                          </div>
                        )}

                        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[10px] text-slate-400">
                            {existing
                              ? `Updated ${new Date(existing.add_update_timestamp).toLocaleDateString()}`
                              : 'No rating submitted'}
                          </span>

                          <button
                            onClick={() => handleOpenRatingModal(skill)}
                            className={`px-2.5 py-1 text-xs font-semibold rounded-md flex items-center gap-1 cursor-pointer transition-colors ${
                              existing
                                ? 'bg-blue-100 text-[#1769AA] hover:bg-blue-200'
                                : 'bg-[#1769AA] text-white hover:bg-[#125386]'
                            }`}
                          >
                            {existing ? (
                              <>
                                <Edit3 className="w-3 h-3" />
                                <span>Update</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3 h-3" />
                                <span>Rate Skill</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>

      {/* Rating & Justification Modal */}
      {editingSkill && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setEditingSkill(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#1769AA] flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#0B3A5B]">Rate Skill: {editingSkill.skillname}</h3>
                <p className="text-xs text-slate-500">
                  {editingSkill.skill_type} • {editingSkill.category_name}
                </p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Self-Rating Proficiency (0.5 to 5.0)
                </label>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <RatingInput value={ratingVal} onChange={setRatingVal} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Comments & Justification (Optional)
                </label>
                <textarea
                  rows={3}
                  name="comments"
                  value={commentsVal}
                  onChange={(e) => setCommentsVal(e.target.value)}
                  placeholder="Describe your production experience, certifications, years of usage, or recent projects..."
                  className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1769AA]"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Detailed comments help managers quickly evaluate and approve ratings for client project staffing.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingSkill(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#1769AA] hover:bg-[#125386] rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? 'Saving...' : 'Save & Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
