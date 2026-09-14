import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Ticket, TicketStatus, TicketPriority } from '../types';
import {
  Search,
  Filter,
  Layers,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building,
  User,
  ChevronRight,
  Plus,
} from 'lucide-react';

interface TicketsQueueViewProps {
  onSelectTicket: (ticket: Ticket) => void;
  onNavigateToReportIssue: () => void;
}

export const TicketsQueueView: React.FC<TicketsQueueViewProps> = ({
  onSelectTicket,
  onNavigateToReportIssue,
}) => {
  const { tickets, departments, entities } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [deptFilter, setDeptFilter] = useState<string>('All');

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.problemDescription.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || t.priority === priorityFilter;
    const matchesDept = deptFilter === 'All' || t.department === deptFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesDept;
  });

  return (
    <div className="w-full py-6 px-4 sm:px-6 lg:px-8 space-y-6" id="tickets-queue-view">
      {/* Top Banner */}
      <div className="bg-[#2d3e50] text-white rounded-xl p-6 shadow-md border border-[#1e293b] flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black">Tickets &amp; Service Requests</h1>
          <p className="text-slate-300 text-xs mt-1">
            Central operational queue for facility, IT, and maintenance requests across all Infominer entities.
          </p>
        </div>

        <button
          onClick={onNavigateToReportIssue}
          className="px-4 py-2 rounded-lg bg-[#eb8a23] hover:bg-[#d97917] text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Report New Issue
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Ticket, Asset, Employee..."
              className="pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg w-52 sm:w-64 focus:outline-hidden focus:border-[#eb8a23]"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-hidden focus:border-[#eb8a23]"
          >
            <option value="All">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Management Review">Under Management Review</option>
            <option value="Approved">Approved</option>
            <option value="Quotation Pending">Quotation Pending</option>
            <option value="Quotation Under Review">Quotation Under Review</option>
            <option value="Work Scheduled">Work Scheduled</option>
            <option value="Work In Progress">Work In Progress</option>
            <option value="Verification Pending">Verification Pending</option>
            <option value="Closed">Closed</option>
            <option value="Rejected">Rejected</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-hidden focus:border-[#eb8a23]"
          >
            <option value="All">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Dept Filter */}
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-hidden focus:border-[#eb8a23]"
          >
            <option value="All">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div className="text-slate-500 font-medium">
          Showing <strong>{filteredTickets.length}</strong> of {tickets.length} tickets
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#2d3e50] text-white select-none">
              <tr>
                <th className="px-4 py-3 font-semibold">Ticket ID</th>
                <th className="px-4 py-3 font-semibold">Asset</th>
                <th className="px-4 py-3 font-semibold">Employee</th>
                <th className="px-4 py-3 font-semibold">Issue Category</th>
                <th className="px-4 py-3 font-semibold">Priority</th>
                <th className="px-4 py-3 font-semibold">Current Status</th>
                <th className="px-4 py-3 font-semibold">Created</th>
                <th className="px-4 py-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400">
                    No tickets found matching the selected filter criteria.
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
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{t.assetName}</div>
                      <div className="text-[10px] font-mono text-slate-400">{t.assetId}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800">{t.employeeName}</div>
                      <div className="text-[10px] text-slate-500">{t.department}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{t.issueCategory}</td>
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
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
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
                    <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">
                      {new Date(t.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                      })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTicket(t);
                        }}
                        className="px-2.5 py-1 rounded bg-white border border-slate-300 hover:border-[#eb8a23] hover:text-[#eb8a23] text-slate-700 font-semibold text-[11px] transition shadow-2xs"
                      >
                        Inspect →
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
