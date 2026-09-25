import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { USER_PROFILES } from '../data/users';
import { InfominerLogo } from './InfominerLogo';
import { UserRole } from '../types';
import {
  Bell,
  ChevronDown,
  User,
  DollarSign,
  Layers,
  Shield,
  Briefcase,
  Wrench,
  CheckCircle2,
  X,
  Clock,
  RotateCcw,
} from 'lucide-react';

interface HeaderProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  onLoginClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab: propActiveTab,
  setActiveTab: propSetActiveTab,
  onLoginClick
}) => {
  const {
    role,
    logout,
    isAuthenticated,
    activeTab: contextActiveTab,
    setActiveTab: contextSetActiveTab,
    currentUser,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    tickets,
    workOrders,
    quotations,
    resetToDefaults,
  } = useApp();

  const activeTab = propActiveTab || contextActiveTab || 'dashboard';
  const setActiveTab = propSetActiveTab || contextSetActiveTab;

  const [showNotifMenu, setShowNotifMenu] = useState(false);

  // Financial metric for navbar highlight
  const activeWorkOrderStatuses = ['Work Scheduled', 'Work In Progress', 'Awaiting Parts'];
  const totalServiceSpend = workOrders
    .filter((wo) => activeWorkOrderStatuses.includes(wo.status))
    .reduce((sum, wo) => sum + (wo.currentQuotationAmount || 0), 0);

  const pendingApprovalsCount = tickets.filter(
    (t) => t.status === 'Submitted' || t.status === 'Under Management Review'
  ).length;

  const pendingQuotationsCount = quotations.filter((q) => q.status === 'Submitted').length;

  const roleNotifications = notifications.filter(
    (n) => n.targetRoles.includes(role) || n.targetRoles.includes('employee')
  );

  const unreadNotifications = roleNotifications.filter(
    (n) => !n.read
  );

  // No handleRoleChange anymore

  const getRoleBadge = (r: UserRole) => {
    switch (r) {
      case 'employee':
        return { label: 'Employee', icon: <User className="w-3.5 h-3.5" />, color: 'text-amber-300' };
      case 'manager':
        return { label: 'Manager', icon: <Briefcase className="w-3.5 h-3.5" />, color: 'text-blue-300' };
      case 'director':
        return { label: 'Director', icon: <Shield className="w-3.5 h-3.5" />, color: 'text-purple-300' };
      case 'admin':
        return { label: 'Admin', icon: <Layers className="w-3.5 h-3.5" />, color: 'text-emerald-300' };
      case 'vendor':
        return { label: 'Vendor', icon: <Wrench className="w-3.5 h-3.5" />, color: 'text-[#eb8a23]' };
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm text-slate-900 select-none">
      {/* Top Primary Bar */}
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => {
                if (role === 'employee') setActiveTab('report-issue');
                else if (role === 'vendor') setActiveTab('vendor-orders');
                else setActiveTab('dashboard');
              }}
              className="text-left focus:outline-hidden"
            >
              <InfominerLogo variant="light" size="md" />
            </button>

            {/* Financial / Operational Highlight Pill (Specified color usage: #1e293b background with #eb8a23 amount) */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-50 border border-slate-200 text-xs shadow-inner">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#eb8a23] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#eb8a23]"></span>
              </span>
              <span className="text-slate-600 font-medium">Active Maintenance Value:</span>
              <span className="text-[#eb8a23] font-bold font-mono text-sm tracking-wide">
                ₹{totalServiceSpend.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Right Action Tools: Role Switcher & Notifications */}
          <div className="flex items-center gap-3">
            {/* User Profile & Logout / Staff Login */}
            <div className="flex items-center gap-4 border-r border-slate-200 pr-4 mr-1">
              {isAuthenticated ? (
                <>
                  <div className="flex flex-col items-end hidden sm:flex">
                    <span className="text-sm font-bold text-slate-900">{currentUser?.name || 'User'}</span>
                    <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">{getRoleBadge(role)?.label || 'Role'}</span>
                  </div>
                  <button
                    onClick={() => logout()}
                    className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100 transition text-xs font-bold shadow-xs flex items-center gap-1"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                onLoginClick && (
                  <button
                    onClick={onLoginClick}
                    className="px-4 py-1.5 rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition text-xs font-bold shadow-xs flex items-center gap-2"
                  >
                    <User className="w-3.5 h-3.5" />
                    Staff Login
                  </button>
                )
              )}
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                id="notification-bell-button"
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="relative p-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 transition shadow-xs"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#eb8a23] text-[9px] font-black text-white shadow-xs">
                    {unreadNotifications.length}
                  </span>
                )}
              </button>

              {showNotifMenu && (
                <div
                  id="notifications-dropdown-menu"
                  className="absolute right-0 mt-2 w-80 sm:w-96 rounded-lg bg-[#1e293b] border border-slate-700 shadow-2xl z-50 overflow-hidden"
                >
                  <div className="p-3 border-b border-slate-700 flex items-center justify-between bg-[#2d3e50]">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-[#eb8a23]" />
                      <span className="font-bold text-sm text-white">Notifications</span>
                      <span className="text-xs bg-[#eb8a23] text-white px-1.5 py-0.2 rounded font-mono">
                        {unreadNotifications.length} unread
                      </span>
                    </div>
                    {unreadNotifications.length > 0 && (
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-[11px] text-slate-300 hover:text-white hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-700/60">
                    {roleNotifications.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 text-xs">No notifications right now</div>
                    ) : (
                      roleNotifications.slice(0, 10).map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            markNotificationRead(item.id);
                            if (item.ticketId && role !== 'employee' && role !== 'vendor') {
                              setActiveTab('tickets');
                            }
                            setShowNotifMenu(false);
                          }}
                          className={`p-3 text-xs cursor-pointer hover:bg-[#2d3e50] transition ${
                            !item.read ? 'bg-slate-800/80 font-medium' : 'text-slate-300'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <span className="font-semibold text-white">{item.title}</span>
                            <span className="text-[10px] text-slate-400 shrink-0">{item.timestamp}</span>
                          </div>
                          <p className="text-[11px] text-slate-300 line-clamp-2">{item.message}</p>
                          {item.ticketId && (
                            <span className="inline-block mt-1 text-[10px] font-mono text-[#eb8a23]">
                              {item.ticketId}
                            </span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Bar based on active role */}
      <div className="bg-slate-50 border-t border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="w-full flex items-center justify-between overflow-x-auto py-1">
          <nav className="flex space-x-1 sm:space-x-2 py-1 text-xs">
            {/* PUBLIC / EMPLOYEE TABS */}
            {role === 'employee' && (
              <>
                <button
                  id="tab-employee-report"
                  onClick={() => setActiveTab('report-issue')}
                  className={`px-3 py-1.5 rounded-md font-medium transition ${
                    activeTab === 'report-issue'
                      ? 'bg-[#eb8a23] text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  Report Asset Issue (No Login)
                </button>
                <button
                  id="tab-employee-track"
                  onClick={() => setActiveTab('track-ticket')}
                  className={`px-3 py-1.5 rounded-md font-medium transition ${
                    activeTab === 'track-ticket'
                      ? 'bg-[#eb8a23] text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  Track Your Ticket
                </button>
                <button
                  id="tab-employee-browse"
                  onClick={() => setActiveTab('browse-assets')}
                  className={`px-3 py-1.5 rounded-md font-medium transition ${
                    activeTab === 'browse-assets'
                      ? 'bg-[#eb8a23] text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  Browse Organization Assets
                </button>
              </>
            )}

            {/* MANAGER / DIRECTOR TABS */}
            {(role === 'manager' || role === 'director') && (
              <>
                <button
                  id="tab-mgmt-dashboard"
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-3 py-1.5 rounded-md font-medium transition ${
                    activeTab === 'dashboard'
                      ? 'bg-[#eb8a23] text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  Overview &amp; KPIs
                </button>
                <button
                  id="tab-mgmt-tickets"
                  onClick={() => setActiveTab('tickets')}
                  className={`px-3 py-1.5 rounded-md font-medium transition relative ${
                    activeTab === 'tickets'
                      ? 'bg-[#eb8a23] text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  All Tickets
                  {pendingApprovalsCount > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px]">
                      {pendingApprovalsCount}
                    </span>
                  )}
                </button>
                <button
                  id="tab-mgmt-quotations"
                  onClick={() => setActiveTab('quotations')}
                  className={`px-3 py-1.5 rounded-md font-medium transition ${
                    activeTab === 'quotations'
                      ? 'bg-[#eb8a23] text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  Vendor Quotations
                  {pendingQuotationsCount > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-[#eb8a23] text-white text-[10px]">
                      {pendingQuotationsCount}
                    </span>
                  )}
                </button>
                <button
                  id="tab-mgmt-assets"
                  onClick={() => setActiveTab('assets')}
                  className={`px-3 py-1.5 rounded-md font-medium transition ${
                    activeTab === 'assets'
                      ? 'bg-[#eb8a23] text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  Asset Master ({tickets.length > 0 ? '30+' : '0'})
                </button>
                <button
                  id="tab-mgmt-vendors"
                  onClick={() => setActiveTab('vendors')}
                  className={`px-3 py-1.5 rounded-md font-medium transition ${
                    activeTab === 'vendors'
                      ? 'bg-[#eb8a23] text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  Vendors &amp; Performance
                </button>
                <button
                  id="tab-mgmt-employees"
                  onClick={() => setActiveTab('employees')}
                  className={`px-3 py-1.5 rounded-md font-medium transition ${
                    activeTab === 'employees'
                      ? 'bg-[#eb8a23] text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  Employees
                </button>
                <button
                  id="tab-mgmt-locations"
                  onClick={() => setActiveTab('locations')}
                  className={`px-3 py-1.5 rounded-md font-medium transition ${
                    activeTab === 'locations'
                      ? 'bg-[#eb8a23] text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  Locations &amp; Addresses
                </button>
                {role === 'director' && (
                  <button
                    id="tab-mgmt-user-management"
                    onClick={() => setActiveTab('user-management')}
                    className={`px-3 py-1.5 rounded-md font-medium transition ${
                      activeTab === 'user-management'
                        ? 'bg-[#eb8a23] text-white shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                    }`}
                  >
                    User Management
                  </button>
                )}
                <button
                  id="tab-mgmt-reports"
                  onClick={() => setActiveTab('reports')}
                  className={`px-3 py-1.5 rounded-md font-medium transition ${
                    activeTab === 'reports'
                      ? 'bg-[#eb8a23] text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  Reports &amp; Export
                </button>
              </>
            )}

            {/* ADMIN TABS */}
            {role === 'admin' && (
              <>
                <button
                  id="tab-admin-dashboard"
                  onClick={() => setActiveTab('admin-dashboard')}
                  className={`px-3 py-1.5 rounded-md font-medium transition ${
                    activeTab === 'admin-dashboard'
                      ? 'bg-[#eb8a23] text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  Admin Operations
                </button>
                <button
                  id="tab-admin-assets"
                  onClick={() => setActiveTab('assets')}
                  className={`px-3 py-1.5 rounded-md font-medium transition ${
                    activeTab === 'assets'
                      ? 'bg-[#eb8a23] text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  Asset Master
                </button>
                <button
                  id="tab-admin-tickets"
                  onClick={() => setActiveTab('tickets')}
                  className={`px-3 py-1.5 rounded-md font-medium transition ${
                    activeTab === 'tickets'
                      ? 'bg-[#eb8a23] text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  Ticket Management
                </button>
                <button
                  id="tab-admin-config"
                  onClick={() => setActiveTab('admin-config')}
                  className={`px-3 py-1.5 rounded-md font-medium transition ${
                    activeTab === 'admin-config'
                      ? 'bg-[#eb8a23] text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  Approval Rules &amp; Limits
                </button>
                <button
                  id="tab-admin-audit"
                  onClick={() => setActiveTab('admin-audit')}
                  className={`px-3 py-1.5 rounded-md font-medium transition ${
                    activeTab === 'admin-audit'
                      ? 'bg-[#eb8a23] text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  Permanent Audit Logs
                </button>
                <button
                  id="tab-admin-employees"
                  onClick={() => setActiveTab('employees')}
                  className={`px-3 py-1.5 rounded-md font-medium transition ${
                    activeTab === 'employees'
                      ? 'bg-[#eb8a23] text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  Employees Directory
                </button>
                <button
                  id="tab-admin-locations"
                  onClick={() => setActiveTab('locations')}
                  className={`px-3 py-1.5 rounded-md font-medium transition ${
                    activeTab === 'locations'
                      ? 'bg-[#eb8a23] text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  Locations &amp; Addresses
                </button>
                <button
                  id="tab-admin-reports"
                  onClick={() => setActiveTab('reports')}
                  className={`px-3 py-1.5 rounded-md font-medium transition ${
                    activeTab === 'reports'
                      ? 'bg-[#eb8a23] text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  Reports &amp; Data Export
                </button>
              </>
            )}

            {/* VENDOR TABS */}
            {role === 'vendor' && (
              <>
                <button
                  id="tab-vendor-orders"
                  onClick={() => setActiveTab('vendor-orders')}
                  className={`px-3 py-1.5 rounded-md font-medium transition ${
                    activeTab === 'vendor-orders'
                      ? 'bg-[#eb8a23] text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  Assigned Work Orders
                </button>
                <button
                  id="tab-vendor-quotations"
                  onClick={() => setActiveTab('vendor-quotations')}
                  className={`px-3 py-1.5 rounded-md font-medium transition ${
                    activeTab === 'vendor-quotations'
                      ? 'bg-[#eb8a23] text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  Quotation Submissions
                </button>
                <button
                  id="tab-vendor-history"
                  onClick={() => setActiveTab('vendor-history')}
                  className={`px-3 py-1.5 rounded-md font-medium transition ${
                    activeTab === 'vendor-history'
                      ? 'bg-[#eb8a23] text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  Completed Jobs &amp; Invoices
                </button>
              </>
            )}
          </nav>

          {/* Quick Info Chip */}
          <div className="hidden md:flex items-center text-[11px] text-slate-400 gap-2">
            <span className="text-slate-500">Facility:</span>
            <span className="text-slate-300 font-medium">Infominer Agra &amp; Noida Hub</span>
          </div>
        </div>
      </div>
    </header>
  );
};
