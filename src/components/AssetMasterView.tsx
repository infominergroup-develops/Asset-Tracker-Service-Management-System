import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Asset, AssetCategory, AssetStatus, AssetCondition } from '../types';
import {
  Search,
  Plus,
  Filter,
  Layers,
  Building2,
  Calendar,
  DollarSign,
  User,
  Wrench,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  X,
  FileText,
  Clock,
  ShieldCheck,
} from 'lucide-react';

interface AssetMasterViewProps {
  initialSelectedAssetId?: string | null;
  onRaiseTicketForAsset?: (asset: Asset) => void;
}

export const AssetMasterView: React.FC<AssetMasterViewProps> = ({
  initialSelectedAssetId,
  onRaiseTicketForAsset,
}) => {
  const { assets, tickets, vendors, entities, departments, locations, employees, createAsset, updateAsset, createVendor, createEmployee, role } = useApp();

  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(initialSelectedAssetId || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Asset Form State
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<AssetCategory>('IT Equipment');
  const [newType, setNewType] = useState('Laptop');
  const [newBrand, setNewBrand] = useState('');
  const [newModel, setNewModel] = useState('');
  const [newSerial, setNewSerial] = useState('');
  const [newPurchaseDate, setNewPurchaseDate] = useState('2024-01-01');
  const [newPurchaseCost, setNewPurchaseCost] = useState('65000');
  const [newWarrantyExpiry, setNewWarrantyExpiry] = useState('2027-01-01');
  const [newVendorId, setNewVendorId] = useState(vendors[0]?.id || '');
  const [newVendorName, setNewVendorName] = useState('');
  const [newEntity, setNewEntity] = useState(entities[0] || '');
  const [newDept, setNewDept] = useState(departments[0] || '');
  const [newLocation, setNewLocation] = useState(locations[0] || '');
  const [newEmployeeName, setNewEmployeeName] = useState('');
  const [newManager, setNewManager] = useState('Swati Katiyar (Operations Manager)');
  const [newCondition, setNewCondition] = useState<AssetCondition>('Excellent');
  const [newStatus, setNewStatus] = useState<AssetStatus>('Active');
  const [newNotes, setNewNotes] = useState('');

  // Software & Antivirus
  const [newSoftwareName, setNewSoftwareName] = useState('');
  const [newSoftwareKey, setNewSoftwareKey] = useState('');
  const [newSoftwareExpiry, setNewSoftwareExpiry] = useState('');
  const [newAntivirusName, setNewAntivirusName] = useState('');
  const [newAntivirusKey, setNewAntivirusKey] = useState('');
  const [newAntivirusExpiry, setNewAntivirusExpiry] = useState('');

  // Filtered Assets
  const filteredAssets = assets.filter((a) => {
    const matchesSearch =
      a.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.assignedEmployeeName && a.assignedEmployeeName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCat = categoryFilter === 'All' || a.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || a.status === statusFilter;

    return matchesSearch && matchesCat && matchesStatus;
  });

  const selectedAsset = assets.find((a) => a.id === selectedAssetId);

  // Tickets for the selected asset
  const assetTickets = selectedAsset
    ? tickets.filter((t) => t.assetId === selectedAsset.id)
    : [];

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalVendorId = vendors[0]?.id || 'VND-001';
    let finalVendorName = newVendorName.trim() || vendors[0]?.name || 'Unknown Vendor';
    
    if (newVendorName.trim()) {
      const existingVendor = vendors.find(v => v.name.toLowerCase() === newVendorName.trim().toLowerCase());
      if (existingVendor) {
        finalVendorId = existingVendor.id;
        finalVendorName = existingVendor.name;
      } else {
        finalVendorId = await createVendor({
          name: newVendorName.trim(),
          category: 'Hardware',
          contactPerson: 'TBD',
          email: 'tbd@example.com',
          phone: '0000000000',
          status: 'Active',
          address: 'TBD',
          gstNumber: 'TBD'
        });
        finalVendorName = newVendorName.trim();
      }
    }

    if (newEmployeeName.trim()) {
      const existingEmployee = employees?.find(emp => emp.name.toLowerCase() === newEmployeeName.trim().toLowerCase());
      if (!existingEmployee && createEmployee) {
        await createEmployee({
          id: `EMP-${Date.now()}`,
          name: newEmployeeName.trim(),
          department: newDept,
          entity: newEntity,
          email: `${newEmployeeName.trim().toLowerCase().replace(/\s+/g, '.')}@example.com`,
          phone: '0000000000',
          location: newLocation
        });
      }
    }

    await createAsset({
      name: newName,
      category: newCategory,
      type: newType,
      brand: newBrand,
      model: newModel,
      serialNumber: newSerial,
      purchaseDate: newPurchaseDate,
      purchaseCost: Number(newPurchaseCost) || 0,
      warrantyExpiry: newWarrantyExpiry,
      vendorId: finalVendorId,
      vendorName: finalVendorName,
      entity: newEntity,
      department: newDept,
      location: newLocation,
      assignedEmployeeName: newEmployeeName || undefined,
      responsibleManager: newManager,
      condition: newCondition,
      status: newStatus,
      notes: newNotes,
      softwareName: newSoftwareName,
      softwareKey: newSoftwareKey,
      softwareExpiry: newSoftwareExpiry,
      antivirusName: newAntivirusName,
      antivirusKey: newAntivirusKey,
      antivirusExpiry: newAntivirusExpiry,
    });

    setShowCreateModal(false);
  };

  // Status badge styling
  const getStatusBadge = (status: AssetStatus) => {
    switch (status) {
      case 'Active':
      case 'Assigned':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Under Maintenance':
      case 'Under Repair':
        return 'bg-amber-100 text-amber-900 border-amber-300 font-bold';
      case 'Damaged':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Retired':
      case 'Disposed':
        return 'bg-slate-200 text-slate-700 border-slate-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  // DEDICATED ASSET DETAIL VIEW
  if (selectedAsset) {
    const activeTicket = assetTickets.find(
      (t) => t.status !== 'Closed' && t.status !== 'Rejected'
    );

    return (
      <div className="w-full py-6 px-4 sm:px-6 lg:px-8 space-y-6" id="asset-detail-view">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedAssetId(null)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#eb8a23] transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Asset Master
          </button>
          <div className="flex items-center gap-2">
            {onRaiseTicketForAsset && (
              <button
                onClick={() => onRaiseTicketForAsset(selectedAsset)}
                className="px-3.5 py-1.5 rounded-lg bg-[#eb8a23] hover:bg-[#d97917] text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5"
              >
                <Wrench className="w-3.5 h-3.5" /> Report Issue on this Asset
              </button>
            )}
          </div>
        </div>

        {/* Asset Header Banner */}
        <div className="bg-[#2d3e50] text-white rounded-xl p-6 shadow-md border border-[#1e293b]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono font-bold text-sm text-[#eb8a23] bg-[#1e293b] px-2.5 py-0.5 rounded border border-slate-700">
                  {selectedAsset.id}
                </span>
                <span className="text-xs text-slate-300">
                  {selectedAsset.category} • {selectedAsset.brand}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black">{selectedAsset.name}</h1>
              <p className="text-xs text-slate-300 mt-1 font-mono">
                Model: {selectedAsset.model} | S/N: {selectedAsset.serialNumber}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(
                  selectedAsset.status
                )}`}
              >
                ● Status: {selectedAsset.status}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#1e293b] text-slate-200 border border-slate-700">
                Condition: {selectedAsset.condition}
              </span>
            </div>
          </div>
        </div>

        {/* 3 Grid Panels: Ownership, Specs, and Active Issue */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          {/* 1. Ownership */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-[#2d3e50] border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-[#eb8a23]" /> Ownership &amp; Custody
            </h3>
            <div>
              <span className="text-slate-400 block text-[11px]">Entity</span>
              <span className="font-semibold text-slate-800 text-sm">{selectedAsset.entity}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Department</span>
              <span className="font-semibold text-slate-800">{selectedAsset.department}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Assigned Custodian</span>
              <span className="font-semibold text-slate-800">
                {selectedAsset.assignedEmployeeName || 'Unassigned / Common Pool'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Responsible Manager</span>
              <span className="font-semibold text-slate-800">{selectedAsset.responsibleManager}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Physical Location</span>
              <span className="font-semibold text-slate-800">{selectedAsset.location}</span>
            </div>
          </div>

          {/* 2. Asset Technical Info */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-[#2d3e50] border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#eb8a23]" /> Financials &amp; Warranty
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-400 block text-[11px]">Purchase Date</span>
                <span className="font-semibold text-slate-800">{selectedAsset.purchaseDate}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Purchase Cost</span>
                <span className="font-bold text-slate-900 font-mono">
                  ₹{selectedAsset.purchaseCost.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Warranty Expiry</span>
              <span className="font-semibold text-emerald-700">{selectedAsset.warrantyExpiry}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Registered OEM / Vendor</span>
              <span className="font-semibold text-slate-800">{selectedAsset.vendorName}</span>
            </div>
            {selectedAsset.notes && (
              <div>
                <span className="text-slate-400 block text-[11px]">Operational Notes</span>
                <p className="text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 mt-0.5">
                  {selectedAsset.notes}
                </p>
              </div>
            )}
            
            {/* Display Software/Antivirus Details if available */}
            {(selectedAsset.softwareName || selectedAsset.antivirusName) && (
              <div className="pt-3 mt-3 border-t border-slate-100 space-y-2">
                <h4 className="font-bold text-[11px] text-[#2d3e50] uppercase tracking-wide">Software & Antivirus</h4>
                {selectedAsset.softwareName && (
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2 rounded border border-slate-100">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Software</span>
                      <span className="font-semibold text-slate-800">{selectedAsset.softwareName}</span>
                      {selectedAsset.softwareKey && <div className="text-[10px] text-slate-500 font-mono mt-0.5 break-all">{selectedAsset.softwareKey}</div>}
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Expiry Date</span>
                      <span className="font-semibold text-rose-600">{selectedAsset.softwareExpiry || 'N/A'}</span>
                    </div>
                  </div>
                )}
                {selectedAsset.antivirusName && (
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2 rounded border border-slate-100">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Antivirus</span>
                      <span className="font-semibold text-slate-800">{selectedAsset.antivirusName}</span>
                      {selectedAsset.antivirusKey && <div className="text-[10px] text-slate-500 font-mono mt-0.5 break-all">{selectedAsset.antivirusKey}</div>}
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Expiry Date</span>
                      <span className="font-semibold text-rose-600">{selectedAsset.antivirusExpiry || 'N/A'}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 3. Current Issue & Lifecycle Health */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-[#2d3e50] border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-[#eb8a23]" /> Active Maintenance Status
            </h3>
            {activeTicket ? (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[#eb8a23]">{activeTicket.id}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900">
                    {activeTicket.status}
                  </span>
                </div>
                <div className="font-semibold text-slate-800">{activeTicket.issueCategory}</div>
                <p className="text-slate-600 text-[11px] line-clamp-2">
                  {activeTicket.problemDescription}
                </p>
                <div className="text-[10px] text-slate-500 pt-1 border-t border-amber-200">
                  Reported by: {activeTicket.employeeName}
                </div>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center text-emerald-800">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
                <span className="font-bold block">No Active Open Issues</span>
                <span className="text-[11px] text-emerald-600">Asset is running normally.</span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-100">
              <span className="text-slate-400 block text-[11px]">Total Lifetime Tickets Filed</span>
              <span className="font-bold text-slate-800 text-base">{assetTickets.length}</span>
            </div>
          </div>
        </div>

        {/* Complete Ticket & Maintenance History for this Asset */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#2d3e50]">
              Lifecycle Maintenance History ({assetTickets.length})
            </h3>
            <span className="text-[11px] text-slate-500">Full auditable historical service log</span>
          </div>

          <div className="divide-y divide-slate-200 text-xs">
            {assetTickets.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                No previous tickets or service jobs have been recorded for this asset.
              </div>
            ) : (
              assetTickets.map((t) => (
                <div key={t.id} className="p-4 hover:bg-slate-50/80 transition space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#eb8a23]">{t.id}</span>
                      <span className="font-semibold text-slate-800">{t.issueCategory}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-500">Reported by {t.employeeName}</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        t.status === 'Closed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">{t.problemDescription}</p>
                  {t.closureNote && (
                    <div className="text-[11px] text-emerald-700 bg-emerald-50/60 p-2 rounded border border-emerald-100">
                      <strong>Resolution Note:</strong> {t.closureNote}
                    </div>
                  )}
                  <div className="text-[10px] text-slate-400 flex items-center gap-3 pt-1">
                    <span>Raised: {new Date(t.createdAt).toLocaleDateString()}</span>
                    {t.resolvedAt && <span>Resolved: {new Date(t.resolvedAt).toLocaleDateString()}</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  // ASSET LIST VIEW
  return (
    <div className="w-full py-6 px-4 sm:px-6 lg:px-8 space-y-6" id="asset-master-list-container">
      {/* Top Banner */}
      <div className="bg-[#2d3e50] text-white rounded-xl p-6 shadow-md border border-[#1e293b] flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black">Asset Master Inventory</h1>
          <p className="text-slate-300 text-xs mt-1">
            Complete registry of physical IT equipment, facilities, HVAC, vehicles, and office furniture.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(role === 'admin' || role === 'manager' || role === 'director') && (
            <button
              id="create-new-asset-btn"
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 rounded-lg bg-[#eb8a23] hover:bg-[#d97917] text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add New Asset
            </button>
          )}
        </div>
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
              placeholder="Search Tag, Name, S/N, Custodian..."
              className="pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg w-52 sm:w-72 focus:outline-hidden focus:border-[#eb8a23]"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-hidden focus:border-[#eb8a23]"
          >
            <option value="All">All Categories</option>
            <option value="IT Equipment">IT Equipment</option>
            <option value="HVAC & Cooling">HVAC & Cooling</option>
            <option value="Office Furniture">Office Furniture</option>
            <option value="Networking">Networking</option>
            <option value="Electrical & Power">Electrical & Power</option>
            <option value="Vehicles">Vehicles</option>
            <option value="Appliances">Appliances</option>
            <option value="Other Facilities">Other Facilities</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-hidden focus:border-[#eb8a23]"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Assigned">Assigned</option>
            <option value="Under Maintenance">Under Maintenance</option>
            <option value="Under Repair">Under Repair</option>
            <option value="Damaged">Damaged</option>
            <option value="Retired">Retired</option>
          </select>
        </div>

        <div className="text-slate-500 font-medium">
          Showing <strong>{filteredAssets.length}</strong> of {assets.length} assets
        </div>
      </div>

      {/* Asset Grid Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#2d3e50] text-white select-none">
              <tr>
                <th className="px-4 py-3 font-semibold">Asset ID</th>
                <th className="px-4 py-3 font-semibold">Asset Name &amp; Spec</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Serial Number</th>
                <th className="px-4 py-3 font-semibold">Location</th>
                <th className="px-4 py-3 font-semibold">Custodian</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400">
                    No assets found matching current criteria.
                  </td>
                </tr>
              ) : (
                filteredAssets.map((ast) => (
                  <tr
                    key={ast.id}
                    onClick={() => setSelectedAssetId(ast.id)}
                    className="hover:bg-amber-50/40 cursor-pointer transition"
                  >
                    <td className="px-4 py-3 font-mono font-bold text-[#eb8a23]">{ast.id}</td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{ast.name}</div>
                      <div className="text-[10px] text-slate-500">{ast.brand} • {ast.model}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{ast.category}</td>
                    <td className="px-4 py-3 font-mono text-slate-600">{ast.serialNumber}</td>
                    <td className="px-4 py-3 text-slate-700 max-w-xs truncate">{ast.location}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800">
                        {ast.assignedEmployeeName || 'Unassigned'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(
                          ast.status
                        )}`}
                      >
                        {ast.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAssetId(ast.id);
                        }}
                        className="px-2.5 py-1 rounded bg-white border border-slate-300 hover:border-[#eb8a23] text-slate-700 font-semibold text-[11px] shadow-2xs transition"
                      >
                        Details →
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE NEW ASSET MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="bg-[#2d3e50] text-white px-6 py-4 flex items-center justify-between shrink-0">
              <h3 className="font-bold text-base">Add New Asset to Master</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAsset} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Asset Name / Model</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Dell Latitude 5450 i7"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Asset Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as AssetCategory)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="IT Equipment">IT Equipment</option>
                    <option value="Office Furniture">Office Furniture</option>
                    <option value="HVAC & Cooling">HVAC & Cooling</option>
                    <option value="Electrical & Power">Electrical & Power</option>
                    <option value="Networking">Networking</option>
                    <option value="Vehicles">Vehicles</option>
                    <option value="Appliances">Appliances</option>
                    <option value="Other Facilities">Other Facilities</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Asset Type</label>
                  <input
                    type="text"
                    required
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    placeholder="e.g. Laptop, Server, Chair"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Brand</label>
                  <input
                    type="text"
                    required
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    placeholder="e.g. Dell / Daikin / Herman Miller"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Serial Number</label>
                  <input
                    type="text"
                    required
                    value={newSerial}
                    onChange={(e) => setNewSerial(e.target.value)}
                    placeholder="e.g. CN-0G6T4M-..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Purchase Cost (₹)</label>
                  <input
                    type="number"
                    required
                    value={newPurchaseCost}
                    onChange={(e) => setNewPurchaseCost(e.target.value)}
                    placeholder="75000"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Warranty Expiry Date</label>
                  <input
                    type="date"
                    required
                    value={newWarrantyExpiry}
                    onChange={(e) => setNewWarrantyExpiry(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Vendor Name</label>
                  <input
                    type="text"
                    required
                    value={newVendorName}
                    onChange={(e) => setNewVendorName(e.target.value)}
                    placeholder="e.g. Dell Inc."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned Custodian (Employee)</label>
                  <input
                    type="text"
                    value={newEmployeeName}
                    onChange={(e) => setNewEmployeeName(e.target.value)}
                    placeholder="e.g. Rohit Mehra (Leave blank if unassigned)"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Location</label>
                  <select
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    {locations.map((loc) => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
              </div>

              {newCategory === 'IT Equipment' && ['Laptop', 'Computer', 'Desktop'].includes(newType) && (
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
                  <h4 className="font-bold text-sm text-[#2d3e50] border-b border-slate-200 pb-2 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#eb8a23]" /> Software & Antivirus Details
                  </h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Software Name</label>
                      <input type="text" value={newSoftwareName} onChange={(e) => setNewSoftwareName(e.target.value)} placeholder="e.g. MS Office" className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white" />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">License Key</label>
                      <input type="text" value={newSoftwareKey} onChange={(e) => setNewSoftwareKey(e.target.value)} placeholder="XXXXX-XXXXX-XXXXX" className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-mono" />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Expiry Date</label>
                      <input type="date" value={newSoftwareExpiry} onChange={(e) => setNewSoftwareExpiry(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Antivirus Name</label>
                      <input type="text" value={newAntivirusName} onChange={(e) => setNewAntivirusName(e.target.value)} placeholder="e.g. Norton" className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white" />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">License Key</label>
                      <input type="text" value={newAntivirusKey} onChange={(e) => setNewAntivirusKey(e.target.value)} placeholder="XXXXX-XXXXX-XXXXX" className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-mono" />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Expiry Date</label>
                      <input type="date" value={newAntivirusExpiry} onChange={(e) => setNewAntivirusExpiry(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white" />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Operational Notes</label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Asset specifications, accessories, or location notes..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#eb8a23] hover:bg-[#d97917] text-white font-bold rounded-lg shadow-xs"
                >
                  Create Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
