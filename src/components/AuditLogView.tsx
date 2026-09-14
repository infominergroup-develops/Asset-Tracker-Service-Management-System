import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AuditLog } from '../types';
import {
  ShieldAlert,
  Search,
  Filter,
  Download,
  Clock,
  User,
  Building,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';

export const AuditLogView: React.FC = () => {
  const { auditLogs } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('All');
  const [overrideOnly, setOverrideOnly] = useState<boolean>(false);

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entityId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.systemNotes.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesAction = actionFilter === 'All' || log.action === actionFilter;
    const matchesOverride = overrideOnly ? log.isOverride : true;

    return matchesSearch && matchesAction && matchesOverride;
  });

  const exportCSV = () => {
    const headers = [
      'ID',
      'Timestamp',
      'User Name',
      'Role',
      'Action',
      'Entity Type',
      'Entity ID',
      'Old Value',
      'New Value',
      'Is Override',
      'System Notes',
      'IP Address',
    ];

    const rows = filteredLogs.map((l) => [
      l.id,
      l.timestamp,
      `"${l.userName}"`,
      l.userRole,
      `"${l.action}"`,
      l.entityType,
      l.entityId,
      `"${l.oldValue || ''}"`,
      `"${l.newValue || ''}"`,
      l.isOverride ? 'YES' : 'NO',
      `"${l.systemNotes.replace(/"/g, '""')}"`,
      l.ipAddress || '',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Infominer_Audit_Log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full py-6 px-4 sm:px-6 lg:px-8 space-y-6" id="audit-trail-view">
      {/* Top Banner */}
      <div className="bg-[#2d3e50] text-white rounded-xl p-6 shadow-md border border-[#1e293b] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-[#1e293b] text-[#eb8a23] text-xs font-bold font-mono">
              IMMUTABLE AUDIT LEDGER
            </span>
            <span className="text-xs text-slate-300">Compliant with ISO 27001 &amp; ITIL v4</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Audit Trail &amp; Compliance Logs</h1>
          <p className="text-slate-300 text-xs mt-1">
            Every state mutation, ticket review, vendor dispatch, quotation authorization, and budget override is permanently stamped.
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="px-4 py-2 rounded-lg bg-white text-slate-800 font-bold text-xs hover:bg-slate-100 shadow-sm transition flex items-center gap-1.5"
        >
          <Download className="w-4 h-4 text-[#eb8a23]" /> Export Compliance CSV
        </button>
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
              placeholder="Search user, action, entity ID..."
              className="pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg w-52 sm:w-72 focus:outline-hidden focus:border-[#eb8a23]"
            />
          </div>

          <label className="flex items-center gap-2 font-semibold text-[#eb8a23] cursor-pointer bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
            <input
              type="checkbox"
              checked={overrideOnly}
              onChange={(e) => setOverrideOnly(e.target.checked)}
              className="rounded text-[#eb8a23] focus:ring-[#eb8a23]"
            />
            Show Budget Overrides Only
          </label>
        </div>

        <div className="text-slate-500 font-medium">
          Logged Entries: <strong>{filteredLogs.length}</strong> (Append-Only)
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#2d3e50] text-white select-none">
              <tr>
                <th className="px-4 py-3 font-semibold">Timestamp</th>
                <th className="px-4 py-3 font-semibold">Actor / User</th>
                <th className="px-4 py-3 font-semibold">Action</th>
                <th className="px-4 py-3 font-semibold">Entity Target</th>
                <th className="px-4 py-3 font-semibold">State Mutation</th>
                <th className="px-4 py-3 font-semibold">Audit Notes</th>
                <th className="px-4 py-3 font-semibold text-right">Flag</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-sans">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    No audit records match the current filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition">
                    {/* Timestamp */}
                    <td className="px-4 py-3 font-mono text-slate-500 whitespace-nowrap">
                      <div>
                        {new Date(log.timestamp).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(log.timestamp).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </div>
                    </td>

                    {/* Actor */}
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-800">{log.userName}</div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">
                        {log.userRole}
                      </div>
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3 font-semibold text-slate-700">{log.action}</td>

                    {/* Entity Target */}
                    <td className="px-4 py-3 font-mono">
                      <span className="text-[#eb8a23] font-bold">{log.entityId}</span>
                      <span className="text-slate-400 text-[10px] block uppercase">
                        {log.entityType}
                      </span>
                    </td>

                    {/* State Mutation (Old -> New) */}
                    <td className="px-4 py-3 text-[11px]">
                      {log.oldValue && log.newValue ? (
                        <div className="flex items-center gap-1.5">
                          <span className="line-through text-slate-400">{log.oldValue}</span>
                          <span className="text-slate-500">→</span>
                          <span className="font-bold text-emerald-700">{log.newValue}</span>
                        </div>
                      ) : log.newValue ? (
                        <span className="font-bold text-slate-700">{log.newValue}</span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    {/* System Notes */}
                    <td className="px-4 py-3 text-slate-600 max-w-xs truncate" title={log.systemNotes}>
                      {log.systemNotes}
                    </td>

                    {/* Override Flag */}
                    <td className="px-4 py-3 text-right">
                      {log.isOverride ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#eb8a23] text-white shadow-2xs">
                          OVERRIDE
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-mono">OK</span>
                      )}
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
