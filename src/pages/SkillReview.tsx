import React, { useState } from 'react';
import { CheckCircle2, XCircle, Edit3, Search, Filter, ShieldCheck, AlertCircle, Check } from 'lucide-react';
import { EmployeeSkillJoined, SafeEmployee, Skill } from '../types/database';
import { RatingBadge } from '../components/RatingBadge';
import { RatingInput } from '../components/RatingInput';

interface SkillReviewProps {
  records: EmployeeSkillJoined[];
  employees: SafeEmployee[];
  skills: Skill[];
  currentUser: SafeEmployee;
  onReviewAction: (
    uniqueId: number,
    action: 'APPROVE' | 'REJECT' | 'EDIT',
    notes?: string,
    reviewedRating?: number
  ) => Promise<void>;
}

export const SkillReview: React.FC<SkillReviewProps> = ({
  records,
  employees,
  skills,
  onReviewAction,
}) => {
  const [search, setSearch] = useState('');
  const [selectedEmp, setSelectedEmp] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Action Modal State
  const [actionTarget, setActionTarget] = useState<{
    record: EmployeeSkillJoined;
    action: 'APPROVE' | 'REJECT' | 'EDIT';
  } | null>(null);

  const [managerNotes, setManagerNotes] = useState('');
  const [editedRating, setEditedRating] = useState<number>(3);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Filter records
  const filteredRecords = records.filter((r) => {
    if (selectedEmp !== 'ALL' && String(r.emp_id) !== selectedEmp) return false;

    // Review status check based on comment annotations or is_active
    const isApproved = r.comments?.includes('[Approved by');
    const isRejected = r.is_active === false || r.comments?.includes('[Rejected by');
    const isPending = !isApproved && !isRejected;

    if (selectedStatus === 'APPROVED' && !isApproved) return false;
    if (selectedStatus === 'REJECTED' && !isRejected) return false;
    if (selectedStatus === 'PENDING' && !isPending) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const empName = `${r.employee?.fName} ${r.employee?.lName}`.toLowerCase();
      const skillName = (r.skill?.skillname || '').toLowerCase();
      return empName.includes(q) || skillName.includes(q);
    }

    return true;
  });

  const handleOpenAction = (record: EmployeeSkillJoined, action: 'APPROVE' | 'REJECT' | 'EDIT') => {
    setActionTarget({ record, action });
    setManagerNotes('');
    setEditedRating(record.self_rating);
  };

  const handleExecuteAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionTarget) return;

    setIsSubmitting(true);
    try {
      await onReviewAction(
        actionTarget.record.unique_id,
        actionTarget.action,
        managerNotes.trim() || undefined,
        actionTarget.action === 'EDIT' ? editedRating : undefined
      );

      setFeedbackMsg(`Submission #${actionTarget.record.unique_id} successfully ${actionTarget.action.toLowerCase()}d.`);
      setTimeout(() => setFeedbackMsg(null), 4000);
      setActionTarget(null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Action failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedbackMsg && (
        <div className="fixed top-6 right-6 z-50 bg-[#0B3A5B] text-white text-xs font-semibold px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 border border-blue-400">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Header & Filter Controls */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#20A36A]" />
              <h2 className="text-lg font-bold text-[#0B3A5B]">Skill Review & Approvals</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Review employee skill submissions. Edit, approve, or reject proficiencies to ensure high staffing
              integrity under the 3-table relational schema.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="px-2.5 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200">
              {records.filter((r) => !r.comments?.includes('[Approved by') && r.is_active).length} Pending Review
            </span>
            <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
              {records.filter((r) => r.comments?.includes('[Approved by')).length} Approved
            </span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by engineer or skill..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1769AA]"
            />
          </div>

          <div>
            <select
              value={selectedEmp}
              onChange={(e) => setSelectedEmp(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1769AA]"
            >
              <option value="ALL">All Engineers</option>
              {employees.map((e) => (
                <option key={e.emp_id} value={String(e.emp_id)}>
                  {e.fName} {e.lName} (@{e.Login_userid})
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1769AA]"
            >
              <option value="ALL">All Review Statuses</option>
              <option value="PENDING">Pending Review</option>
              <option value="APPROVED">Approved by Manager</option>
              <option value="REJECTED">Rejected / Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider">
              <tr>
                <th className="p-4">Engineer</th>
                <th className="p-4">Skill Details</th>
                <th className="p-4 text-center">Self-Rating</th>
                <th className="p-4">Justification & Notes</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No skill records found matching current criteria.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((item) => {
                  const isApproved = item.comments?.includes('[Approved by');
                  const isRejected = item.is_active === false || item.comments?.includes('[Rejected by');

                  return (
                    <tr key={item.unique_id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Engineer */}
                      <td className="p-4 font-semibold text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#0B3A5B] text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {item.employee?.fName[0] || 'E'}
                            {item.employee?.lName[0] || ''}
                          </div>
                          <div>
                            <div>
                              {item.employee?.fName} {item.employee?.lName}
                            </div>
                            <div className="text-[11px] text-slate-400 font-normal">
                              @{item.employee?.Login_userid}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Skill */}
                      <td className="p-4">
                        <div className="font-semibold text-slate-800 text-sm">
                          {item.skill?.skillname || `Skill #${item.skill_id}`}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {item.skill?.skill_type} • {item.skill?.category_name}
                        </div>
                      </td>

                      {/* Self-Rating */}
                      <td className="p-4 text-center">
                        <RatingBadge rating={item.self_rating} size="md" />
                      </td>

                      {/* Comments */}
                      <td className="p-4 max-w-xs">
                        <div className="text-xs text-slate-700 whitespace-pre-wrap line-clamp-3 bg-slate-50 p-2 rounded border border-slate-100">
                          {item.comments || <span className="text-slate-400 italic">No notes provided</span>}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">
                          Last Updated: {new Date(item.add_update_timestamp).toLocaleString()}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        {isApproved ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <Check className="w-3 h-3" /> Approved
                          </span>
                        ) : isRejected ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-300">
                            <XCircle className="w-3 h-3" /> Rejected
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                            <AlertCircle className="w-3 h-3" /> Pending Review
                          </span>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenAction(item, 'APPROVE')}
                            className="px-2.5 py-1 text-xs font-semibold rounded bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 shadow-2xs cursor-pointer transition-colors"
                            title="Approve self-rating"
                          >
                            <Check className="w-3 h-3" />
                            <span>Approve</span>
                          </button>

                          <button
                            onClick={() => handleOpenAction(item, 'EDIT')}
                            className="px-2.5 py-1 text-xs font-semibold rounded bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1 shadow-2xs cursor-pointer transition-colors"
                            title="Adjust rating score"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Adjust</span>
                          </button>

                          <button
                            onClick={() => handleOpenAction(item, 'REJECT')}
                            className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 border border-slate-300 flex items-center gap-1 cursor-pointer transition-colors"
                            title="Reject and deactivate rating"
                          >
                            <XCircle className="w-3 h-3" />
                            <span>Reject</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Action Confirmation Modal */}
      {actionTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-bold text-base text-[#0B3A5B] mb-1">
              {actionTarget.action === 'APPROVE' && 'Approve Skill Submission'}
              {actionTarget.action === 'EDIT' && 'Adjust & Review Skill Rating'}
              {actionTarget.action === 'REJECT' && 'Reject Skill Submission'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              For {actionTarget.record.employee?.fName} {actionTarget.record.employee?.lName} •{' '}
              {actionTarget.record.skill?.skillname} (Current: {actionTarget.record.self_rating}/5)
            </p>

            <form onSubmit={handleExecuteAction} className="space-y-4">
              {actionTarget.action === 'EDIT' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Manager Evaluated Rating (1–5)
                  </label>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <RatingInput value={editedRating} onChange={setEditedRating} />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Manager Review Notes / Justification
                </label>
                <textarea
                  rows={3}
                  value={managerNotes}
                  onChange={(e) => setManagerNotes(e.target.value)}
                  placeholder={
                    actionTarget.action === 'REJECT'
                      ? 'State the reason for rejection (e.g. requires certification verification)...'
                      : 'Add verification notes, project references, or feedback...'
                  }
                  required={actionTarget.action === 'REJECT'}
                  className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1769AA]"
                />
              </div>

              <div className="text-[11px] text-slate-500 bg-blue-50/60 p-2.5 rounded-lg border border-blue-100">
                Note: In accordance with the exact 3-table database schema, review audit logs are appended to
                the record comments and timestamps are updated.
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActionTarget(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-4 py-2 text-xs font-semibold text-white rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-60 ${
                    actionTarget.action === 'APPROVE'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : actionTarget.action === 'EDIT'
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {isSubmitting ? 'Processing...' : `Confirm ${actionTarget.action}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
