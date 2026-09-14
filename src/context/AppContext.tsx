import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Asset,
  Vendor,
  Ticket,
  WorkOrder,
  Quotation,
  AuditLog,
  NotificationItem,
  ApprovalConfig,
  UserRole,
  UserProfile,
  TicketPriority,
  TicketCategory,
  Employee,
} from '../types';
import {
  INITIAL_ASSETS,
  INITIAL_VENDORS,
  INITIAL_TICKETS,
  INITIAL_QUOTATIONS,
  INITIAL_WORK_ORDERS,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS,
  INITIAL_APPROVAL_CONFIG,
  INITIAL_ENTITIES,
  INITIAL_DEPARTMENTS,
  INITIAL_LOCATIONS,
  INITIAL_EMPLOYEES,
} from '../data/initialData';

export const USER_PROFILES: Record<UserRole, UserProfile> = {
  employee: {
    id: 'EMP-GUEST',
    name: 'Self-Service Employee',
    email: 'employee@infominer.in',
    role: 'employee',
    designation: 'Staff Member (Public No-Login Access)',
  },
  manager: {
    id: 'MGR-01',
    name: 'Swati Katiyar',
    email: 'swati.katiyar@infominer.in',
    role: 'manager',
    department: 'Operations & Service Delivery',
    designation: 'Operations Manager',
  },
  director: {
    id: 'DIR-01',
    name: 'Krishna Mittal',
    email: 'krishna.mittal@infominer.in',
    role: 'director',
    designation: 'Managing Director',
  },
  admin: {
    id: 'ADM-01',
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@infominer.in',
    role: 'admin',
    department: 'Technology & IT Infrastructure',
    designation: 'System Administrator',
  },
  vendor: {
    id: 'VND-001',
    name: 'Suresh Verma',
    email: 'service@abctechnologies.in',
    role: 'vendor',
    vendorId: 'VND-001',
    designation: 'Authorized Service Lead (ABC Technologies)',
  },
};

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: UserProfile;
  assets: Asset[];
  vendors: Vendor[];
  tickets: Ticket[];
  quotations: Quotation[];
  workOrders: WorkOrder[];
  auditLogs: AuditLog[];
  notifications: NotificationItem[];
  approvalConfig: ApprovalConfig;
  entities: string[];
  departments: string[];
  locations: string[];
  employees: Employee[];

  // Actions
  createTicket: (data: {
    assetId: string;
    assetName: string;
    assetCategory: any;
    employeeName: string;
    employeeId?: string;
    employeeEmail: string;
    employeePhone: string;
    department: string;
    entity: string;
    location: string;
    issueCategory: TicketCategory;
    problemDescription: string;
    priority: TicketPriority;
    occurredAt: string;
    attachments?: Array<{ name: string; size: string; type: 'image' | 'document'; url: string }>;
  }) => string; // returns ticketId

  approveTicket: (ticketId: string, vendorId: string, comment?: string) => void;
  rejectTicket: (ticketId: string, reason: string) => void;
  requestClarification: (ticketId: string, note: string) => void;
  addInternalComment: (ticketId: string, comment: string) => void;
  
  submitQuotation: (data: {
    workOrderId: string;
    quotationNumber: string;
    serviceDescription: string;
    materialCost: number;
    labourCost: number;
    taxes: number;
    otherCharges: number;
    totalAmount: number;
    estimatedDays: number;
    pdfUrl?: string;
  }) => void;

  reviewQuotation: (
    quotationId: string,
    decision: 'Approved' | 'Revision Required' | 'Rejected',
    comment: string
  ) => void;

  updateWorkProgress: (
    workOrderId: string,
    status: 'Work Scheduled' | 'Work In Progress' | 'Awaiting Parts',
    note?: string,
    scheduledDate?: string
  ) => void;

  completeWork: (
    workOrderId: string,
    data: {
      completionDescription: string;
      vendorInvoiceNumber?: string;
      beforePhotos?: string[];
      afterPhotos?: string[];
      serviceReportUrl?: string;
    }
  ) => void;

  verifyAndClose: (ticketId: string, note?: string) => void;
  sendBackToVendor: (ticketId: string, reason: string) => void;

  createAsset: (asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateAsset: (id: string, updates: Partial<Asset>) => void;
  deactivateAsset: (id: string, reason: string) => void;

  createVendor: (vendor: Omit<Vendor, 'id' | 'completedJobsCount' | 'rating' | 'averageTurnaroundDays'>) => void;
  updateVendor: (id: string, updates: Partial<Vendor>) => void;

  createEmployee: (employee: Employee) => void;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;

  updateApprovalConfig: (config: ApprovalConfig) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  resetToDefaults: () => void;
  resetData: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEYS = {
  IS_AUTHENTICATED: 'infominer_auth_v1',
  ROLE: 'infominer_role_v1',
  ASSETS: 'infominer_assets_v1',
  TICKETS: 'infominer_tickets_v1',
  QUOTATIONS: 'infominer_quotations_v1',
  WORK_ORDERS: 'infominer_work_orders_v1',
  VENDORS: 'infominer_vendors_v1',
  AUDIT_LOGS: 'infominer_audit_logs_v1',
  NOTIFICATIONS: 'infominer_notifications_v1',
  CONFIG: 'infominer_config_v1',
  EMPLOYEES: 'infominer_employees_v1',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.IS_AUTHENTICATED) === 'true';
  });
  const [role, setRole] = useState<UserRole>(() => {
    return (localStorage.getItem(STORAGE_KEYS.ROLE) as UserRole) || 'manager';
  });
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.IS_AUTHENTICATED, String(isAuthenticated));
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ROLE, role);
  }, [role]);

  const [assets, setAssets] = useState<Asset[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ASSETS);
    return saved ? JSON.parse(saved) : INITIAL_ASSETS;
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
    return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
  });

  const [vendors, setVendors] = useState<Vendor[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.VENDORS);
    return saved ? JSON.parse(saved) : INITIAL_VENDORS;
  });

  const [tickets, setTickets] = useState<Ticket[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TICKETS);
    return saved ? JSON.parse(saved) : INITIAL_TICKETS;
  });

  const [quotations, setQuotations] = useState<Quotation[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.QUOTATIONS);
    return saved ? JSON.parse(saved) : INITIAL_QUOTATIONS;
  });

  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.WORK_ORDERS);
    return saved ? JSON.parse(saved) : INITIAL_WORK_ORDERS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [approvalConfig, setApprovalConfig] = useState<ApprovalConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CONFIG);
    return saved ? JSON.parse(saved) : INITIAL_APPROVAL_CONFIG;
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(assets));
  }, [assets]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.QUOTATIONS, JSON.stringify(quotations));
  }, [quotations]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WORK_ORDERS, JSON.stringify(workOrders));
  }, [workOrders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VENDORS, JSON.stringify(vendors));
  }, [vendors]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(approvalConfig));
  }, [approvalConfig]);

  const currentUser = useMemo(() => USER_PROFILES[role], [role]);

  // Log an audit action helper
  const addAudit = (
    action: string,
    entityAffected: string,
    options?: {
      ticketId?: string;
      assetId?: string;
      oldValue?: string;
      newValue?: string;
      comment?: string;
    }
  ) => {
    const newLog: AuditLog = {
      id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      ticketId: options?.ticketId,
      assetId: options?.assetId,
      user: currentUser.name,
      role: currentUser.role.toUpperCase(),
      action,
      entityAffected,
      oldValue: options?.oldValue,
      newValue: options?.newValue,
      comment: options?.comment,
      ipAddress: '192.168.1.' + Math.floor(Math.random() * 200 + 10),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Add notification helper
  const pushNotification = (
    title: string,
    message: string,
    targetRoles: UserRole[],
    type: 'info' | 'success' | 'warning' | 'critical' = 'info',
    extra?: { ticketId?: string; workOrderId?: string }
  ) => {
    const notif: NotificationItem = {
      id: `NOTIF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title,
      message,
      timestamp: 'Just now',
      read: false,
      type,
      targetRoles,
      ticketId: extra?.ticketId,
      workOrderId: extra?.workOrderId,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  // 1. Create Ticket (No Login)
  const createTicket = (data: {
    assetId: string;
    assetName: string;
    assetCategory: any;
    employeeName: string;
    employeeId?: string;
    employeeEmail: string;
    employeePhone: string;
    department: string;
    entity: string;
    location: string;
    issueCategory: TicketCategory;
    problemDescription: string;
    priority: TicketPriority;
    occurredAt: string;
    attachments?: Array<{ name: string; size: string; type: 'image' | 'document'; url: string }>;
  }): string => {
    const count = tickets.length + 129;
    const ticketId = `TKT-2026-${String(count).padStart(5, '0')}`;
    const now = new Date().toISOString();

    const formattedAttachments = (data.attachments || []).map((att, idx) => ({
      id: `ATT-${Date.now()}-${idx}`,
      name: att.name,
      size: att.size,
      type: att.type,
      url: att.url,
      uploadedAt: now,
      uploadedBy: data.employeeName,
    }));

    const newTicket: Ticket = {
      id: ticketId,
      assetId: data.assetId,
      assetName: data.assetName,
      assetCategory: data.assetCategory,
      employeeName: data.employeeName,
      employeeId: data.employeeId,
      employeeEmail: data.employeeEmail,
      employeePhone: data.employeePhone,
      department: data.department,
      entity: data.entity,
      location: data.location,
      issueCategory: data.issueCategory,
      problemDescription: data.problemDescription,
      priority: data.priority,
      occurredAt: data.occurredAt,
      status: 'Submitted',
      createdAt: now,
      updatedAt: now,
      attachments: formattedAttachments,
      timeline: [
        {
          id: `TL-${Date.now()}-1`,
          timestamp: now,
          action: 'Ticket Created',
          user: `${data.employeeName} (Employee)`,
          role: 'employee',
          comment: 'Issue raised without login via Employee Self-Service Portal.',
          newStatus: 'Submitted',
        },
        {
          id: `TL-${Date.now()}-2`,
          timestamp: now,
          action: 'Simultaneous Notification Dispatched',
          user: 'System Automated Router',
          role: 'System',
          comment: 'Notification dispatched to Operations Manager Swati Katiyar and Managing Director Krishna Mittal simultaneously.',
        },
      ],
      internalComments: [],
    };

    setTickets((prev) => [newTicket, ...prev]);

    // Update asset status to 'Under Maintenance' or 'Under Repair' if asset exists
    if (data.assetId && data.assetId !== 'AST-UNLISTED') {
      setAssets((prev) =>
        prev.map((ast) =>
          ast.id === data.assetId
            ? { ...ast, status: 'Under Maintenance', condition: 'Defective', updatedAt: now }
            : ast
        )
      );
    }

    // Simultaneous notification to Manager and Director
    pushNotification(
      `New Ticket: ${ticketId} (${data.priority} Priority)`,
      `${data.employeeName} reported ${data.issueCategory} on ${data.assetName}. Visible to Manager and Director simultaneously.`,
      ['manager', 'director'],
      data.priority === 'Critical' ? 'critical' : 'warning',
      { ticketId }
    );

    // Audit log
    addAudit('TICKET_CREATED', `Ticket ${ticketId}`, {
      ticketId,
      assetId: data.assetId,
      newValue: 'Submitted',
      comment: `Reported by ${data.employeeName} (${data.employeeEmail})`,
    });

    return ticketId;
  };

  // 2. Approve Ticket & Assign Vendor
  const approveTicket = (ticketId: string, vendorId: string, comment?: string) => {
    const now = new Date().toISOString();
    const vendor = vendors.find((v) => v.id === vendorId);
    const targetTicket = tickets.find((t) => t.id === ticketId);
    if (!targetTicket) return;

    const woId = `WO-2026-${ticketId.replace('TKT-2026-', '')}`;

    // Create Work Order
    const newWorkOrder: WorkOrder = {
      id: woId,
      ticketId,
      assetId: targetTicket.assetId,
      assetName: targetTicket.assetName,
      vendorId,
      vendorName: vendor ? vendor.name : 'Authorized Vendor',
      issueSummary: targetTicket.problemDescription.slice(0, 100),
      requiredWork: comment || `Diagnose and resolve ${targetTicket.issueCategory} issue on ${targetTicket.assetName}.`,
      createdAt: now,
      status: 'Quotation Pending',
    };

    setWorkOrders((prev) => [newWorkOrder, ...prev]);

    // Update Ticket
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== ticketId) return t;
        return {
          ...t,
          status: 'Quotation Pending',
          assignedVendorId: vendorId,
          workOrderId: woId,
          updatedAt: now,
          timeline: [
            ...t.timeline,
            {
              id: `TL-${Date.now()}-1`,
              timestamp: now,
              action: `Ticket Approved by ${currentUser.name}`,
              user: currentUser.name,
              role: currentUser.role,
              comment: comment || 'Ticket approved for vendor assignment.',
              previousStatus: t.status,
              newStatus: 'Approved',
            },
            {
              id: `TL-${Date.now()}-2`,
              timestamp: now,
              action: `Work Order Dispatched to ${vendor?.name || 'Vendor'}`,
              user: 'System Workflow Engine',
              role: 'System',
              comment: `Generated Work Order ${woId}. Notified vendor for quotation.`,
              previousStatus: 'Approved',
              newStatus: 'Quotation Pending',
            },
          ],
        };
      })
    );

    // Notifications
    pushNotification(
      `Work Order Dispatched (${woId})`,
      `Assigned to ${vendor?.name} for ticket ${ticketId}.`,
      ['vendor', 'manager'],
      'info',
      { ticketId, workOrderId: woId }
    );

    addAudit('TICKET_APPROVED', `Ticket ${ticketId}`, {
      ticketId,
      assetId: targetTicket.assetId,
      oldValue: targetTicket.status,
      newValue: 'Quotation Pending',
      comment: `Approved by ${currentUser.name}. Assigned to ${vendor?.name}. Work Order: ${woId}`,
    });
  };

  // 3. Reject Ticket
  const rejectTicket = (ticketId: string, reason: string) => {
    const now = new Date().toISOString();
    const targetTicket = tickets.find((t) => t.id === ticketId);
    if (!targetTicket) return;

    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== ticketId) return t;
        return {
          ...t,
          status: 'Rejected',
          rejectionReason: reason,
          updatedAt: now,
          timeline: [
            ...t.timeline,
            {
              id: `TL-${Date.now()}`,
              timestamp: now,
              action: `Ticket Rejected by ${currentUser.name}`,
              user: currentUser.name,
              role: currentUser.role,
              comment: `Reason: ${reason}`,
              previousStatus: t.status,
              newStatus: 'Rejected',
            },
          ],
        };
      })
    );

    // Restore asset status if needed
    if (targetTicket.assetId && targetTicket.assetId !== 'AST-UNLISTED') {
      setAssets((prev) =>
        prev.map((ast) =>
          ast.id === targetTicket.assetId ? { ...ast, status: 'Active', updatedAt: now } : ast
        )
      );
    }

    pushNotification(
      `Ticket Rejected (${ticketId})`,
      `Reason: ${reason}`,
      ['manager', 'director'],
      'critical',
      { ticketId }
    );

    addAudit('TICKET_REJECTED', `Ticket ${ticketId}`, {
      ticketId,
      assetId: targetTicket.assetId,
      oldValue: targetTicket.status,
      newValue: 'Rejected',
      comment: reason,
    });
  };

  // 4. Request Clarification
  const requestClarification = (ticketId: string, note: string) => {
    const now = new Date().toISOString();
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== ticketId) return t;
        return {
          ...t,
          status: 'Clarification Required',
          clarificationNote: note,
          updatedAt: now,
          timeline: [
            ...t.timeline,
            {
              id: `TL-${Date.now()}`,
              timestamp: now,
              action: `Clarification Requested by ${currentUser.name}`,
              user: currentUser.name,
              role: currentUser.role,
              comment: note,
              previousStatus: t.status,
              newStatus: 'Clarification Required',
            },
          ],
        };
      })
    );

    addAudit('CLARIFICATION_REQUESTED', `Ticket ${ticketId}`, {
      ticketId,
      newValue: 'Clarification Required',
      comment: note,
    });
  };

  // 5. Add Internal Comment
  const addInternalComment = (ticketId: string, comment: string) => {
    const now = new Date().toISOString();
    const commentItem = {
      id: `IC-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      comment,
      timestamp: now,
    };

    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, internalComments: [...t.internalComments, commentItem] } : t))
    );

    addAudit('INTERNAL_COMMENT_ADDED', `Ticket ${ticketId}`, {
      ticketId,
      comment,
    });
  };

  // 6. Submit Quotation (Vendor)
  const submitQuotation = (data: {
    workOrderId: string;
    quotationNumber: string;
    serviceDescription: string;
    materialCost: number;
    labourCost: number;
    taxes: number;
    otherCharges: number;
    totalAmount: number;
    estimatedDays: number;
    pdfUrl?: string;
  }) => {
    const now = new Date().toISOString();
    const wo = workOrders.find((w) => w.id === data.workOrderId);
    if (!wo) return;

    const quoId = `QUO-2026-${String(quotations.length + 46).padStart(4, '0')}`;
    const vendor = vendors.find((v) => v.id === wo.vendorId) || INITIAL_VENDORS[0];

    const newQuotation: Quotation = {
      id: quoId,
      workOrderId: data.workOrderId,
      ticketId: wo.ticketId,
      vendorId: vendor.id,
      vendorName: vendor.name,
      quotationNumber: data.quotationNumber,
      date: now.split('T')[0],
      serviceDescription: data.serviceDescription,
      materialCost: data.materialCost,
      labourCost: data.labourCost,
      taxes: data.taxes,
      otherCharges: data.otherCharges,
      totalAmount: data.totalAmount,
      estimatedDays: data.estimatedDays,
      pdfUrl: data.pdfUrl || 'https://infominer.internal/docs/' + quoId + '.pdf',
      status: 'Submitted',
      submittedAt: now,
      version: 1,
    };

    setQuotations((prev) => [newQuotation, ...prev]);

    // Update Work Order
    setWorkOrders((prev) =>
      prev.map((w) =>
        w.id === data.workOrderId
          ? {
              ...w,
              quotationId: quoId,
              currentQuotationAmount: data.totalAmount,
              status: 'Quotation Pending',
            }
          : w
      )
    );

    // Update Ticket
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== wo.ticketId) return t;
        return {
          ...t,
          status: 'Quotation Under Review',
          updatedAt: now,
          timeline: [
            ...t.timeline,
            {
              id: `TL-${Date.now()}`,
              timestamp: now,
              action: `Quotation Submitted by ${vendor.name}`,
              user: `${vendor.contactPerson} (${vendor.name})`,
              role: 'vendor',
              comment: `Quotation ${data.quotationNumber} for ₹${data.totalAmount.toLocaleString()} submitted. Estimated turnaround: ${data.estimatedDays} days.`,
              previousStatus: t.status,
              newStatus: 'Quotation Under Review',
            },
          ],
        };
      })
    );

    // Simultaneous notification to Manager and Director
    const isHighValue = data.totalAmount > approvalConfig.directorRequiredAbove;
    pushNotification(
      `New Quotation: ₹${data.totalAmount.toLocaleString()} (${quoId})`,
      `${vendor.name} submitted quotation for ${wo.assetName}. ${isHighValue ? 'Director approval required (>₹5,000 threshold).' : 'Ready for review.'}`,
      ['manager', 'director'],
      isHighValue ? 'warning' : 'info',
      { ticketId: wo.ticketId, workOrderId: wo.id }
    );

    addAudit('QUOTATION_SUBMITTED', `Quotation ${quoId}`, {
      ticketId: wo.ticketId,
      assetId: wo.assetId,
      oldValue: 'Quotation Pending',
      newValue: 'Quotation Under Review',
      comment: `Amount: ₹${data.totalAmount.toLocaleString()} by ${vendor.name}`,
    });
  };

  // 7. Review Quotation (Manager / Director)
  const reviewQuotation = (
    quotationId: string,
    decision: 'Approved' | 'Revision Required' | 'Rejected',
    comment: string
  ) => {
    const now = new Date().toISOString();
    const quo = quotations.find((q) => q.id === quotationId);
    if (!quo) return;

    setQuotations((prev) =>
      prev.map((q) =>
        q.id === quotationId
          ? {
              ...q,
              status: decision,
              reviewedBy: currentUser.name,
              reviewedAt: now,
              reviewComment: comment,
            }
          : q
      )
    );

    const nextTicketStatus =
      decision === 'Approved'
        ? 'Quotation Approved'
        : decision === 'Revision Required'
        ? 'Quotation Revision Required'
        : 'Quotation Rejected';

    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== quo.ticketId) return t;
        return {
          ...t,
          status: nextTicketStatus,
          updatedAt: now,
          timeline: [
            ...t.timeline,
            {
              id: `TL-${Date.now()}`,
              timestamp: now,
              action: `Quotation ${decision} by ${currentUser.name}`,
              user: currentUser.name,
              role: currentUser.role,
              comment: comment,
              previousStatus: t.status,
              newStatus: nextTicketStatus,
            },
          ],
        };
      })
    );

    // Update Work Order
    setWorkOrders((prev) =>
      prev.map((w) =>
        w.id === quo.workOrderId
          ? {
              ...w,
              status: decision === 'Approved' ? 'Quotation Approved' : 'Quotation Pending',
            }
          : w
      )
    );

    pushNotification(
      `Quotation ${decision} (${quotationId})`,
      `${currentUser.name} (${currentUser.role}) ${decision.toLowerCase()} the quotation. Comment: ${comment}`,
      ['vendor', 'manager', 'director'],
      decision === 'Approved' ? 'success' : 'warning',
      { ticketId: quo.ticketId, workOrderId: quo.workOrderId }
    );

    addAudit(`QUOTATION_${decision.toUpperCase().replace(/\s+/g, '_')}`, `Quotation ${quotationId}`, {
      ticketId: quo.ticketId,
      oldValue: quo.status,
      newValue: decision,
      comment: `Reviewed by ${currentUser.name}: ${comment}`,
    });
  };

  // 8. Update Work Progress (Vendor)
  const updateWorkProgress = (
    workOrderId: string,
    status: 'Work Scheduled' | 'Work In Progress' | 'Awaiting Parts',
    note?: string,
    scheduledDate?: string
  ) => {
    const now = new Date().toISOString();
    const wo = workOrders.find((w) => w.id === workOrderId);
    if (!wo) return;

    setWorkOrders((prev) =>
      prev.map((w) =>
        w.id === workOrderId
          ? {
              ...w,
              status,
              workScheduledDate: scheduledDate || w.workScheduledDate,
              workStartedDate: status === 'Work In Progress' ? now : w.workStartedDate,
            }
          : w
      )
    );

    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== wo.ticketId) return t;
        return {
          ...t,
          status,
          updatedAt: now,
          timeline: [
            ...t.timeline,
            {
              id: `TL-${Date.now()}`,
              timestamp: now,
              action: `Status Updated: ${status}`,
              user: currentUser.name,
              role: currentUser.role,
              comment: note || (scheduledDate ? `Scheduled for ${scheduledDate}` : `Work status shifted to ${status}`),
              previousStatus: t.status,
              newStatus: status,
            },
          ],
        };
      })
    );

    addAudit(`WORK_STATUS_${status.toUpperCase().replace(/\s+/g, '_')}`, `Work Order ${workOrderId}`, {
      ticketId: wo.ticketId,
      assetId: wo.assetId,
      oldValue: wo.status,
      newValue: status,
      comment: note,
    });
  };

  // 9. Complete Work (Vendor)
  const completeWork = (
    workOrderId: string,
    data: {
      completionDescription: string;
      vendorInvoiceNumber?: string;
      beforePhotos?: string[];
      afterPhotos?: string[];
      serviceReportUrl?: string;
    }
  ) => {
    const now = new Date().toISOString();
    const wo = workOrders.find((w) => w.id === workOrderId);
    if (!wo) return;

    setWorkOrders((prev) =>
      prev.map((w) =>
        w.id === workOrderId
          ? {
              ...w,
              status: 'Work Completed',
              workCompletedDate: now,
              completionDescription: data.completionDescription,
              vendorInvoiceNumber: data.vendorInvoiceNumber,
              beforePhotos: data.beforePhotos || [],
              afterPhotos: data.afterPhotos || [],
              serviceReportUrl: data.serviceReportUrl,
            }
          : w
      )
    );

    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== wo.ticketId) return t;
        return {
          ...t,
          status: 'Verification Pending',
          updatedAt: now,
          timeline: [
            ...t.timeline,
            {
              id: `TL-${Date.now()}`,
              timestamp: now,
              action: 'Work Completed by Vendor',
              user: currentUser.name,
              role: currentUser.role,
              comment: `${data.completionDescription}${data.vendorInvoiceNumber ? ` | Invoice: ${data.vendorInvoiceNumber}` : ''}`,
              previousStatus: t.status,
              newStatus: 'Verification Pending',
            },
          ],
        };
      })
    );

    pushNotification(
      `Work Completed — Verification Required (${workOrderId})`,
      `${wo.vendorName} finished service for ${wo.assetName}. Verification required by Management or Admin.`,
      ['manager', 'director', 'admin'],
      'info',
      { ticketId: wo.ticketId, workOrderId }
    );

    addAudit('WORK_COMPLETED_BY_VENDOR', `Work Order ${workOrderId}`, {
      ticketId: wo.ticketId,
      assetId: wo.assetId,
      oldValue: wo.status,
      newValue: 'Verification Pending',
      comment: data.completionDescription,
    });
  };

  // 10. Verify & Close (Manager / Admin)
  const verifyAndClose = (ticketId: string, note?: string) => {
    const now = new Date().toISOString();
    const targetTicket = tickets.find((t) => t.id === ticketId);
    if (!targetTicket) return;

    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== ticketId) return t;
        return {
          ...t,
          status: 'Closed',
          closureNote: note || 'Verified service completion. Functionality tested and confirmed.',
          resolvedAt: now,
          updatedAt: now,
          timeline: [
            ...t.timeline,
            {
              id: `TL-${Date.now()}`,
              timestamp: now,
              action: `Verified & Closed by ${currentUser.name}`,
              user: currentUser.name,
              role: currentUser.role,
              comment: note || 'Service verified and closed.',
              previousStatus: t.status,
              newStatus: 'Closed',
            },
          ],
        };
      })
    );

    if (targetTicket.workOrderId) {
      setWorkOrders((prev) =>
        prev.map((w) => (w.id === targetTicket.workOrderId ? { ...w, status: 'Verified & Closed' } : w))
      );
    }

    // Automatically update asset condition back to 'Good' and status back to 'Active'
    if (targetTicket.assetId && targetTicket.assetId !== 'AST-UNLISTED') {
      setAssets((prev) =>
        prev.map((ast) =>
          ast.id === targetTicket.assetId
            ? { ...ast, status: 'Active', condition: 'Good', updatedAt: now }
            : ast
        )
      );
    }

    pushNotification(
      `Ticket Closed & Verified (${ticketId})`,
      `Service has been confirmed completed. Asset ${targetTicket.assetName} restored to Active.`,
      ['employee', 'manager', 'director', 'admin', 'vendor'],
      'success',
      { ticketId }
    );

    addAudit('TICKET_VERIFIED_AND_CLOSED', `Ticket ${ticketId}`, {
      ticketId,
      assetId: targetTicket.assetId,
      oldValue: targetTicket.status,
      newValue: 'Closed',
      comment: note || 'Verified by ' + currentUser.name,
    });
  };

  // 11. Send back to vendor
  const sendBackToVendor = (ticketId: string, reason: string) => {
    const now = new Date().toISOString();
    const targetTicket = tickets.find((t) => t.id === ticketId);
    if (!targetTicket) return;

    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== ticketId) return t;
        return {
          ...t,
          status: 'Work In Progress',
          updatedAt: now,
          timeline: [
            ...t.timeline,
            {
              id: `TL-${Date.now()}`,
              timestamp: now,
              action: `Sent Back to Vendor by ${currentUser.name}`,
              user: currentUser.name,
              role: currentUser.role,
              comment: `Revision Required: ${reason}`,
              previousStatus: t.status,
              newStatus: 'Work In Progress',
            },
          ],
        };
      })
    );

    if (targetTicket.workOrderId) {
      setWorkOrders((prev) =>
        prev.map((w) => (w.id === targetTicket.workOrderId ? { ...w, status: 'Work In Progress' } : w))
      );
    }

    pushNotification(
      `Work Rejected / Sent Back (${ticketId})`,
      `Management requested revision on work: ${reason}`,
      ['vendor', 'manager'],
      'warning',
      { ticketId }
    );

    addAudit('WORK_SENT_BACK', `Ticket ${ticketId}`, {
      ticketId,
      assetId: targetTicket.assetId,
      oldValue: 'Verification Pending',
      newValue: 'Work In Progress',
      comment: reason,
    });
  };

  // 12. Asset Management
  const createAsset = (assetData: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>): string => {
    const now = new Date().toISOString();
    const nextNum = assets.length + 128;
    const newId = `AST-${String(nextNum).padStart(6, '0')}`;

    const newAsset: Asset = {
      ...assetData,
      id: newId,
      createdAt: now,
      updatedAt: now,
    };

    setAssets((prev) => [newAsset, ...prev]);

    addAudit('ASSET_CREATED', `Asset ${newId}`, {
      assetId: newId,
      newValue: newAsset.name,
      comment: `Created by ${currentUser.name} (${currentUser.role})`,
    });

    return newId;
  };

  const updateAsset = (id: string, updates: Partial<Asset>) => {
    const now = new Date().toISOString();
    setAssets((prev) =>
      prev.map((ast) => (ast.id === id ? { ...ast, ...updates, updatedAt: now } : ast))
    );

    addAudit('ASSET_UPDATED', `Asset ${id}`, {
      assetId: id,
      comment: `Updated fields by ${currentUser.name}`,
    });
  };

  const deactivateAsset = (id: string, reason: string) => {
    const now = new Date().toISOString();
    setAssets((prev) =>
      prev.map((ast) => (ast.id === id ? { ...ast, status: 'Retired', notes: `${ast.notes || ''} [Deactivated: ${reason}]`, updatedAt: now } : ast))
    );

    addAudit('ASSET_DEACTIVATED', `Asset ${id}`, {
      assetId: id,
      oldValue: 'Active',
      newValue: 'Retired',
      comment: reason,
    });
  };

  // 13. Vendor Management
  const createVendor = (vendorData: Omit<Vendor, 'id' | 'completedJobsCount' | 'rating' | 'averageTurnaroundDays'>) => {
    const newId = `VND-${String(vendors.length + 1).padStart(3, '0')}`;
    const newVendor: Vendor = {
      ...vendorData,
      id: newId,
      completedJobsCount: 0,
      rating: 5.0,
      averageTurnaroundDays: 2.0,
    };
    setVendors((prev) => [...prev, newVendor]);
    addAudit('VENDOR_CREATED', `Vendor ${newId}`, {
      comment: `Added ${vendorData.name}`,
    });
  };

  const updateVendor = (id: string, updates: Partial<Vendor>) => {
    setVendors((prev) => prev.map((v) => (v.id === id ? { ...v, ...updates } : v)));
    addAudit('VENDOR_UPDATED', `Vendor ${id}`, {
      comment: `Updated details for ${id}`,
    });
  };

  // 14. Approval Config
  const updateApprovalConfig = (config: ApprovalConfig) => {
    setApprovalConfig(config);
    addAudit('APPROVAL_CONFIG_UPDATED', 'Approval Thresholds', {
      comment: `Manager Threshold: ₹${config.managerMaxThreshold}, Director Above: ₹${config.directorRequiredAbove}`,
    });
  };

  // 15. Notification helpers
  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // 14. Employee Management
  const createEmployee = (employeeData: Employee) => {
    setEmployees((prev) => [...prev, employeeData]);
    addAudit('EMPLOYEE_CREATED', `Employee ${employeeData.id}`, {
      newValue: employeeData.name,
    });
  };

  const updateEmployee = (id: string, updates: Partial<Employee>) => {
    setEmployees((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
    addAudit('EMPLOYEE_UPDATED', `Employee ${id}`, {
      newValue: 'Updated Details',
    });
  };

  // 15. Admin Utils
  const resetToDefaults = () => {
    localStorage.clear();
    setAssets(INITIAL_ASSETS);
    setVendors(INITIAL_VENDORS);
    setTickets(INITIAL_TICKETS);
    setQuotations(INITIAL_QUOTATIONS);
    setWorkOrders(INITIAL_WORK_ORDERS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setApprovalConfig(INITIAL_APPROVAL_CONFIG);
    setEmployees(INITIAL_EMPLOYEES);
    addAudit('SYSTEM_RESET', 'Configuration & Masters', {
      comment: 'Reset assets, vendors, employees, and config to defaults.',
    });
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        role,
        setRole,
        activeTab,
        setActiveTab,
        currentUser,
        assets,
        vendors,
        tickets,
        quotations,
        workOrders,
        auditLogs,
        notifications,
        approvalConfig,
        entities: INITIAL_ENTITIES,
        departments: INITIAL_DEPARTMENTS,
        locations: INITIAL_LOCATIONS,
        employees,
        createTicket,
        approveTicket,
        rejectTicket,
        requestClarification,
        addInternalComment,
        submitQuotation,
        reviewQuotation,
        updateWorkProgress,
        completeWork,
        verifyAndClose,
        sendBackToVendor,
        createAsset,
        updateAsset,
        deactivateAsset,
        createVendor,
        updateVendor,
        createEmployee,
        updateEmployee,
        updateApprovalConfig,
        markNotificationRead,
        markAllNotificationsRead,
        resetToDefaults,
        resetData: resetToDefaults,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
