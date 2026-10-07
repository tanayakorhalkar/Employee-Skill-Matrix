import React, { useMemo, useState } from 'react';
import {
  Check,
  CheckCircle2,
  Edit3,
  Search,
  ShieldCheck,
  AlertCircle,
  XCircle,
} from 'lucide-react';
import { EmployeeSkillJoined, SafeEmployee } from '../types/database';
import { RatingBadge } from '../components/RatingBadge';
import { RatingInput } from '../components/RatingInput';
import { EmployeeAvatar } from '../components/EmployeeAvatar';

type ReviewAction = 'APPROVE' | 'REJECT' | 'EDIT';
type BatchAction = 'APPROVE' | 'REJECT';
type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

interface SkillReviewProps {
  records: EmployeeSkillJoined[];
  employees: SafeEmployee[];
  onReviewAction: (
    uniqueId: number,
    action: ReviewAction,
    notes?: string,
    reviewedRating?: number
  ) => Promise<void>;
  onBatchReview: (empId: number, action: BatchAction, notes?: string) => Promise<void>;
}

function getReviewStatus(record: EmployeeSkillJoined): ReviewStatus {
  if (!record.is_active) return 'REJECTED';

  const comments = (record.comments || '').trim();
  const firstLine = comments.split(/\r?\n/, 1)[0].trim();
  if (firstLine.startsWith('[Pending manager approval')) return 'PENDING';
  if (firstLine.startsWith('[Rejected by')) return 'REJECTED';
  if (
    firstLine.startsWith('[Approved by') ||
    firstLine.startsWith('[Rating adjusted to') ||
    comments.includes('[Approved by') ||
    comments.includes('[Rating adjusted to')
  ) {
    return 'APPROVED';
  }
  return 'PENDING';
}

function getReviewNotes(record: EmployeeSkillJoined): string {
  const comments = record.comments || '';
  return comments.replace(
    /^\[(?:Pending manager approval|Approved by|Rejected by|Rating adjusted to)[^\]]*\](?:[^\r\n]*)\r?\n?/,
    ''
  ).trim();
}

