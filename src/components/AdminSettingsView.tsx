import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Settings,
  ShieldAlert,
  Clock,
  DollarSign,
  Building2,
  MapPin,
  Users,
  RotateCcw,
  CheckCircle2,
  Save,
} from 'lucide-react';

export const AdminSettingsView: React.FC = () => {
  const {
    approvalConfig,
    updateApprovalConfig,
    entities,
    departments,
    locations,
    resetData,
  } = useApp();

  const [threshold, setThreshold] = useState(approvalConfig.managerThreshold);
  const [requireDirector, setRequireDirector] = useState(approvalConfig.requireDirectorAboveThreshold);
  const [autoEscalateHours, setAutoEscalateHours] = useState(approvalConfig.autoEscalateHours);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateApprovalConfig({
      managerThreshold: Number(threshold),
      requireDirectorAboveThreshold: requireDirector,
      autoEscalateHours: Number(autoEscalateHours),
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleResetData = () => {
    if (window.confirm('Reset all demo data back to clean initial factory state?')) {
      resetData();
      window.location.reload();
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 space-y-6" id="admin-settings-view">
      {/* Top Banner */}
      <div className="bg-[#2d3e50] text-white rounded-xl p-6 shadow-md border border-[#1e293b]">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 rounded bg-[#1e293b] text-[#eb8a23] text-xs font-bold font-mono">
            SUPER-ADMIN CONTROLS
          </span>
          <span className="text-xs text-slate-300">System Parameters &amp; Financial Governance</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black">System Administration &amp; Governance</h1>
        <p className="text-slate-300 text-xs mt-1">
          Configure financial approval thresholds, escalation timers, operational entity hierarchies, and demo state.
        </p>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-3 text-xs text-emerald-800 font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Settings updated and persisted successfully!
        </div>
      )}

      {/* Financial Limits & Escalation */}
      <form onSubmit={handleSave} className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6 text-xs">
        <h3 className="font-bold text-base text-[#2d3e50] pb-2 border-b border-slate-100 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-[#eb8a23]" /> Financial Approval Thresholds &amp; Governance
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Manager Approval Ceiling Limit (INR ₹)
            </label>
            <input
              type="number"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Vendor quotations at or below this value can be sanctioned by the Operations Manager.
            </span>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Auto-Escalation Timer (Hours)
            </label>
            <input
              type="number"
              value={autoEscalateHours}
              onChange={(e) => setAutoEscalateHours(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Tickets pending review past this SLA will trigger high-priority alerts to Directors.
            </span>
          </div>
        </div>

        <div className="pt-2">
          <label className="flex items-center gap-2 font-semibold text-slate-800 cursor-pointer">
            <input
              type="checkbox"
              checked={requireDirector}
              onChange={(e) => setRequireDirector(e.target.checked)}
              className="rounded text-[#eb8a23] focus:ring-[#eb8a23]"
            />
            Strictly require Director Approval for any quotation exceeding ₹{threshold.toLocaleString()}
          </label>
          <span className="text-[11px] text-slate-500 block pl-5 mt-0.5">
            When enabled, Managers cannot sanction quotations above threshold without entering a mandatory Budget Override Justification.
          </span>
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-100">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-lg bg-[#eb8a23] hover:bg-[#d97917] text-white font-bold text-xs shadow-md transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Save Governance Rules
          </button>
        </div>
      </form>

      {/* Hierarchy Info */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="font-bold text-slate-800 mb-2 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-[#eb8a23]" /> Registered Entities ({entities.length})
          </div>
          <ul className="space-y-1 text-slate-600">
            {entities.map((e, idx) => (
              <li key={idx} className="p-1.5 bg-slate-50 rounded border border-slate-100 truncate">
                {e}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="font-bold text-slate-800 mb-2 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-[#eb8a23]" /> Departments ({departments.length})
          </div>
          <ul className="space-y-1 text-slate-600">
            {departments.map((d, idx) => (
              <li key={idx} className="p-1.5 bg-slate-50 rounded border border-slate-100 truncate">
                {d}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="font-bold text-slate-800 mb-2 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[#eb8a23]" /> Physical Facilities ({locations.length})
          </div>
          <ul className="space-y-1 text-slate-600">
            {locations.map((loc, idx) => (
              <li key={idx} className="p-1.5 bg-slate-50 rounded border border-slate-100 truncate">
                {loc}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Demo Reset */}
      <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div>
          <h4 className="font-bold text-rose-900 text-sm">Demo Data Reset</h4>
          <p className="text-rose-700 text-xs mt-0.5">
            Reset all ticket statuses, quotations, and asset conditions back to original factory seed records.
          </p>
        </div>
        <button
          onClick={handleResetData}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition flex items-center gap-1.5"
        >
          <RotateCcw className="w-4 h-4" /> Reset Factory Seed Data
        </button>
      </div>
    </div>
  );
};
