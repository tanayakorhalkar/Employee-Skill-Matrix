import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, CheckCircle2, Award, X, FolderTree } from 'lucide-react';
import { Skill } from '../types/database';

interface SkillsManagementProps {
  skills: Skill[];
  onRefresh: () => void;
  onCreateSkill: (data: {
    skill_type: 'Technical skills' | 'Soft skills';
    category_name: string;
    category_id: number;
    skillname: string;
  }) => Promise<void>;
  onUpdateSkill: (
    skill_id: number,
    data: {
      skill_type?: 'Technical skills' | 'Soft skills';
      category_name?: string;
      category_id?: number;
      skillname?: string;
    }
  ) => Promise<void>;
  onDeleteSkill: (skill_id: number) => Promise<void>;
}

export const SkillsManagement: React.FC<SkillsManagementProps> = ({
  skills,
  onCreateSkill,
  onUpdateSkill,
  onDeleteSkill,
}) => {
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);

  // Form states
  const [skillType, setSkillType] = useState<'Technical skills' | 'Soft skills'>('Technical skills');
  const [categoryName, setCategoryName] = useState('');
  const [categoryId, setCategoryId] = useState<number>(101);
  const [skillName, setSkillName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const filtered = skills.filter((s) => {
    if (selectedType !== 'ALL' && s.skill_type !== selectedType) return false;
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

  const handleOpenCreate = () => {
    setSkillType('Technical skills');
    setCategoryName('Cloud & Infrastructure');
    setCategoryId(103);
    setSkillName('');
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (s: Skill) => {
    setEditingSkill(s);
    setSkillType(s.skill_type === 'Hard skills' ? 'Technical skills' : (s.skill_type as any));
    setCategoryName(s.category_name);
    setCategoryId(s.category_id);
    setSkillName(s.skillname);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onCreateSkill({
        skill_type: skillType,
        category_name: categoryName.trim(),
        category_id: Number(categoryId),
        skillname: skillName.trim(),
      });
      setToastMsg(`Skill "${skillName}" created successfully.`);
      setTimeout(() => setToastMsg(null), 4000);
      setIsCreateOpen(false);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to create skill.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSkill) return;
    setIsSubmitting(true);
    try {
      await onUpdateSkill(editingSkill.skill_id, {
        skill_type: skillType,
        category_name: categoryName.trim(),
        category_id: Number(categoryId),
        skillname: skillName.trim(),
      });
      setToastMsg(`Skill "${skillName}" updated successfully.`);
      setTimeout(() => setToastMsg(null), 4000);
      setEditingSkill(null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update skill.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (s: Skill) => {
    if (!confirm(`Are you sure you want to delete "${s.skillname}"? This will delete all employee ratings associated with it.`)) {
      return;
    }
    try {
      await onDeleteSkill(s.skill_id);
      setToastMsg(`Skill "${s.skillname}" removed.`);
      setTimeout(() => setToastMsg(null), 4000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete skill.');
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
            <div className="flex items-center gap-2">
              <FolderTree className="w-5 h-5 text-[#1769AA]" />
              <h2 className="text-lg font-bold text-[#0B3A5B]">Skills Master Management</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Super Admin authority over standard competencies and organizational taxonomy.
            </p>
          </div>

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-lg bg-[#1769AA] hover:bg-[#125386] text-white text-xs font-semibold shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Skill</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by skill name or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1769AA]"
            />
          </div>

          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1769AA]"
            >
              <option value="ALL">All Skill Types</option>
              <option value="Technical skills">Technical Skills</option>
              <option value="Soft skills">Soft Skills</option>
            </select>
          </div>
        </div>
      </div>

      {/* Skills Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700 uppercase tracking-wider">
              <tr>
                <th className="p-4">Skill ID</th>
                <th className="p-4">Skill Name</th>
                <th className="p-4">Skill Type</th>
                <th className="p-4">Category Name</th>
                <th className="p-4">Category ID</th>
                <th className="p-4">Created/Updated (TIMESTAMP)</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((skill) => (
                <tr key={skill.skill_id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-4 font-mono font-semibold text-slate-500">#{skill.skill_id}</td>
                  <td className="p-4 font-bold text-slate-900 flex items-center gap-2">
                    <Award className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>{skill.skillname}</span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        skill.skill_type === 'Technical skills' || skill.skill_type === 'Hard skills'
                          ? 'bg-blue-50 text-blue-800 border border-blue-200'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {skill.skill_type === 'Hard skills' ? 'Technical skills' : skill.skill_type}
                    </span>
                  </td>
                  <td className="p-4 font-medium text-slate-700">{skill.category_name}</td>
                  <td className="p-4 font-mono text-slate-500">{skill.category_id}</td>
                  <td className="p-4 text-slate-400 font-mono text-[11px]">
                    {new Date(skill.skill_description).toLocaleString()}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(skill)}
                        className="p-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-blue-700 cursor-pointer transition-colors"
                        title="Edit skill"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(skill)}
                        className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-700 cursor-pointer transition-colors"
                        title="Delete skill"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Skill Modal */}
      {(isCreateOpen || editingSkill) && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => {
                setIsCreateOpen(false);
                setEditingSkill(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-base text-[#0B3A5B] mb-1">
              {editingSkill ? `Edit Skill #${editingSkill.skill_id}` : 'Create New Skill'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Maintain the skill hierarchy (Skill Type → Category → Skill Name).
            </p>

            <form onSubmit={editingSkill ? handleEditSubmit : handleCreateSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Skill Name (skillname)</label>
                <input
                  type="text"
                  required
                  value={skillName}
                  onChange={(e) => setSkillName(e.target.value)}
                  placeholder="e.g. Terraform, Kubernetes, React"
                  className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1769AA]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Skill Type (skill_type)</label>
                <select
                  value={skillType}
                  onChange={(e) => setSkillType(e.target.value as any)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1769AA]"
                >
                  <option value="Technical skills">Technical skills</option>
                  <option value="Soft skills">Soft skills</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category Name</label>
                  <input
                    type="text"
                    required
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    placeholder="e.g. Cloud & Infrastructure"
                    className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1769AA]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category ID (category_id)</label>
                  <input
                    type="number"
                    required
                    value={categoryId}
                    onChange={(e) => setCategoryId(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1769AA]"
                  />
                </div>
              </div>

              <div className="text-[11px] text-slate-400 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                Note: Per the required schema, <code>skill_description</code> is automatically recorded as
                a TIMESTAMP timestamp on add/update.
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateOpen(false);
                    setEditingSkill(null);
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
                  {isSubmitting ? 'Saving...' : editingSkill ? 'Save Changes' : 'Create Skill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
