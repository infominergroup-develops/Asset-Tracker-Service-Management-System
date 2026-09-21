import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Ticket, Quotation, WorkOrder, Asset } from '../types';
import {
  Layers,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Wrench,
  TrendingUp,
  DollarSign,
  ArrowRight,
  Filter,
  Search,
  Building,
  Users,
  Eye,
  Check,
  RotateCcw,
} from 'lucide-react';

interface ManagerDashboardProps {
  onSelectTicket: (ticket: Ticket) => void;
  onNavigateTab: (tab: string) => void;
}

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({
  onSelectTicket,
  onNavigateTab,
}) => {
  const { role, currentUser, assets, tickets, quotations, workOrders, vendors } = useApp();

  const [pipelineFilter, setPipelineFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. KPI Calculations
  const totalAssetsCount = assets.length;
  const activeAssetsCount = assets.filter((a) => a.status === 'Active' || a.status === 'Assigned').length;
  const underMaintenanceCount = assets.filter(
    (a) => a.status === 'Under Maintenance' || a.status === 'Under Repair'
  ).length;

  const openTickets = tickets.filter((t) => t.status !== 'Closed' && t.status !== 'Rejected');
  const pendingApprovals = tickets.filter(
    (t) =>
      t.status === 'Submitted' ||
      t.status === 'Under Management Review' ||
      t.status === 'Verification Pending' ||
      t.status === 'Quotation Under Review'
  );
  const pendingQuotations = quotations.filter((q) => q.status === 'Submitted');
  const workInProgress = workOrders.filter(
    (w) => w.status === 'Work In Progress' || w.status === 'Work Scheduled' || w.status === 'Awaiting Parts'
  );
  const verificationPending = tickets.filter((t) => t.status === 'Verification Pending');

  // Total active service value
  const totalServiceSpend = quotations
    .filter((q) => q.status === 'Approved')
    .reduce((sum, q) => sum + q.totalAmount, 0);

  // Filtered tickets
  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.problemDescription.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (pipelineFilter === 'pending-approvals') {
      return t.status === 'Submitted' || t.status === 'Under Management Review';
    }
    if (pipelineFilter === 'quotation-review') {
      return t.status === 'Quotation Under Review' || t.status === 'Quotation Pending';
    }
    if (pipelineFilter === 'in-progress') {
      return t.status === 'Work Scheduled' || t.status === 'Work In Progress';
    }
    if (pipelineFilter === 'verification') {
      return t.status === 'Verification Pending';
    }
    if (pipelineFilter === 'closed') {
      return t.status === 'Closed';
    }
    return true;
  });

  return (
    <div className="w-full py-6 px-4 sm:px-6 lg:px-8 space-y-8" id="management-dashboard-view">
      {/* Top Banner with Welcome & Simultaneous Visibility notice */}
      <div className="bg-[#2d3e50] text-white rounded-xl p-6 shadow-md border border-[#1e293b]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded bg-[#1e293b] text-[#eb8a23] text-xs font-bold font-mono">
                {role.toUpperCase()} PORTAL
              </span>
              <span className="text-xs text-slate-300">
                Logged in as <strong>{currentUser.name}</strong> ({currentUser.designation})
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Asset &amp; Service Management Control Center
            </h1>
            <p className="text-slate-300 text-xs mt-1">
              Simultaneous Manager &amp; Director Visibility Engine active. Real-time updates on physical assets, employee tickets, and vendor quotations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigateTab('tickets')}
              className="px-4 py-2 rounded-lg bg-[#eb8a23] hover:bg-[#d97917] text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5"
            >
              Open Ticket Queue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI STATS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4" id="management-kpi-grid">
        {/* Total Assets */}
        <div
          onClick={() => onNavigateTab('assets')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-[#eb8a23] cursor-pointer transition"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Total Assets</span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-[#2d3e50] font-mono">{totalAssetsCount}</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">
            {activeAssetsCount} Active &amp; Assigned
          </div>
        </div>

        {/* Under Maintenance */}
        <div
          onClick={() => onNavigateTab('assets')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-[#eb8a23] cursor-pointer transition"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Under Maintenance</span>
            <Wrench className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 font-mono">{underMaintenanceCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">In diagnostics or repair</div>
        </div>

        {/* Pending Approvals */}
        <div
          onClick={() => setPipelineFilter('pending-approvals')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-[#eb8a23] cursor-pointer transition"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Pending Approvals</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600 font-mono">{pendingApprovals.length}</div>
          <div className="text-[11px] text-rose-600 font-semibold mt-1">Awaiting Manager / Director</div>
        </div>

        {/* Pending Quotations */}
        <div
          onClick={() => onNavigateTab('quotations')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-[#eb8a23] cursor-pointer transition"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Pending Quotations</span>
            <DollarSign className="w-4 h-4 text-[#eb8a23]" />
          </div>
          <div className="text-2xl font-black text-[#eb8a23] font-mono">{pendingQuotations.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Requires review &amp; sign-off</div>
        </div>
      </div>

      {/* TICKET PIPELINE WORKFLOW STRIP */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs" id="ticket-pipeline-section">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-[#2d3e50]">Ticket Lifecycle Pipeline</h3>
            <p className="text-xs text-slate-500">Live counts across all 8 major system stages</p>
          </div>
          <button
            onClick={() => setPipelineFilter('all')}
            className="text-xs font-semibold text-[#eb8a23] hover:underline"
          >
            Reset Filters
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-center text-xs">
          {[
            {
              id: 'all',
              label: 'Total Raised',
              count: tickets.length,
              color: 'text-slate-800',
              bg: 'bg-slate-100',
            },
            {
              id: 'pending-approvals',
              label: 'Under Review',
              count: pendingApprovals.length,
              color: 'text-amber-700',
              bg: 'bg-amber-50 border-amber-200',
            },
            {
              id: 'approved',
              label: 'Approved',
              count: tickets.filter((t) => t.status === 'Approved' || t.status === 'Sent to Vendor').length,
              color: 'text-blue-700',
              bg: 'bg-blue-50 border-blue-200',
            },
            {
              id: 'quotation-pending',
              label: 'Quote Pending',
              count: tickets.filter((t) => t.status === 'Quotation Pending').length,
              color: 'text-purple-700',
              bg: 'bg-purple-50 border-purple-200',
            },
            {
              id: 'quotation-review',
              label: 'Quote Review',
              count: tickets.filter((t) => t.status === 'Quotation Under Review').length,
              color: 'text-[#eb8a23]',
              bg: 'bg-amber-100/50 border-[#eb8a23]/30',
            },
            {
              id: 'in-progress',
              label: 'In Progress',
              count: tickets.filter((t) => t.status === 'Work Scheduled' || t.status === 'Work In Progress').length,
              color: 'text-cyan-800',
              bg: 'bg-cyan-50 border-cyan-200',
            },
            {
              id: 'verification',
              label: 'Verification',
              count: verificationPending.length,
              color: 'text-indigo-800',
              bg: 'bg-indigo-50 border-indigo-200',
            },
            {
              id: 'closed',
              label: 'Closed',
              count: tickets.filter((t) => t.status === 'Closed').length,
              color: 'text-emerald-800',
              bg: 'bg-emerald-50 border-emerald-200',
            },
          ].map((stage) => {
            const isSelected = pipelineFilter === stage.id;
            return (
              <div
                key={stage.id}
                onClick={() => setPipelineFilter(stage.id)}
                className={`p-2.5 rounded-lg border cursor-pointer transition ${stage.bg} ${
                  isSelected ? 'ring-2 ring-[#eb8a23] font-bold shadow-xs' : 'hover:border-slate-400'
                }`}
              >
                <div className={`text-lg font-black font-mono ${stage.color}`}>{stage.count}</div>
                <div className="text-[11px] font-medium text-slate-700 truncate">{stage.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* TICKETS TABLE WITH SEARCH & SIMULTANEOUS ACTIONS */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden" id="dashboard-tickets-table">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-base text-[#2d3e50]">
              Operational Tickets &amp; Actions ({filteredTickets.length})
            </h3>
            <p className="text-xs text-slate-500">
              Click any ticket row to view full details, audit timeline, or trigger manager approval
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ticket, asset, employee..."
                className="pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs w-48 sm:w-64 focus:outline-hidden focus:border-[#eb8a23]"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#2d3e50] text-white select-none">
              <tr>
                <th className="px-4 py-3 font-semibold">Ticket ID</th>
                <th className="px-4 py-3 font-semibold">Asset Name</th>
                <th className="px-4 py-3 font-semibold">Employee</th>
                <th className="px-4 py-3 font-semibold">Issue Summary</th>
                <th className="px-4 py-3 font-semibold">Priority</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    No tickets found matching this filter criteria.
                  </td>
                </tr>
              ) : (
                filteredTickets.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => onSelectTicket(t)}
                    className="hover:bg-amber-50/40 cursor-pointer transition"
                  >
                    <td className="px-4 py-3 font-mono font-bold text-[#eb8a23]">{t.id}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800">
                      <div>{t.assetName}</div>
                      <div className="text-[10px] font-mono text-slate-400">{t.assetId}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800">{t.employeeName}</div>
                      <div className="text-[10px] text-slate-500">{t.department}</div>
                    </td>
                    <td className="px-4 py-3 max-w-xs truncate text-slate-600">
                      {t.problemDescription}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.priority === 'Critical'
                            ? 'bg-rose-100 text-rose-800 font-black'
                            : t.priority === 'High'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {t.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          t.status === 'Closed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : t.status === 'Rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : t.status.includes('Quotation')
                            ? 'bg-[#eb8a23]/15 text-[#d97917]'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTicket(t);
                        }}
                        className="px-2.5 py-1 rounded bg-white border border-slate-300 hover:border-[#eb8a23] hover:text-[#eb8a23] text-slate-700 font-semibold text-[11px] transition shadow-2xs"
                      >
                        View &amp; Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* TWO COLUMN SUMMARY: VENDOR PERFORMANCE & ASSET DISTRIBUTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vendor Performance */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs" id="vendor-performance-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base text-[#2d3e50]">Vendor Performance &amp; SLA</h3>
            <button
              onClick={() => onNavigateTab('vendors')}
              className="text-xs font-semibold text-[#eb8a23] hover:underline"
            >
              View All Vendors →
            </button>
          </div>

          <div className="space-y-3">
            {vendors.map((v) => {
              const activeJobs = workOrders.filter(
                (w) => w.vendorId === v.id && w.status !== 'Verified & Closed'
              ).length;
              return (
                <div key={v.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-800 text-sm">{v.name}</span>
                    <span className="text-amber-500 font-bold font-mono">★ {v.rating}</span>
                  </div>
                  <div className="text-slate-500 text-[11px] mb-2">{v.category} • Contact: {v.contactPerson}</div>
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/80 text-center">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Active Jobs</span>
                      <span className="font-bold text-[#eb8a23]">{activeJobs}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Completed</span>
                      <span className="font-bold text-slate-700">{v.completedJobsCount}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Avg Turnaround</span>
                      <span className="font-bold text-slate-700">{v.averageTurnaroundDays} days</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Asset Distribution Summary */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs" id="asset-distribution-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base text-[#2d3e50]">Asset Distribution by Category</h3>
            <button
              onClick={() => onNavigateTab('assets')}
              className="text-xs font-semibold text-[#eb8a23] hover:underline"
            >
              Asset Master ({assets.length}) →
            </button>
          </div>

          <div className="space-y-2.5 text-xs">
            {[
              { cat: 'IT Equipment', icon: '💻', count: assets.filter((a) => a.category === 'IT Equipment').length },
              { cat: 'HVAC & Cooling', icon: '❄️', count: assets.filter((a) => a.category === 'HVAC & Cooling').length },
              { cat: 'Office Furniture', icon: '🪑', count: assets.filter((a) => a.category === 'Office Furniture').length },
              { cat: 'Networking', icon: '🌐', count: assets.filter((a) => a.category === 'Networking').length },
              { cat: 'Electrical & Power', icon: '⚡', count: assets.filter((a) => a.category === 'Electrical & Power').length },
              { cat: 'Appliances & Vehicles', icon: '🚐', count: assets.filter((a) => a.category === 'Appliances' || a.category === 'Vehicles').length },
            ].map((item) => {
              const pct = Math.round((item.count / assets.length) * 100);
              return (
                <div key={item.cat} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700">
                      {item.icon} {item.cat}
                    </span>
                    <span className="font-mono text-slate-500">
                      {item.count} assets ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#eb8a23] h-full rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
