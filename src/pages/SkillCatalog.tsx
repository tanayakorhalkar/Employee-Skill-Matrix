import React, { useState } from 'react';
import { FolderTree, ChevronDown, ChevronRight, Award, Search } from 'lucide-react';
import { Skill } from '../types/database';

interface SkillCatalogProps {
  skills: Skill[];
}

export const SkillCatalog: React.FC<SkillCatalogProps> = ({ skills }) => {
  const [search, setSearch] = useState('');
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});

  const toggleCategory = (cat: string) => {
    setOpenCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const filtered = skills.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      s.skillname.toLowerCase().includes(q) ||
      s.category_name.toLowerCase().includes(q) ||
      s.skill_type.toLowerCase().includes(q)
    );
  });

  // Group by skill_type -> category_name
  const grouped: Record<string, Record<string, Skill[]>> = {};
  filtered.forEach((s) => {
    if (!grouped[s.skill_type]) grouped[s.skill_type] = {};
    if (!grouped[s.skill_type][s.category_name]) grouped[s.skill_type][s.category_name] = [];
    grouped[s.skill_type][s.category_name].push(s);
  });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <FolderTree className="w-5 h-5 text-[#1769AA]" />
              <h2 className="text-lg font-bold text-[#0B3A5B]">Organizational Skill Taxonomy</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Visual hierarchy model: Skill Type → Category Name (Category ID) → Competency Skill.
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search taxonomy..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1769AA]"
            />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {Object.entries(grouped).map(([skillType, catMap]) => (
          <div key={skillType} className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <div
                className={`w-3 h-3 rounded-full ${
                  skillType === 'Technical skills' || skillType === 'Hard skills'
                    ? 'bg-[#1769AA]'
                    : 'bg-[#20A36A]'
                }`}
              />
              <h3 className="font-extrabold text-base text-[#0B3A5B]">
                {skillType === 'Hard skills' ? 'Technical skills' : skillType}
              </h3>
              <span className="text-xs text-slate-400 ml-auto">
                {Object.values(catMap).reduce((sum, list) => sum + list.length, 0)} skills
              </span>
            </div>

            <div className="space-y-3 pl-3">
              {Object.entries(catMap).map(([categoryName, skillList]) => {
                const isOpen = openCategories[categoryName] !== false; // default open
                return (
                  <div key={categoryName} className="border border-slate-200 rounded-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={() => toggleCategory(categoryName)}
                      className="w-full p-3 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-xs font-bold text-slate-800 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        <span>{categoryName}</span>
                        <span className="text-[10px] font-mono font-normal px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-500">
                          Cat ID #{skillList[0]?.category_id}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-normal">
                        {skillList.length} competency items
                      </span>
                    </button>

                    {isOpen && (
                      <div className="p-4 bg-white grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {skillList.map((skill) => (
                          <div
                            key={skill.skill_id}
                            className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 flex items-center gap-2.5"
                          >
                            <Award className="w-4 h-4 text-blue-600 shrink-0" />
                            <div>
                              <div className="font-semibold text-xs text-slate-800">{skill.skillname}</div>
                              <div className="text-[10px] text-slate-400">ID #{skill.skill_id}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