export const SkillReview: React.FC<SkillReviewProps> = ({
  records,
  employees,
  onReviewAction,
  onBatchReview,
}) => {
  const [search, setSearch] = useState('');
  const [selectedEmp, setSelectedEmp] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [actionTarget, setActionTarget] = useState<{
    record: EmployeeSkillJoined;
    action: ReviewAction;
  } | null>(null);
  const [batchTarget, setBatchTarget] = useState<{
    employee: SafeEmployee;
    action: BatchAction;
  } | null>(null);
  const [managerNotes, setManagerNotes] = useState('');
  const [editedRating, setEditedRating] = useState(3);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const filteredRecords = useMemo(() => records.filter((record) => {
    if (selectedEmp !== 'ALL' && String(record.emp_id) !== selectedEmp) return false;
    if (selectedStatus !== 'ALL' && getReviewStatus(record) !== selectedStatus) return false;
    if (search.trim()) {
      const query = search.toLowerCase();
      const employeeName = `${record.employee?.fName || ''} ${record.employee?.lName || ''}`.toLowerCase();
      const skillName = (record.skill?.skillname || '').toLowerCase();
      return employeeName.includes(query) || skillName.includes(query);
    }
    return true;
  }), [records, search, selectedEmp, selectedStatus]);

  const groupedRecords = useMemo(() => {
    const groups = new Map<number, EmployeeSkillJoined[]>();
    filteredRecords.forEach((record) => {
      const employeeRecords = groups.get(record.emp_id) || [];
      employeeRecords.push(record);
      groups.set(record.emp_id, employeeRecords);
    });
    return Array.from(groups.entries()).map(([empId, employeeRecords]) => ({
      empId,
      employee: employeeRecords[0].employee,
      records: employeeRecords,
      pendingCount: records.filter(
        (record) => record.emp_id === empId && getReviewStatus(record) === 'PENDING'
      ).length,
    })).sort((a, b) => {
      const nameA = `${a.employee?.fName || ''} ${a.employee?.lName || ''}`;
      const nameB = `${b.employee?.fName || ''} ${b.employee?.lName || ''}`;
      return nameA.localeCompare(nameB);
    });
  }, [filteredRecords, records]);

  const pendingCount = records.filter((record) => getReviewStatus(record) === 'PENDING').length;
  const approvedCount = records.filter((record) => getReviewStatus(record) === 'APPROVED').length;

  const handleOpenAction = (record: EmployeeSkillJoined, action: ReviewAction) => {
    setActionTarget({ record, action });
    setBatchTarget(null);
    setManagerNotes('');
    setEditedRating(record.self_rating);
  };

  const handleExecuteAction = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!actionTarget) return;

    setIsSubmitting(true);
    try {
      await onReviewAction(
        actionTarget.record.unique_id,
        actionTarget.action,
        managerNotes.trim() || undefined,
        actionTarget.action === 'EDIT' ? editedRating : undefined
      );
      setFeedbackMsg(
        `${actionTarget.record.skill?.skillname || 'Skill'} for ${actionTarget.record.employee?.fName || 'employee'} successfully reviewed.`
      );
      setTimeout(() => setFeedbackMsg(null), 4000);
      setActionTarget(null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Action failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExecuteBatchAction = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!batchTarget) return;

    setIsSubmitting(true);
    try {
      await onBatchReview(
        batchTarget.employee.emp_id,
        batchTarget.action,
        managerNotes.trim() || undefined
      );
      setFeedbackMsg(
        `All pending skills for ${batchTarget.employee.fName} ${batchTarget.employee.lName} successfully ${batchTarget.action.toLowerCase()}d.`
      );
      setTimeout(() => setFeedbackMsg(null), 4000);
      setBatchTarget(null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Batch action failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openBatchAction = (employee: SafeEmployee, action: BatchAction) => {
    setActionTarget(null);
    setBatchTarget({ employee, action });
    setManagerNotes('');
  };

  return (
    <div className="space-y-6">
      {feedbackMsg && (
        <div className="fixed top-6 right-6 z-50 bg-[#0B3A5B] text-white text-xs font-semibold px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 border border-blue-400">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#20A36A]" />
              <h2 className="text-lg font-bold text-[#0B3A5B]">Skill Review & Approvals</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Each employee’s pending skills are grouped into one review batch. Review skills individually or decide the whole pending batch.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="px-2.5 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200">
              {pendingCount} Pending
            </span>
            <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
              {approvedCount} Approved
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by engineer or skill..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1769AA]"
            />
          </div>
          <select
            value={selectedEmp}
            onChange={(event) => setSelectedEmp(event.target.value)}
            className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700"
          >
            <option value="ALL">All Engineers</option>
            {employees.map((employee) => (
              <option key={employee.emp_id} value={String(employee.emp_id)}>
                {employee.fName} {employee.lName} (@{employee.Login_userid})
              </option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={(event) => setSelectedStatus(event.target.value)}
            className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700"
          >
            <option value="ALL">All Review Statuses</option>
            <option value="PENDING">Pending Review</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {groupedRecords.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-sm text-slate-400">
          No skill records found matching current criteria.
        </div>
      ) : (
        <div className="space-y-5">
          {groupedRecords.map((group) => {
            const employee = group.employee;
            if (!employee) return null;
            return (
              <section key={group.empId} className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <header className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <EmployeeAvatar
                      firstName={employee.fName}
                      lastName={employee.lName}
                      profilePicture={employee.profile_picture}
                      className="w-10 h-10 text-xs shrink-0"
                    />
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">{employee.fName} {employee.lName}</h3>
                      <p className="text-[11px] text-slate-500">@{employee.Login_userid} · {group.pendingCount} pending · {group.records.length} records shown</p>
                    </div>
                  </div>
                  {group.pendingCount > 0 && selectedStatus !== 'APPROVED' && selectedStatus !== 'REJECTED' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openBatchAction(employee, 'APPROVE')}
                        className="px-3 py-1.5 text-xs font-semibold rounded bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve all {group.pendingCount} pending
                      </button>
                      <button
                        onClick={() => openBatchAction(employee, 'REJECT')}
                        className="px-3 py-1.5 text-xs font-semibold rounded border border-red-300 text-red-700 hover:bg-red-50 flex items-center gap-1.5"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject all
                      </button>
                    </div>
                  )}
                </header>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-white border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <tr>
                        <th className="p-3">Skill</th>
                        <th className="p-3 text-center">Self-Rating</th>
                        <th className="p-3">Employee Notes</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Individual Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {group.records.map((record) => {
                        const reviewStatus = getReviewStatus(record);
                        return (
                          <tr key={record.unique_id} className="hover:bg-slate-50/70">
                            <td className="p-3">
                              <div className="font-semibold text-slate-800 text-sm">
                                {record.skill?.skillname || `Skill #${record.skill_id}`}
                              </div>
                              <div className="text-[11px] text-slate-500">
                                {record.skill?.skill_type} · {record.skill?.category_name}
                              </div>
                            </td>
                            <td className="p-3 text-center"><RatingBadge rating={record.self_rating} size="md" /></td>
                            <td className="p-3 max-w-sm">
                              <div className="text-xs text-slate-700 whitespace-pre-wrap line-clamp-3 bg-slate-50 p-2 rounded border border-slate-100">
                                {getReviewNotes(record) || <span className="text-slate-400 italic">No notes provided</span>}
                              </div>
                              <div className="text-[10px] text-slate-400 mt-1">
                                Updated {new Date(record.add_update_timestamp).toLocaleString()}
                              </div>
                            </td>
                            <td className="p-3">
                              {reviewStatus === 'APPROVED' ? (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                  <Check className="w-3 h-3" /> Approved
                                </span>
                              ) : reviewStatus === 'REJECTED' ? (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold bg-red-100 text-red-800 border border-red-300">
                                  <XCircle className="w-3 h-3" /> Rejected
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                                  <AlertCircle className="w-3 h-3" /> Pending
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-right">
                              {reviewStatus === 'PENDING' ? (
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => handleOpenAction(record, 'APPROVE')}
                                    className="px-2.5 py-1 text-xs font-semibold rounded bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1"
                                  >
                                    <Check className="w-3 h-3" /> Approve
                                  </button>
                                  <button
                                    onClick={() => handleOpenAction(record, 'EDIT')}
                                    className="px-2.5 py-1 text-xs font-semibold rounded bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1"
                                  >
                                    <Edit3 className="w-3 h-3" /> Edit & approve
                                  </button>
                                  <button
                                    onClick={() => handleOpenAction(record, 'REJECT')}
                                    className="px-2.5 py-1 text-xs font-semibold rounded border border-slate-300 text-slate-700 hover:bg-red-50 hover:text-red-700"
                                  >
                                    Reject
                                  </button>
                                </div>
                              ) : (
                                <span className="text-[11px] text-slate-400">Reviewed</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            );
          })}
        </div>
      )}

      {(actionTarget || batchTarget) && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <h3 className="font-bold text-base text-[#0B3A5B] mb-1">
              {batchTarget
                ? `${batchTarget.action === 'APPROVE' ? 'Approve' : 'Reject'} Employee Skill Batch`
                : actionTarget?.action === 'APPROVE'
                ? 'Approve Skill Submission'
                : actionTarget?.action === 'EDIT'
                ? 'Edit & Approve Skill Rating'
                : 'Reject Skill Submission'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {batchTarget ? (
                <>
                  This will {batchTarget.action.toLowerCase()} every skill currently pending for{' '}
                  <strong>{batchTarget.employee.fName} {batchTarget.employee.lName}</strong>. Already-reviewed skills will not be changed.
                </>
              ) : (
                <>
                  For {actionTarget?.record.employee?.fName} {actionTarget?.record.employee?.lName} ·{' '}
                  {actionTarget?.record.skill?.skillname} (Current: {actionTarget?.record.self_rating}/5)
                </>
              )}
            </p>
            <form
              onSubmit={batchTarget ? handleExecuteBatchAction : handleExecuteAction}
              className="space-y-4"
            >
              {actionTarget?.action === 'EDIT' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Manager Rating (0.5–5.0); saving approves the adjusted rating
                  </label>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <RatingInput value={editedRating} onChange={setEditedRating} />
                  </div>
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {batchTarget ? 'Manager Notes' : 'Manager Review Notes'}
                </label>
                <textarea
                  rows={3}
                  value={managerNotes}
                  onChange={(event) => setManagerNotes(event.target.value)}
                  placeholder={
                    (batchTarget?.action || actionTarget?.action) === 'REJECT'
                      ? 'State the reason for rejection...'
                      : 'Add verification notes or feedback...'
                  }
                  required={(batchTarget?.action || actionTarget?.action) === 'REJECT'}
                  className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1769AA]"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setActionTarget(null);
                    setBatchTarget(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-4 py-2 text-xs font-semibold text-white rounded-lg disabled:opacity-60 ${
                    (batchTarget?.action || actionTarget?.action) === 'APPROVE' ||
                    actionTarget?.action === 'EDIT'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {isSubmitting ? 'Processing...' : `Confirm ${batchTarget?.action || actionTarget?.action}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
