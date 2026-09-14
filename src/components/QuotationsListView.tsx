import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Quotation, Ticket } from '../types';
import {
  DollarSign,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  Building,
  RotateCcw,
  Check,
  X,
  FileText,
  ShieldAlert,
} from 'lucide-react';

interface QuotationsListViewProps {
  onSelectTicket?: (ticket: Ticket) => void;
}

export const QuotationsListView: React.FC<QuotationsListViewProps> = ({ onSelectTicket }) => {
  const {
    quotations,
    tickets,
    role,
    reviewQuotation,
    approvalConfig,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Active review modal
  const [reviewingQuote, setReviewingQuote] = useState<Quotation | null>(null);
  const [decision, setDecision] = useState<'Approved' | 'Revision Required' | 'Rejected'>('Approved');
  const [reviewNotes, setReviewNotes] = useState('');
  const [overrideNotes, setOverrideNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const filteredQuotations = quotations.filter((q) => {
    const matchesSearch =
      q.quotationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.ticketId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.serviceDescription.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenReview = (q: Quotation) => {
    setReviewingQuote(q);
    setDecision('Approved');
    setReviewNotes('');
    setOverrideNotes('');
    setErrorMessage('');
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingQuote) return;

    // Check threshold rules:
    // If threshold enabled and amount > threshold (e.g. ₹10,000)
    // and user is manager (not director/admin), require override or block
    const isAboveThreshold = reviewingQuote.totalAmount > approvalConfig.managerThreshold;

    if (
      approvalConfig.requireDirectorAboveThreshold &&
      isAboveThreshold &&
      role === 'manager' &&
      decision === 'Approved'
    ) {
      if (!overrideNotes.trim()) {
        setErrorMessage(
          `This quote of ₹${reviewingQuote.totalAmount.toLocaleString()} exceeds the ₹${approvalConfig.managerThreshold.toLocaleString()} Manager Approval Limit. Director approval or mandatory Manager Budget Override justification is required.`
        );
        return;
      }
    }

    if (decision !== 'Approved' && !reviewNotes.trim()) {
      setErrorMessage('Please provide comments/reason for rejection or revision request.');
      return;
    }

    const finalNotes = overrideNotes.trim()
      ? `[BUDGET OVERRIDE: ${overrideNotes.trim()}] ${reviewNotes}`
      : reviewNotes;

    reviewQuotation(reviewingQuote.id, decision, finalNotes || 'Approved by management.');
    setReviewingQuote(null);
  };

  return (
    <div className="w-full py-6 px-4 sm:px-6 lg:px-8 space-y-6" id="quotations-list-view">
      {/* Top Banner */}
      <div className="bg-[#2d3e50] text-white rounded-xl p-6 shadow-md border border-[#1e293b] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-[#1e293b] text-[#eb8a23] text-xs font-bold font-mono">
              FINANCIAL APPROVAL REGISTRY
            </span>
            <span className="text-xs text-slate-300">
              Limit Policy: Up to ₹{approvalConfig.managerThreshold.toLocaleString()} (Manager) • Above: Director Sanction
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Vendor Quotations &amp; Billing</h1>
          <p className="text-slate-300 text-xs mt-1">
            Review submitted OEM estimates, verify itemized parts/labour charges, and authorize repair work.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search quote number, vendor, ticket..."
              className="pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg w-52 sm:w-72 focus:outline-hidden focus:border-[#eb8a23]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-hidden focus:border-[#eb8a23]"
          >
            <option value="All">All Quotation Statuses</option>
            <option value="Submitted">Submitted (Needs Review)</option>
            <option value="Approved">Approved</option>
            <option value="Revision Required">Revision Required</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <div className="text-slate-500 font-medium">
          Total Quotes: <strong>{filteredQuotations.length}</strong>
        </div>
      </div>

      {/* Quotations Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#2d3e50] text-white select-none">
              <tr>
                <th className="px-4 py-3 font-semibold">Quote #</th>
                <th className="px-4 py-3 font-semibold">Vendor Partner</th>
                <th className="px-4 py-3 font-semibold">Ticket &amp; Scope</th>
                <th className="px-4 py-3 font-semibold">Material / Labour</th>
                <th className="px-4 py-3 font-semibold">Total (incl. GST)</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-sans">
              {filteredQuotations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    No quotations found.
                  </td>
                </tr>
              ) : (
                filteredQuotations.map((q) => {
                  const ticket = tickets.find((t) => t.id === q.ticketId);

                  return (
                    <tr key={q.id} className="hover:bg-amber-50/40 transition">
                      <td className="px-4 py-3 font-mono font-bold text-[#eb8a23]">{q.quotationNumber}</td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-800">{q.vendorName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{q.vendorId}</div>
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <div className="font-mono font-semibold text-slate-700">{q.ticketId}</div>
                        <div className="text-slate-500 truncate text-[11px]">{q.serviceDescription}</div>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600">
                        <div>Mat: ₹{q.materialCost.toLocaleString()}</div>
                        <div className="text-[10px] text-slate-400">Lab: ₹{q.labourCost.toLocaleString()}</div>
                      </td>
                      <td className="px-4 py-3 font-mono font-black text-slate-900 text-sm">
                        ₹{q.totalAmount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                            q.status === 'Approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : q.status === 'Rejected'
                              ? 'bg-rose-100 text-rose-800'
                              : q.status === 'Revision Required'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {q.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {(role === 'manager' || role === 'director' || role === 'admin') &&
                            q.status === 'Submitted' && (
                              <button
                                onClick={() => handleOpenReview(q)}
                                className="px-3 py-1 bg-[#eb8a23] hover:bg-[#d97917] text-white font-bold rounded shadow-2xs text-[11px] transition"
                              >
                                Review Quote
                              </button>
                            )}
                          {ticket && onSelectTicket && (
                            <button
                              onClick={() => onSelectTicket(ticket)}
                              className="px-2.5 py-1 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 font-medium rounded text-[11px]"
                            >
                              Ticket →
                            </button>
                          )}
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

      {/* MODAL: REVIEW QUOTATION */}
      {reviewingQuote && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl flex flex-col overflow-hidden">
            <div className="bg-[#2d3e50] text-white px-6 py-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono text-[#eb8a23] font-bold">
                  {reviewingQuote.quotationNumber}
                </span>
                <h3 className="font-bold text-base">Authorize Vendor Quotation</h3>
              </div>
              <button
                onClick={() => setReviewingQuote(null)}
                className="text-slate-300 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="p-6 space-y-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Vendor:</span>
                  <span className="font-bold text-slate-800">{reviewingQuote.vendorName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Ticket Ref:</span>
                  <span className="font-mono font-bold text-[#eb8a23]">{reviewingQuote.ticketId}</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                  <span className="text-slate-700 font-semibold">Total Amount:</span>
                  <span className="font-black font-mono text-base text-slate-900">
                    ₹{reviewingQuote.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Threshold indicator */}
              {reviewingQuote.totalAmount > approvalConfig.managerThreshold && (
                <div className="bg-amber-50 border border-amber-300 p-3 rounded-lg text-amber-900">
                  <div className="font-bold flex items-center gap-1.5 mb-1">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    High-Value Sanction Threshold Alert
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    This amount exceeds the Manager sanction limit of ₹{approvalConfig.managerThreshold.toLocaleString()}.
                    If approving as a Manager, a mandatory Budget Override Justification will be stamped permanently in the immutable audit log.
                  </p>
                </div>
              )}

              {/* Decision Radio */}
              <div>
                <label className="block font-semibold text-slate-700 mb-2">Review Decision</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDecision('Approved')}
                    className={`py-2 px-3 rounded-lg border text-center font-bold ${
                      decision === 'Approved'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-1 ring-emerald-500'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    ✓ Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => setDecision('Revision Required')}
                    className={`py-2 px-3 rounded-lg border text-center font-bold ${
                      decision === 'Revision Required'
                        ? 'bg-amber-50 border-amber-500 text-amber-800 ring-1 ring-amber-500'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    ↺ Revision
                  </button>
                  <button
                    type="button"
                    onClick={() => setDecision('Rejected')}
                    className={`py-2 px-3 rounded-lg border text-center font-bold ${
                      decision === 'Rejected'
                        ? 'bg-rose-50 border-rose-500 text-rose-800 ring-1 ring-rose-500'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    ✕ Reject
                  </button>
                </div>
              </div>

              {/* Budget Override Notes (if manager and above threshold) */}
              {decision === 'Approved' && reviewingQuote.totalAmount > approvalConfig.managerThreshold && (
                <div>
                  <label className="block font-semibold text-amber-800 mb-1">
                    Manager Budget Override Justification <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={overrideNotes}
                    onChange={(e) => setOverrideNotes(e.target.value)}
                    placeholder="Provide business urgency or pre-approved director verbal authorization note..."
                    className="w-full px-3 py-2 border border-amber-300 rounded-lg bg-amber-50/50"
                  />
                </div>
              )}

              {/* Review Notes */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Comments / Instructions for Vendor
                </label>
                <textarea
                  rows={2}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="e.g. Authorized to commence replacement work immediately..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              {errorMessage && (
                <div className="text-rose-700 bg-rose-50 border border-rose-200 p-2.5 rounded-lg text-[11px] font-semibold">
                  {errorMessage}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setReviewingQuote(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#eb8a23] hover:bg-[#d97917] text-white font-bold rounded-lg shadow-xs"
                >
                  Submit Final Decision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
