import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Ticket } from '../types';
import {
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  Building2,
  Calendar,
  Layers,
  ArrowRight,
  Lock,
} from 'lucide-react';

interface PublicTicketTrackerProps {
  initialTicketId?: string;
}

export const PublicTicketTracker: React.FC<PublicTicketTrackerProps> = ({ initialTicketId }) => {
  const { tickets } = useApp();

  const [ticketIdInput, setTicketIdInput] = useState(initialTicketId || '');
  const [emailInput, setEmailInput] = useState('');
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (initialTicketId) {
      setTicketIdInput(initialTicketId);
      const t = tickets.find((item) => item.id.toLowerCase() === initialTicketId.toLowerCase());
      if (t) {
        setEmailInput(t.employeeEmail);
      }
    }
  }, [initialTicketId, tickets]);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsVerified(false);

    const cleanId = ticketIdInput.trim().toUpperCase();
    const cleanEmail = emailInput.trim().toLowerCase();

    if (!cleanId) {
      setErrorMsg('Please enter a Ticket ID (e.g. TKT-2026-00125).');
      return;
    }
    if (!cleanEmail) {
      setErrorMsg('Please enter the registered work email used when filing.');
      return;
    }

    const found = tickets.find(
      (t) =>
        t.id.toUpperCase() === cleanId &&
        (t.employeeEmail.toLowerCase() === cleanEmail || t.employeePhone.includes(cleanEmail))
    );

    if (found) {
      setActiveTicket(found);
      setIsVerified(true);
    } else {
      // Check if ticket exists but email doesn't match
      const exists = tickets.find((t) => t.id.toUpperCase() === cleanId);
      if (exists) {
        setErrorMsg('The email does not match our records for this ticket. Please verify.');
      } else {
        setErrorMsg(`No ticket found matching ID "${cleanId}". Please check your reference.`);
      }
      setActiveTicket(null);
    }
  };

  const getPublicNextStep = (status: string) => {
    switch (status) {
      case 'Submitted':
      case 'Under Management Review':
        return 'Management review in progress. Operations Manager Swati Katiyar and Director Krishna Mittal will review priority and assign service vendor.';
      case 'Clarification Required':
        return 'Management requires additional details regarding this failure before proceeding.';
      case 'Approved':
      case 'Sent to Vendor':
        return 'Approved by management. Work order dispatched to authorized equipment service partner.';
      case 'Quotation Pending':
      case 'Quotation Received':
      case 'Quotation Under Review':
        return 'Service partner is preparing or submitting parts/labour quotation for administrative sanction.';
      case 'Quotation Approved':
      case 'Work Scheduled':
        return 'Quotation approved. Service engineer visit or parts shipment is scheduled.';
      case 'Work In Progress':
      case 'Awaiting Parts':
        return 'Authorized technician is currently actively servicing or repairing the unit.';
      case 'Work Completed':
      case 'Verification Pending':
        return 'Service work is finished. Facilities admin is executing final quality sign-off.';
      case 'Closed':
        return 'Issue completely resolved and verified. Asset operational.';
      case 'Rejected':
        return 'Ticket was reviewed and closed by management without vendor action.';
      default:
        return 'In progress with the maintenance team.';
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'Closed') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Resolved &amp; Closed
        </span>
      );
    }
    if (status === 'Rejected') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
          <AlertCircle className="w-3.5 h-3.5 text-rose-600" /> Rejected
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-[#eb8a23]/40">
        <Clock className="w-3.5 h-3.5 text-[#eb8a23]" /> {status}
      </span>
    );
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6" id="public-ticket-tracking-container">
      {/* Title */}
      <div className="bg-[#2d3e50] text-white rounded-xl p-6 sm:p-8 shadow-md mb-8 border border-[#1e293b]">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Track Your Ticket
        </h1>
        <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
          Check live real-time status updates on your reported equipment or facilities issue.
          Requires no login — simply enter your Ticket ID and registered email.
        </p>
      </div>

      {/* Lookup Form */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs mb-8">
        <form onSubmit={handleTrack} className="space-y-4" id="ticket-lookup-form">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Ticket Reference ID <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={ticketIdInput}
                  onChange={(e) => setTicketIdInput(e.target.value)}
                  placeholder="e.g. TKT-2026-00125"
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg uppercase font-mono font-semibold focus:outline-hidden focus:border-[#eb8a23]"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Registered Work Email <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="e.g. rahul.agrawal@infominer.in"
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-[#eb8a23]"
                />
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 p-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              {errorMsg}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              id="submit-track-lookup-btn"
              className="px-6 py-2.5 rounded-lg bg-[#eb8a23] hover:bg-[#d97917] text-white font-bold text-xs shadow-md transition flex items-center gap-2"
            >
              Verify &amp; Track Status <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Ticket Details View (Public-Safe) */}
      {isVerified && activeTicket && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-md overflow-hidden" id="public-ticket-detail-view">
          {/* Header */}
          <div className="bg-[#2d3e50] text-white p-6 border-b border-slate-700">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-300">
                  Infominer Service Record
                </span>
                <h2 className="text-xl sm:text-2xl font-black font-mono text-[#eb8a23]">
                  {activeTicket.id}
                </h2>
              </div>
              <div>{getStatusBadge(activeTicket.status)}</div>
            </div>
          </div>

          <div className="p-6 space-y-6 text-xs">
            {/* Asset & Employee Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
              <div>
                <span className="text-slate-500 block">Reported Asset</span>
                <span className="font-bold text-slate-900 text-sm">{activeTicket.assetName}</span>
                <span className="text-[11px] font-mono text-slate-500 block">{activeTicket.assetId}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Reported By</span>
                <span className="font-semibold text-slate-900">{activeTicket.employeeName}</span>
                <span className="text-slate-500 block">{activeTicket.department}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Priority</span>
                <span className="font-bold text-slate-800">{activeTicket.priority}</span>
                <span className="text-slate-500 block">{activeTicket.issueCategory}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Created On</span>
                <span className="font-medium text-slate-800">
                  {new Date(activeTicket.createdAt).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
                <span className="text-slate-400 block text-[11px]">
                  {new Date(activeTicket.createdAt).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>

            {/* Next Expected Step Banner */}
            <div className="bg-amber-50/70 border-l-4 border-[#eb8a23] p-4 rounded-r-lg">
              <h4 className="font-bold text-amber-900 text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#eb8a23]" /> Expected Next Step
              </h4>
              <p className="text-slate-700 leading-relaxed text-xs">
                {getPublicNextStep(activeTicket.status)}
              </p>
            </div>

            {/* Problem Description */}
            <div>
              <h4 className="font-bold text-slate-900 mb-1">Issue Description</h4>
              <p className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-700 leading-relaxed">
                {activeTicket.problemDescription}
              </p>
            </div>

            {/* Rejection / Closure note if applicable */}
            {activeTicket.rejectionReason && (
              <div className="bg-rose-50 border border-rose-200 p-4 rounded-lg">
                <h4 className="font-bold text-rose-900 mb-1">Management Decision / Reason</h4>
                <p className="text-rose-800">{activeTicket.rejectionReason}</p>
              </div>
            )}

            {activeTicket.closureNote && (
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg">
                <h4 className="font-bold text-emerald-900 mb-1">Service Resolution Note</h4>
                <p className="text-emerald-800">{activeTicket.closureNote}</p>
              </div>
            )}

            {/* Safe Public Progress Steps */}
            <div>
              <h4 className="font-bold text-slate-900 mb-3">Service Lifecycle Progression</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div
                  className={`p-2.5 rounded-lg border ${
                    activeTicket.status !== 'Rejected'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-semibold'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >
                  <div className="font-bold">1. Reported</div>
                  <div className="text-[10px] text-slate-500">Employee</div>
                </div>

                <div
                  className={`p-2.5 rounded-lg border ${
                    ['Approved', 'Sent to Vendor', 'Quotation Pending', 'Quotation Under Review', 'Quotation Approved', 'Work Scheduled', 'Work In Progress', 'Work Completed', 'Verification Pending', 'Closed'].includes(
                      activeTicket.status
                    )
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-semibold'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >
                  <div className="font-bold">2. Reviewed</div>
                  <div className="text-[10px] text-slate-500">Manager &amp; Director</div>
                </div>

                <div
                  className={`p-2.5 rounded-lg border ${
                    ['Quotation Approved', 'Work Scheduled', 'Work In Progress', 'Work Completed', 'Verification Pending', 'Closed'].includes(
                      activeTicket.status
                    )
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-semibold'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >
                  <div className="font-bold">3. Service Execution</div>
                  <div className="text-[10px] text-slate-500">Authorized Vendor</div>
                </div>

                <div
                  className={`p-2.5 rounded-lg border ${
                    activeTicket.status === 'Closed'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-semibold'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >
                  <div className="font-bold">4. Final Sign-off</div>
                  <div className="text-[10px] text-slate-500">Verified &amp; Closed</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
