import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { WorkOrder, Quotation, Ticket, WorkOrderStatus } from '../types';
import {
  Wrench,
  FileText,
  DollarSign,
  Upload,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building,
  User,
  ExternalLink,
  Plus,
  Send,
} from 'lucide-react';

interface VendorPortalViewProps {
  onSelectTicket?: (ticket: Ticket) => void;
}

export const VendorPortalView: React.FC<VendorPortalViewProps> = ({ onSelectTicket }) => {
  const {
    role,
    vendors,
    workOrders,
    quotations,
    tickets,
    submitQuotation,
    updateWorkProgress,
    completeWork,
    currentUser,
  } = useApp();

  // Selected vendor context (if logged in as vendor or previewing as admin)
  const [selectedVendorId, setSelectedVendorId] = useState<string>(
    role === 'vendor' && currentUser?.vendorId 
      ? currentUser.vendorId 
      : vendors[0]?.id || 'VND-001'
  );

  // Modal states for vendor actions
  const [activeWorkOrderForQuote, setActiveWorkOrderForQuote] = useState<WorkOrder | null>(null);
  const [activeWorkOrderForCompletion, setActiveWorkOrderForCompletion] = useState<WorkOrder | null>(null);

  // Quote form state
  const [materialCost, setMaterialCost] = useState<number>(4500);
  const [labourCost, setLabourCost] = useState<number>(1500);
  const [taxPercent, setTaxPercent] = useState<number>(18);
  const [serviceDescription, setServiceDescription] = useState('');
  const [quoteDocumentName, setQuoteDocumentName] = useState('OEM_Quotation_Estimate.pdf');

  // Completion form state
  const [completionSummary, setCompletionSummary] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [completionPhotoUrl, setCompletionPhotoUrl] = useState('');

  // Active vendor
  const currentVendor = vendors.find((v) => v.id === selectedVendorId) || vendors[0];

  // Work orders assigned to this vendor
  const vendorWorkOrders = workOrders.filter((w) => w.vendorId === selectedVendorId);

  // Status breakdown
  const pendingQuotes = vendorWorkOrders.filter(
    (w) => w.status === 'Assigned' || w.status === 'Quotation Pending' || w.status === 'Quotation Under Review' || w.status === 'Quotation Revision Required'
  );
  const inProgress = vendorWorkOrders.filter(
    (w) => w.status === 'Quotation Approved' || w.status === 'Work Scheduled' || w.status === 'Work In Progress' || w.status === 'Awaiting Parts'
  );
  const completedPendingSignoff = vendorWorkOrders.filter(
    (w) => w.status === 'Work Completed'
  );
  const closedJobs = vendorWorkOrders.filter((w) => w.status === 'Verified & Closed');

  // Calculated totals for quote
  const subtotal = (Number(materialCost) || 0) + (Number(labourCost) || 0);
  const taxes = Math.round((subtotal * (Number(taxPercent) || 0)) / 100);
  const totalQuoteAmount = subtotal + taxes;

  const handleSubmitQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkOrderForQuote) return;

    submitQuotation({
      workOrderId: activeWorkOrderForQuote.id,
      quotationNumber: `Q-${Date.now()}`,
      serviceDescription: serviceDescription || 'Standard OEM replacement and diagnostic service.',
      materialCost: Number(materialCost),
      labourCost: Number(labourCost),
      taxes,
      otherCharges: 0,
      totalAmount: totalQuoteAmount,
      estimatedDays: 3,
      pdfUrl: quoteDocumentName,
    });

    setActiveWorkOrderForQuote(null);
    setServiceDescription('');
  };

  const handleMarkCompleted = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkOrderForCompletion) return;

    completeWork(
      activeWorkOrderForCompletion.id,
      {
        completionDescription: completionSummary || 'All parts replaced and equipment thoroughly tested.',
        vendorInvoiceNumber: invoiceNumber,
        afterPhotos: completionPhotoUrl ? [completionPhotoUrl] : [],
        serviceReportUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
      }
    );

    setActiveWorkOrderForCompletion(null);
    setCompletionSummary('');
    setCompletionPhotoUrl('');
  };

  return (
    <div className="w-full py-6 px-4 sm:px-6 lg:px-8 space-y-6" id="vendor-portal-view">
      {/* Top Banner */}
      <div className="bg-[#2d3e50] text-white rounded-xl p-6 shadow-md border border-[#1e293b]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded bg-[#1e293b] text-[#eb8a23] text-xs font-bold font-mono">
                AUTHORIZED VENDOR PORTAL
              </span>
              <span className="text-xs text-slate-300">
                Partner: <strong>{currentVendor.name}</strong> ({currentVendor.category})
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">Vendor Service Workspace</h1>
            <p className="text-slate-300 text-xs mt-1">
              Submit formal diagnostic quotations, schedule technician visits, update repair milestones, and upload completion invoices.
            </p>
          </div>

          {/* Quick Vendor Switcher (especially helpful for admins or multi-vendor testing) */}
          <div className="flex items-center gap-2 bg-[#1e293b] p-2 rounded-lg border border-slate-700">
            <span className="text-xs text-slate-300 font-semibold pl-1">Switch Partner:</span>
            <select
              value={selectedVendorId}
              onChange={(e) => setSelectedVendorId(e.target.value)}
              className="bg-slate-800 text-xs text-white border border-slate-600 rounded px-2.5 py-1.5 focus:outline-hidden focus:border-[#eb8a23]"
            >
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.category})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards for Vendor */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-slate-500 block">Pending Quotation Requests</span>
          <span className="text-2xl font-black text-[#eb8a23] font-mono">{pendingQuotes.length}</span>
          <span className="text-[11px] text-slate-400 block mt-1">Needs price submission</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-slate-500 block">Active Jobs in Progress</span>
          <span className="text-2xl font-black text-cyan-700 font-mono">{inProgress.length}</span>
          <span className="text-[11px] text-slate-400 block mt-1">Technicians dispatched</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-slate-500 block">Completed (Pending Sign-off)</span>
          <span className="text-2xl font-black text-indigo-700 font-mono">
            {completedPendingSignoff.length}
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">Awaiting client inspection</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-slate-500 block">Total Lifetime Closed</span>
          <span className="text-2xl font-black text-emerald-700 font-mono">
            {currentVendor.completedJobsCount}
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">SLA rating: {currentVendor.rating}★</span>
        </div>
      </div>

      {/* Work Orders List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-sm text-[#2d3e50]">
            Assigned Work Orders for {currentVendor.name} ({vendorWorkOrders.length})
          </h3>
          <span className="text-xs text-slate-500">Contact: {currentVendor.phone}</span>
        </div>

        <div className="divide-y divide-slate-200 text-xs">
          {vendorWorkOrders.length === 0 ? (
            <div className="p-10 text-center text-slate-400">
              No active work orders currently assigned to this vendor.
            </div>
          ) : (
            vendorWorkOrders.map((wo) => {
              const ticket = tickets.find((t) => t.id === wo.ticketId);
              const quote = wo.quotationId
                ? quotations.find((q) => q.id === wo.quotationId)
                : quotations.filter((q) => q.workOrderId === wo.id).sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())[0];

              return (
                <div key={wo.id} className="p-5 hover:bg-slate-50/70 transition space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#eb8a23] text-sm">{wo.id}</span>
                      <span className="text-slate-400">•</span>
                      <span className="font-mono font-semibold text-slate-700">Ticket: {wo.ticketId}</span>
                      <span className="font-bold text-slate-900 text-sm pl-2">{wo.assetName}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                          wo.status === 'Verified & Closed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : wo.status === 'Work Completed'
                            ? 'bg-indigo-100 text-indigo-800'
                            : wo.status.includes('Quotation')
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-cyan-100 text-cyan-800'
                        }`}
                      >
                        {wo.status}
                      </span>
                    </div>
                  </div>

                  {/* Scope & Description */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Instructions / Scope</span>
                      <p className="text-slate-700 mt-0.5">{wo.requiredWork || 'Standard OEM repair protocol.'}</p>
                    </div>

                    {ticket && (
                      <div>
                        <span className="text-slate-400 block text-[11px]">Employee Problem Statement</span>
                        <p className="text-slate-700 mt-0.5 line-clamp-2">{ticket.problemDescription}</p>
                      </div>
                    )}
                  </div>

                  {/* Quote & Completion status if submitted */}
                  {quote && (
                    <div className="flex flex-wrap items-center justify-between bg-amber-50/60 p-3 rounded-lg border border-amber-200">
                      <div className="flex items-center gap-3">
                        <DollarSign className="w-4 h-4 text-[#eb8a23]" />
                        <div>
                          <span className="font-bold text-slate-800">
                            Quotation {quote.quotationNumber} — ₹{quote.totalAmount.toLocaleString()}
                          </span>
                          <span className="text-slate-500 text-[11px] block">
                            Material: ₹{quote.materialCost} | Labour: ₹{quote.labourCost} | GST: ₹{quote.taxes}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          quote.status === 'Approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : quote.status === 'Rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        Quote Status: {quote.status}
                      </span>
                    </div>
                  )}

                  {/* Action Buttons for Vendor */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-2">
                      {ticket && onSelectTicket && (
                        <button
                          onClick={() => onSelectTicket(ticket)}
                          className="px-3 py-1.5 rounded bg-white border border-slate-300 hover:border-slate-400 text-slate-700 font-semibold text-[11px]"
                        >
                          View Full Ticket Record
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Can submit or revise quote */}
                      {(!quote || quote.status === 'Revision Required' || quote.status === 'Rejected') && (
                        <button
                          onClick={() => setActiveWorkOrderForQuote(wo)}
                          className="px-3.5 py-1.5 rounded-lg bg-[#eb8a23] hover:bg-[#d97917] text-white font-bold text-xs shadow-xs flex items-center gap-1.5"
                        >
                          <DollarSign className="w-3.5 h-3.5" /> Submit Quotation
                        </button>
                      )}

                      {/* Can update job progress */}
                      {quote && quote.status === 'Approved' && wo.status !== 'Work Completed' && wo.status !== 'Verified & Closed' && (
                        <>
                          <select
                            value={wo.status}
                            onChange={(e) => updateWorkProgress(wo.id, e.target.value as any)}
                            className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 font-semibold text-slate-700 text-xs"
                          >
                            <option value="Work Scheduled">Status: Work Scheduled</option>
                            <option value="Work In Progress">Status: In Progress</option>
                            <option value="Awaiting Parts">Status: Awaiting Parts</option>
                          </select>

                          <button
                            onClick={() => setActiveWorkOrderForCompletion(wo)}
                            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Mark Work Completed
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* MODAL: SUBMIT QUOTATION */}
      {activeWorkOrderForQuote && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl flex flex-col overflow-hidden">
            <div className="bg-[#2d3e50] text-white px-6 py-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono text-[#eb8a23] font-bold">
                  Work Order: {activeWorkOrderForQuote.id}
                </span>
                <h3 className="font-bold text-base">Submit Formal Service Quotation</h3>
              </div>
              <button
                onClick={() => setActiveWorkOrderForQuote(null)}
                className="text-slate-300 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitQuote} className="p-6 space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-slate-500 block">Asset for Service:</span>
                <span className="font-bold text-slate-900 text-sm">
                  {activeWorkOrderForQuote.assetName}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Material / Parts Cost (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={materialCost}
                    onChange={(e) => setMaterialCost(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Labour &amp; Service Cost (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={labourCost}
                    onChange={(e) => setLabourCost(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">GST / Tax Rate (%)</label>
                  <select
                    value={taxPercent}
                    onChange={(e) => setTaxPercent(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value={18}>18% Standard GST</option>
                    <option value={12}>12% GST</option>
                    <option value={28}>28% GST</option>
                    <option value={0}>0% (Exempt)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Total Amount (Auto-calculated)
                  </label>
                  <div className="w-full px-3 py-2 border border-[#eb8a23] bg-amber-50 rounded-lg font-mono font-black text-sm text-[#eb8a23]">
                    ₹{totalQuoteAmount.toLocaleString()}
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Service Description / Diagnosis Breakdown <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={serviceDescription}
                  onChange={(e) => setServiceDescription(e.target.value)}
                  placeholder="Specify parts to be replaced (OEM part numbers, warranty period on new parts)..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveWorkOrderForQuote(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#eb8a23] hover:bg-[#d97917] text-white font-bold rounded-lg shadow-xs flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> Submit to Management
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: MARK WORK COMPLETED */}
      {activeWorkOrderForCompletion && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl flex flex-col overflow-hidden">
            <div className="bg-[#2d3e50] text-white px-6 py-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono text-emerald-400 font-bold">
                  Work Order: {activeWorkOrderForCompletion.id}
                </span>
                <h3 className="font-bold text-base">Submit Work Completion Report</h3>
              </div>
              <button
                onClick={() => setActiveWorkOrderForCompletion(null)}
                className="text-slate-300 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleMarkCompleted} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Vendor Invoice / Service Report Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Work Summary &amp; Testing Notes <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={completionSummary}
                  onChange={(e) => setCompletionSummary(e.target.value)}
                  placeholder="Details of repairs executed, stress test results, serial of installed replacement parts..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Completion Photograph URL (Optional)
                </label>
                <input
                  type="url"
                  value={completionPhotoUrl}
                  onChange={(e) => setCompletionPhotoUrl(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-800">
                <span className="font-semibold block mb-0.5">Automated Client Verification:</span>
                Submitting completion will notify both the Operations Manager and Managing Director to inspect the asset and sign off.
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveWorkOrderForCompletion(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Submit for Sign-Off
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
