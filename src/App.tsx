import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { LoginPage } from './components/LoginPage';
import { EmployeeTicketForm } from './components/EmployeeTicketForm';
import { PublicTicketTracker } from './components/PublicTicketTracker';
import { ManagerDashboard } from './components/ManagerDashboard';
import { TicketsQueueView } from './components/TicketsQueueView';
import { AssetMasterView } from './components/AssetMasterView';
import { VendorPortalView } from './components/VendorPortalView';
import { VendorsDirectoryView } from './components/VendorsDirectoryView';
import { EmployeesDirectoryView } from './components/EmployeesDirectoryView';
import { QuotationsListView } from './components/QuotationsListView';
import { AuditLogView } from './components/AuditLogView';
import { AdminSettingsView } from './components/AdminSettingsView';
import { TicketDetailModal } from './components/TicketDetailModal';
import { UserManagementView } from './components/UserManagementView';
import { Ticket, Asset } from './types';
import { InfominerLogo } from './components/InfominerLogo';

const MainLayout: React.FC = () => {
  const { role, activeTab, setActiveTab, isAuthenticated } = useApp();
  const [showStaffLogin, setShowStaffLogin] = useState(true);
  
  // Selected ticket for modal
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  // Deep linking between views
  const [trackerTicketId, setTrackerTicketId] = useState<string>('');
  const [selectedAssetForDetail, setSelectedAssetForDetail] = useState<string | null>(null);

  if (!isAuthenticated && showStaffLogin) {
    return (
      <LoginPage 
        onBack={() => {
          setShowStaffLogin(false);
          setActiveTab('report-issue');
        }} 
      />
    );
  }

  const handleTicketCreated = (ticketId: string) => {
    setTrackerTicketId(ticketId);
  };

  const handleTrackRequested = (ticketId: string) => {
    setTrackerTicketId(ticketId);
    setActiveTab('track-ticket');
  };

  const handleOpenAssetDetail = (assetId: string) => {
    setSelectedAssetForDetail(assetId);
    setSelectedTicket(null);
    setActiveTab('assets');
  };

  const handleRaiseTicketForAsset = (asset: Asset) => {
    setActiveTab('report-issue');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800 antialiased selection:bg-[#eb8a23]/20 selection:text-[#d97917]">
      {/* Sticky Top Header */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} onLoginClick={() => setShowStaffLogin(true)} />

      {/* Main Content Area based on activeTab */}
      <main className="flex-1 pb-16">
        {activeTab === 'report-issue' && (
          <EmployeeTicketForm
            onTicketCreated={handleTicketCreated}
            onTrackRequested={handleTrackRequested}
          />
        )}

        {activeTab === 'track-ticket' && (
          <PublicTicketTracker initialTicketId={trackerTicketId} />
        )}

        {(activeTab === 'dashboard' || activeTab === 'admin-dashboard') && (
          <ManagerDashboard
            onSelectTicket={(t) => setSelectedTicket(t)}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {(activeTab === 'tickets' || activeTab === 'admin-tickets') && (
          <TicketsQueueView
            onSelectTicket={(t) => setSelectedTicket(t)}
            onNavigateToReportIssue={() => setActiveTab('report-issue')}
          />
        )}

        {(activeTab === 'assets' || activeTab === 'browse-assets' || activeTab === 'admin-assets') && (
          <AssetMasterView
            initialSelectedAssetId={selectedAssetForDetail}
            onRaiseTicketForAsset={handleRaiseTicketForAsset}
          />
        )}

        {(activeTab === 'vendor-portal' ||
          activeTab === 'vendor-orders' ||
          activeTab === 'vendor-quotations' ||
          activeTab === 'vendor-history') && (
          <VendorPortalView onSelectTicket={(t) => setSelectedTicket(t)} />
        )}

        {activeTab === 'vendors' && <VendorsDirectoryView />}
        {activeTab === 'employees' && <EmployeesDirectoryView />}

        {activeTab === 'quotations' && (
          <QuotationsListView onSelectTicket={(t) => setSelectedTicket(t)} />
        )}

        {(activeTab === 'audit-log' || activeTab === 'admin-audit' || activeTab === 'reports') && (
          <AuditLogView />
        )}

        {(activeTab === 'settings' || activeTab === 'admin-config') && <AdminSettingsView />}

        {activeTab === 'user-management' && role === 'director' && <UserManagementView />}

        {/* Fallback default view if activeTab is unset or invalid */}
        {![
          'report-issue',
          'track-ticket',
          'dashboard',
          'admin-dashboard',
          'tickets',
          'admin-tickets',
          'assets',
          'browse-assets',
          'admin-assets',
          'vendor-portal',
          'vendor-orders',
          'vendor-quotations',
          'vendor-history',
          'vendors',
          'employees',
          'quotations',
          'audit-log',
          'admin-audit',
          'reports',
          'settings',
          'admin-config',
          'user-management',
        ].includes(activeTab) && (
          role === 'employee' ? (
            <EmployeeTicketForm
              onTicketCreated={handleTicketCreated}
              onTrackRequested={handleTrackRequested}
            />
          ) : role === 'vendor' ? (
            <VendorPortalView onSelectTicket={(t) => setSelectedTicket(t)} />
          ) : (
            <ManagerDashboard
              onSelectTicket={(t) => setSelectedTicket(t)}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#2d3e50] text-slate-400 text-xs py-6 border-t border-[#1e293b]">
        <div className="w-full px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <InfominerLogo className="w-5 h-5" />
            <span className="text-white font-bold">
              Infominer Services Pvt. Ltd.
            </span>
            <span className="text-slate-500">|</span>
            <span>Asset Tracker &amp; Service Management System</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Agra Corporate Bay &amp; Branch Facilities</span>
            <span>•</span>
            <span className="text-[#eb8a23] font-medium">
              Simultaneous Director &amp; Manager Governance
            </span>
          </div>
        </div>
      </footer>

      {/* Global Ticket Detail Modal */}
      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onOpenAssetDetail={handleOpenAssetDetail}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
