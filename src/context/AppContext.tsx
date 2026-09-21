import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from "firebase/auth";
import { collection, onSnapshot, addDoc, getDocs, doc, setDoc, query, orderBy, limit, updateDoc, arrayUnion } from "firebase/firestore";
import { auth, db } from '../config/firebase';
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
import { USER_PROFILES } from '../data/users';
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


interface AppContextType {
  role: UserRole;
  isAuthenticated: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: UserProfile;
  users: UserProfile[];
  addUser: (user: UserProfile) => void;
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => void;
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
  }) => Promise<string>; // returns ticketId

  approveTicket: (ticketId: string, vendorId: string, comment?: string) => Promise<void>;
  rejectTicket: (ticketId: string, reason: string) => Promise<void>;
  requestClarification: (ticketId: string, note: string) => Promise<void>;
  addInternalComment: (ticketId: string, comment: string) => Promise<void>;
  
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
  }) => Promise<void>;

  reviewQuotation: (
    quotationId: string,
    decision: 'Approved' | 'Revision Required' | 'Rejected',
    comment: string
  ) => Promise<void>;

  updateWorkProgress: (
    workOrderId: string,
    status: 'Work Scheduled' | 'Work In Progress' | 'Awaiting Parts',
    note?: string,
    scheduledDate?: string
  ) => Promise<void>;

  completeWork: (
    workOrderId: string,
    data: {
      completionDescription: string;
      vendorInvoiceNumber?: string;
      beforePhotos?: string[];
      afterPhotos?: string[];
      serviceReportUrl?: string;
    }
  ) => Promise<void>;

  verifyAndClose: (ticketId: string, note?: string) => Promise<void>;
  sendBackToVendor: (ticketId: string, reason: string) => Promise<void>;

  createAsset: (asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateAsset: (id: string, updates: Partial<Asset>) => Promise<void>;
  deactivateAsset: (id: string, reason: string) => Promise<void>;

  createVendor: (vendor: Omit<Vendor, 'id' | 'completedJobsCount' | 'rating' | 'averageTurnaroundDays'>) => Promise<string>;
  updateVendor: (id: string, updates: Partial<Vendor>) => Promise<void>;

  createEmployee: (employee: Employee) => Promise<void>;
  updateEmployee: (id: string, updates: Partial<Employee>) => Promise<void>;

  updateApprovalConfig: (newConfig: Partial<ApprovalConfig>) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  resetToDefaults: () => void;
  resetData: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEYS = {
  IS_AUTHENTICATED: 'infominer_auth_v1',
  CURRENT_USER_ID: 'infominer_current_user_id_v1',
  USERS: 'infominer_users_v1',
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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [users, setUsers] = useState<UserProfile[]>(Object.values(USER_PROFILES));
  const [currentUserId, setCurrentUserId] = useState<string>('EMP-GUEST');
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  useEffect(() => {
    // Load users from Firestore
    const loadUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const fbUsers: UserProfile[] = [];
        querySnapshot.forEach((doc) => {
          fbUsers.push(doc.data() as UserProfile);
        });
        if (fbUsers.length > 0) {
          // Merge with INITIAL_USERS if needed, but here we just use Firestore + guest
          const guestUser = Object.values(USER_PROFILES).find(u => u.role === 'employee')!;
          setUsers([guestUser, ...fbUsers]);
        }
      } catch (e) {
        console.error("Error loading users", e);
      }
    };
    loadUsers();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        // Find user by email
        const found = users.find(u => u.email.toLowerCase().trim() === user.email?.toLowerCase().trim());
        if (found) setCurrentUserId(found.id);
      } else {
        setIsAuthenticated(false);
        setCurrentUserId('EMP-GUEST');
      }
    });
    return () => unsubscribe();
  }, [users]);

  const currentUser = useMemo(() => {
    return users.find(u => u.id === currentUserId) || users.find(u => u.role === 'employee') || Object.values(USER_PROFILES)[0];
  }, [users, currentUserId]);
  
  const role = currentUser?.role || 'employee';

  const login = async (email: string, password: string): Promise<string | null> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setActiveTab('dashboard');
      return null;
    } catch (error: any) {
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found') {
        try {
          console.log("User not found or invalid credential, attempting to auto-register...");
          await createUserWithEmailAndPassword(auth, email, password);
          setActiveTab('dashboard');
          return null;
        } catch (regError: any) {
          console.error("Auto-registration failed:", regError);
          if (regError.code === 'auth/email-already-in-use') {
            return "Incorrect password for this existing account.";
          }
          return regError.message || "Failed to register user.";
        }
      }
      return error.message || "Login failed.";
    }
  };
  
  const logout = async () => {
    await signOut(auth);
    setActiveTab('dashboard');
  };
  
  const addUser = async (user: UserProfile) => {
    try {
      // In a real app, this should be done via Firebase Admin SDK in a Cloud Function
      // to avoid signing out the current user. For demo, we just add to Firestore.
      await setDoc(doc(db, "users", user.id), user);
      setUsers(prev => [...prev, user]);
    } catch (e) {
      console.error(e);
    }
  };

  const [assets, setAssets] = useState<Asset[]>([]);

  useEffect(() => {
    const q = query(collection(db, "assets"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const asts: Asset[] = [];
      snapshot.forEach((doc) => {
        asts.push({ ...doc.data(), id: doc.id } as Asset);
      });
      setAssets(asts);
    });
    return () => unsubscribe();
  }, []);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [approvalConfig, setApprovalConfig] = useState<ApprovalConfig>(INITIAL_APPROVAL_CONFIG);

  const hasCheckedExpiries = React.useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !['admin', 'manager', 'director'].includes(role) || hasCheckedExpiries.current || assets.length === 0 || notifications.length === 0) return;
    
    hasCheckedExpiries.current = true;
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    assets.forEach((ast) => {
      if (ast.category === 'IT Equipment' && ['Laptop', 'Computer', 'Desktop'].includes(ast.type)) {
        // Software
        if (ast.softwareExpiry) {
          const expDate = new Date(ast.softwareExpiry);
          if (expDate <= thirtyDaysFromNow && expDate >= now) {
            const exists = notifications.some(n => n.assetId === ast.id && n.title.includes('Software Expiring'));
            if (!exists) {
              pushNotification(
                `Software Expiring: ${ast.name}`,
                `The software license (${ast.softwareName || 'Unknown'}) on ${ast.id} expires on ${ast.softwareExpiry}.`,
                ['admin', 'manager', 'director'],
                'warning',
                { assetId: ast.id }
              );
            }
          }
        }
        // Antivirus
        if (ast.antivirusExpiry) {
          const expDate = new Date(ast.antivirusExpiry);
          if (expDate <= thirtyDaysFromNow && expDate >= now) {
            const exists = notifications.some(n => n.assetId === ast.id && n.title.includes('Antivirus Expiring'));
            if (!exists) {
              pushNotification(
                `Antivirus Expiring: ${ast.name}`,
                `The antivirus subscription (${ast.antivirusName || 'Unknown'}) on ${ast.id} expires on ${ast.antivirusExpiry}.`,
                ['admin', 'manager', 'director'],
                'warning',
                { assetId: ast.id }
              );
            }
          }
        }
      }
    });
  }, [assets, isAuthenticated, role, notifications]);

  useEffect(() => {
    const unsubEmployees = onSnapshot(collection(db, "employees"), (snap) => {
      setEmployees(snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Employee)));
    });
    const unsubVendors = onSnapshot(collection(db, "vendors"), (snap) => {
      setVendors(snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Vendor)));
    });
    const unsubTickets = onSnapshot(query(collection(db, "tickets"), orderBy("createdAt", "desc")), (snap) => {
      setTickets(snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Ticket)));
    });
    const unsubQuotations = onSnapshot(query(collection(db, "quotations"), orderBy("createdAt", "desc")), (snap) => {
      setQuotations(snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Quotation)));
    });
    const unsubWorkOrders = onSnapshot(query(collection(db, "workOrders"), orderBy("createdAt", "desc")), (snap) => {
      setWorkOrders(snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as WorkOrder)));
    });
    const unsubAuditLogs = onSnapshot(query(collection(db, "auditLogs"), orderBy("timestamp", "desc")), (snap) => {
      setAuditLogs(snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as AuditLog)));
    });
    const unsubNotifs = onSnapshot(query(collection(db, "notifications"), orderBy("timestamp", "desc"), limit(50)), (snap) => {
      setNotifications(snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as NotificationItem)));
    });
    const unsubConfig = onSnapshot(doc(db, "settings", "approvalConfig"), (docSnap) => {
      if (docSnap.exists()) setApprovalConfig(docSnap.data() as ApprovalConfig);
    });

    return () => {
      unsubEmployees(); unsubVendors(); unsubTickets();
      unsubQuotations(); unsubWorkOrders(); unsubAuditLogs();
      unsubNotifs(); unsubConfig();
    };
  }, []);

  // Sync to local storage













  // Log an audit action helper
  const addAudit = async (
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
    try { await setDoc(doc(db, "auditLogs", newLog.id), newLog); } catch(e) { console.error(e); }
  };

  // Add notification helper
  const pushNotification = async (
    title: string,
    message: string,
    targetRoles: UserRole[],
    type: NotificationItem['type'] = 'info',
    relatedIds?: {
      ticketId?: string;
      quotationId?: string;
      assetId?: string;
    }
  ): Promise<void> => {
    const newNotif: NotificationItem = {
      id: `NOT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      title,
      message,
      type,
      targetRoles,
      read: false,
      ...relatedIds,
    };
    try {
      await setDoc(doc(db, "notifications", newNotif.id), newNotif);
    } catch (e) { console.error(e); }
  };

  // 1. Create Ticket (No Login)
  const createTicket = async (data: {
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
  }): Promise<string> => {
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
        }
      ],
      internalComments: [],
    };

    try {
      await setDoc(doc(db, "tickets", ticketId), newTicket);
      
      if (data.assetId && data.assetId !== 'AST-UNLISTED') {
        await updateDoc(doc(db, "assets", data.assetId), {
          status: 'Under Maintenance',
          condition: 'Defective',
          updatedAt: now
        });
      }
      
      const isUrgent = data.priority === 'High' || data.priority === 'Critical';
      const msg = isUrgent ? `URGENT: New ${data.priority} priority ticket needs immediate attention.` : `New ticket logged.`;
      
      pushNotification(
        `New Ticket Raised (${ticketId})`,
        msg,
        ['manager', 'director', 'admin'],
        isUrgent ? 'warning' : 'info',
        { ticketId }
      );
      
      addAudit('TICKET_CREATED', `Ticket ${ticketId}`, {
        ticketId,
        newValue: data.problemDescription,
        comment: `Created by ${data.employeeName}`,
      });
      
      return ticketId;
    } catch(e) {
      console.error("Error creating ticket:", e);
      throw e;
    }
  };

  // 2. Approve Ticket & Assign Vendor
  const approveTicket = async (ticketId: string, vendorId: string, comment?: string): Promise<void> => {
    const targetTicket = tickets.find((t) => t.id === ticketId);
    if (!targetTicket) return;
    const vendor = vendors.find((v) => v.id === vendorId);
    if (!vendor) return;

    const now = new Date().toISOString();
    
    // Create the Work Order document for the vendor
    const count = workOrders.length + 10;
    const woId = `WO-2026-${String(count).padStart(5, '0')}`;
    
    const newWorkOrder: WorkOrder = {
      id: woId,
      ticketId: targetTicket.id,
      assetId: targetTicket.assetId,
      assetName: targetTicket.assetName,
      vendorId: vendor.id,
      vendorName: vendor.name,
      issueSummary: targetTicket.issueCategory,
      requiredWork: comment || 'Please diagnose and provide a formal quotation for repair/service.',
      createdAt: now,
      status: 'Quotation Pending'
    };

    try {
      await setDoc(doc(db, "workOrders", woId), newWorkOrder);
      
      await updateDoc(doc(db, "tickets", ticketId), {
        status: 'Quotation Pending',
        assignedVendorId: vendor.id,
        assignedVendorName: vendor.name,
        updatedAt: now,
        timeline: arrayUnion({
          id: `TL-${Date.now()}`,
          timestamp: now,
          action: 'Ticket Approved & Assigned',
          user: currentUser.name,
          role: currentUser.role,
          comment: comment || 'Ticket approved and sent to vendor',
          newStatus: 'Quotation Pending',
        })
      });

      pushNotification(
        `Ticket Approved (${ticketId})`,
        `Assigned to ${vendor.name} for quotation.`,
        ['admin', 'vendor', 'director'],
        'success',
        { ticketId }
      );
      addAudit('TICKET_APPROVED', `Ticket ${ticketId}`, { ticketId, comment: comment || 'Approved' });
    } catch (e) { console.error(e); }
  };

  // 3. Reject Ticket
  const rejectTicket = async (ticketId: string, reason: string): Promise<void> => {
    const targetTicket = tickets.find((t) => t.id === ticketId);
    if (!targetTicket) return;

    const now = new Date().toISOString();
    try {
      await updateDoc(doc(db, "tickets", ticketId), {
        status: 'Rejected',
        updatedAt: now,
        timeline: arrayUnion({
          id: `TL-${Date.now()}`,
          timestamp: now,
          action: 'Ticket Rejected',
          user: currentUser.name,
          role: currentUser.role,
          comment: reason,
          newStatus: 'Rejected',
        })
      });

      pushNotification(
        `Ticket Rejected (${ticketId})`,
        `Reason: ${reason}`,
        ['employee', 'manager', 'director', 'admin'],
        'warning',
        { ticketId }
      );
      addAudit('TICKET_REJECTED', `Ticket ${ticketId}`, { ticketId, comment: reason });
    } catch (e) { console.error(e); }
  };

  // 4. Request Clarification
  const requestClarification = async (ticketId: string, note: string): Promise<void> => {
    const targetTicket = tickets.find((t) => t.id === ticketId);
    if (!targetTicket) return;

    const now = new Date().toISOString();
    try {
      await updateDoc(doc(db, "tickets", ticketId), {
        status: 'Clarification Required',
        updatedAt: now,
        timeline: arrayUnion({
          id: `TL-${Date.now()}`,
          timestamp: now,
          action: 'Clarification Requested',
          user: currentUser.name,
          role: currentUser.role,
          comment: note,
          newStatus: 'Clarification Required',
        })
      });

      pushNotification(
        `Clarification Needed (${ticketId})`,
        `Manager requested more info: ${note}`,
        ['employee', 'admin'],
        'warning',
        { ticketId }
      );
      addAudit('TICKET_CLARIFICATION_REQUESTED', `Ticket ${ticketId}`, { ticketId, comment: note });
    } catch (e) { console.error(e); }
  };

  // 5. Add Internal Comment
  const addInternalComment = async (ticketId: string, comment: string): Promise<void> => {
    const targetTicket = tickets.find((t) => t.id === ticketId);
    if (!targetTicket) return;
    
    const now = new Date().toISOString();
    try {
      await updateDoc(doc(db, "tickets", ticketId), {
        updatedAt: now,
        internalComments: arrayUnion({
          id: `IC-${Date.now()}`,
          timestamp: now,
          author: currentUser.name,
          authorRole: currentUser.role,
          text: comment,
        })
      });
    } catch (e) { console.error(e); }
  };

  // 6. Submit Quotation (Vendor)
  const submitQuotation = async (data: {
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
  }): Promise<void> => {
    const targetWo = workOrders.find((w) => w.id === data.workOrderId);
    if (!targetWo) return;
    
    const targetTicket = tickets.find((t) => t.id === targetWo.ticketId);
    if (!targetTicket) return;

    const vendor = vendors.find((v) => v.id === targetTicket.assignedVendorId);
    if (!vendor) return;

    const count = quotations.length + 1;
    const qId = `QTN-2026-${String(count).padStart(4, '0')}`;
    const now = new Date().toISOString();

    const newQuotation: Quotation = {
      id: qId,
      workOrderId: data.workOrderId,
      ticketId: targetTicket.id,
      vendorId: vendor.id,
      vendorName: vendor.name,
      quotationNumber: data.quotationNumber,
      date: now,
      serviceDescription: data.serviceDescription,
      materialCost: data.materialCost,
      labourCost: data.labourCost,
      taxes: data.taxes,
      otherCharges: data.otherCharges,
      version: 1,
      totalAmount: data.totalAmount,
      status: 'Submitted',
      submittedAt: now,
      estimatedDays: data.estimatedDays,
    };

    try {
      await setDoc(doc(db, "quotations", qId), newQuotation);
      
      // Update the WorkOrder so the vendor sees the state change
      await updateDoc(doc(db, "workOrders", targetWo.id), {
        status: 'Quotation Under Review',
        quotationId: qId,
        currentQuotationAmount: data.totalAmount
      });

      await updateDoc(doc(db, "tickets", targetTicket.id), {
        status: 'Quotation Under Review',
        quotationId: qId,
        updatedAt: now,
        timeline: arrayUnion({
          id: `TL-${Date.now()}`,
          timestamp: now,
          action: 'Quotation Submitted',
          user: currentUser.name,
          role: currentUser.role,
          comment: `Quotation ${data.quotationNumber} submitted for ₹${data.totalAmount.toLocaleString('en-IN')}`,
          newStatus: 'Quotation Under Review',
        })
      });

      pushNotification(
        `New Quotation Received (${targetTicket.id})`,
        `${vendor.name} submitted a quote for ₹${data.totalAmount.toLocaleString('en-IN')} regarding ${targetTicket.assetName}.`,
        ['manager', 'director'],
        'info',
        { ticketId: targetTicket.id, quotationId: qId }
      );
      addAudit('QUOTATION_SUBMITTED', `Quotation ${qId}`, { ticketId: targetTicket.id });
    } catch (e) { console.error(e); }
  };

  // 7. Review Quotation (Manager / Director)
  const reviewQuotation = async (
    quotationId: string,
    decision: 'Approved' | 'Revision Required' | 'Rejected',
    comment: string
  ): Promise<void> => {
    const targetQuote = quotations.find((q) => q.id === quotationId);
    if (!targetQuote) return;

    const targetTicket = tickets.find((t) => t.id === targetQuote.ticketId);
    if (!targetTicket) return;

    const now = new Date().toISOString();
    try {
      await updateDoc(doc(db, "quotations", quotationId), {
        status: decision,
        approvedBy: decision === 'Approved' ? currentUser.name : undefined,
        approvedAt: decision === 'Approved' ? now : undefined,
        comments: comment,
      });

      const nextTicketStatus = decision === 'Approved' ? 'Approved' : (decision === 'Revision Required' ? 'Quotation Pending' : 'Rejected');

      // Update the WorkOrder so the vendor sees the approval
      const nextWoStatus = decision === 'Approved' ? 'Quotation Approved' : (decision === 'Revision Required' ? 'Quotation Pending' : 'Assigned');
      await updateDoc(doc(db, "workOrders", targetQuote.workOrderId), {
        status: nextWoStatus,
      });

      await updateDoc(doc(db, "tickets", targetTicket.id), {
        status: nextTicketStatus,
        updatedAt: now,
        timeline: arrayUnion({
          id: `TL-${Date.now()}`,
          timestamp: now,
          action: `Quotation ${decision}`,
          user: currentUser.name,
          role: currentUser.role,
          comment: comment || `Quotation was ${decision.toLowerCase()}`,
          newStatus: nextTicketStatus,
        })
      });

      pushNotification(
        `Quotation ${decision}`,
        `${targetTicket.assetName}: Quote ${quotationId} was ${decision.toLowerCase()}.`,
        ['vendor', 'manager', 'director', 'admin'],
        decision === 'Approved' ? 'success' : 'warning',
        { ticketId: targetTicket.id, quotationId }
      );
      addAudit(`QUOTATION_${decision.toUpperCase().replace(' ', '_')}`, `Quotation ${quotationId}`, { ticketId: targetTicket.id });
    } catch (e) { console.error(e); }
  };

  // 8. Update Work Progress (Vendor)
  const updateWorkProgress = async (
    workOrderId: string,
    status: 'Work Scheduled' | 'Work In Progress' | 'Awaiting Parts',
    note?: string,
    scheduledDate?: string
  ): Promise<void> => {
    const targetWo = workOrders.find((w) => w.id === workOrderId);
    if (!targetWo) return;

    const targetTicket = tickets.find((t) => t.id === targetWo.ticketId);
    if (!targetTicket) return;

    const now = new Date().toISOString();
    
    try {
      await updateDoc(doc(db, "workOrders", workOrderId), {
        status: status,
        notes: note,
        workScheduledDate: scheduledDate || targetWo.workScheduledDate
      });

      await updateDoc(doc(db, "tickets", targetTicket.id), {
        status: status,
        updatedAt: now,
        timeline: arrayUnion({
          id: `TL-${Date.now()}`,
          timestamp: now,
          action: 'Work Progress Updated',
          user: currentUser.name,
          role: currentUser.role,
          comment: note || `Status updated to ${status}`,
          newStatus: status,
        })
      });

      pushNotification(
        `Work Update (${workOrderId})`,
        `${status} - ${note || ''}`,
        ['manager', 'admin'],
        'info',
        { ticketId: targetTicket.id }
      );
      addAudit('WORK_PROGRESS_UPDATED', `WO ${workOrderId}`, { ticketId: targetTicket.id });
    } catch (e) { console.error(e); }
  };

  // 9. Complete Work (Vendor)
  const completeWork = async (
    workOrderId: string,
    data: {
      completionDescription: string;
      vendorInvoiceNumber?: string;
      beforePhotos?: string[];
      afterPhotos?: string[];
      serviceReportUrl?: string;
    }
  ): Promise<void> => {
    const targetWo = workOrders.find((w) => w.id === workOrderId);
    if (!targetWo) return;
    const targetTicket = tickets.find((t) => t.id === targetWo.ticketId);
    if (!targetTicket) return;

    const now = new Date().toISOString();
    try {
      await updateDoc(doc(db, "workOrders", workOrderId), {
        status: 'Work Completed',
        completedAt: now,
        notes: data.completionDescription,
      });

      await updateDoc(doc(db, "tickets", targetTicket.id), {
        status: 'Verification Pending',
        updatedAt: now,
        timeline: arrayUnion({
          id: `TL-${Date.now()}`,
          timestamp: now,
          action: 'Work Completed by Vendor',
          user: currentUser.name,
          role: currentUser.role,
          comment: data.completionDescription,
          newStatus: 'Verification Pending',
        })
      });

      pushNotification(
        `Work Completed (${workOrderId})`,
        `Vendor has finished service. Please verify to close.`,
        ['manager', 'director', 'admin'],
        'success',
        { ticketId: targetTicket.id }
      );
      addAudit('WORK_COMPLETED', `WO ${workOrderId}`, { ticketId: targetTicket.id });
    } catch (e) { console.error(e); }
  };

  // 10. Verify & Close (Manager / Admin)
  const verifyAndClose = async (ticketId: string, note?: string): Promise<void> => {
    const targetTicket = tickets.find((t) => t.id === ticketId);
    if (!targetTicket) return;

    const now = new Date().toISOString();
    try {
      await updateDoc(doc(db, "tickets", ticketId), {
        status: 'Closed',
        updatedAt: now,
        timeline: arrayUnion({
          id: `TL-${Date.now()}`,
          timestamp: now,
          action: 'Ticket Verified & Closed',
          user: currentUser.name,
          role: currentUser.role,
          comment: note || 'Verified & Closed successfully.',
          newStatus: 'Closed',
        })
      });

      // Find corresponding work order for this ticket to close it
      const targetWo = workOrders.find(w => w.ticketId === ticketId);
      if (targetWo) {
        await updateDoc(doc(db, "workOrders", targetWo.id), {
          status: 'Verified & Closed',
        });
      }

      if (targetTicket.assetId && targetTicket.assetId !== 'AST-UNLISTED') {
        await updateDoc(doc(db, "assets", targetTicket.assetId), {
          status: 'Active',
          condition: 'Good',
          updatedAt: now,
        });
      }

      pushNotification(
        `Ticket Closed & Verified (${ticketId})`,
        `Service has been confirmed completed. Asset ${targetTicket.assetName} restored to Active.`,
        ['employee', 'manager', 'director', 'admin', 'vendor'],
        'success',
        { ticketId }
      );
      addAudit('TICKET_VERIFIED_AND_CLOSED', `Ticket ${ticketId}`, { ticketId });
    } catch (e) { console.error(e); }
  };

  // 11. Send back to vendor
  const sendBackToVendor = async (ticketId: string, reason: string): Promise<void> => {
    const targetTicket = tickets.find((t) => t.id === ticketId);
    if (!targetTicket) return;

    const now = new Date().toISOString();
    try {
      await updateDoc(doc(db, "tickets", ticketId), {
        status: 'Work In Progress',
        updatedAt: now,
        timeline: arrayUnion({
          id: `TL-${Date.now()}`,
          timestamp: now,
          action: 'Rework Requested',
          user: currentUser.name,
          role: currentUser.role,
          comment: `Sent back to vendor: ${reason}`,
          newStatus: 'Work In Progress',
        })
      });

      if (targetTicket.workOrderId) {
        await updateDoc(doc(db, "workOrders", targetTicket.workOrderId), {
          status: 'Work In Progress',
        });
      }

      pushNotification(
        `Rework Required (${ticketId})`,
        `Manager rejected completion: ${reason}`,
        ['vendor', 'admin'],
        'warning',
        { ticketId }
      );
      addAudit('TICKET_SENT_BACK_TO_VENDOR', `Ticket ${ticketId}`, { ticketId });
    } catch (e) { console.error(e); }
  };

  // 12. Asset Management
  const createAsset = async (assetData: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const now = new Date().toISOString();
    
    // Create an empty doc to get the ID synchronously
    const docRef = doc(collection(db, "assets"));
    const newId = docRef.id;

    const newAsset: Asset = {
      ...assetData,
      id: newId,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await setDoc(docRef, newAsset);
      
      addAudit('ASSET_CREATED', `Asset ${newId}`, {
        assetId: newId,
        newValue: newAsset.name,
        comment: `Created by ${currentUser.name} (${currentUser.role})`,
      });
      return newId;
    } catch (e) {
      console.error("Error creating asset: ", e);
      throw e;
    }
  };

  const updateAsset = async (id: string, updates: Partial<Asset>): Promise<void> => {
    const now = new Date().toISOString();
    
    try {
      await updateDoc(doc(db, "assets", id), {
        ...updates,
        updatedAt: now
      });

      addAudit('ASSET_UPDATED', `Asset ${id}`, {
        assetId: id,
        comment: `Updated fields by ${currentUser.name}`,
      });
    } catch (e) {
      console.error("Error updating asset: ", e);
    }
  };

  const deactivateAsset = async (id: string, reason: string): Promise<void> => {
    const now = new Date().toISOString();
    const asset = assets.find(a => a.id === id);
    if (!asset) return;
    
    const newNotes = `${asset.notes || ''} [Deactivated: ${reason}]`;
    
    try {
      await updateDoc(doc(db, "assets", id), {
        status: 'Retired',
        notes: newNotes,
        updatedAt: now
      });

      addAudit('ASSET_DEACTIVATED', `Asset ${id}`, {
        assetId: id,
        oldValue: 'Active',
        newValue: 'Retired',
        comment: reason,
      });
    } catch (e) {
      console.error("Error deactivating asset: ", e);
    }
  };

  // 13. Vendor Management
  const createVendor = async (vendorData: Omit<Vendor, 'id' | 'completedJobsCount' | 'rating' | 'averageTurnaroundDays'>): Promise<string> => {
    const newId = `VND-${String(vendors.length + 1).padStart(3, '0')}`;
    const newVendor: Vendor = {
      ...vendorData,
      id: newId,
      completedJobsCount: 0,
      rating: 5.0,
      averageTurnaroundDays: 2.0,
    };
    try {
      await setDoc(doc(db, "vendors", newId), newVendor);
      addAudit('VENDOR_CREATED', `Vendor ${newId}`, {
        comment: `Added ${vendorData.name}`,
      });
      return newId;
    } catch (e) {
      console.error("Error creating vendor:", e);
      throw e;
    }
  };

  const updateVendor = async (id: string, updates: Partial<Vendor>) => {
    try {
      await updateDoc(doc(db, "vendors", id), updates);
      addAudit('VENDOR_UPDATED', `Vendor ${id}`, {
        comment: `Updated details for ${id}`,
      });
    } catch (e) {
      console.error("Error updating vendor:", e);
    }
  };

  // 14. Approval Config
  const updateApprovalConfig = async (config: ApprovalConfig) => {
    setApprovalConfig(config);
    addAudit('APPROVAL_CONFIG_UPDATED', 'Approval Thresholds', {
      comment: `Manager Threshold: ₹${config.managerMaxThreshold}, Director Above: ₹${config.directorRequiredAbove}`,
    });
  };

  // 15. Notification helpers
  const markNotificationRead = async (id: string) => {
    try {
      await updateDoc(doc(db, "notifications", id), { read: true });
    } catch (e) {
      console.error(e);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      // Create a batch or just loop, for simplicity loop since it's client side and limited
      const unreadNotifs = notifications.filter(n => !n.read);
      for (const n of unreadNotifs) {
        await updateDoc(doc(db, "notifications", n.id), { read: true });
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 14. Employee Management
  const createEmployee = async (employeeData: Employee) => {
    try {
      await setDoc(doc(db, 'employees', employeeData.id), employeeData);
      addAudit('EMPLOYEE_CREATED', `Employee ${employeeData.id}`, {
        newValue: employeeData.name,
      });
    } catch (e) {
      console.error(e);
    }
  };

  const updateEmployee = async (id: string, updates: Partial<Employee>) => {
    try {
      await updateDoc(doc(db, 'employees', id), updates);
      addAudit('EMPLOYEE_UPDATED', `Employee ${id}`, {
        newValue: 'Updated Details',
      });
    } catch (e) {
      console.error(e);
    }
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
        role,
        activeTab,
        setActiveTab,
        currentUser,
        users,
        addUser,
        login,
        logout,
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
