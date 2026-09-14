import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Asset, TicketCategory, TicketPriority } from '../types';
import {
  Search,
  Upload,
  AlertCircle,
  CheckCircle2,
  FileText,
  Clock,
  ShieldAlert,
  ArrowRight,
  HelpCircle,
  Copy,
  Check,
  Building2,
  MapPin,
  Laptop,
} from 'lucide-react';

interface EmployeeTicketFormProps {
  onTicketCreated?: (ticketId: string) => void;
  onTrackRequested?: (ticketId: string) => void;
}

export const EmployeeTicketForm: React.FC<EmployeeTicketFormProps> = ({
  onTicketCreated,
  onTrackRequested,
}) => {
  const { assets, entities, departments, locations, createTicket } = useApp();

  // Form states
  const [employeeName, setEmployeeName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [employeeEmail, setEmployeeEmail] = useState('');
  const [employeePhone, setEmployeePhone] = useState('');
  const [department, setDepartment] = useState(departments[0] || 'Technology & Engineering');
  const [entity, setEntity] = useState(entities[0] || 'Infominer Services Pvt. Ltd. (Corporate)');
  const [location, setLocation] = useState(locations[0] || 'Agra Office - 1st Floor Operations Bay');

  // Asset selection
  const [assetSearchQuery, setAssetSearchQuery] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isAssetNotListed, setIsAssetNotListed] = useState(false);
  const [manualAssetName, setManualAssetName] = useState('');
  const [manualCategory, setManualCategory] = useState<string>('IT Equipment');

  // Issue details
  const [issueCategory, setIssueCategory] = useState<TicketCategory>('Hardware Problem');
  const [priority, setPriority] = useState<TicketPriority>('Medium');
  const [problemDescription, setProblemDescription] = useState('');
  const [occurredAt, setOccurredAt] = useState(
    new Date().toISOString().slice(0, 16)
  );

  // Upload simulation
  const [uploadedFiles, setUploadedFiles] = useState<
    Array<{ name: string; size: string; type: 'image' | 'document'; url: string }>
  >([]);

  // Workflow states: 'form' | 'confirm' | 'success'
  const [step, setStep] = useState<'form' | 'confirm' | 'success'>('form');
  const [submittedTicketId, setSubmittedTicketId] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);

  // Filter assets based on search query
  const filteredAssets = assets
    .filter((a) => a.status !== 'Retired' && a.status !== 'Disposed')
    .filter(
      (a) =>
        a.id.toLowerCase().includes(assetSearchQuery.toLowerCase()) ||
        a.name.toLowerCase().includes(assetSearchQuery.toLowerCase()) ||
        a.serialNumber.toLowerCase().includes(assetSearchQuery.toLowerCase()) ||
        a.category.toLowerCase().includes(assetSearchQuery.toLowerCase())
    )
    .slice(0, 6);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const isImg = file.type.startsWith('image/');
      const newFile = {
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        type: isImg ? ('image' as const) : ('document' as const),
        url: isImg
          ? URL.createObjectURL(file)
          : 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=600&q=80',
      };
      setUploadedFiles((prev) => [...prev, newFile]);
    }
  };

  const validateForm = () => {
    const errors: string[] = [];
    if (!employeeName.trim()) errors.push('Employee name is required.');
    if (!employeeEmail.trim() || !employeeEmail.includes('@')) errors.push('A valid work email is required.');
    if (!employeePhone.trim()) errors.push('Contact phone number is required.');
    if (!isAssetNotListed && !selectedAsset) errors.push('Please select the affected asset or check "Asset Not Listed".');
    if (isAssetNotListed && !manualAssetName.trim()) errors.push('Please enter the name/description of the unlisted asset.');
    if (!problemDescription.trim() || problemDescription.length < 15)
      errors.push('Please provide a detailed description of the problem (at least 15 characters).');

    setFormErrors(errors);
    return errors.length === 0;
  };

  const handleProceedToConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setStep('confirm');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFinalSubmit = () => {
    const finalAssetId = isAssetNotListed ? 'AST-UNLISTED' : selectedAsset ? selectedAsset.id : 'AST-UNLISTED';
    const finalAssetName = isAssetNotListed
      ? manualAssetName
      : selectedAsset
      ? selectedAsset.name
      : 'Unlisted Asset';
    const finalCategory = isAssetNotListed
      ? (manualCategory as any)
      : selectedAsset
      ? selectedAsset.category
      : 'Other Facilities';

    const ticketId = createTicket({
      assetId: finalAssetId,
      assetName: finalAssetName,
      assetCategory: finalCategory,
      employeeName,
      employeeId: employeeId || undefined,
      employeeEmail,
      employeePhone,
      department,
      entity,
      location,
      issueCategory,
      problemDescription,
      priority,
      occurredAt,
      attachments: uploadedFiles,
    });

    setSubmittedTicketId(ticketId);
    setStep('success');
    if (onTicketCreated) onTicketCreated(ticketId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopyTicket = () => {
    navigator.clipboard.writeText(submittedTicketId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // SUCCESS SCREEN
  if (step === 'success') {
    return (
      <div className="max-w-3xl mx-auto py-10 px-4" id="ticket-submission-success-view">
        <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-6 sm:p-10 text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-xs">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-[#2d3e50] mb-2 font-sans">
            Your ticket has been submitted successfully.
          </h2>
          <p className="text-slate-600 text-sm max-w-lg mx-auto mb-6">
            The facility management and director teams at Infominer Services have been notified simultaneously.
            You can track progress using your ticket reference below.
          </p>

          {/* Ticket Badge Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 max-w-md mx-auto mb-8 text-left">
            <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">
              Official Ticket Reference
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-2xl font-black font-mono text-[#eb8a23] tracking-wide">
                {submittedTicketId}
              </span>
              <button
                onClick={handleCopyTicket}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-xs transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">Current Status:</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[11px] mt-0.5">
                  <Clock className="w-3 h-3" /> Submitted
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Submitted At:</span>
                <span className="font-medium text-slate-800">
                  {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}{' '}
                  {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>

          {/* Tracking instructions */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-4 text-xs text-left max-w-md mx-auto mb-8 text-blue-900">
            <p className="font-semibold mb-1 flex items-center gap-1.5 text-blue-950">
              <AlertCircle className="w-4 h-4 text-blue-600 shrink-0" />
              Tracking Without Login:
            </p>
            <p className="text-slate-600 leading-relaxed">
              Save this ticket number. You can visit the <strong>"Track Your Ticket"</strong> tab anytime and enter your
              ticket ID along with your email ({employeeEmail}) to view live real-time status updates from management and vendors.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => {
                if (onTrackRequested) onTrackRequested(submittedTicketId);
              }}
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-[#eb8a23] hover:bg-[#d97917] text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
            >
              Track Ticket Now <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setStep('form');
                setSelectedAsset(null);
                setProblemDescription('');
                setUploadedFiles([]);
                setSubmittedTicketId('');
              }}
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-sm transition"
            >
              Report Another Asset Issue
            </button>
          </div>
        </div>
      </div>
    );
  }

  // CONFIRMATION SCREEN
  if (step === 'confirm') {
    return (
      <div className="max-w-3xl mx-auto py-10 px-4" id="ticket-submission-confirm-view">
        <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-6 sm:p-8">
          <div className="border-b border-slate-200 pb-4 mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-[#eb8a23]">
              Review Before Submission
            </span>
            <h2 className="text-2xl font-bold text-[#2d3e50]">Please Confirm Your Asset Report</h2>
            <p className="text-xs text-slate-500 mt-1">
              Ensure all details are accurate. A unique ticket ID will be issued immediately upon confirmation.
            </p>
          </div>

          <div className="space-y-6 text-xs text-slate-700">
            {/* Employee Block */}
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <h3 className="font-bold text-sm text-[#2d3e50] mb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#eb8a23]" /> Employee Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-500 block">Employee Name:</span>
                  <span className="font-semibold text-slate-800">{employeeName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Employee ID:</span>
                  <span className="font-semibold text-slate-800">{employeeId || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Contact Email:</span>
                  <span className="font-semibold text-slate-800">{employeeEmail}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Contact Phone:</span>
                  <span className="font-semibold text-slate-800">{employeePhone}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Department:</span>
                  <span className="font-semibold text-slate-800">{department}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Entity &amp; Location:</span>
                  <span className="font-semibold text-slate-800">{entity} — {location}</span>
                </div>
              </div>
            </div>

            {/* Asset Block */}
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <h3 className="font-bold text-sm text-[#2d3e50] mb-3 flex items-center gap-2">
                <Laptop className="w-4 h-4 text-[#eb8a23]" /> Reported Asset
              </h3>
              {isAssetNotListed ? (
                <div>
                  <div className="text-slate-500">Unlisted Asset:</div>
                  <div className="font-bold text-slate-900 text-sm">{manualAssetName}</div>
                  <div className="text-slate-500 mt-1">Category: {manualCategory}</div>
                </div>
              ) : selectedAsset ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-500 block">Asset ID:</span>
                    <span className="font-mono font-bold text-[#eb8a23] text-sm">{selectedAsset.id}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Asset Name:</span>
                    <span className="font-semibold text-slate-800">{selectedAsset.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Category &amp; Brand:</span>
                    <span className="font-semibold text-slate-800">{selectedAsset.category} • {selectedAsset.brand}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Serial Number:</span>
                    <span className="font-mono text-slate-700">{selectedAsset.serialNumber}</span>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Problem Block */}
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <h3 className="font-bold text-sm text-[#2d3e50] mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#eb8a23]" /> Problem Description
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div>
                  <span className="text-slate-500 block">Issue Category:</span>
                  <span className="font-semibold text-slate-800">{issueCategory}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Priority:</span>
                  <span
                    className={`inline-block px-2 py-0.5 rounded font-bold text-[11px] ${
                      priority === 'Critical'
                        ? 'bg-rose-100 text-rose-800'
                        : priority === 'High'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {priority}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-slate-500 block mb-1">Detailed Description:</span>
                <p className="bg-white p-3 rounded border border-slate-200 text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {problemDescription}
                </p>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="mt-3">
                  <span className="text-slate-500 block mb-1">Attached Files ({uploadedFiles.length}):</span>
                  <div className="flex flex-wrap gap-2">
                    {uploadedFiles.map((f, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white border border-slate-200 text-[11px]">
                        <FileText className="w-3 h-3 text-slate-500" />
                        {f.name} ({f.size})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200 flex items-center justify-between gap-4">
            <button
              onClick={() => setStep('form')}
              className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition"
            >
              ← Back to Edit
            </button>
            <button
              id="confirm-submit-ticket-btn"
              onClick={handleFinalSubmit}
              className="px-7 py-2.5 rounded-lg bg-[#eb8a23] hover:bg-[#d97917] text-white font-bold text-xs shadow-md transition flex items-center gap-2"
            >
              Confirm &amp; Generate Ticket
            </button>
          </div>
        </div>
      </div>
    );
  }

  // MAIN FORM
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6" id="report-asset-issue-container">
      {/* Top Header Card */}
      <div className="bg-[#2d3e50] text-white rounded-xl p-6 sm:p-8 shadow-md mb-8 border border-[#1e293b]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#1e293b] text-[#eb8a23] font-mono text-xs font-bold mb-2">
              <ShieldAlert className="w-3.5 h-3.5" />
              NO LOGIN REQUIRED
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Report an Asset Issue
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
              Experience an issue with organization equipment, hardware, or facilities? Submit this form
              directly. Your ticket is immediately and simultaneously routed to the Operations Manager and Managing Director.
            </p>
          </div>
          <div className="hidden sm:block text-right">
            <span className="text-[11px] text-slate-400 block">Infominer Services Helpdesk</span>
            <span className="text-xs font-bold text-slate-200">SLA: Under 2 Hours Review</span>
          </div>
        </div>
      </div>

      {/* Validation Errors */}
      {formErrors.length > 0 && (
        <div className="bg-rose-50 border border-rose-300 rounded-lg p-4 mb-6 text-xs text-rose-800">
          <div className="font-bold flex items-center gap-1.5 mb-1 text-rose-900">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            Please fix the following issues before submitting:
          </div>
          <ul className="list-disc list-inside space-y-0.5">
            {formErrors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleProceedToConfirm} className="space-y-8" id="employee-ticket-submission-form">
        {/* SECTION 1: EMPLOYEE INFORMATION */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <span className="flex h-6 w-6 rounded-full bg-[#2d3e50] text-white text-xs font-bold items-center justify-center">
              1
            </span>
            <h3 className="font-bold text-base text-[#2d3e50]">Employee Information</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Employee Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                placeholder="e.g. Rahul Agrawal"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-[#eb8a23] focus:ring-1 focus:ring-[#eb8a23]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Employee ID <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="e.g. EMP-104"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-[#eb8a23] focus:ring-1 focus:ring-[#eb8a23]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Work Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                value={employeeEmail}
                onChange={(e) => setEmployeeEmail(e.target.value)}
                placeholder="e.g. rahul.agrawal@infominer.in"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-[#eb8a23] focus:ring-1 focus:ring-[#eb8a23]"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Required to verify and track your ticket later without login.
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Contact Phone / WhatsApp <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={employeePhone}
                onChange={(e) => setEmployeePhone(e.target.value)}
                placeholder="e.g. +91 98370 12345"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-[#eb8a23] focus:ring-1 focus:ring-[#eb8a23]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Department <span className="text-rose-500">*</span>
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-[#eb8a23]"
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Organization Entity <span className="text-rose-500">*</span>
              </label>
              <select
                value={entity}
                onChange={(e) => setEntity(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-[#eb8a23]"
              >
                {entities.map((ent) => (
                  <option key={ent} value={ent}>
                    {ent}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 2: ASSET IDENTIFICATION */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 rounded-full bg-[#2d3e50] text-white text-xs font-bold items-center justify-center">
                2
              </span>
              <h3 className="font-bold text-base text-[#2d3e50]">Identify Affected Asset</h3>
            </div>
            <label className="flex items-center gap-2 text-xs font-semibold text-[#eb8a23] cursor-pointer">
              <input
                type="checkbox"
                checked={isAssetNotListed}
                onChange={(e) => {
                  setIsAssetNotListed(e.target.checked);
                  if (e.target.checked) setSelectedAsset(null);
                }}
                className="rounded border-slate-300 text-[#eb8a23] focus:ring-[#eb8a23]"
              />
              Asset Not Listed / Tag Missing
            </label>
          </div>

          {!isAssetNotListed ? (
            <div>
              {/* Asset Search Input */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Search by Asset ID (e.g. AST-000123), Name, or Serial Number
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={assetSearchQuery}
                    onChange={(e) => setAssetSearchQuery(e.target.value)}
                    placeholder="Type asset code (e.g., AST-000123, Dell, Daikin, Chair)..."
                    className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs focus:outline-hidden focus:border-[#eb8a23] focus:ring-1 focus:ring-[#eb8a23]"
                  />
                </div>
              </div>

              {/* Selected Asset Display */}
              {selectedAsset ? (
                <div className="bg-amber-50/60 border-2 border-[#eb8a23] rounded-lg p-4 text-xs mb-4 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-[#eb8a23] bg-white px-2 py-0.5 rounded border border-[#eb8a23]/30">
                        {selectedAsset.id}
                      </span>
                      <span className="font-bold text-slate-900 text-sm">{selectedAsset.name}</span>
                    </div>
                    <div className="text-slate-600 flex flex-wrap gap-x-4 gap-y-1 pt-1">
                      <span><strong>Category:</strong> {selectedAsset.category}</span>
                      <span><strong>Serial:</strong> {selectedAsset.serialNumber}</span>
                      <span><strong>Location:</strong> {selectedAsset.location}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedAsset(null)}
                    className="text-xs text-slate-500 hover:text-rose-600 font-semibold underline"
                  >
                    Change
                  </button>
                </div>
              ) : (
                /* Asset selection grid / quick picker */
                <div>
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Select from Available Assets:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                    {filteredAssets.map((ast) => (
                      <div
                        key={ast.id}
                        onClick={() => setSelectedAsset(ast)}
                        className="p-3 border border-slate-200 rounded-lg text-xs hover:border-[#eb8a23] hover:bg-amber-50/40 cursor-pointer transition flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-[#eb8a23]">{ast.id}</span>
                            <span className="font-semibold text-slate-800 truncate">{ast.name}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 truncate">
                            {ast.category} • S/N: {ast.serialNumber}
                          </div>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0 font-medium">
                          Select
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Unlisted Asset Form */
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3 text-xs">
              <div className="text-amber-800 font-semibold flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-amber-600" />
                Reporting an uncatalogued or missing-tag asset
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Asset Item Name / Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required={isAssetNotListed}
                    value={manualAssetName}
                    onChange={(e) => setManualAssetName(e.target.value)}
                    placeholder="e.g. Conference Room B projector remote or Standing fan"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Asset Category</label>
                  <select
                    value={manualCategory}
                    onChange={(e) => setManualCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="IT Equipment">IT Equipment</option>
                    <option value="Office Furniture">Office Furniture</option>
                    <option value="HVAC & Cooling">HVAC & Cooling</option>
                    <option value="Electrical & Power">Electrical & Power</option>
                    <option value="Networking">Networking</option>
                    <option value="Appliances">Appliances</option>
                    <option value="Other Facilities">Other Facilities</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 3: ISSUE DETAILS */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <span className="flex h-6 w-6 rounded-full bg-[#2d3e50] text-white text-xs font-bold items-center justify-center">
              3
            </span>
            <h3 className="font-bold text-base text-[#2d3e50]">Issue Details</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs mb-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Issue Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={issueCategory}
                onChange={(e) => setIssueCategory(e.target.value as TicketCategory)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-[#eb8a23]"
              >
                <option value="Hardware Problem">Hardware Problem</option>
                <option value="Damage">Damage / Physical Breakage</option>
                <option value="Electrical Problem">Electrical Problem</option>
                <option value="Furniture Problem">Furniture Problem</option>
                <option value="Maintenance">Regular Maintenance</option>
                <option value="Replacement Required">Replacement Required</option>
                <option value="Software/IT Issue">Software/IT Issue</option>
                <option value="General Issue">General Issue</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Urgency / Priority <span className="text-rose-500">*</span>
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TicketPriority)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-[#eb8a23]"
              >
                <option value="Low">Low — Minor cosmetic or non-blocking</option>
                <option value="Medium">Medium — Work affected but workaround exists</option>
                <option value="High">High — Key business process blocked</option>
                <option value="Critical">Critical — Facility halt / Safety risk</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                When Did It Occur?
              </label>
              <input
                type="datetime-local"
                value={occurredAt}
                onChange={(e) => setOccurredAt(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-[#eb8a23]"
              />
            </div>
          </div>

          <div className="mb-4 text-xs">
            <label className="block font-semibold text-slate-700 mb-1">
              Physical Location of Item <span className="text-rose-500">*</span>
            </label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-[#eb8a23]"
            >
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4 text-xs">
            <label className="block font-semibold text-slate-700 mb-1">
              Problem Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={problemDescription}
              onChange={(e) => setProblemDescription(e.target.value)}
              placeholder="Describe the exact symptoms, error codes, what happens when using the asset, and any troubleshooting already attempted..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-[#eb8a23] focus:ring-1 focus:ring-[#eb8a23] leading-relaxed"
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              Minimum 15 characters. Clear descriptions expedite vendor diagnosis and quote authorization.
            </span>
          </div>

          {/* Upload Photo / Document */}
          <div className="text-xs">
            <label className="block font-semibold text-slate-700 mb-1">
              Upload Photographs or Supporting Documents (Optional)
            </label>
            <div className="border-2 border-dashed border-slate-300 hover:border-[#eb8a23] rounded-lg p-4 text-center cursor-pointer transition bg-slate-50">
              <input
                type="file"
                id="ticket-file-upload"
                onChange={handleFileUpload}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx"
              />
              <label htmlFor="ticket-file-upload" className="cursor-pointer">
                <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                <span className="font-semibold text-slate-700">Click to upload photo or document</span>
                <span className="text-slate-400 block text-[11px] mt-0.5">
                  JPEG, PNG, or PDF up to 10MB
                </span>
              </label>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {uploadedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-md text-[11px]"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#eb8a23]" />
                    <span className="font-medium text-slate-800">{file.name}</span>
                    <span className="text-slate-400 font-mono">({file.size})</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="flex items-center justify-end gap-4 pt-2">
          <button
            type="submit"
            id="employee-review-submit-btn"
            className="px-8 py-3 rounded-lg bg-[#eb8a23] hover:bg-[#d97917] text-white font-bold text-sm shadow-md transition flex items-center gap-2"
          >
            Review &amp; Submit Ticket <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
