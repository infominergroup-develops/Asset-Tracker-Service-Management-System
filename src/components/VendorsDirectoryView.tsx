import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Vendor } from '../types';
import {
  Wrench,
  Search,
  Plus,
  Star,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle2,
  Building2,
  FileText,
  DollarSign,
} from 'lucide-react';

export const VendorsDirectoryView: React.FC = () => {
  const { vendors, workOrders, quotations } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const filteredVendors = vendors.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'All' || v.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="w-full py-6 px-4 sm:px-6 lg:px-8 space-y-6" id="vendors-directory-view">
      {/* Top Banner */}
      <div className="bg-[#2d3e50] text-white rounded-xl p-6 shadow-md border border-[#1e293b] flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black">Vendor &amp; Service Partner Directory</h1>
          <p className="text-slate-300 text-xs mt-1">
            Empaneled OEM maintenance suppliers, SLAs, verified GST records, and turnaround ratings.
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
              placeholder="Search vendor name, category, or contact..."
              className="pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg w-52 sm:w-72 focus:outline-hidden focus:border-[#eb8a23]"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-hidden focus:border-[#eb8a23]"
          >
            <option value="All">All Vendor Categories</option>
            <option value="IT Hardware & Repairs">IT Hardware &amp; Repairs</option>
            <option value="HVAC & Cooling Systems">HVAC &amp; Cooling Systems</option>
            <option value="Electrical & Power Systems">Electrical &amp; Power Systems</option>
            <option value="Office Furniture & Ergonomics">Office Furniture &amp; Ergonomics</option>
            <option value="Networking & Telecom">Networking &amp; Telecom</option>
          </select>
        </div>

        <div className="text-slate-500 font-medium">
          Empaneled Partners: <strong>{filteredVendors.length}</strong>
        </div>
      </div>

      {/* Vendor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVendors.map((vendor) => {
          const activeOrders = workOrders.filter(
            (w) => w.vendorId === vendor.id && w.status !== 'Verified & Closed'
          );
          const vendorQuotes = quotations.filter((q) => q.vendorId === vendor.id);
          const totalEarned = vendorQuotes
            .filter((q) => q.status === 'Approved')
            .reduce((sum, q) => sum + q.totalAmount, 0);

          return (
            <div
              key={vendor.id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs hover:border-[#eb8a23] transition p-5 space-y-4 text-xs"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-mono font-bold text-[#eb8a23] text-xs block mb-0.5">
                    {vendor.id}
                  </span>
                  <h3 className="font-bold text-base text-[#2d3e50]">{vendor.name}</h3>
                  <span className="text-[11px] text-slate-500 block">{vendor.category}</span>
                </div>
                <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md text-amber-900 font-black font-mono">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                  {vendor.rating}
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-1.5 text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-900">Contact:</span>
                  <span>{vendor.contactPerson}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{vendor.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{vendor.email}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{vendor.address}</span>
                </div>
                <div className="text-[10px] font-mono text-slate-400 pt-1">
                  GST: {vendor.gstNumber}
                </div>
              </div>

              {/* Stats Strip */}
              <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px]">Active Orders</span>
                  <span className="font-bold text-[#eb8a23] text-sm font-mono">
                    {activeOrders.length}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Turnaround</span>
                  <span className="font-bold text-slate-800 text-sm font-mono">
                    {vendor.averageTurnaroundDays}d
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Completed</span>
                  <span className="font-bold text-emerald-700 text-sm font-mono">
                    {vendor.completedJobsCount}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
