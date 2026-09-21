import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Ticket, Quotation, WorkOrder } from '../types';
import { TicketTimeline } from './TicketTimeline';
import {
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  Building2,
  FileText,
  User,
  Wrench,
  DollarSign,
  Send,
  MessageSquare,
  ShieldCheck,
  RotateCcw,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

interface TicketDetailModalProps {
  ticket: Ticket;
  onClose: () => void;
  onOpenAssetDetail?: (assetId: string) => void;
}

export const TicketDetailModal: React.FC<TicketDetailModalProps> = ({
  ticket,
  onClose,
  onOpenAssetDetail,
}) => {
  const {
    role,
    currentUser,
    vendors,
    quotations,
    workOrders,
    approveTicket,
    rejectTicket,
    requestClarification,
    addInternalComment,
    reviewQuotation,
    verifyAndClose,
    sendBackToVendor,
    approvalConfig,
  } = useApp();

  // Action states
  const [activeAction, setActiveAction] = useState<'none' | 'approve' | 'reject' | 'clarify' | 'comment' | 'verify' | 'sendback' | 'reviewQuo'>('none');
  const [selectedVendorId, setSelectedVendorId] = useState(vendors[0]?.id || '');
  const [actionComment, setActionComment] = useState('');
  const [actionError, setActionError] = useState('');

  // Quotation review state
  const [quotationDecision, setQuotationDecision] = useState<'Approved' | 'Revision Required' | 'Rejected'>('Approved');

  // Linked items
  const linkedQuotation = quotations.find((q) => q.ticketId === ticket.id);
  const linkedWorkOrder = workOrders.find((w) => w.ticketId === ticket.id);

  const canApproveTicket =
    (role === 'manager' || role === 'director' || role === 'admin') &&
    (ticket.status === 'Submitted' || ticket.status === 'Under Management Review');

  const canReviewQuotation =
    (role === 'manager' || role === 'director' || role === 'admin') &&
    (ticket.status === 'Quotation Under Review' || ticket.status === 'Under Management Review') &&
    (role !== 'manager' || linkedQuotation?.status !== 'Pending Director Approval');

  const canVerifyCompletion =
    (role === 'manager' || role === 'director' || role === 'admin') &&
    ticket.status === 'Verification Pending';

  const handleApprove = () => {
    if (!selectedVendorId) {
      setActionError('Please select a vendor to assign.');
      return;
    }
    approveTicket(ticket.id, selectedVendorId, actionComment);
    setActiveAction('none');
  };

  const handleReject = () => {
    if (!actionComment.trim()) {
      setActionError('A rejection reason is mandatory.');
      return;
    }
    rejectTicket(ticket.id, actionComment);
    setActiveAction('none');
  };

  const handleClarify = () => {
    if (!actionComment.trim()) {
      setActionError('Please enter clarification questions.');
      return;
    }
    requestClarification(ticket.id, actionComment);
    setActiveAction('none');
  };

  const handleComment = () => {
    if (!actionComment.trim()) return;
    addInternalComment(ticket.id, actionComment);
    setActionComment('');
    setActiveAction('none');
  };

  const handleReviewQuotation = () => {
    if (!linkedQuotation) return;
    
    let finalDecision: 'Approved' | 'Revision Required' | 'Rejected' | 'Pending Director Approval' = quotationDecision as any;

    if (role === 'manager' && quotationDecision === 'Approved') {
      const isAboveThreshold = linkedQuotation.totalAmount > approvalConfig.managerMaxThreshold;
      if (approvalConfig.directorRequiredAbove && isAboveThreshold) {
        if (!actionComment.trim()) {
           finalDecision = 'Pending Director Approval';
        }
      } else {
        finalDecision = 'Pending Director Approval';
      }
    }

    if (finalDecision !== 'Approved' && finalDecision !== 'Pending Director Approval' && !actionComment.trim()) {
      setActionError('Please provide a comment/reason for rejection or revision.');
      return;
    }

    const finalNotes = actionComment.trim()
      ? actionComment
      : (finalDecision === 'Pending Director Approval' ? 'Manager Approved. Awaiting Director.' : 'Quotation approved.');

    reviewQuotation(linkedQuotation.id, finalDecision, finalNotes);
    setActiveAction('none');
  };

  const handleVerify = () => {
    verifyAndClose(ticket.id, actionComment || 'Service verified and approved for closure.');
    setActiveAction('none');
  };

  const handleSendBack = () => {
    if (!actionComment.trim()) {
      setActionError('Please provide reasons for returning the work to vendor.');
      return;
    }
    sendBackToVendor(ticket.id, actionComment);
    setActiveAction('none');
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
      id="ticket-detail-modal"
    >
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Top Header with Infominer Navy */}
        <div className="bg-[#2d3e50] text-white px-6 py-4 border-b border-[#1e293b] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase font-mono px-2 py-0.5 rounded bg-[#1e293b] text-[#eb8a23] font-bold">
              {ticket.id}
            </span>
            <span className="font-bold text-lg">{ticket.assetName}</span>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                ticket.status === 'Closed'
                  ? 'bg-emerald-500 text-white'
                  : ticket.status === 'Rejected'
                  ? 'bg-rose-500 text-white'
                  : 'bg-[#eb8a23] text-white'
              }`}
            >
              {ticket.status}
            </span>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-slate-300 hover:text-white hover:bg-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Two Columns */}
        <div className="overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 text-xs">
          {/* Left Column: Details & Workflows (8 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Action Bar based on role and ticket state */}
            {(canApproveTicket || canReviewQuotation || canVerifyCompletion) && (
              <div className="p-4 rounded-xl bg-amber-50/80 border border-[#eb8a23]/40 shadow-xs">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#eb8a23]" />
                    Management Action Required
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-500 font-mono">
                    Role: {role}
                  </span>
                </div>

                {activeAction === 'none' ? (
                  <div className="flex flex-wrap gap-2">
                    {canApproveTicket && (
                      <>
                        <button
                          onClick={() => {
                            setActiveAction('approve');
                            setActionError('');
                          }}
                          className="px-3.5 py-2 rounded-lg bg-[#eb8a23] hover:bg-[#d97917] text-white font-bold transition flex items-center gap-1.5 shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approve &amp; Assign Vendor
                        </button>
                        <button
                          onClick={() => {
                            setActiveAction('reject');
                            setActionError('');
                          }}
                          className="px-3 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold transition"
                        >
                          Reject Ticket
                        </button>
                        <button
                          onClick={() => {
                            setActiveAction('clarify');
                            setActionError('');
                          }}
                          className="px-3 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold transition"
                        >
                          Request Clarification
                        </button>
                      </>
                    )}

                    {canReviewQuotation && linkedQuotation && (
                      <button
                        onClick={() => {
                          setActiveAction('reviewQuo');
                          setActionError('');
                        }}
                        className="px-4 py-2 rounded-lg bg-[#eb8a23] hover:bg-[#d97917] text-white font-bold transition flex items-center gap-1.5 shadow-xs"
                      >
                        <DollarSign className="w-3.5 h-3.5" /> Review Vendor Quotation (₹{linkedQuotation.totalAmount.toLocaleString()})
                      </button>
                    )}

                    {canVerifyCompletion && (
                      <>
                        <button
                          onClick={() => {
                            setActiveAction('verify');
                            setActionError('');
                          }}
                          className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition flex items-center gap-1.5 shadow-xs"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" /> Verify &amp; Close Ticket
                        </button>
                        <button
                          onClick={() => {
                            setActiveAction('sendback');
                            setActionError('');
                          }}
                          className="px-3 py-2 rounded-lg bg-white border border-rose-300 text-rose-700 hover:bg-rose-50 font-semibold transition"
                        >
                          Send Back to Vendor
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-3">
                    {/* Approve Form */}
                    {activeAction === 'approve' && (
                      <div>
                        <h4 className="font-bold text-slate-900 mb-2">Approve Ticket &amp; Dispatch Work Order</h4>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                              Select Authorized Vendor <span className="text-rose-500">*</span>
                            </label>
                            <select
                              value={selectedVendorId}
                              onChange={(e) => setSelectedVendorId(e.target.value)}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                            >
                              {vendors.map((v) => (
                                <option key={v.id} value={v.id}>
                                  {v.name} ({v.category}) — Rating: {v.rating}★
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                              Instructions / Scope of Work for Vendor
                            </label>
                            <textarea
                              rows={2}
                              value={actionComment}
                              onChange={(e) => setActionComment(e.target.value)}
                              placeholder="e.g. Inspect display panel and provide OEM quotation..."
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                            />
                          </div>
                          {actionError && <div className="text-rose-600 text-[11px] font-semibold">{actionError}</div>}
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setActiveAction('none')}
                              className="px-3 py-1.5 border border-slate-300 rounded-md text-slate-600"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleApprove}
                              className="px-4 py-1.5 bg-[#eb8a23] hover:bg-[#d97917] text-white font-bold rounded-md"
                            >
                              Confirm Approval &amp; Dispatch
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Reject Form */}
                    {activeAction === 'reject' && (
                      <div>
                        <h4 className="font-bold text-rose-900 mb-2">Reject Ticket</h4>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                              Mandatory Rejection Reason <span className="text-rose-500">*</span>
                            </label>
                            <textarea
                              rows={3}
                              required
                              value={actionComment}
                              onChange={(e) => setActionComment(e.target.value)}
                              placeholder="Enter clear business reason for rejecting this issue report..."
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                            />
                          </div>
                          {actionError && <div className="text-rose-600 text-[11px] font-semibold">{actionError}</div>}
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setActiveAction('none')}
                              className="px-3 py-1.5 border border-slate-300 rounded-md text-slate-600"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleReject}
                              className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-md"
                            >
                              Confirm Rejection
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Clarification Form */}
                    {activeAction === 'clarify' && (
                      <div>
                        <h4 className="font-bold text-slate-900 mb-2">Request Clarification from Employee</h4>
                        <div className="space-y-3">
                          <textarea
                            rows={3}
                            value={actionComment}
                            onChange={(e) => setActionComment(e.target.value)}
                            placeholder="Specify what additional detail or photo is required..."
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                          />
                          {actionError && <div className="text-rose-600 text-[11px] font-semibold">{actionError}</div>}
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setActiveAction('none')}
                              className="px-3 py-1.5 border border-slate-300 rounded-md text-slate-600"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleClarify}
                              className="px-4 py-1.5 bg-slate-800 text-white font-bold rounded-md"
                            >
                              Submit Request
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Review Quotation Form */}
                    {activeAction === 'reviewQuo' && linkedQuotation && (
                      <div>
                        <h4 className="font-bold text-slate-900 mb-2">
                          Quotation Review — {linkedQuotation.quotationNumber} (₹{linkedQuotation.totalAmount.toLocaleString()})
                        </h4>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="radio"
                                checked={quotationDecision === 'Approved'}
                                onChange={() => setQuotationDecision('Approved')}
                                className="text-[#eb8a23]"
                              />
                              <span className="font-bold text-emerald-700">Approve Quotation</span>
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="radio"
                                checked={quotationDecision === 'Revision Required'}
                                onChange={() => setQuotationDecision('Revision Required')}
                                className="text-[#eb8a23]"
                              />
                              <span className="font-semibold text-amber-700">Request Revision</span>
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="radio"
                                checked={quotationDecision === 'Rejected'}
                                onChange={() => setQuotationDecision('Rejected')}
                                className="text-rose-700"
                              />
                              <span className="font-semibold text-rose-700">Reject Quotation</span>
                            </label>
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                              Reviewer Notes / Justification
                            </label>
                            <textarea
                              rows={2}
                              value={actionComment}
                              onChange={(e) => setActionComment(e.target.value)}
                              placeholder="e.g. Approved within equipment maintenance budget."
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                            />
                          </div>

                          {actionError && <div className="text-rose-600 text-[11px] font-semibold">{actionError}</div>}
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setActiveAction('none')}
                              className="px-3 py-1.5 border border-slate-300 rounded-md text-slate-600"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleReviewQuotation}
                              className="px-4 py-1.5 bg-[#eb8a23] hover:bg-[#d97917] text-white font-bold rounded-md"
                            >
                              Submit Decision
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Verify & Close Form */}
                    {activeAction === 'verify' && (
                      <div>
                        <h4 className="font-bold text-emerald-900 mb-2">Final Service Verification &amp; Closure</h4>
                        <div className="space-y-3">
                          <p className="text-slate-600">
                            Confirm that the vendor work has been inspected and the asset is restored to active operational status.
                          </p>
                          <textarea
                            rows={2}
                            value={actionComment}
                            onChange={(e) => setActionComment(e.target.value)}
                            placeholder="e.g. Tested laptop display and verified 100% functional."
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setActiveAction('none')}
                              className="px-3 py-1.5 border border-slate-300 rounded-md text-slate-600"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleVerify}
                              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-md"
                            >
                              Sign-off &amp; Close Ticket
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Send Back to Vendor Form */}
                    {activeAction === 'sendback' && (
                      <div>
                        <h4 className="font-bold text-rose-900 mb-2">Send Work Back to Vendor</h4>
                        <div className="space-y-3">
                          <textarea
                            rows={2}
                            value={actionComment}
                            onChange={(e) => setActionComment(e.target.value)}
                            placeholder="Explain why the completed work does not pass verification..."
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                          />
                          {actionError && <div className="text-rose-600 text-[11px] font-semibold">{actionError}</div>}
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setActiveAction('none')}
                              className="px-3 py-1.5 border border-slate-300 rounded-md text-slate-600"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleSendBack}
                              className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-md"
                            >
                              Return to Vendor
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Asset Information Card */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-sm text-[#2d3e50] flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-[#eb8a23]" /> Asset Master Details
                </h4>
                {onOpenAssetDetail && ticket.assetId !== 'AST-UNLISTED' && (
                  <button
                    onClick={() => onOpenAssetDetail(ticket.assetId)}
                    className="text-[11px] font-semibold text-[#eb8a23] hover:underline flex items-center gap-1"
                  >
                    Open Asset Record <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-slate-500 block">Asset Tag:</span>
                  <span className="font-mono font-bold text-slate-800">{ticket.assetId}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Category:</span>
                  <span className="font-semibold text-slate-800">{ticket.assetCategory}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Entity:</span>
                  <span className="font-semibold text-slate-800">{ticket.entity}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Location:</span>
                  <span className="font-semibold text-slate-800">{ticket.location}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Employee:</span>
                  <span className="font-semibold text-slate-800">{ticket.employeeName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Priority:</span>
                  <span className="font-bold text-slate-800">{ticket.priority}</span>
                </div>
              </div>
            </div>

            {/* Problem Description */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <h4 className="font-bold text-sm text-[#2d3e50] mb-2">Problem Description</h4>
              <p className="bg-white p-3 rounded border border-slate-200 text-slate-800 whitespace-pre-wrap leading-relaxed">
                {ticket.problemDescription}
              </p>
              {ticket.attachments.length > 0 && (
                <div className="mt-3">
                  <span className="text-slate-500 font-semibold block mb-1.5">Attachments:</span>
                  <div className="flex flex-wrap gap-2">
                    {ticket.attachments.map((att) => (
                      <a
                        key={att.id}
                        href={att.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:text-[#eb8a23] transition"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>{att.name}</span>
                        <span className="text-slate-400 font-mono">({att.size})</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Linked Quotation Breakdown (if present) */}
            {linkedQuotation && (
              <div className="p-4 rounded-xl bg-white border-2 border-slate-300">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">
                      Quotation Record
                    </span>
                    <h4 className="font-bold text-sm text-[#2d3e50]">
                      {linkedQuotation.quotationNumber} ({linkedQuotation.vendorName})
                    </h4>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      linkedQuotation.status === 'Approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    {linkedQuotation.status}
                  </span>
                </div>

                <p className="text-slate-600 mb-3 italic">{linkedQuotation.serviceDescription}</p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200 mb-2">
                  <div>
                    <span className="text-slate-500 block">Material:</span>
                    <span className="font-bold text-slate-800 font-mono">
                      ₹{linkedQuotation.materialCost.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Labour:</span>
                    <span className="font-bold text-slate-800 font-mono">
                      ₹{linkedQuotation.labourCost.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">GST (Taxes):</span>
                    <span className="font-bold text-slate-800 font-mono">
                      ₹{linkedQuotation.taxes.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Total Amount:</span>
                    <span className="font-black text-[#eb8a23] text-sm font-mono">
                      ₹{linkedQuotation.totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>

                {linkedQuotation.reviewedBy && (
                  <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                    Reviewed by: <strong>{linkedQuotation.reviewedBy}</strong> ({linkedQuotation.reviewedAt ? new Date(linkedQuotation.reviewedAt).toLocaleDateString() : ''}) — "{linkedQuotation.reviewComment}"
                  </div>
                )}
              </div>
            )}

            {/* Internal Management Comments */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-sm text-[#2d3e50] flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-[#eb8a23]" /> Internal Comments (Confidential)
                </h4>
                <button
                  onClick={() => setActiveAction('comment')}
                  className="text-[11px] font-semibold text-[#eb8a23] hover:underline"
                >
                  + Add Note
                </button>
              </div>

              {activeAction === 'comment' && (
                <div className="mb-3 space-y-2">
                  <textarea
                    rows={2}
                    value={actionComment}
                    onChange={(e) => setActionComment(e.target.value)}
                    placeholder="Enter confidential internal note (only visible to Manager/Director/Admin)..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setActiveAction('none')}
                      className="px-2.5 py-1 text-slate-600 border border-slate-300 rounded"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleComment}
                      className="px-3 py-1 bg-[#2d3e50] text-white rounded font-semibold"
                    >
                      Post Note
                    </button>
                  </div>
                </div>
              )}

              {ticket.internalComments.length === 0 ? (
                <div className="text-slate-400 italic text-[11px]">No internal management comments yet.</div>
              ) : (
                <div className="space-y-2">
                  {ticket.internalComments.map((c) => (
                    <div key={c.id} className="bg-white p-2.5 rounded-lg border border-slate-200">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-800">{c.userName} ({c.userRole})</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-slate-700 leading-relaxed">{c.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Visual Lifecycle Timeline (5 cols) */}
          <div className="lg:col-span-5 bg-slate-50/70 p-4 rounded-xl border border-slate-200 overflow-y-auto">
            <h4 className="font-bold text-sm text-[#2d3e50] mb-4 flex items-center justify-between">
              <span>Lifecycle Audit Timeline</span>
              <span className="text-[10px] text-slate-400 uppercase font-mono font-normal">
                {ticket.timeline.length} Events
              </span>
            </h4>
            <TicketTimeline events={ticket.timeline} />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex items-center justify-between shrink-0 text-xs">
          <div className="text-slate-500">
            Last Updated: {new Date(ticket.updatedAt).toLocaleDateString('en-IN')} {new Date(ticket.updatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg shadow-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
